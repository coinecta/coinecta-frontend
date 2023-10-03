import React, { FC, useEffect, useContext } from "react";
import { useRouter } from "next/router";
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
  ListItemButton
} from "@mui/material";
import { useWalletList, useAddress, useWallet } from '@meshsdk/react';

const WALLET_ADDRESS = "wallet_address_coinecta";
const WALLET_NAME = "wallet_name_coinecta";

interface IAddWallet {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AddWallet: FC<IAddWallet> = ({ open, setOpen }) => {
  const router = useRouter();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const wallets = useWalletList();
  const walletContext = useWallet()
  const connectedWalletAddress = useAddress(0);

  useEffect(() => {
    // load primary address
    const storedWalletAddress = localStorage.getItem(WALLET_ADDRESS);
    // load wallet state
    const storedWalletName = localStorage.getItem(WALLET_NAME);
    if (
      storedWalletAddress !== null &&
      storedWalletName !== null &&
      storedWalletAddress !== "" &&
      storedWalletName !== ""
    ) {
      walletContext.connect(storedWalletName)
    }
  }, [])

  const handleClose = () => {
    setOpen(false)
  }

  const handleConnect = (walletName: string) => {
    walletContext.connect(walletName)
    if (connectedWalletAddress) {
      localStorage.setItem(WALLET_ADDRESS, connectedWalletAddress);
      localStorage.setItem(WALLET_NAME, walletContext.name);
    }
  }

  useEffect(() => {
    if (walletContext.connecting === false) {
      setOpen(false)
    }
    if (connectedWalletAddress) {
      localStorage.setItem(WALLET_ADDRESS, connectedWalletAddress);
      localStorage.setItem(WALLET_NAME, walletContext.name);
    }
  }, [walletContext.connecting, connectedWalletAddress])

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen={fullScreen}
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
        <DialogContent sx={{ minWidth: '350px', pb: 0 }}>
          {walletContext.connecting ? (
            <CircularProgress sx={{ ml: 2, color: "black" }} size={"1.2rem"} />
          ) : (
            <List>
              {wallets.map((wallet, i) => {
                return (
                  <ListItemButton key={i} onClick={() => handleConnect(wallet.name)}>
                    <ListItemAvatar>
                      <Avatar alt={wallet.name + ' Icon'} src={wallet.icon} sx={{ height: '24px', width: '24px' }} variant="square" />
                    </ListItemAvatar>
                    <ListItemText primary={wallet.name} />
                  </ListItemButton>
                )
              })}
            </List>
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

export default AddWallet;
