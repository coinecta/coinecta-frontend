import { Wallet } from "@meshsdk/core";

export const VESPR_ICON = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbDpzcGFjZT0icHJlc2VydmUiIHZpZXdCb3g9IjAgMCA2NDAgNjQwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJyZ2JhKDksIDE0LCAyMiwgMSkiIHJ4PSIxMDAiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJtNDU1LjUxOCAxNzguMDQwOC0xMzUuMjQzNiAxODIuNzV2LS43Mzk2TDE4NC45NjIgMTc3LjE4MDhINzAuOTI2bDM1LjE3NCA0Ny41NThoMzMuOTE4NEwzMjAuMjA1NiA0NjIuMTE2di45NjMybDE4MC4yNTYtMjM3LjQ5NzZINTM0LjM4bDM1LjE3NC00Ny41NDA4SDQ1NS41MTh6Ii8+PHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZD0iTTMwMC45OTkgMTAyaC4wMDIiLz48L3N2Zz4='

export const walletNameToId = (name: string) => {
  return {
    Nami: 'nami',
    'Begin Wallet': 'begin',
    eternl: 'eternl',
    'Flint Wallet': 'flint',
    lace: 'lace',
    NuFi: 'nufi',
    GeroWallet: 'gero',
    'Typhon Wallet': 'typhon',
    VESPR: 'vespr'
  }[name];
};

export const walletDataByName = (name: string) => {
  return walletsList.find(wallet => wallet.connectName === name);
}

export const walletsList: TWalletListItem[] = [
  {
    name: 'Begin',
    connectName: 'Begin Wallet',
    icon: '/wallets/begin-light.svg',
    iconDark: '/wallets/begin-dark.svg',
    mobile: true,
    url: 'https://begin.is/'
  },
  {
    name: 'Eternl',
    connectName: 'eternl',
    icon: '/wallets/eternl-light.svg',
    iconDark: '/wallets/eternl-light.svg',
    mobile: true,
    url: 'https://eternl.io/'
  },
  {
    name: 'Flint',
    connectName: 'Flint Wallet',
    icon: '/wallets/flint-light.svg',
    iconDark: '/wallets/flint-light.svg',
    mobile: true,
    url: 'https://flint-wallet.com/'
  },
  {
    name: 'Lace',
    connectName: 'lace',
    icon: '/wallets/lace.svg',
    iconDark: '/wallets/lace.svg',
    mobile: false,
    url: 'https://www.lace.io/'
  },
  {
    name: 'Nami',
    connectName: 'Nami',
    icon: '/wallets/nami-light.svg',
    iconDark: '/wallets/nami-light.svg',
    mobile: false,
    url: 'https://namiwallet.io/'
  },
  {
    name: 'NuFi',
    connectName: 'NuFi',
    icon: '/wallets/nufi-navbar-light.svg',
    iconDark: '/wallets/nufi-navbar-dark.svg',
    mobile: false,
    url: 'https://nu.fi/'
  },
  {
    name: 'Gero',
    connectName: 'GeroWallet',
    icon: '/wallets/gerowallet.svg',
    iconDark: '/wallets/gerowallet.svg',
    mobile: true,
    url: 'https://gerowallet.io/'
  },
  {
    name: 'Typhon',
    connectName: 'Typhon Wallet',
    icon: '/wallets/typhon-light.svg',
    iconDark: '/wallets/typhon-dark.svg',
    mobile: false,
    url: 'https://typhonwallet.io/'
  },
  {
    name: 'VESPR',
    connectName: 'VESPR',
    icon: '/wallets/vespr-light.svg',
    iconDark: '/wallets/vespr-dark.svg',
    mobile: true,
    url: 'https://www.vespr.xyz/'
  }
]

export const filterInstalledWallets = (wallets: Wallet[]) => {
  return walletsList.filter(walletListEntry => {
    const correspondingWallet = wallets.find(wallet =>
      walletListEntry.connectName === wallet.name &&
      !(wallet.icon === VESPR_ICON && wallet.name !== 'VESPR')
    );

    return correspondingWallet !== undefined;
  });
}