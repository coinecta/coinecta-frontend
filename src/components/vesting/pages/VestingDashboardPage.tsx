import React, { useState } from 'react'
import DashboardHeader from '@components/dashboard/DashboardHeader'
import { Box, Container, Typography } from '@mui/material'
import VestingStatsTable from '../VestingStatsTable'
import VestingPositionTable from '../VestingPositionTable'

const VestingDashboardPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<any>>(new Set());

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 5 }}>
        <Typography align='center' variant='h3' sx={{fontWeight: 'bold'}}>
          Vesting Dashboard
        </Typography>
      </Box>
      <Box sx={{ mb: 7 }}>
        <DashboardHeader title="Vesting Global Stats" />
        <VestingStatsTable data={staticStatsData.data} isLoading={isLoading} />
      </Box>
      <Box sx={{ mb: 7 }}>
        <VestingPositionTable 
          data={staticPositionsData.data} 
          selectedRows={selectedRows} 
          setSelectedRows={setSelectedRows} 
          isLoading={isLoading} 
        />
      </Box>
    </Container>
  )
}

export default VestingDashboardPage;

const staticStatsData = {
  data: [
    {
      icon: 'https://i.imgur.com/aA4NG2V.png',
      name: 'SundaeSwap',
      totalTreasury: "1,000,000 CNCT",
      totalClaimed: "890,000 CNCT",
      frequency: "1 month",
      startDate: new Date(),
      cliffDate: new Date(),
    },
    {
      icon: 'https://i.imgur.com/4KkO0mV.jpg',
      name: 'Coinecta',
      totalTreasury: "500,000 CNCT",
      totalClaimed: "450,000 CNCT",
      frequency: "1 month",
      startDate: new Date(),
      cliffDate: new Date(),
    },
    {
      icon: 'https://i.imgur.com/TAAEyrV.jpg',
      name: 'Crashr',
      totalTreasury: "2,500,000 CNCT",
      totalClaimed: "1,000,000 CNCT",
      frequency: "1 month",
      startDate: new Date(),
      cliffDate: new Date(),
    },
  ]
}

const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 7);

const staticPositionsData = {
  data: [
    {
      projectName: 'Coinecta',
      tokenName: "CNCT",
      total: "217.29",
      unlockDate: futureDate,
      initial: 216.21,
      bonus: 1.08,
      interest: 0.5,
    },
    {
      projectName: 'SundaeSwap',
      tokenName: "CNCT",
      total: "328.59",
      unlockDate: new Date(),
      initial: 200.21,
      bonus: 1.08,
      interest: 0.5,
    },
    {
      projectName: 'Coinecta',
      tokenName: "CNCT",
      total: "117.19",
      unlockDate: new Date(),
      initial: 100.21,
      bonus: 1.08,
      interest: 0.5,
    },
  ]
}