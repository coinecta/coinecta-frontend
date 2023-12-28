import React, { FC } from 'react';
import {
  Box,
  Divider,
  Typography,
} from '@mui/material';
import { useAlert } from '@contexts/AlertContext';

const UnlockVested: FC = () => {
  const { addAlert } = useAlert();

  return (

    <Box>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Unlock Vested Tokens
      </Typography>
      <Divider />

    </Box>
  );
};

export default UnlockVested;