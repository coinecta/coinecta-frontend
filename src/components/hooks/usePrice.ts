import { getAdaPriceAsync, getCnctPriceAsync } from '@components/services/priceService';
import { useEffect, useState } from 'react';

const expireTime = 60 * 60 * 1000;
export const usePrice = () => {
    const [cnctPrice, setCnctPrice] = useState<number>(0);
    const [adaPrice, setAdaPrice] = useState<number>(0);

    useEffect(() => {

        if (typeof window !== 'undefined' && window.localStorage) {
            const cachedCnctPrice = window.localStorage.getItem('cnctPrice');

            if (cachedCnctPrice !== null) {
                const cachedCnctPriceObject = JSON.parse(cachedCnctPrice);
                if (cachedCnctPriceObject) {
                    setCnctPrice(parseFloat(cachedCnctPriceObject.value));
                }
            }

            const cachedAdaPrice = window.localStorage.getItem('adaPrice');
            if (cachedAdaPrice !== null) {
                const cachedAdaPriceObject = JSON.parse(cachedAdaPrice);
                if (cachedAdaPriceObject) {
                    setAdaPrice(parseFloat(cachedAdaPriceObject.value));
                }
            }
        }


        const fetchCnctPrice = async () => {
            try {
                const cachedData = typeof window !== 'undefined' && window.localStorage.getItem('cnctPrice') ? JSON.parse(window.localStorage.getItem('cnctPrice')!) : null;

                const now = Date.now();

                if (!cachedData || now - cachedData.lastFetch > expireTime) {
                    const cnctPrice = await getCnctPriceAsync();
                    setCnctPrice(cnctPrice);

                    if (typeof window !== 'undefined' && window.localStorage) {
                        window.localStorage.setItem('cnctPrice', JSON.stringify({ value: cnctPrice, lastFetch: now }));
                    }
                } else {
                    setCnctPrice(cachedData.value);
                }
            } catch (e) {
                console.error(e);
            }
        };

        const fetchAdaPrice = async () => {
            try {
                const cachedData = typeof window !== 'undefined' && window.localStorage.getItem('adaPrice') ? JSON.parse(window.localStorage.getItem('adaPrice')!) : null;

                const now = Date.now();

                if (!cachedData || now - cachedData.lastFetch > expireTime) {
                    const adaPrice = await getAdaPriceAsync();
                    setAdaPrice(adaPrice);

                    if (typeof window !== 'undefined' && window.localStorage) {
                        window.localStorage.setItem('adaPrice', JSON.stringify({ value: adaPrice, lastFetch: now }));
                    }
                } else {
                    setAdaPrice(cachedData.value);
                }
            } catch (e) {
                console.error(e);
            }
        };

        fetchCnctPrice();
        fetchAdaPrice();

        const interval = setInterval(() => {
            fetchCnctPrice();
            fetchAdaPrice();
        }, expireTime);

        return () => clearInterval(interval);

    }, []);

    const convertToUSD = (amount: number, token: "ADA" | "CNCT") => {
        if (token === "ADA") {
            return amount * adaPrice;
        } else {
            return amount * cnctPrice;
        }
    }

    const convertUSDToADA = (amountInUSD: number) => {
        return amountInUSD / adaPrice;
    }

    const convertCnctToADA = (amountInCNCT: number) => {
        return convertToUSD(amountInCNCT, "CNCT") / adaPrice;
    }

    return {
        cnctPrice,
        adaPrice,
        convertToUSD,
        convertUSDToADA,
        convertCnctToADA
    };
};
