import React, { FC, useState } from "react";
import {
  Button,
  CircularProgress,
  useTheme,
  Typography,
  Box,
  Collapse
} from "@mui/material";
import { useWalletList, useWallet } from '@meshsdk/react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { WalletListItemComponent } from "./WalletListItem";
import { walletsList, filterInstalledWallets } from "@lib/walletsList";

interface IWalletList {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const WalletList: FC<IWalletList> = ({ setOpen, setLoading }) => {
  const theme = useTheme();
  const wallets = useWalletList();
  const { wallet, connected, name, connecting, connect, disconnect, error } = useWallet()
  const [openAddWallet, setOpenAddWallet] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  const handleConnect = (walletName: string) => {
    setLoading(true)
    if (connected) {
      try {
        disconnect()
      } catch (e: any) {
        console.log(e)
      } finally {
        connect(walletName)
      }
    } else connect(walletName)
    handleClose()
  }

  const handleOpenAddWallet = () => {
    setOpenAddWallet(!openAddWallet)
  }

  const installedWallets = filterInstalledWallets(wallets)

  const notInstalledWallets = walletsList.filter(walletListEntry =>
    !installedWallets.includes(walletListEntry)
  );

  return (
    <>
      {
        connecting ? (
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
                    Install a wallet:
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
        )
      }
    </>
  )
}

export default WalletList