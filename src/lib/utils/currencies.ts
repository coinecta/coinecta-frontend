export const getSymbol = (searchTerm: string) => {
  // Convert the search term to uppercase to make the comparison case-insensitive
  const upperSearchTerm = searchTerm.toUpperCase();

  for (let currency of currencies) {
    if (currency.ticker.toUpperCase() === upperSearchTerm || currency.name.toUpperCase() === upperSearchTerm) {
      return currency.symbol;
    }
  }

  return null;
}

export const currencies = [
  {
    ticker: 'ADA',
    name: 'Cardano',
    symbol: '₳'
  },
  {
    ticker: 'ERG',
    name: 'Ergo',
    symbol: 'Σ'
  }
]