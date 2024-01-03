import React, { FC } from 'react';
import {
  Box,
  Divider,
  Typography,
} from '@mui/material';

const Dashboard: FC = () => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Overview
      </Typography>
      <Divider />

    </Box>
  );
};

export default Dashboard;