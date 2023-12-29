import React, { FC } from 'react';
import {
  Box,
  Divider,
  Typography,
} from '@mui/material';
import Grid from '@mui/system/Unstable_Grid/Grid';
import DashboardCard from '../DashboardCard';
import DataSpread from '@components/DataSpread';

const StakePositions: FC = () => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Manage Staked Positions
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
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
    </Box>
  );
};

export default StakePositions;