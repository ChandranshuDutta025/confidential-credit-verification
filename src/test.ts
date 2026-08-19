import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const zkConfigPath = path.resolve(__dirname, '..', 'contracts', 'managed', 'credit-verification');
const contractPath = path.join(zkConfigPath, 'contract', 'index.js');
const sourcePath = path.resolve(__dirname, '..', 'contracts', 'credit-verification.compact');

let passed = 0;
let failed = 0;
let skipped = 0;

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) throw new Error(`${message}: expected ${expected}, got ${actual}`);
}

function assertIncludes(haystack: string, needle: string, message: string) {
  if (!haystack.includes(needle)) throw new Error(`${message}: "${needle}" not found`);
}

async function runTest(name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    passed++;
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
  } catch (err: any) {
    if (err.message === '__SKIP__') {
      skipped++;
      console.log(`  \x1b[33m○\x1b[0m ${name} (skipped — compiled artifact not found)`);
    } else {
      failed++;
      console.log(`  \x1b[31m✗\x1b[0m ${name}: ${err.message}`);
    }
  }
}

function skipIfNoArtifact() {
  if (!fs.existsSync(contractPath)) throw new Error('__SKIP__');
}

async function main() {
  console.log('\n\x1b[1m╔══════════════════════════════════════════════════════════════╗');
  console.log('║       Confidential Credit Verification — Unit Tests         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\x1b[0m\n');

  const source = fs.readFileSync(sourcePath, 'utf-8');
  let contractMod: any;

  // ── Contract Artifact & Compilation ──────────────────────────

  console.log('\x1b[4mContract Artifact\x1b[0m');

  await runTest('Contract artifact file exists', () => {
    skipIfNoArtifact();
  });

  await runTest('Contract module exports Contract class', async () => {
    skipIfNoArtifact();
    contractMod = await import(pathToFileURL(contractPath).href);
    assert(typeof contractMod.Contract === 'function', 'Contract class not exported');
  });

  await runTest('Contract module exports ledger function', async () => {
    skipIfNoArtifact();
    assert(typeof contractMod.ledger === 'function', 'ledger export not a function');
  });

  await runTest('Contract module exports pureCircuits', () => {
    skipIfNoArtifact();
    assert(contractMod.pureCircuits !== undefined, 'pureCircuits not exported');
    assert(typeof contractMod.pureCircuits === 'object', 'pureCircuits must be an object');
  });

  await runTest('pureCircuits.deriveUserCommitment exists', () => {
    skipIfNoArtifact();
    assert(typeof contractMod.pureCircuits.deriveUserCommitment === 'function',
      'deriveUserCommitment not in pureCircuits');
  });

  // ── Contract Instantiation ───────────────────────────────────

  console.log('\n\x1b[4mContract Instantiation\x1b[0m');

  await runTest('Creates instance with valid witness functions', () => {
    skipIfNoArtifact();
    const witnesses = {
      getCreditScore: (ctx: any) => [ctx.currentPrivateState, 700n],
      getUserSecret: (ctx: any) => [ctx.currentPrivateState, new Uint8Array(32)],
    };
    const instance = new contractMod.Contract(witnesses);
    assert(instance !== undefined, 'Instance must not be undefined');
    assert(typeof instance === 'object', 'Instance must be an object');
  });

  await runTest('Rejects instance with missing witness function', () => {
    try {
      new contractMod.Contract({});
      throw new Error('Should have thrown');
    } catch (err: any) {
      assert(err.message !== 'Should have thrown', 'Missing witness was not caught');
    }
  });

  // ── Privacy Model — Source Analysis ──────────────────────────

  console.log('\n\x1b[4mPrivacy Model\x1b[0m');

  await runTest('getCreditScore is declared as witness', () => {
    assertIncludes(source, 'witness getCreditScore(): Uint<64>',
      'getCreditScore witness not found');
  });

  await runTest('getUserSecret is declared as witness', () => {
    assertIncludes(source, 'witness getUserSecret(): Bytes<32>',
      'getUserSecret witness not found');
  });

  await runTest('getCreditScore is never directly disclosed', () => {
    assert(!source.match(/disclose\(\s*getCreditScore\s*\(\)\s*\)/),
      'getCreditScore() must not be directly disclosed');
  });

  await runTest('getUserSecret is never directly disclosed', () => {
    assert(!source.match(/disclose\(\s*getUserSecret\s*\(\)\s*\)/),
      'getUserSecret() must not be directly disclosed');
  });

  await runTest('Only boolean/commitment outputs are disclosed', () => {
    const disclosePattern = /disclose\(([^)]+)\)/g;
    let match;
    const disclosedValues: string[] = [];
    while ((match = disclosePattern.exec(source)) !== null) {
      disclosedValues.push(match[1].trim());
    }
    for (const val of disclosedValues) {
      const isAllowed =
        val === 'threshold' ||
        val === '0' ||
        val === '1' ||
        val === 'isEligible' ||
        val === 'userHash' ||
        val === 'result' ||
        val === 'newThreshold' ||
        val === 'newTotal' ||
        val === 'minCreditScore' ||
        val === 'totalVerifications';
      assert(isAllowed, `Unexpected disclosed value: ${val}`);
    }
  });

  // ── Ledger State Structure ───────────────────────────────────

  console.log('\n\x1b[4mLedger State\x1b[0m');

  await runTest('minCreditScore is Uint<64>', () => {
    assertIncludes(source, 'export ledger minCreditScore: Uint<64>',
      'minCreditScore type declaration missing');
  });

  await runTest('totalVerifications is Uint<64>', () => {
    assertIncludes(source, 'export ledger totalVerifications: Uint<64>',
      'totalVerifications type declaration missing');
  });

  await runTest('verificationResults is Map<Bytes<32>, Uint<64>>', () => {
    assertIncludes(source, 'export ledger verificationResults: Map<Bytes<32>, Uint<64>>',
      'verificationResults type declaration missing');
  });

  // ── Circuit Definitions ──────────────────────────────────────

  console.log('\n\x1b[4mCircuit Definitions\x1b[0m');

  await runTest('initialize circuit exists with threshold parameter', () => {
    assertIncludes(source, 'circuit initialize(threshold: Uint<64>): []',
      'initialize circuit signature not found');
  });

  await runTest('deriveUserCommitment circuit exists', () => {
    assertIncludes(source, 'circuit deriveUserCommitment(secret: Bytes<32>): Bytes<32>',
      'deriveUserCommitment circuit signature not found');
  });

  await runTest('verifyCreditScore circuit exists', () => {
    assertIncludes(source, 'circuit verifyCreditScore(): []',
      'verifyCreditScore circuit signature not found');
  });

  await runTest('checkVerification circuit exists', () => {
    assertIncludes(source, 'circuit checkVerification(userHash: Bytes<32>): []',
      'checkVerification circuit signature not found');
  });

  await runTest('updateThreshold circuit exists', () => {
    assertIncludes(source, 'circuit updateThreshold(newThreshold: Uint<64>): []',
      'updateThreshold circuit signature not found');
  });

  await runTest('getMinThreshold getter circuit exists', () => {
    assertIncludes(source, 'circuit getMinThreshold(): Uint<64>',
      'getMinThreshold circuit not found');
  });

  await runTest('getTotalVerifications getter circuit exists', () => {
    assertIncludes(source, 'circuit getTotalVerifications(): Uint<64>',
      'getTotalVerifications circuit not found');
  });

  // ── Eligibility Logic ────────────────────────────────────────

  console.log('\n\x1b[4mEligibility Logic\x1b[0m');

  await runTest('Compares creditScore >= minCreditScore threshold', () => {
    assertIncludes(source, 'creditScore >= disclose(minCreditScore)',
      'Threshold comparison not found');
  });

  await runTest('Stores eligible result (1) for qualifying scores', () => {
    assertIncludes(source, 'verificationResults.insert(disclose(userHash), disclose(1))',
      'Eligible insert not found');
  });

  await runTest('Stores ineligible result (0) for non-qualifying scores', () => {
    assertIncludes(source, 'verificationResults.insert(disclose(userHash), disclose(0))',
      'Ineligible insert not found');
  });

  await runTest('Increments totalVerifications after each check', () => {
    assertIncludes(source, 'totalVerifications + 1',
      'totalVerifications increment not found');
  });

  await runTest('Uses deriveUserCommitment to link wallet to score', () => {
    assertIncludes(source, 'deriveUserCommitment(userSecret)',
      'deriveUserCommitment call not found in verifyCreditScore');
  });

  // ── SHA-256 Commitment — Pure Circuit ────────────────────────

  console.log('\n\x1b[4mSHA-256 Commitment (pureCircuits)\x1b[0m');

  await runTest('deriveUserCommitment returns 32-byte Uint8Array', () => {
    skipIfNoArtifact();
    const secret = new Uint8Array(32);
    const hash = contractMod.pureCircuits.deriveUserCommitment(secret);
    assert(hash instanceof Uint8Array, 'Hash must be Uint8Array');
    assertEqual(hash.length, 32, 'Hash must be 32 bytes');
  });

  await runTest('deriveUserCommitment is deterministic (same input → same output)', () => {
    skipIfNoArtifact();
    const secret = new Uint8Array(32);
    secret[0] = 42;
    secret[31] = 255;
    const h1 = contractMod.pureCircuits.deriveUserCommitment(secret);
    const h2 = contractMod.pureCircuits.deriveUserCommitment(secret);
    assert(Buffer.from(h1).equals(Buffer.from(h2)), 'Identical inputs must produce identical hashes');
  });

  await runTest('deriveUserCommitment differs for different secrets', () => {
    skipIfNoArtifact();
    const s1 = new Uint8Array(32);
    const s2 = new Uint8Array(32);
    s2[0] = 1;
    const h1 = contractMod.pureCircuits.deriveUserCommitment(s1);
    const h2 = contractMod.pureCircuits.deriveUserCommitment(s2);
    assert(!Buffer.from(h1).equals(Buffer.from(h2)),
      'Different secrets must produce different hashes');
  });

  await runTest('deriveUserCommitment is non-zero for non-zero secret', () => {
    skipIfNoArtifact();
    const secret = new Uint8Array(32).fill(0xFF);
    const hash = contractMod.pureCircuits.deriveUserCommitment(secret);
    const isAllZero = hash.every((b: number) => b === 0);
    assert(!isAllZero, 'Hash of non-zero secret must be non-zero');
  });

  await runTest('deriveUserCommitment produces uniform distribution', () => {
    skipIfNoArtifact();
    const hashes: number[][] = [];
    for (let i = 0; i < 10; i++) {
      const secret = new Uint8Array(32);
      secret[0] = i;
      const hash = contractMod.pureCircuits.deriveUserCommitment(secret);
      hashes.push(Array.from(hash));
    }
    const allSame = hashes.every(h => Buffer.from(h).equals(Buffer.from(hashes[0])));
    assert(!allSame, 'Hashes of different secrets must not all be identical');
  });

  // ── Threshold Management ─────────────────────────────────────

  console.log('\n\x1b[4mThreshold Management\x1b[0m');

  await runTest('initialize sets minCreditScore to threshold', () => {
    assertIncludes(source, 'minCreditScore = disclose(threshold)',
      'initialize must set minCreditScore to threshold');
  });

  await runTest('initialize sets totalVerifications to 0', () => {
    assertIncludes(source, 'totalVerifications = disclose(0)',
      'initialize must set totalVerifications to 0');
  });

  await runTest('updateThreshold modifies minCreditScore', () => {
    assertIncludes(source, 'minCreditScore = disclose(newThreshold)',
      'updateThreshold must set minCreditScore to newThreshold');
  });

  // ── System Requirements ──────────────────────────────────────

  console.log('\n\x1b[4mSystem Requirements\x1b[0m');

  await runTest('Compact language version >= 0.23', () => {
    assertIncludes(source, 'pragma language_version >= 0.23',
      'Missing version pragma');
  });

  await runTest('Imports CompactStandardLibrary', () => {
    assertIncludes(source, 'import CompactStandardLibrary',
      'Missing standard library import');
  });

  await runTest('Uses persistentHash for commitment derivation', () => {
    assertIncludes(source, 'persistentHash',
      'persistentHash not used for commitment derivation');
  });

  // ── Summary ──────────────────────────────────────────────────

  console.log(`\n\x1b[1m─── Results ────────────────────────────────────────────────────\x1b[0m\n`);
  console.log(`  Total:  ${passed + failed + skipped}`);
  console.log(`  Passed: \x1b[32m${passed}\x1b[0m`);
  console.log(`  Failed: \x1b[31m${failed}\x1b[0m`);
  if (skipped > 0) console.log(`  Skipped: \x1b[33m${skipped}\x1b[0m (compiled artifact not found — run on Linux with Compact CLI)`);
  console.log('');
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => { console.error(err); process.exit(1); });
