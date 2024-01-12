import React, { FC, useEffect, useState } from "react";
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
  Avatar,
  IconButton
} from "@mui/material";
import { useWallet } from '@meshsdk/react';
import Link from "@components/Link";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WalletList from "./WalletList";
import { useAlert } from "@contexts/AlertContext";
import { walletsList } from "@lib/walletsList";
import { deleteEmptyUser } from "@server/utils/deleteEmptyUser";
import { signIn } from "next-auth/react";
import { trpc } from "@lib/utils/trpc";
import { getShorterAddress } from "@lib/utils/general";
import ClearIcon from '@mui/icons-material/Clear';
import { useWalletContext } from '@contexts/WalletContext';
import { TRPCClientError } from "@trpc/client";

interface IAddWallet {

}

export const AddWallet: FC<IAddWallet> = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { addAlert } = useAlert()
  const { wallet, connected, name, connecting, connect, disconnect, error } = useWallet()
  const [openAddWallet, setOpenAddWallet] = useState(false)
  const [walletSelected, setWalletSelected] = useState(true) // true to use a "false" trigger when a wallet is selected
  const [openManageWallets, setOpenManageWallets] = useState(false)
  const [shouldRefetch, setShouldRefetch] = useState(false)
  const [loading, setLoading] = useState(false)
  const { sessionData } = useWalletContext()

  const getWallets = trpc.user.getWallets.useQuery()

  useEffect(() => {
    if (connected && !walletSelected) {
      addNewWallet()
      setWalletSelected(true)
    }
    else { console.log('not connected') }
  }, [connected, walletSelected]);

  const mutateAddWallet = trpc.user.addWallet.useMutation()

  const addNewWallet = async () => {
    const thisChangeAddress = await wallet.getChangeAddress();
    const thisRewardAddress = await wallet.getRewardAddresses();
    const thisUnusedAddresses = await wallet.getUnusedAddresses();
    const thisUsedAddresses = await wallet.getUsedAddresses();
    try {
      await mutateAddWallet.mutateAsync({
        type: name,
        changeAddress: thisChangeAddress,
        rewardAddress: thisRewardAddress[0],
        unusedAddresses: thisUnusedAddresses,
        usedAddresses: thisUsedAddresses
      })
      addAlert("success", `Successfully added wallet ${getShorterAddress(thisChangeAddress, 6)}`)
      setShouldRefetch(true)
      setOpenManageWallets(true)
      setOpenAddWallet(false)
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof TRPCClientError ? e.message : 'Failed to add wallet.';
      addAlert('error', errorMessage);
    } finally { setWalletSelected(true) }
  }

  const handleOpenAddWallet = () => {
    if (!openAddWallet) {
      setOpenManageWallets(false)
    }
    setOpenAddWallet(!openAddWallet)
  }
  const handleOpenManageWallets = () => {
    if (!openManageWallets) {
      setOpenAddWallet(false)
    }
    setOpenManageWallets(!openManageWallets)
  }

  useEffect(() => {
    if (shouldRefetch) {
      const doRefetch = async () => {
        try {
          await getWallets.refetch();
          setShouldRefetch(false);
        } catch (error) {
          console.error('Failed to refetch data:', error);
          addAlert('error', 'Failed to update data. Please refresh the page.');
        }
      };

      doRefetch();
    }
  }, [shouldRefetch])
  const deleteWallet = trpc.user.removeWallet.useMutation()
  const removeWallet = async (id: number) => {
    await deleteWallet.mutateAsync({ walletId: id })
    setShouldRefetch(true)
  }

  return (
    <Box sx={{ display: 'block', position: 'relative', maxWidth: 'sm' }}>
      <Button
        endIcon={<ExpandMoreIcon sx={{ transform: openAddWallet ? 'rotate(180deg)' : null }} />}
        startIcon={
          <Box>
            <Typography sx={{ fontSize: '1rem !important', color: theme.palette.text.primary }}>
              {openAddWallet ? 'Close wallet list' : `Add a wallet`}
            </Typography>
          </Box>
        }
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
      <Collapse in={openAddWallet}>
        <WalletList setOpen={setWalletSelected} setLoading={setLoading} />
      </Collapse>
      <Button
        endIcon={<ExpandMoreIcon sx={{ transform: openManageWallets ? 'rotate(180deg)' : null }} />}
        startIcon={
          <Box>
            <Typography sx={{ fontSize: '1rem !important', color: theme.palette.text.primary }}>
              {openManageWallets ? 'Close' : `Manage wallets`}
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
        onClick={() => handleOpenManageWallets()}
      />
      <Collapse in={openManageWallets}>
        {getWallets.data && getWallets.data.wallets.map((item) => {
          const wallet = walletsList.find(wallet => item.type === wallet.connectName)
          return (
            <Box
              key={item.id}
              sx={{
                p: '3px 12px',
                fontSize: '1rem',
                minWidth: '64px',
                width: '100%',
                background: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '6px',
                mb: 1,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: 3
              }}>
                <Box>
                  <Avatar
                    src={theme.palette.mode === 'dark' ? wallet?.iconDark : wallet?.icon}
                    sx={{ height: '24px', width: '24px' }}
                    variant="square"
                  />
                </Box>
                <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {getShorterAddress(item.changeAddress, 12)}
                </Box>
              </Box>

              <Box>
                <IconButton
                  disabled={item.changeAddress === sessionData?.user.address}
                  onClick={() => {
                    removeWallet(item.id)
                  }}>
                  <ClearIcon sx={{ height: '18px', width: '18px' }} />
                </IconButton>
              </Box>

            </Box>
          )
        })}
      </Collapse>

    </Box>
  );
};

export default AddWallet;
