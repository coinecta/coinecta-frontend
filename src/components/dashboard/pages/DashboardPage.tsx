import React, { FC, use, useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Typography,
  useTheme
} from '@mui/material';
import DataSpread from '@components/DataSpread';
import DashboardCard from '../DashboardCard';
import Grid from '@mui/system/Unstable_Grid/Grid';
import DashboardHeader from '../DashboardHeader';
import { useWallet } from '@meshsdk/react';
import { StakeSummary, coinectaSyncApi } from '@server/services/syncApi';
import { useRouter } from 'next/router';
import Skeleton from '@mui/material/Skeleton';
import { usePrice } from '@components/hooks/usePrice';

const Dashboard: FC = () => {
  const router = useRouter();

  const { wallet, connected } = useWallet();

  const [stakeKeys, setStakeKeys] = useState<string[]>([]);
  const [summary, setSummary] = useState<StakeSummary | null>(null);
  const [time, setTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const theme = useTheme();

  const formatNumber = (num: number, key: string) => `${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}${key !== '' && key != null ? ` ${key}` : ''}`;

  // Refresh data every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(time => time + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const execute = async () => {
      if (connected) {
        const STAKING_KEY_POLICY = process.env.STAKING_KEY_POLICY;
        const balance = await wallet.getBalance();
        const stakeKeys = balance.filter((asset) => asset.unit.indexOf(STAKING_KEY_POLICY) !== -1);
        const processedStakeKeys = stakeKeys.map((key) => key.unit.split('000de140').join(''));
        setStakeKeys(processedStakeKeys);
      }
    };
    execute();
  }, [wallet, connected, time]);

  const querySummary = useCallback(() => {
    const execute = async () => {
      if (stakeKeys.length === 0) {
        setSummary(null);
        return;
      };
      const summary = await coinectaSyncApi.getStakeSummary(stakeKeys);
      setSummary(summary);
      setIsLoading(false);
    };
    execute();
  }, [stakeKeys]);

  useEffect(() => {
    querySummary();
  }, [querySummary]);


  const { convertCnctToADA, convertToUSD } = usePrice();
  return (
    <Box sx={{ position: 'relative' }} >
      <DashboardHeader title="Overview" />
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid xs={12} md={5}>
          <DashboardCard center>
            <Typography>
              Total portfolio value
            </Typography>
            <Typography variant="h5">
              {isLoading ?
                <>
                  <Skeleton animation='wave' width={160} />
                  <Skeleton animation='wave' width={160} />
                </> :
                <>
                  <Box sx={{ mb: 1 }}>
                    <Typography align='center' variant='h5'>{formatNumber(convertCnctToADA(summary?.poolStats.CNCT.totalPortfolio ?? 0), '₳')}</Typography>
                    <Typography sx={{ color: theme.palette.grey[500] }} align='center'>${formatNumber(convertToUSD(summary?.poolStats.CNCT.totalPortfolio ?? 0, "CNCT"), '')}</Typography>
                  </Box>
                </>
              }
            </Typography>
          </DashboardCard>
        </Grid>
        <Grid xs={12} md={7}>
          <DashboardCard center>
            <DataSpread
              title="CNCT"
              data={formatNumber(summary?.poolStats.CNCT.totalPortfolio ?? 0, '')}
              usdValue={`$${formatNumber(convertToUSD(summary?.poolStats.CNCT.totalPortfolio ?? 0, "CNCT"), '')}`}
              isLoading={isLoading}
            />
          </DashboardCard>
        </Grid>
        <Grid xs={12} md={4}>
          <DashboardCard center>
            <Typography>
              Total Vested
            </Typography>
            {isLoading ?
              <Box sx={{ mb: 1 }}>
                <Skeleton animation='wave' width={100} />
                <Skeleton animation='wave' width={100} />
              </Box> :
              <Box sx={{ mb: 1 }}>
                <Typography align='center' variant='h5'>-</Typography>
                <Typography sx={{ color: theme.palette.grey[500] }} align='center'>-</Typography>
              </Box>}
            <Button disabled={isLoading ? true : false} variant="contained" color="secondary" size="small" onClick={() => router.push("/dashboard/unlock-vested")}>
              Unlock now
            </Button>
          </DashboardCard>
        </Grid>
        <Grid xs={12} md={4}>
          <DashboardCard center>
            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-around', gap: '5px' }}>
              <Box sx={{ flexGrow: '1' }}>
                <Typography align='center'>Total Staked</Typography>
                {isLoading ?
                  <Box sx={{ mb: 1 }}>
                    <Skeleton sx={{ margin: 'auto' }} animation='wave' width={100} />
                    <Skeleton sx={{ margin: 'auto' }} animation='wave' width={100} />
                  </Box> :
                  <Box sx={{ mb: 1 }}>
                    <Typography align='center' variant='h5'>{formatNumber(convertCnctToADA(summary?.poolStats.CNCT.totalStaked ?? 0), '₳')}</Typography>
                    <Typography sx={{ color: theme.palette.grey[500] }} align='center'>${formatNumber(convertToUSD(summary?.poolStats.CNCT.totalStaked ?? 0, "CNCT"), '')}</Typography>
                  </Box>}
              </Box>
              <Divider orientation='vertical' variant='middle' flexItem />
              <Box sx={{ flexGrow: '1' }}>
                <Typography align='center'>Claimable Stake</Typography>
                {isLoading ?
                  <Box sx={{ mb: 1 }}>
                    <Skeleton sx={{ margin: 'auto' }} animation='wave' width={100} />
                    <Skeleton sx={{ margin: 'auto' }} animation='wave' width={100} />
                  </Box> :
                  <Box sx={{ mb: 1 }}>
                    <Typography align='center' variant='h5'>{formatNumber(convertCnctToADA(summary?.poolStats.CNCT.unclaimedTokens ?? 0), '₳')}</Typography>
                    <Typography sx={{ color: theme.palette.grey[500] }} align='center'>${formatNumber(convertToUSD(summary?.poolStats.CNCT.unclaimedTokens ?? 0, "CNCT"), '')}</Typography>
                  </Box>}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, width: '100%' }}>
              <Button sx={{ width: '100%' }} disabled={isLoading ? true : false} variant="contained" color="secondary" size="small" onClick={() => router.push("/dashboard/add-stake")}>
                Stake now
              </Button>
              <Button sx={{ width: '100%' }} disabled={isLoading ? true : false} variant="outlined" color="secondary" size="small" onClick={() => router.push("/dashboard/manage-stake")}>
                Manage positions
              </Button>
            </Box>
          </DashboardCard>
        </Grid>
        <Grid xs={12} md={4}>
          <DashboardCard center>
            <Typography>
              Unclaimed tokens
            </Typography>
            {isLoading ?
              <Box sx={{ mb: 1 }}>
                <Skeleton animation='wave' width={100} />
                <Skeleton animation='wave' width={100} />
              </Box> :
              <Box sx={{ mb: 1 }}>
                <Typography align='center' variant='h5'>-</Typography>
                <Typography sx={{ color: theme.palette.grey[500] }} align='center'>-</Typography>
              </Box>}
            <Button disabled={isLoading ? true : false} variant="contained" color="secondary" size="small" onClick={() => router.push("/dashboard/claim-tokens")}>
              Claim now
            </Button>
          </DashboardCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;