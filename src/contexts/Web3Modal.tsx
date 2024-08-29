import { BASE_MAINNET, ETHEREUM_MAINNET } from '@lib/constants/evm'
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react'
import { PropsWithChildren, FC, useEffect } from 'react'

export const Web3Modal: FC<PropsWithChildren> = ({ children }) => {
  useEffect(() => {
    const projectId = process.env.WALLETCONNECT_PUBLIC_PROJECT_ID || ''

    const metadata = {
      name: 'Coinecta',
      description: 'Launchpad on Cardano',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://coinecta.fi',
      icons: ['https://avatars.githubusercontent.com/u/37784886']
    }

    const ethersConfig = defaultConfig({
      /*Required*/
      metadata,
      /*Optional*/
      enableEIP6963: true, // true by default
      enableInjected: true, // true by default
      enableCoinbase: true, // true by default
      rpcUrl: 'https://base.llamarpc.com', // used for the Coinbase SDK
      defaultChainId: 8453 // used for the Coinbase SDK
    })

    // Create an AppKit instance
    createWeb3Modal({
      ethersConfig,
      chains: [ETHEREUM_MAINNET, BASE_MAINNET],
      projectId,
      enableAnalytics: true, // Optional - defaults to WalletConnect Cloud configuration
      themeVariables: {
        '--w3m-z-index': 9999,
      }
    })
  }, [])

  return children
}