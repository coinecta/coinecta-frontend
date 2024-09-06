import React, { FC, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Collapse,
  Avatar,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useWallet } from '@meshsdk/react';
import { trpc } from '@lib/utils/trpc';
import { getShorterAddress } from '@lib/utils/general';
import { walletsList } from "@lib/walletsList";
import AddWallet from '@components/user/AddWallet';
import WalletList from '@components/user/WalletList';
import { useAlert } from '@contexts/AlertContext';
import { useWalletContext } from '@contexts/WalletContext';
import { TRPCClientError } from '@trpc/client';

interface CardanoWalletSelectorProps {
  tokenName: string;
  onAddressSelect: (address: string) => void;
}

const CardanoWalletSelector: FC<CardanoWalletSelectorProps> = ({ tokenName, onAddressSelect }) => {
  const theme = useTheme();
  const [openWalletList, setOpenWalletList] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [walletSelected, setWalletSelected] = useState(false)
  const [loading, setLoading] = useState(false);
  const getWallets = trpc.user.getWallets.useQuery();
  const { connect, wallet, connected, name } = useWallet()
  const { addAlert } = useAlert()
  const { sessionData } = useWalletContext()
  const [shouldRefetch, setShouldRefetch] = useState(false)
  const [openAddWallet, setOpenAddWallet] = useState(false)


  useEffect(() => {
    if (connected && walletSelected) {
      addNewWallet()
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
      await connect(sessionData!.user.walletType!)
      setShouldRefetch(true)
      setOpenAddWallet(false)
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof TRPCClientError ? e.message : 'Failed to add wallet.';
      addAlert('error', errorMessage);
    } finally { setWalletSelected(false) }
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

  useEffect(() => {
    if (selectedAddress) {
      onAddressSelect(selectedAddress);
    }
  }, [selectedAddress]);

  const handleWalletSelect = (address: string) => {
    setSelectedAddress(address);
    setOpenWalletList(false);
  };

  const handleOpenAddWallet = () => {
    setOpenAddWallet(!openAddWallet)
  }

  return (
    <Box>
      <Typography gutterBottom sx={{ fontSize: '0.9rem!important' }}>
        {tokenName} is a token on the Cardano network. Choose the address you want it to be sent to:
      </Typography>

      {selectedAddress ? (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="body1">Selected address: {getShorterAddress(selectedAddress, 12)}</Typography>
          <Button onClick={() => setOpenWalletList(true)} sx={{ ml: 2 }}>Change</Button>
        </Box>
      ) : (
        <Button
          endIcon={<ExpandMoreIcon sx={{ transform: openWalletList ? 'rotate(180deg)' : 'none' }} />}
          onClick={() => setOpenWalletList(!openWalletList)}
          fullWidth
          sx={{
            background: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '6px',
            mb: 2,
            px: 2,
            textTransform: 'none',
            '& .MuiListItemSecondaryAction-root': {
              height: '24px'
            },
            color: theme.palette.text.secondary,
            justifyContent: "space-between"
          }}
        >
          Select a wallet
        </Button>
      )}

      <Collapse in={openWalletList}>
        <Box sx={{ mb: 2 }}>
          {getWallets.data && getWallets.data.wallets.map((item) => {
            const wallet = walletsList.find(w => item.type === w.connectName);
            return (
              <Button
                key={item.id}
                onClick={() => handleWalletSelect(item.changeAddress)}
                fullWidth
                sx={{
                  justifyContent: "flex-start",
                  mb: 1,
                  py: 1,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Avatar
                  src={theme.palette.mode === 'dark' ? wallet?.iconDark : wallet?.icon}
                  sx={{ mr: 2, height: '24px', width: '24px' }}
                  variant="square"
                />
                <Typography>{getShorterAddress(item.changeAddress, 12)}</Typography>
              </Button>
            );
          })}
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
            <WalletList setConnectedCallback={setWalletSelected} setLoading={setLoading} />
          </Collapse>
        </Box>
      </Collapse>
    </Box>
  );
};

export default CardanoWalletSelector;