import { useWalletContext } from '@contexts/WalletContext';
import { BrowserWallet } from '@meshsdk/core';
import { useEffect, useMemo } from 'react';
import { trpc } from './trpc';

export const useCardano = () => {
    const { setSelectedAddresses } = useWalletContext();

    const getWallets = trpc.user.getWallets.useQuery()
    const wallets = useMemo(() => getWallets.data && getWallets.data.wallets, [getWallets]);

    const api = {
        isWalletConnected: async (walletName: string, walletAddress: string) => {
            try {
                const api = await BrowserWallet.enable(walletName);
                const changeAddress = await api.getChangeAddress();
                return walletAddress === changeAddress;
            } catch {
                return false;
            }
        },
        setSelectedAddresses: (addresses: string[]) => {
            // Check if running in a browser environment
            if (typeof window !== "undefined") {
                try {
                    setSelectedAddresses(addresses)

                    // Convert the addresses array to a JSON string
                    const addressesJSON = JSON.stringify(addresses);

                    // Store the JSON string in localStorage under the key 'selectedAddresses'
                    localStorage.setItem('selectedAddresses', addressesJSON);
                } catch (error) {
                    console.error('Failed to save addresses to localStorage:', error);
                }
            } else {
                console.log('localStorage is not available. This code might be running on the server side.');
            }
        },
        getSelectedAddresses: (): string[] => {
            // Check if running in a browser environment
            if (typeof window !== "undefined") {
                try {
                    // Retrieve the JSON string from localStorage under the key 'selectedAddresses'
                    const addressesJSON = localStorage.getItem('selectedAddresses');
                    // If the JSON string is not null, parse it and return the result
                    if (addressesJSON !== null) {
                        return JSON.parse(addressesJSON);
                    }
                } catch (error) {
                    console.error('Failed to retrieve addresses from localStorage:', error);
                }
            } else {
                console.log('localStorage is not available. This code might be running on the server side.');
            }

            // If the JSON string was null or an error occurred, return an empty array
            return [];
        },
        getAddressWalletType: (address: string) => {
            return wallets?.find(wallet => wallet.changeAddress === address)?.type;
        },
        clearSelectedAddresses: () => {
            localStorage.removeItem('selectedAddresses');
        }
    };

    useEffect(() => {
        setSelectedAddresses(api.getSelectedAddresses());
    }, []);

    return api;
};