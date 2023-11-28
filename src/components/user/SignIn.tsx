import React, { FC, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Typography,
  Box,
  Collapse
} from "@mui/material";
import { useWalletList, useWallet } from '@meshsdk/react';
import Link from "@components/Link";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { WalletListItemComponent } from "./WalletListItem";
import { walletsList, filterInstalledWallets } from "@lib/walletsList";

interface ISignIn {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SignIn: FC<ISignIn> = ({ open, setOpen, setLoading }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const wallets = useWalletList();
  const walletContext = useWallet()
  const [openAddWallet, setOpenAddWallet] = useState(false)
  const [openNewUserInfo, setOpenNewUserInfo] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  const handleConnect = (walletName: string) => {
    setLoading(true)
    walletContext.connect(walletName)
    handleClose()
  }

  const handleOpenAddWallet = () => {
    setOpenAddWallet(!openAddWallet)
  }
  const handleOpenNewUserInfo = () => {
    setOpenNewUserInfo(!openNewUserInfo)
  }

  const installedWallets = filterInstalledWallets(wallets)

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
          <>
            <Collapse in={openNewUserInfo}>
              <Typography variant="body2" sx={{ fontSize: '1rem!important' }}>
                We use a Web3 sign in method rather than social profiles or your email address. The address you use to sign up will be your login. You can use the same address on other devices to login to the same account.
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '1rem!important' }}>
                When logging in, it will ask you to sign a message. This does not give us permission to access any funds in your wallet, but it protects any private information you may provide while using the site.
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '1rem!important' }}>
                Ledger currently does not support this functionality. If you are using a Ledger, please create an account with another address. We will provide areas to manually track and use your Ledger wallet while logged in with a standard account.
              </Typography>
            </Collapse>
            <Button
              endIcon={<ExpandMoreIcon sx={{ transform: openNewUserInfo ? 'rotate(180deg)' : null }} />}
              startIcon={
                <Box>
                  <Typography sx={{ fontSize: '1rem !important', color: theme.palette.text.primary }}>
                    {`${openNewUserInfo ? 'Hide new user info' : `New user information`}`}
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
              onClick={() => handleOpenNewUserInfo()}
            />
          </>
          <Typography sx={{ fontSize: '0.9rem !important', color: theme.palette.text.secondary, mb: 2, textAlign: 'center' }}>
            By connecting, you agree to the&nbsp;<Link href="/terms">Terms &amp; Conditions</Link>&nbsp;and&nbsp;<Link href="/privacy">Privacy Policy</Link>.
          </Typography>
          {walletContext.connecting ? (
            <CircularProgress sx={{ ml: 2, color: "black" }} size={"1.2rem"} />
          ) : (
            <>
              {installedWallets.map((wallet) => (
                <WalletListItemComponent {...wallet} key={wallet.name} handleConnect={handleConnect} />
              ))}
              {notInstalledWallets.length > 0 && (
                <>
                  <Collapse in={openAddWallet}>
                    <Typography sx={{ fontSize: '1rem !important', mb: 1, textAlign: 'center' }}>
                      Add a wallet:
                    </Typography>

                    {notInstalledWallets.map((walletListEntry) => (
                      <WalletListItemComponent {...walletListEntry} link key={walletListEntry.name} handleConnect={handleConnect} />
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
