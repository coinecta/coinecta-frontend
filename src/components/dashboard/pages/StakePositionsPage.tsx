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
import { IActionBarButton } from '../ActionBar';
import DashboardHeader from '../DashboardHeader';
import UnstakeConfirm from '../staking/UnstakeConfirm';
import StakePositionTable from '../staking/StakePositionTable';

const StakePositions: FC = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [redeemableRows, setRedeemableRows] = useState<Set<number>>(new Set());
  const [lockedRows, setLockedRows] = useState<Set<number>>(new Set());
  const [openUnstakeDialog, setOpenUnstakeDialog] = useState(false)
  const [unstakeRowData, setUnstakeRowData] = useState<IUnstakeListItem[]>([])

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
    // {
    //   label: 'Combine',
    //   count: lockedRows.size,
    //   handler: handleRedeem
    // },
    // {
    //   label: 'Split',
    //   count: lockedRows.size,
    //   handler: handleRedeem
    // }
  ]

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
              25,391 ₳ ($15,644)
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
              data={`230,660 ($15,644)`}
            />
          </DashboardCard>
        </Grid>
      </Grid>
      <StakePositionTable
        {...fakeTrpcDashboardData}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        actions={actions}
        parentContainerRef={parentRef}
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
  isLoading: false,
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
    }
  ]
}