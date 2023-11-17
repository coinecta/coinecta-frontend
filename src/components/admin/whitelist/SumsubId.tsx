import { ChangeEvent, FC, useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
} from '@mui/material';
import { trpc } from '@lib/utils/trpc';
import { useAlert } from '@contexts/AlertContext';
import Grid from '@mui/system/Unstable_Grid/Grid';
import { resolveRewardAddress, resolveStakeKeyHash } from '@meshsdk/core';

const SumsubId: FC = () => {
  const { addAlert } = useAlert();
  const [adaAddress, setAdaAddress] = useState<string>('')

  const initCustomAddress = {
    rewardAddress: '',
    changeAddress: ''
  }
  const [customRewardAddress, setCustomRewardAddress] = useState(initCustomAddress)
  const userInfo = trpc.whitelist.getSumsubId.useQuery(customRewardAddress, {
    enabled: customRewardAddress.changeAddress.length > 0 || customRewardAddress.rewardAddress.length > 0,
    retry: false
  })
  const [refetchUserInfo, setRefetchUserInfo] = useState(false)
  useEffect(() => {
    if (refetchUserInfo) {
      userInfo.refetch()
      setRefetchUserInfo(false)
    }
  }, [refetchUserInfo])
  const handleChangeAdaAddress = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setAdaAddress(e.target.value)
  }
  const deriveCustomRewardAddress = (address: string) => {
    if (address === '') {
      setCustomRewardAddress(initCustomAddress)
      return
    }
    try {
      // this tells us that address is a change address and potentially the user's defaultAddress
      // it also derives the stake address. we can check the database for both to find a user account. 
      const rewardAddress = resolveRewardAddress(address);
      console.log(rewardAddress)
      if (rewardAddress) {
        setCustomRewardAddress({
          rewardAddress,
          changeAddress: address
        });
      }
    } catch (error) {
      try {
        // this tells us its a valid stake key
        const rewardAddress = resolveStakeKeyHash(address);
        console.log(rewardAddress)
        if (rewardAddress) {
          setCustomRewardAddress({
            rewardAddress: address,
            changeAddress: ''
          });
        }
      } catch (error) {
        console.log(error)
        setCustomRewardAddress(initCustomAddress);
        addAlert('error', 'Please enter a valid Cardano address');
      }
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Get SumSub ID
      </Typography>
      <Grid container sx={{ mb: 2 }} spacing={2} alignItems="center">
        <Grid xs>
          <TextField
            id="wallet-address"
            variant="filled"
            label="Address or stake key"
            value={adaAddress}
            onChange={handleChangeAdaAddress}
            fullWidth
          />
        </Grid>
        <Grid xs="auto">
          <Button
            variant="contained"
            onClick={() => deriveCustomRewardAddress(adaAddress)}>
            Submit
          </Button>
        </Grid>
        <Grid xs="auto">
          <Button variant="outlined"
            onClick={() => {
              setAdaAddress('')
              deriveCustomRewardAddress('')
            }}
          >
            Clear
          </Button>
        </Grid>
      </Grid>
      <Box>
        {userInfo.isError && userInfo.error.shape?.message.includes('Unable to retrieve user')
          ? <Box>
            User not found in db
          </Box>
          : userInfo?.data?.sumsubId
            ? <Box>
              <Typography>
                Sumsub ID: {userInfo?.data?.sumsubId}
              </Typography>
              <Typography>
                Sumsub Result: {JSON.stringify(userInfo?.data?.sumsubResult)}
              </Typography>
              <Typography>
                Sumsub Status: {userInfo?.data?.sumsubStatus}
              </Typography>
            </Box>
            : userInfo?.data?.id
              ? <Box>User has not done KYC</Box>
              : <Box>Enter a valid ADA address</Box>
        }
      </Box>
    </Box>
  );
};

export default SumsubId;


