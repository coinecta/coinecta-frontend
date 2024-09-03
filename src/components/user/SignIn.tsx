import React, { FC, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useTheme,
  useMediaQuery,
  Typography,
  Box,
  Collapse,
  CircularProgress
} from "@mui/material";
import { useWallet } from '@meshsdk/react';
import Link from "@components/Link";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WalletList from "./WalletList";
import { useWalletContext } from "@contexts/WalletContext";

interface ISignIn {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SignIn: FC<ISignIn> = ({ open, setOpen, setLoading }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const walletContext = useWallet()
  const [openNewUserInfo, setOpenNewUserInfo] = useState(false)
  const [connectedCallback, setConnectedCallback] = useState(false); // not used here, needed for WalletList
  const { providerLoading } = useWalletContext()

  const handleClose = () => {
    setOpen(false)
  }

  const handleOpenNewUserInfo = () => {
    setOpenNewUserInfo(!openNewUserInfo)
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen={fullScreen}
        PaperProps={{
          variant: 'outlined',
          elevation: 0
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: "800",
            fontSize: "32px",
          }}
        >
          Connect Wallet
        </DialogTitle>
        <DialogContent sx={{ minWidth: '350px', maxWidth: !fullScreen ? '460px' : null, pb: 0 }}>
          {providerLoading
            ? <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Box>
                <Typography sx={{ fontSize: '1rem!important', mb: 2 }}>
                  Please sign the message to login. This does not give us any access to your funds.
                </Typography>
                <Typography sx={{ fontSize: '1rem!important', mb: 2 }}>
                  <Link href="https://cips.cardano.org/cip/CIP-8">Read more about CIP-8</Link>
                </Typography>
                <Typography sx={{ fontSize: '1rem!important', mb: 2 }}>
                  <Link href="https://meshjs.dev/guides/prove-wallet-ownership">Read how we verify wallet ownership to handle logins</Link>
                </Typography>
                <Typography sx={{ fontSize: '1rem!important' }}>
                  Some hardware wallets do not support this feature. Please use an empty hot wallet to sign in. You will still be able to use the site with your hardware wallet.
                </Typography>
              </Box>
            </Box>
            : <>
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
              <WalletList setConnectedCallback={setConnectedCallback} setLoading={setLoading} />
            </>
          }
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
