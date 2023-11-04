import React, { FC, useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  useTheme,
  useMediaQuery,
  List,
  ListItemAvatar,
  Avatar,
  ListItemText,
  ListItemButton,
  Typography,
  ListItem,
  Box,
  Collapse
} from "@mui/material";
import { useWalletList, useWallet } from '@meshsdk/react';
import { signIn } from "next-auth/react"; // Import signIn from next-auth
import Link from "@components/Link";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface ISignIn {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

type WalletListItem = {
  name: string;
  connectName: string;
  icon: string;
  iconDark: string;
  mobile: boolean;
  url: string;
}

const walletsList: WalletListItem[] = [
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

const VESPR_ICON = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbDpzcGFjZT0icHJlc2VydmUiIHZpZXdCb3g9IjAgMCA2NDAgNjQwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJyZ2JhKDksIDE0LCAyMiwgMSkiIHJ4PSIxMDAiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJtNDU1LjUxOCAxNzguMDQwOC0xMzUuMjQzNiAxODIuNzV2LS43Mzk2TDE4NC45NjIgMTc3LjE4MDhINzAuOTI2bDM1LjE3NCA0Ny41NThoMzMuOTE4NEwzMjAuMjA1NiA0NjIuMTE2di45NjMybDE4MC4yNTYtMjM3LjQ5NzZINTM0LjM4bDM1LjE3NC00Ny41NDA4SDQ1NS41MTh6Ii8+PHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZD0iTTMwMC45OTkgMTAyaC4wMDIiLz48L3N2Zz4='

export const SignIn: FC<ISignIn> = ({ open, setOpen, setLoading }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const wallets = useWalletList();
  const walletContext = useWallet()
  const [openAddWallet, setOpenAddWallet] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  const handleConnect = (walletName: string) => {
    setLoading(true)
    walletContext.connect(walletName)
    handleClose()
  }

  interface WalletListItemProps extends WalletListItem {
    link?: boolean;
  }

  const WalletListItemComponent: FC<WalletListItemProps> = ({
    name,
    connectName,
    icon,
    iconDark,
    mobile,
    url,
    link = false
  }) => {
    return (
      <Button
        endIcon={<Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          {mobile && <Box>
            <Typography sx={{ fontSize: '0.9rem !important', color: theme.palette.text.secondary }}>
              {name !== 'VESPR' ? 'Mobile supported' : 'Awaiting software update'}
            </Typography>
          </Box>}
          {link && <OpenInNewIcon sx={{ height: '16px', width: '16px' }} />}
        </Box>}
        startIcon={<Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          <Avatar
            alt={
              name + ' Icon'
            }
            src={theme.palette.mode === 'dark' ? iconDark : icon}
            sx={{ height: '24px', width: '24px' }}
            variant="square"
          />
          <Box>
            <Typography sx={{ fontSize: '1rem !important', color: theme.palette.text.primary }}>
              {name}
            </Typography>
          </Box>
        </Box>}
        sx={{
          background: name !== 'VESPR' ? theme.palette.background.paper : theme.palette.divider,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '6px',
          mb: 1,
          px: 2,
          py: 1,
          justifyContent: "space-between",
          textTransform: 'none',
          '& .MuiListItemSecondaryAction-root': {
            height: '24px'
          },
          color: theme.palette.text.secondary
        }}
        // disabled={name === 'VESPR'}
        fullWidth
        onClick={
          link
            ? () => window.open(url, '_blank', 'noopener,noreferrer')
            : () => handleConnect(connectName)
        }
      />
    )
  }

  const handleOpenAddWallet = () => {
    setOpenAddWallet(!openAddWallet)
  }

  const installedWallets = walletsList.filter(walletListEntry => {
    const correspondingWallet = wallets.find(wallet =>
      walletListEntry.connectName === wallet.name &&
      !(wallet.icon === VESPR_ICON && wallet.name !== 'VESPR')
    );

    return correspondingWallet !== undefined;
  }).map(walletListEntry => walletListEntry);

  const notInstalledWallets = walletsList.filter(walletListEntry =>
    !installedWallets.includes(walletListEntry)
  );

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen={fullScreen}
        PaperProps={{
          variant: 'outlined'
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: "800",
            fontSize: "32px",
          }}
        >
          {walletContext.connected ? "Wallet Connected" : "Connect Wallet"}
        </DialogTitle>
        <DialogContent sx={{ minWidth: '350px', maxWidth: !fullScreen ? '460px' : null, pb: 0 }}>
          <Typography sx={{ fontSize: '0.9rem !important', color: theme.palette.text.secondary, mb: 2, textAlign: 'center' }}>
            By connecting, you agree to the&nbsp;<Link href="/terms">Terms &amp; Conditions</Link>&nbsp;and&nbsp;<Link href="/privacy">Privacy Policy</Link>.
          </Typography>
          {walletContext.connecting ? (
            <CircularProgress sx={{ ml: 2, color: "black" }} size={"1.2rem"} />
          ) : (
            <>
              {installedWallets.map((wallet) => (
                <WalletListItemComponent {...wallet} key={wallet.name} />
              ))}
              {notInstalledWallets.length > 0 && (
                <>
                  <Collapse in={openAddWallet}>
                    <Typography sx={{ fontSize: '1rem !important', mb: 1, textAlign: 'center' }}>
                      Add a wallet:
                    </Typography>

                    {notInstalledWallets.map((walletListEntry) => (
                      <WalletListItemComponent {...walletListEntry} link key={walletListEntry.name} />
                    ))}
                  </Collapse>
                  <Button
                    endIcon={<ExpandMoreIcon sx={{ transform: openAddWallet ? 'rotate(180deg)' : null }} />}
                    startIcon={
                      <Box>
                        <Typography sx={{ fontSize: '1rem !important', color: theme.palette.text.primary }}>
                          {`${openAddWallet ? 'Hide uninstalled wallets' : `View other wallet options (${notInstalledWallets.length})`}`}
                        </Typography>
                      </Box>}
                    sx={{
                      background: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: '6px',
                      mb: 1,
                      px: 2,
                      textTransform: 'none',
                      '& .MuiListItemSecondaryAction-root': {
                        height: '24px'
                      },
                      color: theme.palette.text.secondary,
                      justifyContent: "space-between"
                    }}
                    fullWidth
                    onClick={() => handleOpenAddWallet()}
                  />
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close Window</Button>
          {walletContext.connected && (
            <Button
              onClick={() => walletContext.disconnect()}
            >
              Disconnect
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SignIn;
