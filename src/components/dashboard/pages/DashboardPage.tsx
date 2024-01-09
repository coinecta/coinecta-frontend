import React, { FC } from 'react';
import {
  Box,
  Button,
  Divider,
  Typography,
} from '@mui/material';
import DataSpread from '@components/DataSpread';
import DashboardCard from '../DashboardCard';
import Grid from '@mui/system/Unstable_Grid/Grid';
import WalletSelectDropdown from '@components/WalletSelect';
import DashboardHeader from '../DashboardHeader';

const Dashboard: FC = () => {
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
              10,309 ₳ ($6,000)
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
              10,309 ₳ ($6,000)
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
              10,309 ₳ ($6,000)
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
              10,309 ₳ ($6,000)
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