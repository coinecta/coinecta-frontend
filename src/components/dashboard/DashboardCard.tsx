import React, { FC, ReactNode } from 'react';
import { Box, Paper, SxProps, Theme } from '@mui/material';
import { useWalletContext } from '@contexts/WalletContext';

interface DashboardCardProps {
  children?: ReactNode;
  sx?: SxProps<Theme>;
  center?: true
}

const DashboardCard: FC<DashboardCardProps> = ({ children, sx, center }) => {
  const { sessionStatus } = useWalletContext();

  const baseStyles: SxProps<Theme> = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    px: 2,
    py: 3,
    minHeight: '120px'
  };

  const typeStyles: SxProps<Theme> = center || sessionStatus === 'unauthenticated'
    ? {
      alignItems: 'center',
      height: '100%'
    }
    : {
      alignItems: 'flex-start',
    };

  const finalStyles: SxProps<Theme> = {
    ...baseStyles,
    ...typeStyles,
    ...sx, // Custom styles passed via sx prop, allowing default override
  };


  return (
    <Paper variant="outlined" sx={finalStyles}>
      {sessionStatus === 'loading'
        ? 'Loading...'
        : sessionStatus === 'unauthenticated'
          ? 'Sign in to see positions'
          : children}
    </Paper>
  );
};

export default DashboardCard;