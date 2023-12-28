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

const options = [
  {
    duration: 1,
    interest: 0.0153
  },
  {
    duration: 2,
    interest: 0.0337
  },
  {
    duration: 3,
    interest: 0.0549
  },
  {
    duration: 6,
    interest: 0.1191
  },
  {
    duration: 9,
    interest: 0.20
  },
  {
    duration: 12,
    interest: 0.30
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
      <Typography variant="h5" sx={{ mb: 1 }}>
        Add Stake
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        <Grid xs={12} md={7}>
          <DashboardCard sx={{
            alignItems: 'center',
            height: '100%',
            justifyContent: 'space-between',
            py: 4
          }}>
            <Typography variant="h3" sx={{ mb: 1 }}>
              Stake Coinecta
            </Typography>
            <Box sx={{ width: '100%' }}>
              <StakeDuration
                duration={stakeDuration}
                setDuration={setStakeDuration}
                durations={durations}
              />
            </Box>
            <Box sx={{ width: '100%' }}>
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
                Contribute now
              </Button>
            </Box>
          </DashboardCard>
        </Grid>
        <Grid xs={12} md={5} sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
          <DashboardCard>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Base APY
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {`${calculateAPY(1, (options.find(option => option.duration === 1)?.interest || 1)).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`}
            </Typography>
          </DashboardCard>
          <DashboardCard>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              APY Boost
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {`${(calculateAPY(stakeDuration, (options.find(option => option.duration === stakeDuration)?.interest || 1)) - calculateAPY(1, (options.find(option => option.duration === 1)?.interest || 1))).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`}
            </Typography>
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
              title="APY"
              data={`${calculateAPY(stakeDuration, (options.find(option => option.duration === stakeDuration)?.interest || 1)).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`}
            />
            <DataSpread
              title="Principal plus rewards"
              data={`${(Number(cnctAmount) ? (Number(cnctAmount) * (options.find(option => option.duration === stakeDuration)?.interest || 0)) + Number(cnctAmount) : 0).toLocaleString(undefined, { maximumFractionDigits: 1 })} CNCT`}
            />

          </DashboardCard>
        </Grid>
      </Grid>
    </Box >
  );
};

export default AddStakePage;