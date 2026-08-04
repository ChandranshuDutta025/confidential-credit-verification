export interface WalletInfo {
  address: string;
  networkId: string;
  walletName: string;
}

export interface VerificationResult {
  txId: string;
  blockHeight: string;
  userHash: string;
  eligible: boolean;
}
