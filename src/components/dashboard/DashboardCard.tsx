import React, { FC, ReactNode } from 'react';
import { Paper, SxProps, Theme } from '@mui/material';
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
    p: 2
  };

  const typeStyles: SxProps<Theme> = center
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
      {/* {sessionStatus === 'loading'
        ? 'Loading...'
        : sessionStatus === 'unauthenticated'
          ? 'Please login'
          : children} */}
      {children}
    </Paper>
  );
};

export default DashboardCard;