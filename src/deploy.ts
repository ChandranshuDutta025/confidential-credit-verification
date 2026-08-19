import * as fs from 'node:fs';
import * as path from 'node:path';
import { resolveNetwork, getOrCreateSeed, recordDeployment } from './network';
import { createWallet, persistWalletState, unshieldedToken, type WalletContext } from './wallet';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';
import * as Rx from 'rxjs';

import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';

(globalThis as any).WebSocket = WebSocket;

const PRIVATE_STATE_ID = 'creditVerificationPrivateState';
const MAX_RETRIES = 20;
const { network, config: networkConfig } = resolveNetwork();
const SEED = getOrCreateSeed(network);

async function waitForProofServer(maxAttempts = 60, delayMs = 2000): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await fetch(networkConfig.proofServer, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      return true;
    } catch (err: any) {
      const code = err?.cause?.code || err?.code || '';
      if (code !== 'ECONNREFUSED' && code !== 'UND_ERR_CONNECT_TIMEOUT' && code !== 'UND_ERR_SOCKET') {
        return true;
      }
    }
    if (attempt < MAX_RETRIES) {
      process.stdout.write(`\r  Waiting for proof server... (${attempt}/${maxAttempts})   `);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return false;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const zkConfigPath = path.resolve(__dirname, '..', 'contracts', 'managed', 'credit-verification');
const contractPath = path.join(zkConfigPath, 'contract', 'index.js');

if (!fs.existsSync(contractPath)) {
  console.error('\nContract not compiled! Run: npm run compile\n');
  process.exit(1);
}

const CreditVerification = await import(pathToFileURL(contractPath).href);

// Reproduce withVacantWitnesses inline with correct witness names
const withCreditVerificationWitnesses = (cls: typeof CreditVerification.Contract) => {
  const witnesses = {
    getCreditScore: (witnessContext: any) => [witnessContext.currentPrivateState, 700n],
    getUserSecret: (witnessContext: any) => [witnessContext.currentPrivateState, new Uint8Array(32)],
  };
  return class extends cls {
    constructor() {
      super(witnesses);
    }
  };
};

const compiledContract = CompiledContract.make(
  'credit-verification',
  withCreditVerificationWitnesses(CreditVerification.Contract) as any,
).pipe(CompiledContract.withCompiledFileAssets(zkConfigPath));

async function createProviders(walletCtx: WalletContext) {
  const privateStatePassword = process.env.PRIVATE_STATE_PASSWORD?.trim() || 'Local-Devnet-Development-Placeholder-1';
  const walletProvider = {
    getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,
    async balanceTx(tx: any, ttl?: Date) {
      const recipe = await walletCtx.wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys: walletCtx.shieldedSecretKeys, dustSecretKey: walletCtx.dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      return walletCtx.wallet.finalizeRecipe(recipe);
    },
    submitTx: (tx: any) => walletCtx.wallet.submitTransaction(tx) as any,
  };
  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  const accountId = walletCtx.unshieldedKeystore.getBech32Address().toString();
  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'credit-verification-state',
      accountId,
      privateStoragePasswordProvider: () => privateStatePassword,
    }),
    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };
}

