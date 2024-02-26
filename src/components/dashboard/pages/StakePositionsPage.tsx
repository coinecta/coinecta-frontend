import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Typography,
} from '@mui/material';
import Grid from '@mui/system/Unstable_Grid/Grid';
import DashboardCard from '../DashboardCard';
import DataSpread from '@components/DataSpread';
import DashboardTable from '../DashboardTable';
import { IActionBarButton } from '../ActionBar';
import DashboardHeader from '../DashboardHeader';
import { useWallet } from '@meshsdk/react';
import { StakePosition, StakeSummary, coinectaApi } from '@server/services/syncApi';

const StakePositions: FC = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [redeemableRows, setRedeemableRows] = useState<Set<number>>(new Set());
  const [lockedRows, setLockedRows] = useState<Set<number>>(new Set());

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

  }

  const actions: IActionBarButton[] = [
    {
      label: 'Redeem',
      count: redeemableRows.size,
      handler: handleRedeem
    },
    {
      label: 'Combine',
      count: lockedRows.size,
      handler: handleRedeem
    },
    {
      label: 'Split',
      count: lockedRows.size,
      handler: handleRedeem
    }
  ]

  /* Staking API */
  const [stakeKeys, setStakeKeys] = useState<string[]>([]);
  const { wallet, connected } = useWallet();
  const [time, setTime] = useState<number>(0);
  const [positions, setPositions] = useState<StakePosition[]>([]);
  const [summary, setSummary] = useState<StakeSummary | null>(null);

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
      const positions = await coinectaApi.postStakePositions(stakeKeys);
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
      const summary = await coinectaApi.postStakeSummary(stakeKeys);
      setSummary(summary);
    };
    execute();
  }, [stakeKeys]);

  useEffect(() => {
    querySummary();
  }, [querySummary]);

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
            <Typography variant="h5">
              {formatNumber(summary?.totalStats.totalStaked ?? 0, 'CNCT')}
            </Typography>
          </DashboardCard>
        </Grid>
        <Grid xs={12} md={8}>
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
      </Grid>
      <DashboardTable
        isLoading={false}
        error={false}
        data={positions.map((position) => {
          return {
            name: position.name,
            total: position.total,
            unlockDate: new Date(position.unlockDate),
            initial: position.initial,
            bonus: position.bonus,
            apy: (position.interest * 100).toString() + "%"
          }
        })}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        actions={actions}
        parentContainerRef={parentRef}
      />
    </Box>
  );
};

export default StakePositions;






const fakeTrpcDashboardData = {
  isLoading: false,
  error: false,
  data: [
    {
      name: 'CNCT',
      total: 5125,
      unlockDate: new Date(),
      initial: 5000,
      bonus: 125,
      apy: "12%"
    },
    {
      name: 'CNCT',
      total: 5125,
      unlockDate: new Date(),
      initial: 5000,
      bonus: 125,
      apy: "12%"
    },
    {
      name: 'CNCT',
      total: 5125,
      unlockDate: new Date(),
      initial: 5000,
      bonus: 125,
      apy: "12%"
    },
    {
      name: 'CNCT',
      total: 5125,
      unlockDate: new Date(),
      initial: 5000,
      bonus: 125,
      apy: "12%"
    },
    {
      name: 'CNCT',
      total: 5125,
      unlockDate: new Date(),
      initial: 5000,
      bonus: 125,
      apy: "12%"
    },
    {
      name: 'CNCT',
      total: 5125,
      unlockDate: new Date(),
      initial: 5000,
      bonus: 125,
      apy: "12%"
    },
    {
      name: 'CNCT',
      total: 5125,
      unlockDate: new Date(),
      initial: 5000,
      bonus: 125,
      apy: "12%"
    },
    {
      name: 'CNCT',
      total: 5125,
      unlockDate: new Date(),
      initial: 5000,
      bonus: 125,
      apy: "12%"
    },
    {
      name: 'CNCT',
      total: 5125,
      unlockDate: new Date(1717393753000),
      initial: 5000,
      bonus: 125,
      apy: "12%"
    },
    {
      name: 'CNCT',
      total: 5125,
      unlockDate: new Date(1717393753000),
      initial: 5000,
      bonus: 125,
      apy: "12%"
    },
    {
      name: 'CNCT',
      total: 5125,
      unlockDate: new Date(1717393753000),
      initial: 5000,
      bonus: 125,
      apy: "12%"
    },
    {
      name: 'CNCT',
      total: 5125,
      unlockDate: new Date(1717393753000),
      initial: 5000,
      bonus: 125,
      apy: "12%"
    },
    {
      name: 'CNCT',
      total: 5125,
      unlockDate: new Date(1717393753000),
      initial: 5000,
      bonus: 125,
      apy: "12%"
    },
    {
      name: 'CNCT',
      amount: 5125,
      unlockDate: new Date(1717393753000),
      initial: 5000,
      bonus: 125,
      apy: "12%"
    }
  ]
}