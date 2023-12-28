import React, { FC } from 'react';
import {
  Box,
  Divider,
  Typography,
} from '@mui/material';
import { useAlert } from '@contexts/AlertContext';
import { useWalletContext } from '@contexts/WalletContext';

const Dashboard: FC = () => {
  const { addAlert } = useAlert();
  const { sessionStatus } = useWalletContext()

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