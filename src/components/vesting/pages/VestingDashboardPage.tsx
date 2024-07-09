import React, { useState } from 'react'
import DashboardHeader from '@components/dashboard/DashboardHeader'
import { Box, Container, Grid, Skeleton, Typography, useTheme } from '@mui/material'
import VestingStatsTable from '../VestingStatsTable'
import VestingPositionTable from '../VestingPositionTable'
import DashboardCard from '@components/dashboard/DashboardCard'

const VestingDashboardPage = () => {
  const theme = useTheme();
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
        <Grid container sx={{ mb: 5 }}>
          <Grid xs={12} md={4} pr={4}>
            <DashboardCard center>
              <Typography>
                Total Number of Projects
              </Typography>
              <Typography variant="h5">
                {isLoading ?
                  <Skeleton animation='wave' width={160} />
                  :
                  <Box sx={{ mb: 1 }}>
                    <Typography align='center' variant='h5'>3</Typography>
                  </Box>
                }
              </Typography>
            </DashboardCard>
          </Grid>
          <Grid xs={12} md={4} pr={4}>
            <DashboardCard center>
              <Typography>
                Total Locked Assets <span style={{color:'gray'}}>(in USD)</span>
              </Typography>
              <Typography variant="h5">
                {isLoading ?
                  <>
                    <Skeleton animation='wave' width={160} />
                    <Skeleton animation='wave' width={160} />
                  </> :
                  <>
                    <Box sx={{ mb: 1 }}>
                      <Typography align='center' variant='h5'>$ 266,638.79</Typography>
                    </Box>
                  </>
                }
              </Typography>
            </DashboardCard>
          </Grid>
          <Grid xs={12} md={4}>
            <DashboardCard center>
              <Typography>
                Total Locked Assets <span style={{color:'gray'}}>(in ADA)</span>
              </Typography>
              <Typography variant="h5">
                {isLoading ?
                  <>
                    <Skeleton animation='wave' width={160} />
                  </> :
                  <>
                    <Box sx={{ mb: 1 }}>
                      <Typography align='center' variant='h5'>₳ 9,950,466.91</Typography>
                    </Box>
                  </>
                }
              </Typography>
            </DashboardCard>
          </Grid>
        </Grid>
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

const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 7);

const staticPositionsData = {
  data: [
    {
      projectName: 'Coinecta',
      token: "CNCT",
      total: "217.29",
      claimable: "15.29",
      frequency: "1 month",
      nextUnlockDate: futureDate,
      endDate: futureDate,
      remainingPeriods: "3 periods"
    },
    {
      projectName: 'SundaeSwap',
      token: "CNCT",
      total: "328.59",
      claimable: "200.29",
      frequency: "1 month",
      nextUnlockDate: new Date(),
      endDate: new Date(),
      remainingPeriods: "1 period"
    },
    {
      projectName: 'Coinecta',
      token: "CNCT",
      total: "117.19",
      claimable: "16.79",
      frequency: "1 month",
      nextUnlockDate: new Date(),
      endDate: new Date(),
      remainingPeriods: "2 periods"
    },
  ]
}