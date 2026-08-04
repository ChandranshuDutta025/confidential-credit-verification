import { useWalletDetection } from "./useWalletDetection";

export function useWallet() {
  const {
    status: walletStatus,
    walletInfo,
    connect: connectWallet,
    disconnect: disconnectWallet,
    retry: retryDetection,
    error,
    copyToClipboard,
  } = useWalletDetection();

  return {
    walletStatus,
    walletInfo,
    connectWallet,
    disconnectWallet,
    retryDetection,
    error,
    copyToClipboard,
  };
}
