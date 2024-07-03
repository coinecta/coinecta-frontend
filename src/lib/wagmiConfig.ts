// wagmiConfig.ts

import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';

import { cookieStorage, createStorage } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';

if (!process.env.WALLETCONNECT_PUBLIC_PROJECT_ID) {
    throw new Error('You need to provide NEXT_PUBLIC_PROJECT_ID env variable');
}

export const projectId = process.env.WALLETCONNECT_PUBLIC_PROJECT_ID;

const metadata = {
    name: 'Coinecta',
    description: 'AppKit Example',
    url: 'https://coinecta.fi', // origin must match your domain & subdomain
    icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Create wagmiConfig
const chains = [mainnet, sepolia] as const
export const config = defaultWagmiConfig({
    chains,
    projectId,
    metadata,
    ssr: true,
    storage: createStorage({
        storage: cookieStorage
    }),
    // ...wagmiOptions // Optional - Override createConfig parameters
})