import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Skeleton,
  Typography,
  useTheme
} from '@mui/material';
import Grid from '@mui/system/Unstable_Grid/Grid';
import DashboardCard from '../DashboardCard';
import DataSpread from '@components/DataSpread';
import { IActionBarButton } from '../ActionBar';
import DashboardHeader from '../DashboardHeader';
import { useWallet } from '@meshsdk/react';
import { StakePosition, StakeSummary, coinectaSyncApi } from '@server/services/syncApi';
import UnstakeConfirm from '../staking/UnstakeConfirm';
import StakePositionTable from '../staking/StakePositionTable';
import { useWalletContext } from '@contexts/WalletContext';
import { useToken } from '@components/hooks/useToken';
import { formatTokenWithDecimals } from '@lib/utils/assets';
import { usePrice } from '@components/hooks/usePrice';

const StakePositions: FC = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const { sessionStatus } = useWalletContext();
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [redeemableRows, setRedeemableRows] = useState<Set<number>>(new Set());
  const [lockedRows, setLockedRows] = useState<Set<number>>(new Set());
  const [openUnstakeDialog, setOpenUnstakeDialog] = useState(false)
  const [unstakeRowData, setUnstakeRowData] = useState<IUnstakeListItem[]>([])
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

  useEffect(() => {
    const newData = Array.from(selectedRows).filter(index => redeemableRows.has(index)).map(index => {
      const item = fakeTrpcDashboardData.data[index];
      return {
        currency: item.name,
        amount: item.total.toString(),
      };
    });

    setUnstakeRowData(newData);
  }, [selectedRows, redeemableRows, fakeTrpcDashboardData])

  useEffect(() => {
    const newRedeemableRows = new Set<number>();
    const newLockedRows = new Set<number>();
    const now = new Date();

    selectedRows.forEach((index) => {
      const item = fakeTrpcDashboardData.data[index];
      if (item && item.unlockDate) {
        if (item.unlockDate <= now) {
          newRedeemableRows.add(index);
        } else {
          newLockedRows.add(index);
        }
      }
    });

    setRedeemableRows(newRedeemableRows);
    setLockedRows(newLockedRows);

  }, [selectedRows, fakeTrpcDashboardData]);

  const handleRedeem = () => {
    setOpenUnstakeDialog(true)
  }

  const actions: IActionBarButton[] = [
    {
      label: 'Redeem',
      count: redeemableRows.size,
      handler: handleRedeem
    },
  ]

  /* Staking API */
  const [stakeKeys, setStakeKeys] = useState<string[]>([]);
  const { wallet, connected } = useWallet();
  const [time, setTime] = useState<number>(0);
  const [positions, setPositions] = useState<StakePosition[]>([]);
  const [summary, setSummary] = useState<StakeSummary | null>(null);

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
  }, [wallet, connected, time]);

  const queryPositions = useCallback(() => {
    const execute = async () => {
      if (stakeKeys.length === 0) {
        setPositions([]);
        return;
      }
      const positions = await coinectaSyncApi.getStakePositions(stakeKeys);
      setPositions(positions);
    };
    execute();
  }, [stakeKeys]);

  useEffect(() => {
    queryPositions();
  }, [queryPositions]);

  const querySummary = useCallback(() => {
    const execute = async () => {
      if (stakeKeys.length === 0) {
        setSummary(null);
        return;
      };
      const summary = await coinectaSyncApi.getStakeSummary(stakeKeys);
      setSummary(summary);
    };
    execute();
  }, [stakeKeys]);

  useEffect(() => {
    querySummary();
  }, [querySummary]);

  const { cnctDecimals } = useToken();
  const { convertToUSD, convertCnctToADA } = usePrice();

  const processedPositions = useMemo(() => {
    return positions.map((position) => {
      return {
        name: position.name,
        total: formatTokenWithDecimals(BigInt(position.total), cnctDecimals),
        unlockDate: new Date(position.unlockDate),
        initial: formatTokenWithDecimals(BigInt(position.initial), cnctDecimals),
        bonus: formatTokenWithDecimals(BigInt(position.bonus), cnctDecimals),
        interest: formatNumber(position.interest * 100, '%')
      };
    });
  }, [cnctDecimals, positions]);

  const formatWithDecimals = (value: string) => parseFloat(formatTokenWithDecimals(BigInt(value), cnctDecimals));

  return (
    <Box sx={{ position: 'relative' }} ref={parentRef}>
      <DashboardHeader title="Manage Staked Positions" />
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid xs={12} md={4}>
          <DashboardCard sx={{
            alignItems: 'center',
            height: '100%',
            justifyContent: 'center',
            py: 4
          }}>
            <Typography>
              Total value staked
            </Typography>
            {isLoading ?
              <Box sx={{ mb: 1 }}>
                <Skeleton animation='wave' width={100} />
                <Skeleton animation='wave' width={100} />
              </Box> :
              <Box sx={{ mb: 1 }}>
                <Typography align='center' variant='h5'>{formatNumber(convertCnctToADA(formatWithDecimals(summary?.poolStats.CNCT.totalPortfolio ?? "0")), '₳')}</Typography>
                <Typography sx={{ color: theme.palette.grey[500] }} align='center'>${formatNumber(convertToUSD(formatWithDecimals(summary?.poolStats.CNCT.totalPortfolio ?? "0"), "CNCT"), '')}</Typography>
              </Box>}
          </DashboardCard>
        </Grid>
        <Grid xs={12} md={8}>
          <DashboardCard center sx={{
            justifyContent: sessionStatus === 'unauthenticated' ? 'center' : 'space-between',
          }}>
            <DataSpread
              title="CNCT"
              data={formatNumber(formatWithDecimals(summary?.poolStats.CNCT.totalPortfolio ?? "0"), '')}
              usdValue={`$${formatNumber(convertToUSD(formatWithDecimals(summary?.poolStats.CNCT.totalPortfolio ?? "0"), "CNCT"), '')}`}
              isLoading={isLoading}
            />
          </DashboardCard>
        </Grid>
      </Grid>
      <StakePositionTable
        error={false}
        data={processedPositions}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        actions={actions}
        parentContainerRef={parentRef}
        isLoading={isLoading}
      />
      <UnstakeConfirm
        open={openUnstakeDialog}
        setOpen={setOpenUnstakeDialog}
        unstakeList={unstakeRowData}
      />
    </Box>
  );
};

