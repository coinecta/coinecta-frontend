

import React, { FC, useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Button, TextField } from '@mui/material';
import { trpc } from '@lib/utils/trpc';
import { useWalletContext } from '@contexts/WalletContext';
import FisoFullCard from './FisoFullCard';
import Grid from '@mui/system/Unstable_Grid/Grid';
import { TStakepoolInfoReturn } from '@server/routers/stakepools';
import { resolveEpochNo, resolveRewardAddress, resolveStakeKeyHash } from '@meshsdk/core';
import { fetchData } from 'next-auth/client/_utils';
import { useAlert } from '@contexts/AlertContext';
import UnlabelledTextField from '@components/styled-components/UnlabelledTextField';

type FisoTabProps = {
  fisos: TFiso[]
  projectSlug: string;
}

const FisoTab: FC<FisoTabProps> = ({ fisos, projectSlug }) => {
  const { sessionStatus, sessionData } = useWalletContext()
  const { addAlert } = useAlert()
  const stakepoolInfo = trpc.stakepool.stakepoolInfo.useMutation()
  const [stakepoolData, setStakepoolData] = useState<TStakepoolInfoReturn>({
    successfulStakePools: [],
    errors: []
  })
  const [userStakepoolData, setUserStakepoolData] = useState<TStakePoolWithStats | undefined>(undefined)
  const [customRewardAddress, setCustomRewardAddress] = useState<string | undefined>(undefined)
  const [customAddressText, setCustomAddressText] = useState('')
  const currentEpoch = resolveEpochNo('mainnet');


  // {
  //   userEarned: number;
  //   userCurrentPool?: string;
  //   userCurrentStakedAmount?: number;
  //   currentTotalStake: number;
  //   currentTotalDelegators: number;
  // }
  const fisoUserInfoQuery = trpc.fisos.getFisoUserInfo.useQuery(
    {
      fisoId: fisos[0].id!,
      rewardAddress: customRewardAddress,
      currentEpochProvided: currentEpoch
    },
    {
      enabled: !!fisos[0].id && (!!customRewardAddress || sessionStatus === 'authenticated'),
      refetchOnWindowFocus: false
    })

  const userStakingInfoQuery = trpc.stakepool.getCurrentStake.useQuery(
    {
      rewardAddress: customRewardAddress
    },
    {
      enabled: !!customRewardAddress || sessionStatus === 'authenticated',
      refetchOnWindowFocus: false
    }
  )

  const fisoCurrentStake = trpc.fisos.getFisoTotalStake.useQuery(
    {
      fisoId: fisos[0].id!,
      currentEpoch: currentEpoch || 0
    },
    {
      enabled: !!currentEpoch && !!fisos[0].id,
      refetchOnWindowFocus: false
    }
  )

  useEffect(() => {
    if (sessionData?.user?.id || !!customRewardAddress) {
      fisoUserInfoQuery.refetch();
    }
  }, [sessionData?.user?.id, customRewardAddress]);

  useEffect(() => {
    if (userStakingInfoQuery.data?.pool_id) {
      getUserStakepoolData(userStakingInfoQuery.data?.pool_id)
    }
  }, [userStakingInfoQuery.data])

  useEffect(() => {
    if (fisos[0] && fisos[0].approvedStakepools && fisos[0].approvedStakepools.length > 0) {
      const stakepoolIds = fisos[0].approvedStakepools.map(pool => pool.poolId)
      getStakepoolData(stakepoolIds)
    }
  }, [fisos])

  const getStakepoolData = async (fisoPoolIds: string[]) => {
    try {
      const response = await stakepoolInfo.mutateAsync({ stakepoolIds: fisoPoolIds });
      setStakepoolData(response);
    } catch (error) {
      console.error(error);
    }
  }

  const getUserStakepoolData = async (poolId: string) => {
    try {
      const response = await stakepoolInfo.mutateAsync({ stakepoolIds: [poolId] });
      // console.log(response)
      setUserStakepoolData(response.successfulStakePools[0])
    } catch (error) {
      console.error(error);
    }
  }

  const [userStakepoolInfo, setUserStakepoolInfo] = useState({
    poolTicker: '',
    poolName: '',
  })
  useEffect(() => {
    if (fisoUserInfoQuery.data && stakepoolData.successfulStakePools) {
      const thisStakepoolData =
        stakepoolData.successfulStakePools.find(
          pool => pool.pool_id === fisoUserInfoQuery.data.userCurrentPool
        )
      setUserStakepoolInfo({
        poolTicker: thisStakepoolData?.ticker || '',
        poolName: thisStakepoolData?.name || '',
      })
    }
  }, [fisoUserInfoQuery.data, stakepoolData.successfulStakePools])

  const handleChangeCustomAddress = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomAddressText(e.target.value)
  }
  const deriveCustomRewardAddress = (address: string) => {
    const trimmedAddress = address.trim()
    if (address === '') {
      setCustomRewardAddress(undefined)
      return
    }
    try {
      const rewardAddress = resolveRewardAddress(trimmedAddress);
      if (rewardAddress) {
        setCustomRewardAddress(rewardAddress);
      }
    } catch (error) {
      try {
        const rewardAddress = resolveStakeKeyHash(trimmedAddress);
        if (rewardAddress) {
          setCustomRewardAddress(trimmedAddress);
        }
      } catch (innerError) {
        setCustomRewardAddress(undefined);
        addAlert('error', 'Please enter a valid Cardano address');
      }
    }
  };
  const loadingCheck = fisoUserInfoQuery.status === 'loading' && !!fisos[0].id && (!!customRewardAddress || sessionStatus === 'authenticated')
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ width: '100%', textAlign: 'center', mb: 2 }}>
        <Typography variant="h5">
          Current epoch: {currentEpoch}
        </Typography>
        <Typography variant="h6">
          Start epoch: {fisos[0].startEpoch} - End epoch: {fisos[0].endEpoch}
        </Typography>
      </Box>
      <Grid container sx={{ mb: 2 }} spacing={2} alignItems="center">
        <Grid xs>
          <UnlabelledTextField
            id="wallet-address"
            variant="filled"
            value={customAddressText}
            onChange={handleChangeCustomAddress}
            fullWidth
            placeholder="Paste an address to see the rewards"
          />
        </Grid>
        <Grid xs="auto">
          <Button
            variant="contained"
            onClick={() => deriveCustomRewardAddress(customAddressText)}>
            Submit
          </Button>
        </Grid>
        <Grid xs="auto">
          <Button variant="outlined"
            onClick={() => {
              setUserStakepoolData(undefined)
              setCustomAddressText('')
              deriveCustomRewardAddress('')
            }}
          >
            Clear
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3, textAlign: 'center' }} alignItems="stretch">
        <Grid xs={12} sm={6} md={4}>
          <Paper variant="outlined"
            sx={{
              p: 2, minHeight: '160px ', height: '100%', position: 'relative',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <Typography sx={{ mb: 0 }}>
              Total FISO active stake:
            </Typography>
            <Typography variant="h5" sx={{ mb: 1 }}>
              {fisoCurrentStake.data
                ? `${(fisoCurrentStake.data.totalStake * 0.000001).toLocaleString(undefined, { maximumFractionDigits: 2 })} ₳`
                : fisoUserInfoQuery.data
                  ? `${(fisoUserInfoQuery.data.currentTotalStake * 0.000001).toLocaleString(undefined, { maximumFractionDigits: 2 })} ₳`
                  : '-'}
            </Typography>
            <Typography sx={{ mb: 0, fontSize: '1rem !important' }}>
              Total delegators:
            </Typography>
            <Typography variant="h6" sx={{ lineHeight: '24px', fontSize: '1.2rem !important' }}>
              {fisoCurrentStake.data
                ? fisoCurrentStake.data.totalDelegators.toLocaleString(undefined, { maximumFractionDigits: 2 })
                : fisoUserInfoQuery.data
                  ? (fisoUserInfoQuery.data.currentTotalDelegators).toLocaleString(undefined, { maximumFractionDigits: 2 })
                  : '-'}
            </Typography>
          </Paper>
        </Grid>
        <Grid xs={12} sm={6} md={4}>
          <Paper variant="outlined"
            sx={{
              p: 2, minHeight: '160px ', height: '100%', position: 'relative',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {loadingCheck
              ? <CircularProgress />
              : (currentEpoch - 2) >= fisos[0].startEpoch
                ? <>
                  <Typography>
                    Estimated rewards to epoch {currentEpoch - 2}:
                  </Typography>
                  <Typography variant="h5">
                    {fisoUserInfoQuery.data && !Number.isNaN(fisoUserInfoQuery.data.userEarned)
                      ? `${fisoUserInfoQuery.data.userEarned.toLocaleString(
                        undefined,
                        { maximumFractionDigits: 2 }
                      )} ${fisos[0].tokenTicker}`
                      : '-'}
                  </Typography>
                </>
                : <Box>
                  <Typography>
                    Rewards will show here 2 epochs after FISO start
                  </Typography>
                  {/* <Button variant="contained" color="secondary" onClick={() => {}}>
                    Estimate
                  </Button> */}
                </Box>
            }
          </Paper>
        </Grid>
        <Grid xs={12} sm={6} md={4}>
          <Paper variant="outlined"
            sx={{
              p: 2, minHeight: '160px ', height: '100%', position: 'relative',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {loadingCheck
              ? <CircularProgress />
              : (
                <>
                  <Typography sx={{ mb: 0 }}>
                    Your current stakepool:
                  </Typography>
                  <Typography variant="h5" sx={{ mb: 1 }}>
                    {userStakingInfoQuery.isFetching
                      ? <CircularProgress size={18} />
                      : userStakepoolData?.ticker
                        ? userStakepoolData?.ticker
                        : userStakepoolInfo.poolTicker
                          ? userStakepoolInfo.poolTicker
                          : '-'}
                  </Typography>
                  <Typography sx={{ mb: 0, fontSize: '1rem !important' }}>
                    Your current staked amount:
                  </Typography>
                  <Typography variant="h6" sx={{ lineHeight: '24px', fontSize: '1.2rem !important' }}>
                    {userStakingInfoQuery.isFetching
                      ? <CircularProgress size={18} />
                      : userStakingInfoQuery.data?.controlled_amount
                        ? `${(Number(userStakingInfoQuery.data?.controlled_amount) * 0.000001).toLocaleString(undefined, { maximumFractionDigits: 2 })} ₳`
                        : fisoUserInfoQuery.data && fisoUserInfoQuery.data.userCurrentStakedAmount
                          ? `${(Number(fisoUserInfoQuery.data.userCurrentStakedAmount) * 0.000001).toLocaleString(undefined, { maximumFractionDigits: 2 })} ₳`
                          : '-'}
                  </Typography>
                </>
              )
            }
          </Paper>
        </Grid>
      </Grid>
      {stakepoolData.successfulStakePools?.length > 0
        ? <Box>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Approved Stakepools
          </Typography>
          <Grid container spacing={2} alignItems="stretch">
            {stakepoolData.successfulStakePools.map((item: TStakePoolWithStats, i: number) => {
              return (
                <Grid xs={12} sm={6} md={3} key={`ispo-card-${item.hex}`}>
                  <FisoFullCard
                    stakepoolData={item}
                    userStakepoolData={userStakingInfoQuery.data}
                    projectSlug={projectSlug}
                    epochInfo={fisos[0].approvedStakepools}
                    currentEpoch={currentEpoch}
                  />
                </Grid>
              )
            })}
          </Grid>
        </Box>
        : stakepoolInfo.isLoading
          ? <Box sx={{ mb: 1 }}>
            Loading...
          </Box>
          : stakepoolInfo.isError
            ? <Box sx={{ mb: 1 }}>
              Error fetching stakepool info
            </Box>
            : <Box sx={{ mb: 1, textAlign: 'center' }}>
              No FISO info to display currently.
            </Box>
      }
    </Box>
  );
};

export default FisoTab;
