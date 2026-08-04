import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { resolveNetwork, getOrCreateSeed, getDeployment } from '../src/network';
import { createWallet, persistWalletState } from '../src/wallet';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';

globalThis.WebSocket = WebSocket;
const PRIVATE_STATE_ID = 'creditVerificationPrivateState';
const { network, config: networkConfig } = resolveNetwork();
const SEED = getOrCreateSeed(network);

function fail(msg: string): never {
  console.error('?', msg); process.exit(1);
}

async function main() {
  const dep = getDeployment(network);
  if (!dep) { console.error('No deployment.'); process.exit(1); }
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const zkPath = path.resolve(__dirname, '..', 'contracts', 'managed', 'credit-verification');
  const cPath = path.join(zkPath, 'contract', 'index.js');
  if (!fs.existsSync(cPath)) fail('Compile first.');
  const CV = await import(pathToFileURL(cPath).href);
  const cc = CompiledContract.make('credit-verification', CV.Contract).pipe(
    CompiledContract.withVacantWitnesses, CompiledContract.withCompiledFileAssets(zkPath),
  );
  const wc = await createWallet({ network, networkConfig, seed: SEED });
  await wc.wallet.waitForSyncedState();
  await persistWalletState(network, wc);
  const zkp = new NodeZkConfigProvider(zkPath);
  const wp: any = {
    getCoinPublicKey: () => wc.shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => wc.shieldedSecretKeys.encryptionPublicKey,
    balanceTx: () => { throw new Error('read-only'); },
    submitTx: () => { throw new Error('read-only'); },
  };
  const prov = {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'credit-verification-state',
      accountId: wc.unshieldedKeystore.getBech32Address().toString(),
      privateStoragePasswordProvider: () => 'Local-Devnet-Development-Placeholder-1',
    }),
    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
    zkConfigProvider: zkp,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkp),
    walletProvider: wp, midnightProvider: wp,
  };
  await findDeployedContract(prov, {
    contractAddress: dep.address, compiledContract: cc as any,
    privateStateId: PRIVATE_STATE_ID, initialPrivateState: {},
  });
  const onChain = await prov.publicDataProvider.queryContractState(dep.address);
  if (!onChain) fail('No on-chain state.');
  const ls = CV.ledger(onChain.data);
  console.log('? e2e-check passed');
  console.log(`  address: ${dep.address}`);
  console.log(`  network: ${network}`);
  console.log(`  minScore: ${ls.minCreditScore}`);
  console.log(`  totalVerifications: ${ls.totalVerifications}`);
  await wc.wallet.stop();
}
main().catch((e) => { console.error(e); process.exit(1); });
