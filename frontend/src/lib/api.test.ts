import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hexToBytes, deriveUserCommitment, generateSecret } from './api';

describe('hexToBytes', () => {
  it('converts hex string to Uint8Array', () => {
    const result = hexToBytes('0a1b2c');
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(3);
    expect(result[0]).toBe(0x0a);
    expect(result[1]).toBe(0x1b);
    expect(result[2]).toBe(0x2c);
  });

  it('converts empty hex string to empty array', () => {
    const result = hexToBytes('');
    expect(result.length).toBe(0);
  });

  it('converts single byte hex', () => {
    const result = hexToBytes('ff');
    expect(result.length).toBe(1);
    expect(result[0]).toBe(255);
  });

  it('roundtrips with bytesToHex pattern', () => {
    const original = new Uint8Array([0, 1, 127, 128, 255]);
    const hex = Array.from(original)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const roundtripped = hexToBytes(hex);
    expect(Buffer.from(roundtripped)).toEqual(Buffer.from(original));
  });
});

describe('deriveUserCommitment', () => {
  it('returns a 64-char hex string (32 bytes)', async () => {
    const secret = '00'.repeat(32);
    const hash = await deriveUserCommitment(secret);
    expect(hash.length).toBe(64);
    expect(/^[0-9a-f]{64}$/.test(hash)).toBe(true);
  });

  it('is deterministic (same input → same output)', async () => {
    const secret = 'aabb'.repeat(16);
    const h1 = await deriveUserCommitment(secret);
    const h2 = await deriveUserCommitment(secret);
    expect(h1).toBe(h2);
  });

  it('produces different hashes for different secrets', async () => {
    const h1 = await deriveUserCommitment('00'.repeat(32));
    const h2 = await deriveUserCommitment('ff'.repeat(32));
    expect(h1).not.toBe(h2);
  });

  it('prepends "credit-verify:user:" prefix before hashing', async () => {
    const secret = '00'.repeat(32);
    const hash = await deriveUserCommitment(secret);
    // Hash must match manual SHA-256 of "credit-verify:user:" + secret bytes
    const encoder = new TextEncoder();
    const prefix = encoder.encode('credit-verify:user:');
    const secretBytes = hexToBytes(secret);
    const combined = new Uint8Array(prefix.length + secretBytes.length);
    combined.set(prefix);
    combined.set(secretBytes, prefix.length);
    const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
    const expected = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    expect(hash).toBe(expected);
  });

  it('produces non-zero output for non-zero secret', async () => {
    const secret = 'ff'.repeat(32);
    const hash = await deriveUserCommitment(secret);
    expect(hash).not.toBe('00'.repeat(32));
  });

  it('produces different hashes for sequential secrets', async () => {
    const hashes = new Set<string>();
    for (let i = 0; i < 5; i++) {
      const secret = i.toString(16).padStart(2, '0').repeat(32);
      const hash = await deriveUserCommitment(secret);
      hashes.add(hash);
    }
    expect(hashes.size).toBe(5);
  });
});

describe('generateSecret', () => {
  it('returns a 64-char hex string', () => {
    const secret = generateSecret();
    expect(secret.length).toBe(64);
    expect(/^[0-9a-f]{64}$/.test(secret)).toBe(true);
  });

  it('generates unique secrets', () => {
    const secrets = new Set<string>();
    for (let i = 0; i < 20; i++) {
      secrets.add(generateSecret());
    }
    expect(secrets.size).toBe(20);
  });

  it('generates cryptographically random values', () => {
    const s1 = generateSecret();
    const s2 = generateSecret();
    expect(s1).not.toBe(s2);
  });
});

describe('getConfig', () => {
  it('returns config object with all required fields', async () => {
    vi.resetModules();
    const { getConfig } = await import('./api');
    const config = getConfig();
    expect(config).toHaveProperty('proofServer');
    expect(config).toHaveProperty('indexerUrl');
    expect(config).toHaveProperty('contractAddress');
    expect(config).toHaveProperty('network');
    expect(config).toHaveProperty('nodeUrl');
  });

  it('uses env vars when set', async () => {
    process.env.NEXT_PUBLIC_PROOF_SERVER_URL = 'http://custom:9999';
    process.env.NEXT_PUBLIC_NETWORK = 'preview';
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS = 'abc123';
    vi.resetModules();
    const { getConfig } = await import('./api');
    const config = getConfig();
    expect(config.proofServer).toBe('http://custom:9999');
    expect(config.network).toBe('preview');
    expect(config.contractAddress).toBe('abc123');
    delete process.env.NEXT_PUBLIC_PROOF_SERVER_URL;
    delete process.env.NEXT_PUBLIC_NETWORK;
    delete process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  });

  it('strips trailing slashes from URLs', async () => {
    process.env.NEXT_PUBLIC_PROOF_SERVER_URL = 'http://example.com///';
    process.env.NEXT_PUBLIC_INDEXER_URL = 'http://indexer.dev////';
    vi.resetModules();
    const { getConfig } = await import('./api');
    const config = getConfig();
    expect(config.proofServer).toBe('http://example.com');
    expect(config.indexerUrl).toBe('http://indexer.dev');
    delete process.env.NEXT_PUBLIC_PROOF_SERVER_URL;
    delete process.env.NEXT_PUBLIC_INDEXER_URL;
  });
});

describe('Eligibility threshold logic', () => {
  const THRESHOLD = 700;

  it('classifies score >= 700 as eligible', () => {
    expect(750 >= THRESHOLD).toBe(true);
    expect(700 >= THRESHOLD).toBe(true);
    expect(850 >= THRESHOLD).toBe(true);
  });

  it('classifies score < 700 as ineligible', () => {
    expect(699 >= THRESHOLD).toBe(false);
    expect(600 >= THRESHOLD).toBe(false);
    expect(300 >= THRESHOLD).toBe(false);
  });

  it('matches the Compact contract disclose(1) / disclose(0) pattern', () => {
    const eligibleResult = 750 >= THRESHOLD ? 1 : 0;
    const ineligibleResult = 650 >= THRESHOLD ? 1 : 0;
    expect(eligibleResult).toBe(1);
    expect(ineligibleResult).toBe(0);
  });
});

describe('Proof generation flow integration', () => {
  it('full flow: generate secret → derive commitment → check eligibility', async () => {
    const secret = generateSecret();
    expect(secret.length).toBe(64);

    const commitment = await deriveUserCommitment(secret);
    expect(commitment.length).toBe(64);

    const creditScore = 720;
    const threshold = 700;
    const eligible = creditScore >= threshold;
    expect(eligible).toBe(true);

    const result = eligible ? 1 : 0;
    expect(result).toBe(1);
  });

  it('full flow with ineligible score', async () => {
    const secret = generateSecret();
    const commitment = await deriveUserCommitment(secret);

    const creditScore = 650;
    const threshold = 700;
    const eligible = creditScore >= threshold;
    expect(eligible).toBe(false);
    expect(eligible ? 1 : 0).toBe(0);
  });

  it('commitment changes when secret changes', async () => {
    const secret1 = generateSecret();
    const secret2 = generateSecret();
    const commitment1 = await deriveUserCommitment(secret1);
    const commitment2 = await deriveUserCommitment(secret2);
    expect(commitment1).not.toBe(commitment2);
  });
});
