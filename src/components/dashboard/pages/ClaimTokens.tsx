import React, { FC, useRef, useState } from 'react';
import {
  Box,
  Divider,
  Typography,
} from '@mui/material';
import LoginWarning from '@components/LoginWarning';
import { useWalletContext } from '@contexts/WalletContext';
import DashboardTable from '../DashboardTable';
import { IActionBarButton } from '../ActionBar';
import DashboardHeader from '../DashboardHeader';

const ClaimTokens: FC = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const { sessionStatus } = useWalletContext()
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())

  const handleClaim = () => {

  }

  const actions: IActionBarButton[] = [
    {
      label: 'Claim',
      count: selectedRows.size,
      handler: handleClaim
    }
  ]

  return (
    <Box ref={parentRef}>
      <DashboardHeader title="Claim Vesting Tokens" />
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Here you can claim your vesting NFTs, which allow you to redeem tokens as they unlock. If the tokens in the vesting key are already redeemable, they will automatically be redeemed when you claim your vesting key here.
      </Typography>
      {sessionStatus !== 'authenticated' && <LoginWarning />}
      <DashboardTable
        {...fakeTrpcDashboardData}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        actions={actions}
        parentContainerRef={parentRef}
      />
    </Box>
  );
};

export default ClaimTokens;


const fakeTrpcDashboardData = {
  isLoading: false,
  error: false,
  data: [
    {
      name: 'CNCT FISO',
      token: 'CNCT',
      amount: 5000,
      redeemable: 500,
      unlockFrequency: 'Monthly',
      vestedLength: '12 Months'
    },
  ]
}