export default StakePositions;

const fakeTrpcDashboardData = {
  error: false,
  data: [
    {
      name: 'CNCT',
      total: 63000,
      unlockDate: new Date(),
      initial: 60000,
      bonus: 3000,
      apy: "21.6%"
    },
    {
      name: 'CNCT',
      total: 46000,
      unlockDate: new Date(),
      initial: 40000,
      bonus: 6000,
      apy: "32.2%"
    },
    {
      name: 'CNCT',
      total: 121660,
      unlockDate: new Date(1718344201000),
      initial: 86900,
      bonus: 34760,
      apy: "40%"
    },
    {
      name: 'CNCT',
      total: 63000,
      unlockDate: new Date(),
      initial: 60000,
      bonus: 3000,
      apy: "21.6%"
    },
    {
      name: 'CNCT',
      total: 46000,
      unlockDate: new Date(),
      initial: 40000,
      bonus: 6000,
      apy: "32.2%"
    },
    {
      name: 'CNCT',
      total: 121660,
      unlockDate: new Date(1718344201000),
      initial: 86900,
      bonus: 34760,
      apy: "40%"
    },
    {
      name: 'CNCT',
      total: 63000,
      unlockDate: new Date(),
      initial: 60000,
      bonus: 3000,
      apy: "21.6%"
    },
    {
      name: 'CNCT',
      total: 46000,
      unlockDate: new Date(),
      initial: 40000,
      bonus: 6000,
      apy: "32.2%"
    },
    {
      name: 'CNCT',
      total: 121660,
      unlockDate: new Date(1718344201000),
      initial: 86900,
      bonus: 34760,
      apy: "40%"
    },
    {
      name: 'CNCT',
      total: 63000,
      unlockDate: new Date(),
      initial: 60000,
      bonus: 3000,
      apy: "21.6%"
    },
    {
      name: 'CNCT',
      total: 46000,
      unlockDate: new Date(),
      initial: 40000,
      bonus: 6000,
      apy: "32.2%"
    },
    {
      name: 'CNCT',
      total: 121660,
      unlockDate: new Date(1718344201000),
      initial: 86900,
      bonus: 34760,
      apy: "40%"
    }
  ]
}