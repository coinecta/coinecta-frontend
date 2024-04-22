import React, { FC } from 'react';
import { Box, Button, Divider, Typography, useTheme } from '@mui/material';
import WalletSelectDropdown from '@components/WalletSelectDropdown';

interface IDashboardHeaderProps {
  title: string;
  isDropdownHidden?: boolean;
}

const DashboardHeader: FC<IDashboardHeaderProps> = ({ title, isDropdownHidden = false }) => {
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
        <Box sx={{ minWidth: '250px', display: isDropdownHidden ? 'none' : 'block' }}>
          <WalletSelectDropdown />
        </Box>
      </Box>
      <Divider sx={{ mb: 2 }} />
    </>
  );
};

export default DashboardHeader;


