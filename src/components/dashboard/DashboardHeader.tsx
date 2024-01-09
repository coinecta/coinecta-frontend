import React, { FC } from 'react';
import { Box, Button, Divider, Typography, useTheme } from '@mui/material';
import WalletSelectDropdown from '@components/WalletSelect';

interface IDashboardHeaderProps {
  title: string;
}

const DashboardHeader: FC<IDashboardHeaderProps> = ({ title }) => {
  const theme = useTheme()
  return (
    <>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'center', sm: 'flex-end' },
        mb: 1,
        gap: 1
      }}>
        <Typography variant="h5">
          {title}
        </Typography>
        <Box sx={{ minWidth: '250px' }}>
          <WalletSelectDropdown />
        </Box>
      </Box>
      <Divider sx={{ mb: 2 }} />
    </>
  );
};

export default DashboardHeader;


