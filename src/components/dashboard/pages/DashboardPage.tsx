import React, { FC, use, useCallback, useEffect, useMemo, useState } from 'react';
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
import { formatTokenWithDecimals } from '@lib/utils/assets';
import { useToken } from '@components/hooks/useToken';
import { trpc } from '@lib/utils/trpc';
import { BrowserWallet } from '@meshsdk/core';
import { useCardano } from '@lib/utils/cardano';
import { select } from 'd3';
import { useWalletContext } from '@contexts/WalletContext';

const Dashboard: FC = () => {
  const router = useRouter();

  const { wallet, connected } = useWallet();
  const [stakeKeys, setStakeKeys] = useState<string[]>([]);
  const [time, setTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isStakingKeysLoaded, setIsStakingKeysLoaded] = useState(false);
  const { selectedAddresses } = useWalletContext();
  const getWallets = trpc.user.getWallets.useQuery()
  const userWallets = useMemo(() => getWallets.data && getWallets.data.wallets, [getWallets]);
  const theme = useTheme();

  const queryStakeSummary = trpc.sync.getStakeSummary.useQuery(stakeKeys, { retry: 0 });

  const summary = useMemo(() => {
    if (queryStakeSummary.data?.poolStats.CNCT === undefined) return undefined;
    return queryStakeSummary.data;
  }, [queryStakeSummary.data]);
  useEffect(() => {
    setIsLoading(!queryStakeSummary.isSuccess && !isStakingKeysLoaded);
  }, [isStakingKeysLoaded, queryStakeSummary.isSuccess]);

  const formatNumber = (num: number, key: string) => `${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}${key !== '' && key != null ? ` ${key}` : ''}`;

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
        if (userWallets === undefined || userWallets === null) return;
        const stakeKeysPromises = userWallets.map(async userWallet => {
          if (selectedAddresses.indexOf(userWallet.changeAddress) === -1) return [];
          try {
            const browserWallet = await BrowserWallet.enable(userWallet.type);
            const balance = await browserWallet.getBalance();
            const stakeKeys = balance.filter((asset) => asset.unit.includes(STAKING_KEY_POLICY));
            const processedStakeKeys = stakeKeys.map((key) => key.unit.replace('000de140', ''));
            return processedStakeKeys;
          } catch {
            return []
          }
        });
        const stakeKeysArrays = await Promise.all(stakeKeysPromises);
        const allStakeKeys = stakeKeysArrays.flat();
        setStakeKeys(allStakeKeys);
        setIsStakingKeysLoaded(true);
      }
    };
    execute();
  }, [wallet, connected, time, userWallets, selectedAddresses]);

  const { convertCnctToADA, convertToUSD } = usePrice();
  const { cnctDecimals } = useToken();

  const formatWithDecimals = (value: string) => parseFloat(formatTokenWithDecimals(BigInt(value), cnctDecimals));
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
                    <Typography align='center' variant='h5'>{formatNumber(convertCnctToADA(formatWithDecimals(summary?.poolStats.CNCT.totalPortfolio ?? "0")), '₳')}</Typography>
                    <Typography sx={{ color: theme.palette.grey[500] }} align='center'>${formatNumber(convertToUSD(formatWithDecimals(summary?.poolStats.CNCT.totalPortfolio ?? "0"), "CNCT"), '')}</Typography>
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
              data={formatNumber(formatWithDecimals(summary?.poolStats.CNCT.totalPortfolio ?? "0"), '')}
              usdValue={`$${formatNumber(convertToUSD(formatWithDecimals(summary?.poolStats.CNCT.totalPortfolio ?? "0"), "CNCT"), '')}`}
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
            <Button disabled variant="outlined" color="secondary" size="small" onClick={() => router.push("/dashboard/unlock-vested")}>
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
                    <Typography align='center' variant='h5'>{formatNumber(convertCnctToADA(formatWithDecimals(summary?.poolStats.CNCT.totalStaked ?? "0")), '₳')}</Typography>
                    <Typography sx={{ color: theme.palette.grey[500] }} align='center'>${formatNumber(convertToUSD(formatWithDecimals(summary?.poolStats.CNCT.totalStaked ?? "0"), "CNCT"), '')}</Typography>
                  </Box>}
              </Box>
              <Divider orientation='vertical' variant='middle' flexItem />
              <Box sx={{ width: '50%' }}>
                <Typography align='center'>Claimable Stake</Typography>
                {isLoading ?
                  <Box sx={{ mb: 1 }}>
                    <Skeleton sx={{ margin: 'auto' }} animation='wave' width={100} />
                    <Skeleton sx={{ margin: 'auto' }} animation='wave' width={100} />
                  </Box> :
                  <Box sx={{ mb: 1 }}>
                    <Typography align='center' variant='h5'>{formatNumber(convertCnctToADA(formatWithDecimals(summary?.poolStats.CNCT.unclaimedTokens ?? "0")), '₳')}</Typography>
                    <Typography sx={{ color: theme.palette.grey[500] }} align='center'>${formatNumber(convertToUSD(formatWithDecimals(summary?.poolStats.CNCT.unclaimedTokens ?? "0"), "CNCT"), '')}</Typography>
                  </Box>}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, width: '100%' }}>
              <Button sx={{ margin: "auto" }} disabled={isLoading ? true : false} variant="outlined" color="secondary" size="small" onClick={() => router.push("/dashboard/manage-stake")}>
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
            <Button disabled variant="outlined" color="secondary" size="small" onClick={() => router.push("/dashboard/claim-tokens")}>
              Claim now
            </Button>
          </DashboardCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;