import React, { FC, ReactNode } from 'react';
import { Paper, SxProps, Theme } from '@mui/material';
import { useWalletContext } from '@contexts/WalletContext';

interface DashboardCardProps {
  children?: ReactNode;
  sx?: SxProps<Theme>;
}

const DashboardCard: FC<DashboardCardProps> = ({ children, sx }) => {
  const { sessionStatus } = useWalletContext();

  const defaultStyles: SxProps<Theme> = {
    py: 1,
    px: 2,
    // height: '100%',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    ...sx,
  };

  return (
    <Paper variant="outlined" sx={defaultStyles}>
      {sessionStatus === 'loading'
        ? 'Loading...'
        : sessionStatus === 'unauthenticated'
          ? 'Please login'
          : children}
    </Paper>
  );
};

export default DashboardCard;