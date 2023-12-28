import React, { FC } from 'react';
import {
  Box,
  Divider,
  Typography,
} from '@mui/material';
import { useAlert } from '@contexts/AlertContext';

const ClaimTokens: FC = () => {
  const { addAlert } = useAlert();

  return (

    <Box>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Claim Vesting Tokens
      </Typography>
      <Divider />

    </Box>
  );
};

export default ClaimTokens;