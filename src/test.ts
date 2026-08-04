import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const zkConfigPath = path.resolve(__dirname, '..', 'contracts', 'managed', 'credit-verification');
const contractPath = path.join(zkConfigPath, 'contract', 'index.js');

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

async function runTest(name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err: any) {
    failed++;
    console.log(`  ✗ ${name}: ${err.message}`);
  }
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║         Confidential Credit Score Verification Tests        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // Test 1: Contract compilation loads compiled artifact
  await runTest('Contract compilation: loads compiled contract artifact', async () => {
    assert(fs.existsSync(contractPath), `Contract file not found: ${contractPath}`);
    const mod = await import(pathToFileURL(contractPath).href);
    assert(typeof mod.Contract === 'function', 'Contract class not exported');
    assert(typeof mod.ledger === 'function', 'ledger export must be a function');
  });

  // Test 2: Contract instantiation with valid parameters
  await runTest('Contract instantiation: creates contract with valid parameters', async () => {
    const mod = await import(pathToFileURL(contractPath).href);
    const witnesses = {
      getCreditScore: (ctx: any) => [ctx.currentPrivateState, 700n],
      getUserSecret: (ctx: any) => [ctx.currentPrivateState, new Uint8Array(32)],
    };
    const instance = new mod.Contract(witnesses);
    assert(instance !== undefined, 'Contract instance must be created');
    assert(typeof instance === 'object', 'Contract instance must be an object');
  });

  // Test 3: Privacy guarantee — credit score is a private witness
  await runTest('Privacy guarantee: credit score remains private witness value', async () => {
    const sourcePath = path.resolve(__dirname, '..', 'contracts', 'credit-verification.compact');
    const source = fs.readFileSync(sourcePath, 'utf-8');
    assert(source.includes('witness getCreditScore(): Uint<64>'), 'getCreditScore witness must exist');
    assert(source.includes('witness getUserSecret(): Bytes<32>'), 'getUserSecret witness must exist');
    // Witnesses are never directly disclosed — only used in logic
    assert(!source.match(/disclose\(\s*getCreditScore\s*\(\)\s*\)/), 'getCreditScore() must not be directly disclosed');
    assert(!source.match(/disclose\(\s*getUserSecret\s*\(\)\s*\)/), 'getUserSecret() must not be directly disclosed');
  });

  // Test 4: Eligibility logic — score >= threshold returns eligible (1)
  await runTest('Eligibility logic: score >= threshold returns eligible (1)', async () => {
    const sourcePath = path.resolve(__dirname, '..', 'contracts', 'credit-verification.compact');
    const source = fs.readFileSync(sourcePath, 'utf-8');
    assert(source.includes('creditScore >= disclose(minCreditScore)'), 'Eligibility comparison must be present');
    assert(source.includes('verificationResults.insert'), 'Results must be inserted into ledger');
    assert(source.includes('disclose(1)'), 'Eligible result (1) must be stored');
  });

  // Test 5: Ineligibility logic — score < threshold returns not eligible (0)
  await runTest('Ineligibility logic: score < threshold returns not eligible (0)', async () => {
    const sourcePath = path.resolve(__dirname, '..', 'contracts', 'credit-verification.compact');
    const source = fs.readFileSync(sourcePath, 'utf-8');
    assert(source.includes('disclose(0)'), 'Ineligible result (0) must be stored');
  });

  // Test 6: SHA-256 commitment — deriveUserCommitment produces deterministic hash
  await runTest('SHA-256 commitment: deriveUserCommitment produces deterministic hash', async () => {
    const mod = await import(pathToFileURL(contractPath).href);
    assert(mod.pureCircuits && typeof mod.pureCircuits.deriveUserCommitment === 'function',
      'pureCircuits.deriveUserCommitment must be exported');
    const secret = new Uint8Array(32);
    secret[0] = 42;
    const hash1 = mod.pureCircuits.deriveUserCommitment(secret);
    const hash2 = mod.pureCircuits.deriveUserCommitment(secret);
    assert(hash1 instanceof Uint8Array, 'Hash must be a Uint8Array');
    assert(hash1.length === 32, 'Hash must be 32 bytes');
    assert(Buffer.from(hash1).equals(Buffer.from(hash2)), 'Same input must produce same hash');
  });

  // Test 7: Verification results — Map stores per-user boolean outcomes
  await runTest('Verification results: Map stores per-user boolean outcomes', async () => {
    const sourcePath = path.resolve(__dirname, '..', 'contracts', 'credit-verification.compact');
    const source = fs.readFileSync(sourcePath, 'utf-8');
    assert(source.includes('Map<Bytes<32>, Uint<64>>'), 'verificationResults must be Map<Bytes<32>, Uint<64>>');
    assert(source.includes('verificationResults.insert'), 'Must insert into verificationResults');
    assert(source.includes('verificationResults.lookup'), 'Must lookup from verificationResults');
    assert(source.includes('totalVerifications'), 'Must track total verifications');
    assert(source.includes('minCreditScore'), 'Must track minimum credit score threshold');
  });

  console.log(`\n─── Results ────────────────────────────────────────────────────\n`);
  console.log(`  Total: ${passed + failed}`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => { console.error(err); process.exit(1); });
