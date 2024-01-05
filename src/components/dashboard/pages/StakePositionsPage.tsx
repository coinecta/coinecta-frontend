import React, { FC, useEffect, useState } from 'react';
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

const StakePositions: FC = () => {
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

  return (
    <Box sx={{ position: 'relative' }}>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Manage Staked Positions
      </Typography>
      <Divider sx={{ mb: 2 }} />
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
              $620,032
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
            <DataSpread
              title="CNCT"
              data={`231,032 ($4,300)`}
            />
            <DataSpread
              title="Optim"
              data={`23,012 ($1,300)`}
            />
            <DataSpread
              title="Crux"
              data={`13,023,120 ($6,000)`}
            />
            <DataSpread
              title="Paideia"
              data={`231,032 ($4,300)`}
            />
            <DataSpread
              title="Ergopad"
              data={`231,032 ($4,300)`}
            />
          </DashboardCard>
        </Grid>
      </Grid>
      <DashboardTable {...fakeTrpcDashboardData} selectedRows={selectedRows} setSelectedRows={setSelectedRows} actions={actions} />
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