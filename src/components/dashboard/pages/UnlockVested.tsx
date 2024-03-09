import React, { FC, useEffect, useRef, useState } from 'react';
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

const UnlockVested: FC = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [redeemableRows, setRedeemableRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    const newRedeemableRows = new Set<number>();

    selectedRows.forEach((index) => {
      const item = fakeTrpcDashboardData.data[index];
      if (item && item.redeemable) {
        if (item.redeemable > 0) {
          newRedeemableRows.add(index);
        }
      }
    });

    setRedeemableRows(newRedeemableRows);
  }, [selectedRows, fakeTrpcDashboardData]);

  const handleRedeem = () => {

  }

  const actions: IActionBarButton[] = [
    {
      label: 'Redeem from',
      count: redeemableRows.size,
      handler: handleRedeem
    }
  ]

  return (
    <Box sx={{ position: 'relative' }} ref={parentRef}>
      <DashboardHeader title="Unlock Vested Tokens" />
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid xs={12} md={4}>
          <DashboardCard sx={{
            alignItems: 'center',
            height: '100%',
            justifyContent: 'center',
            py: 4
          }}>
            <Typography>
              Total value vested
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
      <DashboardTable
        {...fakeTrpcDashboardData}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        actions={actions}
        parentContainerRef={parentRef}
      />
    </Box>
  );
};

export default UnlockVested;






const fakeTrpcDashboardData = {
  isLoading: false,
  error: false,
  data: [
    {
      name: 'CNCT',
      redeemable: 225,
      nextUnlock: new Date(),
      initial: 5000,
      remaining: 1230,
      unlockFrequency: 'Daily'
    },
    {
      name: 'CNCT',
      redeemable: 225,
      nextUnlock: new Date(),
      initial: 5000,
      remaining: 1230,
      unlockFrequency: 'Daily'
    },
    {
      name: 'CNCT',
      redeemable: 225,
      nextUnlock: new Date(),
      initial: 5000,
      remaining: 1230,
      unlockFrequency: 'Daily'
    },
    {
      name: 'CNCT',
      redeemable: 225,
      nextUnlock: new Date(),
      initial: 5000,
      remaining: 1230,
      unlockFrequency: 'Daily'
    },
    {
      name: 'CNCT',
      redeemable: 225,
      nextUnlock: new Date(),
      initial: 5000,
      remaining: 1230,
      unlockFrequency: 'Daily'
    },
    {
      name: 'CNCT',
      redeemable: 225,
      nextUnlock: new Date(),
      initial: 5000,
      remaining: 1230,
      unlockFrequency: 'Daily'
    },
    {
      name: 'CNCT',
      redeemable: 0,
      nextUnlock: new Date(),
      initial: 5000,
      remaining: 1230,
      unlockFrequency: 'Daily'
    },
    {
      name: 'CNCT',
      redeemable: 0,
      nextUnlock: new Date(),
      initial: 5000,
      remaining: 150,
      unlockFrequency: 'Daily'
    },
    {
      name: 'CNCT',
      redeemable: 225,
      nextUnlock: new Date(1717393753000),
      initial: 5000,
      remaining: 1230,
      unlockFrequency: 'Daily'
    },
    {
      name: 'CNCT',
      redeemable: 225,
      nextUnlock: new Date(1717393753000),
      initial: 5000,
      remaining: 1230,
      unlockFrequency: 'Daily'
    },
    {
      name: 'CNCT',
      redeemable: 225,
      nextUnlock: new Date(1717393753000),
      initial: 5000,
      remaining: 1230,
      unlockFrequency: 'Daily'
    },
    {
      name: 'CNCT',
      redeemable: 225,
      nextUnlock: new Date(1717393753000),
      initial: 5000,
      remaining: 1230,
      unlockFrequency: 'Daily'
    },
    {
      name: 'CNCT',
      redeemable: 225,
      nextUnlock: new Date(1717393753000),
      initial: 5000,
      remaining: 1230,
      unlockFrequency: 'Daily'
    },
    {
      name: 'CNCT',
      redeemable: 650,
      nextUnlock: new Date(1717393753000),
      initial: 5000,
      remaining: 1230,
      unlockFrequency: 'Daily'
    }
  ]
}