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

interface IAddWallet {

}

export const AddWallet: FC<IAddWallet> = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { addAlert } = useAlert()
  const [modalOpen, setModalOpen] = useState(false)
  const { wallet, connected, name, connecting, connect, disconnect, error } = useWallet()
  const [rewardAddress, setRewardAddress] = useState<string | undefined>(undefined);
  const [changeAddress, setChangeAddress] = useState<string | undefined>(undefined)
  const [usedAddresses, setUsedAddresses] = useState<string[] | undefined>(undefined)
  const [unusedAddresses, setUnusedAddresses] = useState<string[] | undefined>(undefined)
  const [openAddWallet, setOpenAddWallet] = useState(false)
  const [openManageWallets, setOpenManageWallets] = useState(false)
  const [loading, setLoading] = useState(false)
  const { sessionData } = useWalletContext()

  const getWallets = trpc.user.getWallets.useQuery()

  useEffect(() => {
    if (connected) {
      getAddresses()
    }
    else { console.log('not connected') }
  }, [disconnect, connected]);

  const getAddresses = async () => {
    const thisChangeAddress = await wallet.getChangeAddress();
    const thisRewardAddress = await wallet.getRewardAddresses();
    const thisUnusedAddresses = await wallet.getUnusedAddresses();
    const thisUsedAddresses = await wallet.getUsedAddresses();
    setRewardAddress(thisRewardAddress[0]);
    setChangeAddress(thisChangeAddress)
    setUsedAddresses(thisUsedAddresses)
    setUnusedAddresses(thisUnusedAddresses)
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

  const [shouldRefetch, setShouldRefetch] = useState(false)
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
        <WalletList setOpen={setModalOpen} setLoading={setLoading} />
      </Collapse>
      {/* <Divider sx={{ mb: 2, mt: 1 }} /> */}
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
              <Box>
                <Avatar
                  src={theme.palette.mode === 'dark' ? wallet?.iconDark : wallet?.icon}
                  sx={{ height: '24px', width: '24px' }}
                />
              </Box>
              <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.rewardAddress}
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
