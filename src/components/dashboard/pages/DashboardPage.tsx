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
import { StakeSummary, coinectaApi } from '@server/services/syncApi';
import { useRouter } from 'next/router';
import Skeleton from '@mui/material/Skeleton';
import { usePrice } from '@components/hooks/usePrice';

const Dashboard: FC = () => {
  const { wallet, connected} = useWallet();

  const [ stakeKeys, setStakeKeys ] = useState<string[]>([]);
  const [ summary, setSummary ] = useState<StakeSummary | null>(null);
  const [ time, setTime ] = useState<number>(0);
  const [ isLoading, setIsLoading ] = useState(true);

  const theme = useTheme();

  const formatNumber = (num: number, key: string) => `${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} ${key}`;

  // Refresh data every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(time => time + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const execute = async () => {
      const STAKING_KEY_POLICY = "5496b3318f8ca933bbfdf19b8faa7f948d044208e0278d62c24ee73e";

      if (connected) {
        const balance = await wallet.getBalance();
        const stakeKeys = balance.filter((asset) => asset.unit.indexOf(STAKING_KEY_POLICY) !== -1);
        const processedStakeKeys = stakeKeys.map((key) => key.unit.split('000de140').join(''));
        setStakeKeys(processedStakeKeys);
      }
    };
    execute();
  },[wallet, connected, time]);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

  const querySummary = useCallback(() => {
    const execute = async () => {
      if (stakeKeys.length === 0) {
        setSummary(null);
        return;
      };
      const summary = await coinectaApi.postStakeSummary(stakeKeys);
      setSummary(summary);
    };
    execute();
  }, [stakeKeys]);

  useEffect(() => {
    querySummary();
  }, [querySummary]);

  const router = useRouter()

  const { convert } = usePrice();

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
                <Skeleton animation='wave' width={160} /> :
                formatNumber(summary?.totalStats.totalPortfolio ?? 0, 'CNCT')}
            </Typography>
          </DashboardCard>
        </Grid>
        <Grid xs={12} md={7}>
          <DashboardCard center>
            <DataSpread
              title="CNCT"
              data={`28,612`}
              usdValue='$1,736'
              isLoading={isLoading}
            />
            <DataSpread
              title="CHIP"
              data={`231,032`}
              usdValue='$1,291'
              isLoading={isLoading}
            />
            <DataSpread
              title="BANA"
              data={`42,648`}
              usdValue='$807'
              isLoading={isLoading}
            />
            <DataSpread
              title="rsPAI"
              margin={0}
              data={`725,048`}
              usdValue='$5,885'
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
                <Typography align='center' variant='h5'>2,431 ₳</Typography>
                <Typography sx={{color: theme.palette.grey[500]}} align='center'>$1,504</Typography>
              </Box>}
            <Button disabled={isLoading ? true : false} variant="contained" color="secondary" size="small" onClick={() => router.push("/dashboard/unlock-vested")}>
              Unlock now
            </Button>
          </DashboardCard>
        </Grid>
        <Grid xs={12} md={4}>
          <DashboardCard center>
            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-around', gap: '5px'}}>
              <Box sx={{ flexGrow: '1' }}>
                <Typography align='center'>Locked</Typography>
                {isLoading ?  
                  <Box sx={{ mb: 1 }}>
                    <Skeleton sx={{ margin: 'auto' }} animation='wave' width={100} />
                    <Skeleton sx={{ margin: 'auto' }} animation='wave' width={100} />
                  </Box> : 
                  <Box sx={{ mb: 1 }}>
                    <Typography align='center' variant='h5'>6,132 ₳</Typography>
                    <Typography sx={{color: theme.palette.grey[500]}} align='center'>$3,795</Typography>
                  </Box>}
              </Box>
              <Divider orientation='vertical' variant='middle' flexItem />
              <Box sx={{ flexGrow: '1' }}>
                <Typography align='center'>Unlocked</Typography>
                {isLoading ?  
                  <Box sx={{ mb: 1 }}>
                    <Skeleton sx={{ margin: 'auto' }} animation='wave' width={100} />
                    <Skeleton sx={{ margin: 'auto' }} animation='wave' width={100} />
                  </Box> : 
                  <Box sx={{ mb: 1 }}>
                    <Typography align='center' variant='h5'>6,132 ₳</Typography>
                    <Typography sx={{color: theme.palette.grey[500]}} align='center'>$3,795</Typography>
                  </Box>}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, width: '100%'}}>
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
                <Typography align='center' variant='h5'>467 ₳</Typography>
                <Typography sx={{color: theme.palette.grey[500]}} align='center'>$289</Typography>
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