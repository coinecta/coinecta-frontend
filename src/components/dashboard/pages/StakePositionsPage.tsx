import React, { FC } from 'react';
import {
  Box,
  Divider,
  Typography,
} from '@mui/material';

const StakePositions: FC = () => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Manage Staked Positions
      </Typography>
      <Divider />
    </Box>
  );
};

export default StakePositions;