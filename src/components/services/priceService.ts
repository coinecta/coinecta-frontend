export const getCnctPriceAsync = async () => {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=coinecta&vs_currencies=usd');
    const data = await response.json();
    return parseFloat(data.coinecta.usd);
}

export const getAdaPriceAsync = async () => {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd');
    const data = await response.json();
    return parseFloat(data.cardano.usd);
}