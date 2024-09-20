import React, { useCallback, useEffect, useState } from 'react'
import DashboardHeader from '@components/dashboard/DashboardHeader'
import { Box, Container, Grid, Skeleton, Typography, useTheme } from '@mui/material'
import VestingStatsTable from '../VestingStatsTable'
import VestingPositionTable from '../VestingPositionTable'
import DashboardCard from '@components/dashboard/DashboardCard'
import { useWallet } from '@meshsdk/react'
import { useWalletContext } from '@contexts/WalletContext'
import { trpc } from '@lib/utils/trpc'
import { ClaimEntriesResponse } from '@server/services/vestingApi'

const VestingDashboardPage = () => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const { wallet, connected, name } = useWallet();
  const { sessionData } = useWalletContext();
  const [connectedAddress, setConnectedAddress] = useState<string | undefined>(undefined);
  const [walletName, setWalletName] = useState<string | undefined>(undefined);

  useEffect(() => {
    const execute = async () => {
      if (connected) {
        const api = await window.cardano[name.toLowerCase()].enable();

        const changeAddress = await wallet.getChangeAddress();
        setConnectedAddress(changeAddress);
        setWalletName(name.toLowerCase());
      }
    };
    execute();
  }, [connected, connectedAddress, name, wallet]);

  return (
    <Container maxWidth="xl">

      <Box sx={{ my: 5 }}>
        <Typography align='center' variant='h3' sx={{ fontWeight: 'bold' }}>
          Vesting Dashboard
        </Typography>
      </Box>

      <Box sx={{ mb: 7 }}>
        <VestingPositionTable
          isLoading={isLoading}
          connectedAddress={connectedAddress}
          walletName={walletName}
        />
      </Box>

    </Container>
  )
}

export default VestingDashboardPage;

const staticStatsData = {
  data: [
    {
      icon: 'https://i.imgur.com/4KkO0mV.jpg',
      projectName: 'SundaeSwap',
      totalTreasury: "1,000,000 CNCT",
      totalClaimed: "890,000 CNCT",
      frequency: "1 month",
      startDate: new Date(),
      cliffDate: new Date(),
    },
    {
      icon: 'https://i.imgur.com/4KkO0mV.jpg',
      projectName: 'Coinecta',
      totalTreasury: "500,000 CNCT",
      totalClaimed: "450,000 CNCT",
      frequency: "1 month",
      startDate: new Date(),
      cliffDate: new Date(),
    },
    {
      icon: 'https://i.imgur.com/4KkO0mV.jpg',
      projectName: 'Crashr',
      totalTreasury: "2,500,000 CNCT",
      totalClaimed: "1,000,000 CNCT",
      frequency: "1 month",
      startDate: new Date(),
      cliffDate: new Date(),
    },
  ]
}
