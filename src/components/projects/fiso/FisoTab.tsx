

import React, { FC, useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { trpc } from '@lib/utils/trpc';
import { useWalletContext } from '@contexts/WalletContext';
import FisoFullCard from './FisoFullCard';
import Grid from '@mui/system/Unstable_Grid/Grid';
import { TStakepoolInfoReturn } from '@server/routers/stakepools';

type FisoTabProps = {
  fisos: TFiso[]
  projectSlug: string;
}

const FisoTab: FC<FisoTabProps> = ({ fisos, projectSlug }) => {
  const { sessionStatus, sessionData } = useWalletContext()
  const stakepoolInfo = trpc.stakepool.stakepoolInfo.useMutation()
  const [stakepoolData, setStakepoolData] = useState<TStakepoolInfoReturn>({
    successfulStakePools: [],
    errors: []
  })

  // current epoch stuff
  const currentEpochQuery = trpc.stakepool.getCurrentEpoch.useQuery()
  const [currentEpoch, setCurrentEpoch] = useState<number | undefined>(undefined)
  useEffect(() => {
    if (currentEpochQuery.status === 'success') setCurrentEpoch(currentEpochQuery.data.epoch)
  }, [currentEpochQuery.status])
  ////

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
      currentEpochProvided: currentEpoch
    },
    {
      enabled: !!fisos[0].id,
    })

  useEffect(() => {
    if (sessionData?.user?.id) {
      fisoUserInfoQuery.refetch();
    }
  }, [sessionData?.user?.id]);

  useEffect(() => {
    if (fisos[0] && fisos[0].approvedStakepools && fisos[0].approvedStakepools.length > 0) {
      const stakepoolIds = fisos[0].approvedStakepools.map(pool => pool.poolId)

      getStakepoolData(stakepoolIds)
    }
  }, [fisos])

  const getStakepoolData = async (fisoPoolIds: string[]) => {
    try {
      const response = await stakepoolInfo.mutateAsync({ stakepoolIds: fisoPoolIds });
      console.log(response);
      setStakepoolData(response);
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

      <Grid container spacing={2} sx={{ mb: 3, textAlign: 'center' }} alignItems="stretch">
        <Grid xs={12} sm={6} md={4}>
          <Paper variant="outlined"
            sx={{
              p: 2, minHeight: '160px ', height: '100%', position: 'relative',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {fisoUserInfoQuery.status === 'success' && currentEpoch ? (
              <>
                <Typography sx={{ mb: 0 }}>
                  Total FISO stake:
                </Typography>
                <Typography variant="h5" sx={{ mb: 1 }}>
                  {(fisoUserInfoQuery.data.currentTotalStake * 0.000001).toLocaleString(undefined, { maximumFractionDigits: 2 })} ₳
                </Typography>
                <Typography sx={{ mb: 0, fontSize: '1rem !important' }}>
                  Total delegators:
                </Typography>
                <Typography variant="h6" sx={{ lineHeight: '24px', fontSize: '1.2rem !important' }}>
                  {(fisoUserInfoQuery.data.currentTotalDelegators).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </Typography>
              </>
            )
              : <CircularProgress />}
          </Paper>
        </Grid>
        <Grid xs={12} sm={6} md={4}>
          <Paper variant="outlined"
            sx={{
              p: 2, minHeight: '160px ', height: '100%', position: 'relative',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {fisoUserInfoQuery.status === 'success' && currentEpoch
              ? (
                <>
                  <Typography>
                    Your current rewards:
                  </Typography>
                  <Typography variant="h5">
                    {sessionStatus === 'authenticated'
                      ? `${fisoUserInfoQuery.data.userEarned.toLocaleString(
                        undefined,
                        { maximumFractionDigits: 2 }
                      )} ${fisos[0].tokenTicker}`
                      : '-'}
                  </Typography>
                </>
              )
              : <CircularProgress />}
          </Paper>
        </Grid>
        <Grid xs={12} sm={6} md={4}>
          <Paper variant="outlined"
            sx={{
              p: 2, minHeight: '160px ', height: '100%', position: 'relative',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {fisoUserInfoQuery.status === 'success' && currentEpoch ? (
              <>
                <Typography sx={{ mb: 0 }}>
                  Your current stakepool:
                </Typography>
                <Typography variant="h5" sx={{ mb: 1 }}>
                  {sessionStatus === 'authenticated'
                    ? userStakepoolInfo.poolTicker || '-'
                    : '-'}
                </Typography>
                <Typography sx={{ mb: 0, fontSize: '1rem !important' }}>
                  Your current staked amount:
                </Typography>
                <Typography variant="h6" sx={{ lineHeight: '24px', fontSize: '1.2rem !important' }}>
                  {sessionStatus === 'authenticated'
                    ? `${(Number(fisoUserInfoQuery.data.userCurrentStakedAmount) * 0.000001).toLocaleString(undefined, { maximumFractionDigits: 2 })} ₳`
                    : '-'}
                </Typography>
              </>
            )
              : <CircularProgress />}
          </Paper>
        </Grid>
      </Grid>
      {stakepoolInfo.isLoading
        ? <Box sx={{ mb: 1 }}>
          Loading...
        </Box>
        : stakepoolInfo.isError
          ? <Box sx={{ mb: 1 }}>
            Error fetching stakepool info
          </Box>
          : stakepoolData.successfulStakePools?.length > 0
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
                        projectSlug={projectSlug}
                        epochInfo={fisos[0].approvedStakepools}
                        currentEpoch={currentEpoch}
                      />
                    </Grid>
                  )
                })}
              </Grid>
            </Box>
            : <Box sx={{ mb: 1 }}>
              No ISPO info to display...
            </Box>
      }
    </Box>
  );
};

export default FisoTab;
