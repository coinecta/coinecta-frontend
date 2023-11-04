import { useState, useEffect, FC } from 'react';
import {
  Box,
  Button,
  InputLabel,
  FormControl,
  CircularProgress,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { useWalletContext } from '@contexts/WalletContext';
import { trpc } from '@lib/utils/trpc';
import { Wallet } from 'next-auth';
import { getShorterAddress } from '@lib/utils/general';

interface ChangeDefaultAddressProps {
  title: string;
}

const ChangeDefaultAddress: FC<ChangeDefaultAddressProps> = ({
  title
}) => {
  const { sessionStatus, sessionData, fetchSessionData, providerLoading, setProviderLoading } = useWalletContext()
  const [addressOptions, setAddressOptions] = useState<string[]>([]);
  const [defaultAddress, setDefaultAddress] = useState('');
  const changeLoginAddressMutation = trpc.user.changeLoginAddress.useMutation()

  const shouldFetch = sessionStatus === "authenticated";
  const walletsQuery = trpc.user.getWallets.useQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
      enabled: shouldFetch
    }
  )

  const getWallets = async (): Promise<Wallet[]> => {
    if (sessionStatus !== 'authenticated') {
      return []
    }
    const fetchResult = await walletsQuery.refetch();
    return fetchResult && fetchResult.data ? fetchResult.data.wallets : [];
  };

  const updateLoginAddress = async (address: string) => {
    try {
      setProviderLoading(true)
      const changeLogin = await changeLoginAddressMutation.mutateAsync({
        changeAddress: address
      })
      if (changeLogin) {
        await fetchSessionData()
        setProviderLoading(false)
      }
    } catch (error) {
      console.error("Error setting Login wallet", error);
      setProviderLoading(false)
    }
  }
  useEffect(() => {
    // console.log('fetch ' + sessionStatus)
    if (sessionStatus === 'authenticated') {
      getWallets()
      updateWallets()
    }
  }, [sessionData, sessionStatus, fetchSessionData]);
  const updateWallets = async () => {
    if (walletsQuery.data) {
      let changeAddresses = walletsQuery.data.wallets.map(wallet => wallet.changeAddress);

      // If address exists, remove it from its current position and prepend it
      if (sessionData?.user.address) {
        const address = sessionData?.user.address
        changeAddresses = changeAddresses.filter(addr => addr !== address);
        changeAddresses.unshift(address);
        setDefaultAddress(address);
      }

      setAddressOptions(changeAddresses);
    }
  }
  const handleChangeAddress = (event: SelectChangeEvent) => {
    setDefaultAddress(event.target.value);
    updateLoginAddress(event.target.value)
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
      <Box sx={{ flexGrow: 1 }}>
        <FormControl
          variant="filled"
          fullWidth
          disabled={providerLoading}
          sx={{ minWidth: 120, width: '100%' }}
        >
          <InputLabel id="default-address-selector-label">{title}</InputLabel>
          <Select
            id="default-address-selector"
            label="Address to receive whitelist tokens"
            value={defaultAddress}
            onChange={handleChangeAddress}
          >
            {addressOptions.map((item, i) => {
              return (
                <MenuItem value={item} key={`address-option-${i}`}>{getShorterAddress(item, 6)}</MenuItem>
              )
            })}
          </Select>
        </FormControl>
      </Box>
      {/* <Box>
        <Button
          variant="contained"
          onClick={() => updateLoginAddress(defaultAddress)}
          sx={{ height: '56px' }}
          disabled={defaultAddressLoading}
        >
          {defaultAddressLoading ? <CircularProgress size={24} /> : "Update"}
        </Button>
      </Box> */}
    </Box>
  )
}

export default ChangeDefaultAddress