import React, { FC, ReactNode } from 'react';
import { Box, Paper, SxProps, Theme } from '@mui/material';
import { useWalletContext } from '@contexts/WalletContext';

interface DashboardCardProps {
  children?: ReactNode;
  sx?: SxProps<Theme>;
  center?: true;
  standard?: boolean;
}

const DashboardCard: FC<DashboardCardProps> = ({ children, sx, center, standard }) => {
  const { sessionStatus } = useWalletContext();

  const baseStyles: SxProps<Theme> = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'start',
    px: 2,
    py: sessionStatus === 'unauthenticated' ? '60px' : 2,
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
      {standard ?
        children :
        (sessionStatus === 'loading'
        ? 'Loading...'
        : sessionStatus === 'unauthenticated'
          ? 'Sign in to see positions'
          : children)}
    </Paper>
  );
};

export default DashboardCard;