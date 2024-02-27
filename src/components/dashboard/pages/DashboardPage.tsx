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
import WalletSelectDropdown from '@components/WalletSelectDropdown';
import DashboardHeader from '../DashboardHeader';

const Dashboard: FC = () => {
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
              31,463 ₳ ($19,438)
            </Typography>
          </DashboardCard>
        </Grid>
        <Grid xs={12} md={7}>
          <DashboardCard center>
            <DataSpread
              title="CNCT"
              data={`28,612 ($1,736)`}
            />
            <DataSpread
              title="CHIP"
              data={`231,032 ($1,291)`}
            />
            <DataSpread
              title="BANA"
              data={`42,648 ($807)`}
            />
            <DataSpread
              title="rsPAI"
              margin={0}
              data={`725,048 ($5,885)`}
            />
          </DashboardCard>
        </Grid>
        <Grid xs={12} md={4}>
          <DashboardCard center>
            <Typography>
              Total Vested
            </Typography>
            <Typography variant="h5" sx={{ mb: 1 }}>
              2,431 ₳ ($1,504)
            </Typography>
            <Button variant="contained" color="secondary" size="small">
              Unlock now
            </Button>
          </DashboardCard>
        </Grid>
        <Grid xs={12} md={4}>
          <DashboardCard center>
            <Typography>
              Total Staked
            </Typography>
            <Typography variant="h5" sx={{ mb: 1 }}>
              6,132 ₳ ($3,795)
            </Typography>
            <Button variant="contained" color="secondary" size="small">
              Manage positions
            </Button>
          </DashboardCard>
        </Grid>
        <Grid xs={12} md={4}>
          <DashboardCard center>
            <Typography>
              Unclaimed tokens
            </Typography>
            <Typography variant="h5" sx={{ mb: 1 }}>
              467 ₳ ($289)
            </Typography>
            <Button variant="contained" color="secondary" size="small">
              Claim now
            </Button>
          </DashboardCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;