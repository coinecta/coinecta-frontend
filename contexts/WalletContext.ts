import React, { createContext } from "react";

interface IWalletType {
  name: string;
  icon: string;
  version: string;
}

export interface IWalletContext {
  walletAddress: string;
  setWalletAddress: React.Dispatch<React.SetStateAction<string>>;
  walletType: IWalletType;
  setWalletType: React.Dispatch<React.SetStateAction<IWalletType>>;
}

export const WalletContext = createContext({} as IWalletContext);
