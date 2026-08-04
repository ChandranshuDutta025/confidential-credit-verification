const PROOF_SERVER = import.meta.env.VITE_PROOF_SERVER_URL || 'http://127.0.0.1:6300';
const INDEXER_URL = import.meta.env.VITE_INDEXER_URL || 'http://127.0.0.1:8088/api/v4/graphql';
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';
const NETWORK = import.meta.env.VITE_NETWORK || 'preprod';

export function getConfig() {
  return { proofServer: PROOF_SERVER, indexerUrl: INDEXER_URL, contractAddress: CONTRACT_ADDRESS, network: NETWORK };
}

export async function deriveUserCommitment(secretHex: string): Promise<string> {
  const encoder = new TextEncoder();
  const prefix = encoder.encode('credit-verify:user:');
  const secretBytes = hexToBytes(secretHex);
  const combined = new Uint8Array(prefix.length + secretBytes.length);
  combined.set(prefix);
  combined.set(secretBytes, prefix.length);
  const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
  return bytesToHex(new Uint8Array(hashBuffer));
}

export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateSecret(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

export async function queryContractState(): Promise<{ minCreditScore: string; totalVerifications: string } | null> {
  if (!CONTRACT_ADDRESS) return null;
  const query = {
    query: `
      query ContractState($address: String!) {
        contractState(address: $address) {
          state
        }
      }
    `,
    variables: { address: CONTRACT_ADDRESS },
  };
  try {
    const res = await fetch(INDEXER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
      signal: AbortSignal.timeout(5000),
    });
    const json = await res.json();
    if (json?.data?.contractState?.state) {
      return { minCreditScore: '0', totalVerifications: '0' };
    }
    return null;
  } catch {
    return null;
  }
}

export async function generateProof(creditScore: number): Promise<boolean> {
  try {
    const res = await fetch(`${PROOF_SERVER}/prove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        circuit: 'verifyCreditScore',
        inputs: { creditScore: creditScore.toString() },
        contractAddress: CONTRACT_ADDRESS,
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`Proof server error: ${res.status}`);
    return true;
  } catch {
    return false;
  }
}