async function main() {
  console.log('\n==============================================================');
  console.log('  Deploy confidential-credit-verification to ' + network);
  console.log('==============================================================\n');

  console.log('--- Wallet setup ---\n');
  console.log('  Creating wallet...');
  const walletCtx = await createWallet({ network, networkConfig, seed: SEED });
  const restoredCount = Object.values(walletCtx.restored).filter(Boolean).length;
  if (restoredCount > 0) {
    console.log('  Restored ' + restoredCount + '/3 child wallets from .midnight-wallet-state');
  }
  console.log('  Syncing with network...\n');
  const syncStart = Date.now();
  const syncInterval = setInterval(() => {
    const elapsed = Math.round((Date.now() - syncStart) / 1000);
    process.stdout.write('\r  Still syncing... (' + elapsed + 's elapsed)   ');
  }, 5000);
  const state = await walletCtx.wallet.waitForSyncedState();
  clearInterval(syncInterval);
  process.stdout.write('\r  Synced with network.\n');
  await persistWalletState(network, walletCtx);
  const address = walletCtx.unshieldedKeystore.getBech32Address();
  const balance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
  console.log('\n  Wallet Address: ' + address);
  console.log('  Balance: ' + balance.toLocaleString() + ' tNight\n');

  if (network === 'undeployed' && balance === 0n) {
    console.error('\nGenesis-seed wallet has zero NIGHT.\n');
    await walletCtx.wallet.stop();
    process.exit(1);
  }

  if (network !== 'undeployed' && networkConfig.faucet) {
    const initialBalance = await Rx.firstValueFrom(
      walletCtx.wallet.state().pipe(Rx.filter((s) => s.isSynced))
    );
    const initialTNight = initialBalance.unshielded.balances[unshieldedToken().raw] ?? 0n;
    if (initialTNight === 0n) {
      console.log('--- Fund Wallet ---\n');
      console.log('  Wallet address: ' + address);
      console.log('  Faucet:         ' + networkConfig.faucet + '\n');
      const timeoutMs = 600_000;
      const start = Date.now();
      while (true) {
        await new Promise((r) => setTimeout(r, 10_000));
        const s = await Rx.firstValueFrom(walletCtx.wallet.state().pipe(Rx.filter((x) => x.isSynced)));
        const tn = s.unshielded.balances[unshieldedToken().raw] ?? 0n;
        if (tn > 0n) { console.log('  Funded!\n'); break; }
        if (Date.now() - start > timeoutMs) {
          console.log('  Timeout.\n'); await walletCtx.wallet.stop(); process.exit(1);
        }
      }
    }
  }

  console.log('--- DUST Setup ---\n');
  const dustState = await Rx.firstValueFrom(
    walletCtx.wallet.state().pipe(Rx.filter((s) => s.isSynced))
  );
  const unregistered = dustState.unshielded.availableCoins.filter(
    (c: any) => !c.meta?.registeredForDustGeneration,
  );
  if (unregistered.length > 0) {
    console.log('  Registering ' + unregistered.length + ' UTXOs for DUST...');
    const recipe = await walletCtx.wallet.registerNightUtxosForDustGeneration(
      unregistered,
      walletCtx.unshieldedKeystore.getPublicKey(),
      (payload: any) => walletCtx.unshieldedKeystore.signData(payload),
    );
    const finalized = await walletCtx.wallet.finalizeRecipe(recipe);
    await walletCtx.wallet.submitTransaction(finalized);
  }
  if (dustState.dust.balance(new Date()) === 0n) {
    console.log('  Waiting for DUST...');
    await Rx.firstValueFrom(
      walletCtx.wallet.state().pipe(
        Rx.throttleTime(5000),
        Rx.filter((s) => s.isSynced),
        Rx.filter((s) => s.dust.balance(new Date()) > 0n),
      ),
    );
  }
  console.log('  DUST ready!\n');

  console.log('--- Deploy Contract ---\n');
  console.log('  Checking proof server...');
  if (!(await waitForProofServer())) {
    console.log('\n  Proof server not responding.\n');
    await walletCtx.wallet.stop();
    process.exit(1);
  }
  process.stdout.write('\r  Proof server ready!\n');
  console.log('  Setting up providers...');
  const providers = await createProviders(walletCtx);
  await new Promise((r) => setTimeout(r, 6000));
  console.log('  Deploying with threshold=700...\n');

  let deployed: Awaited<ReturnType<typeof deployContract>> | undefined;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      deployed = await deployContract(providers, {
        compiledContract: compiledContract as any,
        args: [],
        privateStateId: PRIVATE_STATE_ID,
        initialPrivateState: { threshold: 700n },
      });
      break;
    } catch (err: any) {
      const msg = err?.message || '';
      const cause = err?.cause?.message || '';
      const full = msg + ' ' + cause;
      const isDust = full.includes('Not enough Dust') || full.includes('Insufficient Funds');
      if (!(isDust && attempt === 1)) {
        console.error('\n  Attempt ' + attempt + ': ' + msg.substring(0, 200));
      }
      if (full.includes('ECONNREFUSED') && !isDust) {
        console.log('  Proof server unreachable.\n');
        await walletCtx.wallet.stop();
        process.exit(1);
      }
      if (isDust) {
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, 5000));
        } else {
          console.log('  DUST shortage.\n');
          await walletCtx.wallet.stop();
          process.exit(1);
        }
      } else {
        throw err;
      }
    }
  }
  if (!deployed) throw new Error('Deployment failed');
  const contractAddress = deployed.deployTxData.public.contractAddress;
  console.log('  Deployed!\n');
  console.log('  Address: ' + contractAddress + '\n');
  recordDeployment(network, contractAddress, address.toString());
  console.log('  Saved to .midnight-state.json\n');
  await persistWalletState(network, walletCtx);
  await walletCtx.wallet.stop();
  console.log('--- Deploy complete ---\n');
  console.log('  Next: npm run cli\n');
}
main().catch((err) => { console.error(err); process.exit(1); });
