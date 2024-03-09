import React, {
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  FC
} from 'react';
import { Session } from 'next-auth';
import { getSession } from 'next-auth/react';

type Wallet = {
  connected: boolean;
  type: string;
  changeAddress: string;
  addresses: string[];
}

interface WalletState {
  wallet: Wallet;
  sessionData: Session | null;
  sessionStatus: "loading" | "authenticated" | "unauthenticated";
  selectedAddresses: string[],
  providerLoading: boolean;
}

interface WalletContextType extends WalletState {
  setWallet: React.Dispatch<React.SetStateAction<WalletState['wallet']>>;
  setSessionData: React.Dispatch<React.SetStateAction<WalletState['sessionData']>>;
  setSessionStatus: React.Dispatch<React.SetStateAction<WalletState['sessionStatus']>>;
  setProviderLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedAddresses: React.Dispatch<React.SetStateAction<string[]>>;
  fetchSessionData: Function;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const WalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletState['wallet']>({
    connected: false,
    type: '',
    changeAddress: '',
    addresses: [],
  });
  const [providerLoading, setProviderLoading] = useState<boolean>(false);
  const [sessionData, setSessionData] = useState<WalletState['sessionData']>(null)
  const [sessionStatus, setSessionStatus] = useState<WalletState['sessionStatus']>('unauthenticated')
  const [selectedAddresses, setSelectedAddresses] = useState<string[]>([])

  const fetchSessionData = useCallback(async () => {
    setProviderLoading(true)
    try {
      const updatedSessionData = await getSession();

      if (updatedSessionData) {
        setSessionData(updatedSessionData);
        setSessionStatus("authenticated");
      } else {
        setSessionData(null);
        setSessionStatus("unauthenticated");
      }
    } catch (error) {
      console.error("Failed to fetch session data:", error);
      setSessionData(null);
      setSessionStatus("unauthenticated");
    }
    setProviderLoading(false)
  }, []);

  useEffect(() => {
    fetchSessionData();
  }, [fetchSessionData]);

  // Context values passed to consumer
  const value = {
    wallet,
    setWallet,
    sessionData,
    setSessionData,
    sessionStatus,
    setSessionStatus,
    fetchSessionData,
    providerLoading,
    setProviderLoading,
    selectedAddresses,
    setSelectedAddresses
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

const useWalletContext = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

export { WalletProvider, useWalletContext };