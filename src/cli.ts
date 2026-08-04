import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';
import { Buffer } from 'buffer';

import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { resolveNetwork, getOrCreateSeed, getDeployment } from './network';
import { createWallet, persistWalletState, unshieldedToken, type WalletContext } from './wallet';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';

import crypto from 'node:crypto';

(globalThis as any).WebSocket = WebSocket;

const PRIVATE_STATE_ID = 'creditVerificationPrivateState';
const { network, config: networkConfig } = resolveNetwork();
const SEED = getOrCreateSeed(network);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const zkConfigPath = path.resolve(__dirname, '..', 'contracts', 'managed', 'credit-verification');
const contractPath = path.join(zkConfigPath, 'contract', 'index.js');

if (!fs.existsSync(contractPath)) {
  console.error('\n? Contract not compiled! Run: npm run compile\n');
  process.exit(1);
}

const CreditVerification = await import(pathToFileURL(contractPath).href);

// Dynamic witness state — updated before each circuit call
const witnessState: { creditScore: bigint; userSecret: Uint8Array } = {
  creditScore: 700n,
  userSecret: new Uint8Array(32),
};

const withCreditVerificationWitnesses = (cls: typeof CreditVerification.Contract) => {
  const witnesses = {
    getCreditScore: (witnessContext: any) => [witnessContext.currentPrivateState, witnessState.creditScore],
    getUserSecret: (witnessContext: any) => [witnessContext.currentPrivateState, witnessState.userSecret],
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

function toBytes32(hex: string): Uint8Array {
  const buf = Buffer.from(hex, 'hex');
  if (buf.length === 32) return buf;
  const padded = Buffer.alloc(32);
  buf.copy(padded, 32 - buf.length);
  return padded;
}

async function main() {
  console.log('\n????????????????????????????????????????????????????????????????');
  console.log('?         Confidential Credit Score Verification CLI           ?');
  console.log('????????????????????????????????????????????????????????????????\n');
  const rl = createInterface({ input: stdin, output: stdout });
  const deployment = getDeployment(network);
  if (!deployment) {
    console.error(`No deploy on file for network ${network}. Run \`npm run setup -- --network ${network}\` first.`);
    process.exit(1);
  }
  console.log(`  Contract: ${deployment.address}`);
  console.log(`  Network: ${network}\n`);
  try {
    const walletCtx = await createWallet({ network, networkConfig, seed: SEED });
    const restoredCount = Object.values(walletCtx.restored).filter(Boolean).length;
    if (restoredCount > 0) {
      console.log(`  Restored ${restoredCount}/3 child wallets from .midnight-wallet-state`);
    }
    console.log('  Syncing with network...');
    const syncStart = Date.now();
    const syncInterval = setInterval(() => {
      const elapsed = Math.round((Date.now() - syncStart) / 1000);
      process.stdout.write(`\r  ? Still syncing... (${elapsed}s elapsed)   `);
    }, 5000);
    const state = await walletCtx.wallet.waitForSyncedState();
    clearInterval(syncInterval);
    process.stdout.write('\r  ? Synced with network.                                      \n');
    await persistWalletState(network, walletCtx);
    const balance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
    console.log(`  Balance: ${balance.toLocaleString()} tNight\n`);
    if (balance === 0n && network !== 'undeployed' && networkConfig.faucet) {
      const address = walletCtx.unshieldedKeystore.getBech32Address();
      console.log('  ? Wallet has no tNight. Fund it from the faucet:');
      console.log(`     ${networkConfig.faucet}`);
      console.log(`     Wallet address: ${address}\n`);
    }
    console.log('  Connecting to contract...');
    const providers = await createProviders(walletCtx);
    const deployed: any = await findDeployedContract(providers, {
      compiledContract: compiledContract as any,
      contractAddress: deployment.address,
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState: {},
    });
    console.log('  ? Connected!\n');
    let running = true;
    while (running) {
      console.log('??? Menu ???????????????????????????????????????????????????????');
      console.log('  1. Verify credit score (private)');
      console.log('  2. Check verification status');
      console.log('  3. View current threshold');
      console.log('  4. View total verifications');
      console.log('  5. Update threshold (admin)');
      console.log('  6. Check wallet balance');
      console.log('  7. Exit\n');
      const choice = await rl.question('  Your choice: ');
      switch (choice.trim()) {
        case '1': {
          const scoreStr = await rl.question('  Enter your credit score (300-850): ');
          const creditScore = BigInt(scoreStr.trim());
          console.log('\n  ? Your credit score is a PRIVATE witness.');
          console.log('  It will be proven via zero-knowledge proof.');
          console.log('  Only the boolean result (eligible/not-eligible)');
          console.log('  will be stored on the public ledger.\n');
          const userSecret = crypto.randomBytes(32);
          witnessState.creditScore = creditScore;
          witnessState.userSecret = userSecret;
          console.log('  Generated ephemeral user identity (commitment).\n');
          console.log('  Generating proof and submitting transaction...');
          try {
            const tx = await deployed.callTx.verifyCreditScore();
            const result = tx.public;
            console.log(`\n  ? Verification complete!`);
            console.log(`  Transaction ID: ${result.txId}`);
            console.log(`  Block height: ${result.blockHeight}\n`);
            const userHash = CreditVerification.deriveUserCommitment(userSecret);
            console.log(`  Your verification hash: ${Buffer.from(userHash).toString('hex')}`);
            console.log('  Save this hash to check your status later.\n');
          } catch (error) {
            console.error('\n  ? Verification failed:', error instanceof Error ? error.message : error);
          }
          break;
        }
        case '2': {
          const hashStr = await rl.question('  Enter your verification hash (hex): ');
          const userHash = toBytes32(hashStr.trim());
          console.log('\n  Querying verification status...');
          try {
            const result = await providers.publicDataProvider.queryContractState(deployment.address);
            if (result) {
              const ledgerState = CreditVerification.ledger(result.data);
                const status = ledgerState.verificationResults.lookup(userHash);
              if (status !== undefined) {
                const eligible = status === 1n;
                console.log(`\n  ?? Verification status: ${eligible ? '? Eligible' : '? Not eligible'}\n`);
              } else {
                console.log('\n  ?? No verification record found for this hash.\n');
              }
            } else {
              console.log('\n  ?? Contract state is empty.\n');
            }
          } catch (error) {
            console.error('\n  ? Failed:', error instanceof Error ? error.message : error);
          }
          break;
        }
        case '3': {
          console.log('\n  Reading current threshold...');
          try {
            const result = await providers.publicDataProvider.queryContractState(deployment.address);
            if (result) {
              const ledgerState = CreditVerification.ledger(result.data);
              console.log(`\n  ?? Minimum credit score threshold: ${ledgerState.minCreditScore}\n`);
            }
          } catch (error) {
            console.error('\n  ? Failed:', error instanceof Error ? error.message : error);
          }
          break;
        }
        case '4': {
          console.log('\n  Reading total verifications...');
          try {
            const result = await providers.publicDataProvider.queryContractState(deployment.address);
            if (result) {
              const ledgerState = CreditVerification.ledger(result.data);
              console.log(`\n  ?? Total verifications performed: ${ledgerState.totalVerifications}\n`);
            }
          } catch (error) {
            console.error('\n  ? Failed:', error instanceof Error ? error.message : error);
          }
          break;
        }
        case '5': {
          const thresholdStr = await rl.question('  Enter new minimum threshold: ');
          const newThreshold = BigInt(thresholdStr.trim());
          console.log('\n  Submitting threshold update...');
          try {
            const tx = await deployed.callTx.updateThreshold(newThreshold);
            console.log(`\n  ? Threshold updated to ${newThreshold}`);
            console.log(`  Transaction ID: ${tx.public.txId}\n`);
          } catch (error) {
            console.error('\n  ? Failed:', error instanceof Error ? error.message : error);
          }
          break;
        }
        case '6': {
          const currentState = await walletCtx.wallet.waitForSyncedState();
          const currentBalance = currentState.unshielded.balances[unshieldedToken().raw] ?? 0n;
          const dustBalance = currentState.dust.balance(new Date());
          console.log(`\n  tNight: ${currentBalance.toLocaleString()}`);
          console.log(`  DUST:   ${dustBalance.toLocaleString()}\n`);
          break;
        }
        case '7':
          running = false;
          console.log('\n  ?? Goodbye!\n');
          break;
        default:
          console.log('\n  ? Invalid choice. Please enter 1-7.\n');
      }
    }
    await persistWalletState(network, walletCtx);
    await walletCtx.wallet.stop();
  } catch (error) {
    console.error('\n? Error:', error instanceof Error ? error.message : error);
  } finally {
    rl.close();
  }
}
main().catch(console.error);
