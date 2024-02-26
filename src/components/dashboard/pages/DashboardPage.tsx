import React, { FC, useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
} from '@mui/material';
import DataSpread from '@components/DataSpread';
import DashboardCard from '../DashboardCard';
import Grid from '@mui/system/Unstable_Grid/Grid';
import WalletSelectDropdown from '@components/WalletSelectDropdown';
import DashboardHeader from '../DashboardHeader';
import { useWallet } from '@meshsdk/react';
import { StakeSummary, coinectaApi } from '@server/services/syncApi';

const Dashboard: FC = () => {

  const { wallet, connected} = useWallet();

  const [ stakeKeys, setStakeKeys ] = useState<string[]>([]);
  const [ summary, setSummary ] = useState<StakeSummary | null>(null);
  const [ time, setTime ] = useState<number>(0);

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

  return (
    <Box sx={{ position: 'relative' }} >
      <DashboardHeader title="Overview" />
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid xs={12} md={5}>
          <DashboardCard sx={{
            alignItems: 'center',
            height: '100%',
            justifyContent: 'center',
            py: 4
          }}>
            <Typography>
              Total portfolio value
            </Typography>
            <Typography variant="h5">
              {formatNumber(summary?.totalStats.totalPortfolio ?? 0, 'CNCT')}
            </Typography>
          </DashboardCard>
        </Grid>
        <Grid xs={12} md={7}>
          <DashboardCard sx={{
            alignItems: 'center',
            height: '100%',
            justifyContent: 'space-between',
            pt: 4,
            pb: 2
          }}>
            {summary?.poolStats && Object.entries(summary.poolStats).map(([key, stats]) => (
              <>
              <DataSpread
                title={key}
                data={formatNumber(stats.totalPortfolio, 'CNCT')}
              />
              </>  
            ))}
          </DashboardCard>
        </Grid>
        <Grid xs={12} md={4}>
          <DashboardCard sx={{
            alignItems: 'center',
            height: '100%',
            justifyContent: 'space-between',
            pt: 4,
            pb: 2
          }}>
            <Typography>
              Total Vested
            </Typography>
            <Typography variant="h5">
              {formatNumber(summary?.totalStats.totalVested ?? 0, 'CNCT')}
            </Typography>
            <Button>
              Unlock now
            </Button>
          </DashboardCard>
        </Grid>
        <Grid xs={12} md={4}>
          <DashboardCard sx={{
            alignItems: 'center',
            height: '100%',
            justifyContent: 'space-between',
            pt: 4,
            pb: 2
          }}>
            <Typography>
              Total Staked
            </Typography>
            <Typography variant="h5">
              {formatNumber(summary?.totalStats.totalStaked ?? 0, 'CNCT')}
            </Typography>
            <Button>
              Manage positions
            </Button>
          </DashboardCard>
        </Grid>
        <Grid xs={12} md={4}>
          <DashboardCard sx={{
            alignItems: 'center',
            height: '100%',
            justifyContent: 'space-between',
            pt: 4,
            pb: 2
          }}>
            <Typography>
              Unclaimed tokens
            </Typography>
            <Typography variant="h5">
              {formatNumber(summary?.totalStats.unclaimedTokens ?? 0, 'CNCT')}
            </Typography>
            <Button>
              Claim now
            </Button>
          </DashboardCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;