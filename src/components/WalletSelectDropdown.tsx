import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  ListSubheader,
  Button,
  SelectChangeEvent,
  useTheme,
  Checkbox,
  ListItemText,
  Tooltip,
  Avatar
} from '@mui/material';
import { getShorterAddress } from '@lib/utils/general';
import { useRouter } from 'next/router';
import { trpc } from '@lib/utils/trpc';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { walletDataByName, walletNameToId } from '@lib/walletsList';
import { useCardano } from '@lib/utils/cardano';
import { useWalletContext } from '@contexts/WalletContext';

const WalletSelectDropdown = () => {

  const theme = useTheme()
  const router = useRouter()
  const { isWalletConnected: _isWalletConnected, setSelectedAddresses, getSelectedAddresses } = useCardano()
  const [walletAddresses, setWalletAddresses] = useState<string[]>([])
  const [selectedAddresses, setSelectedAddress] = useState<string[]>([])
  const [isConnectedByWallets, setIsConnectedByWallets] = useState<Record<string, boolean>>({})

  const isWalletConnected = useCallback(_isWalletConnected, [_isWalletConnected])

  const getWallets = trpc.user.getWallets.useQuery()

  const wallets = useMemo(() => getWallets.data && getWallets.data.wallets, [getWallets]);

  useEffect(() => {
    if (wallets && walletAddresses.length < 1) {
      const localStorageSelectedAddresses = getSelectedAddresses()
      if (localStorageSelectedAddresses.length > 0) {
        setSelectedAddress(localStorageSelectedAddresses)
      } else {
        setSelectedAddress(wallets.map((wallet) => wallet.changeAddress))
        setSelectedAddresses(wallets.map((wallet) => wallet.changeAddress))
      }
      setWalletAddresses(wallets.map((wallet) => wallet.changeAddress))
    }
  }, [walletAddresses.length, wallets])

  const walletByName = useCallback((name: string) => walletDataByName(name), []);

  const handleChange = (event: SelectChangeEvent<typeof selectedAddresses>) => {
    const {
      target: { value },
    } = event;
    setSelectedAddress(
      typeof value === 'string' ? value.split(',') : value,
    );

    setSelectedAddresses([...value]);
  };

  const handleAddWallet = () => {
    router.push('/user/connected-wallets')
  };

  useEffect(() => {
    const execute = async () => {
      if (wallets) {
        const promises = wallets.map(wallet =>
          isWalletConnected(wallet!.type, wallet.changeAddress)
            .then(isConnected => ({ [wallet.changeAddress]: isConnected }))
        );

        const results = await Promise.all(promises);
        setIsConnectedByWallets(Object.assign({}, ...results));
      }
    };
    execute();
  }, [wallets]);

  return (
    <FormControl fullWidth>
      <Select
        multiple
        displayEmpty
        variant="filled"
        value={selectedAddresses}
        onChange={handleChange}
        renderValue={() => selectedAddresses.length === 0 ? 'No wallet selected' : 'Select displayed wallets'}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 420,
            },
          },
        }}
        sx={{
          borderRadius: '6px',
          borderStyle: 'solid',
          borderWidth: '1px',
          borderColor: theme.palette.mode === 'dark'
            ? 'rgba(200, 225, 255, 0.2)'
            : 'rgba(20, 22, 25, 0.15)',
          background: theme.palette.mode === 'dark'
            ? 'radial-gradient(at right top, rgba(16,20,34,0.4), rgba(1, 4, 10, 0.4))'
            : 'radial-gradient(at right top, rgba(16,20,34,0.05), rgba(1, 4, 10, 0.05))',
          boxShadow: '2px 2px 5px 3px rgba(0,0,0,0.03)',
          fontFamily: 'sans-serif',
          fontSize: '1rem',
          '& .MuiInputBase-input': {
            py: '3px',
            px: '9px',
          },
          '&:hover': {
            borderColor: theme.palette.primary.main,
          },
          '& .MuiFilledInput-before': { display: 'none' },
          '& .MuiFilledInput-after': { display: 'none' },
          '& .Mui-error': {
            borderColor: theme.palette.error.dark,
            borderWidth: '2px'
          }
        }}
      >
        <ListSubheader>
          <Button fullWidth onClick={handleAddWallet} sx={{ my: 1 }}>
            Add wallet
          </Button>
        </ListSubheader>
        {walletAddresses.map((item, i) => (
          <MenuItem key={item} value={item}>
            <Avatar variant='square' sx={{ width: '22px', height: '22px' }} src={theme.palette.mode === "dark" ? walletByName(wallets![i].type)?.iconDark : walletByName(wallets![i].type)?.icon} />
            <Checkbox checked={selectedAddresses.indexOf(item) > -1} />
            <ListItemText primary={getShorterAddress(item, 6)} />
            {!isConnectedByWallets[item] && <>
              <Tooltip title='This wallet is not connected'>
                <WarningAmberOutlinedIcon fontSize='small' color='error' />
              </Tooltip>
            </>}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default WalletSelectDropdown;