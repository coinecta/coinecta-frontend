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
import { BrowserWallet } from '@meshsdk/core';
import { CardanoWallet, MeshBadge } from "@meshsdk/react";



interface IWalletList {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const WalletList: FC<IWalletList> = ({ setOpen, setLoading }) => {
  const theme = useTheme();
  const wallets = useWalletList();
  const { connecting, connect, error } = useWallet()
  const [openAddWallet, setOpenAddWallet] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  const handleConnect = async (walletName: string) => {
    try {
      setLoading(true)
      await connect(walletName)
    } catch {
      if (error) console.log(error)
    } finally {
      // handleClose()
      setLoading(false)
    }
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
      {connecting && (
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <CircularProgress sx={{ color: "black" }} size={"1.2rem"} />
        </Box>
      )}
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
    </>
  )
}

export default WalletList