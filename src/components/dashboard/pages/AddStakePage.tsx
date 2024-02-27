import React, { FC, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Paper,
  Typography,
} from '@mui/material';
import Grid from '@mui/system/Unstable_Grid/Grid';
import DashboardCard from '@components/dashboard/DashboardCard';
import StakeInput from '@components/dashboard/staking/StakeInput';
import StakeDuration from '../staking/StakeDuration';
import DataSpread from '@components/DataSpread';
import DashboardHeader from '../DashboardHeader';

const options = [
  {
    duration: 1,
    interest: 0.01
  },
  {
    duration: 3,
    interest: 0.05
  },
  {
    duration: 6,
    interest: 0.15
  },
  {
    duration: 12,
    interest: 0.40
  },
]

const calculateAPY = (lockupMonths: number, interestRate: number): number => {
  const compoundFrequency = 12 / lockupMonths;
  const apy = Math.pow(1 + interestRate, compoundFrequency) - 1;
  return apy * 100;
}

const AddStakePage: FC = () => {
  const [cnctAmount, setCnctAmount] = useState('')
  const [stakeDuration, setStakeDuration] = useState<number>(1)
  const [durations, setDurations] = useState<number[]>([])

  useEffect(() => {
    const newArray = options.map(option => option.duration)
    setDurations(newArray)
  }, [options]) // replace with TRPC query when its available

  return (
    <Box sx={{ mb: 4 }}>
      <DashboardHeader title="Add stake" />
      <Grid container spacing={2}>
        <Grid xs={12} md={7}>
          <DashboardCard center>
            <Typography variant="h3" sx={{ mb: 2 }}>
              Stake Coinecta
            </Typography>
            <Box sx={{ width: '100%', mb: 3 }}>
              <StakeDuration
                duration={stakeDuration}
                setDuration={setStakeDuration}
                durations={durations}
              />
            </Box>
            <Box sx={{ width: '100%', mb: 3 }}>
              <StakeInput
                inputValue={cnctAmount}
                setInputValue={setCnctAmount}
              />
            </Box>
            <Box>
              <Button
                variant="contained"
                color="secondary"
                // disabled={!termsCheck || !whitelisted || !live}
                sx={{
                  textTransform: 'none',
                  fontSize: '20px',
                  fontWeight: 600,
                  borderRadius: '6px'
                }}
              // onClick={() => setOpenContribution(true)}
              >
                Stake now
              </Button>
            </Box>
          </DashboardCard>
        </Grid>
        <Grid xs={12} md={5} sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
          <DashboardCard center>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Total APY
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {`${(calculateAPY(stakeDuration, (options.find(option => option.duration === stakeDuration)?.interest || 1))).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 700 }}>
                  Base APY
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {`${calculateAPY(1, (options.find(option => option.duration === 1)?.interest || 1)).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>
                  APY Boost
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {`${(calculateAPY(stakeDuration, (options.find(option => option.duration === stakeDuration)?.interest || 1)) - calculateAPY(1, (options.find(option => option.duration === 1)?.interest || 1))).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`}
                </Typography>
              </Box>
            </Box>
          </DashboardCard>
          <DashboardCard>
            <DataSpread
              title="Rewards"
              data={`${(Number(cnctAmount) ? Number(cnctAmount) * (options.find(option => option.duration === stakeDuration)?.interest || 0) : 0).toLocaleString(undefined, { maximumFractionDigits: 1 })} CNCT`}
            />
            <DataSpread
              title="Total interest"
              data={`${((options.find(option => option.duration === stakeDuration)?.interest || 0) * 100).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`}
            />
            <DataSpread
              title="Principal plus rewards"
              margin={0}
              data={`${(Number(cnctAmount) ? (Number(cnctAmount) * (options.find(option => option.duration === stakeDuration)?.interest || 0)) + Number(cnctAmount) : 0).toLocaleString(undefined, { maximumFractionDigits: 1 })} CNCT`}
            />
          </DashboardCard>
        </Grid>
      </Grid>
    </Box >
  );
};

export default AddStakePage;