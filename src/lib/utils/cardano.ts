import { BrowserWallet } from '@meshsdk/core';
import { useState } from 'react';

export const useCardano = () => {
    const [selectedAddresses, setSelectedAddresses] = useState<string[]>([]);

    return {
        selectedAddresses,
        isWalletConnected: async (walletName: string, walletAddress: string) => {
            try {
                const api = await BrowserWallet.enable(walletName);
                const changeAddress = await api.getChangeAddress();
                if (walletAddress === changeAddress) {
                    return true;
                }
                return false;
            } catch {
                return false;
            }
        },
        setSelectedAddresses: (addresses: string[]) => {
            // Check if running in a browser environment
            if (typeof window !== "undefined") {
                try {
                    // Convert the addresses array to a JSON string
                    const addressesJSON = JSON.stringify(addresses);
                    setSelectedAddresses(addresses);
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
                        setSelectedAddresses(JSON.parse(addressesJSON));
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
        }
    };
};