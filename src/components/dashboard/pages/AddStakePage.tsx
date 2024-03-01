import React, { FC, useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Paper,
  Skeleton,
  Typography,
} from '@mui/material';
import Grid from '@mui/system/Unstable_Grid/Grid';
import DashboardCard from '@components/dashboard/DashboardCard';
import StakeInput from '@components/dashboard/staking/StakeInput';
import StakeDuration from '../staking/StakeDuration';
import DataSpread from '@components/DataSpread';
import DashboardHeader from '../DashboardHeader';
import { useWallet } from '@meshsdk/react';
import { Data, Transaction } from '@meshsdk/core';
import StakeConfirm from '../staking/StakeConfirm';
import { calculateFutureDateMonths } from '@lib/utils/general'
import { coinectaSyncApi } from '@server/services/syncApi';
import { set } from 'zod';

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

  const STAKE_POOL_VALIDATOR_ADDRESS = process.env.STAKE_POOL_VALIDATOR_ADDRESS!;
  const STAKE_POOL_OWNER_KEY_HASH = process.env.STAKE_POOL_OWNER_KEY_HASH!;
  const STAKE_POOL_ASSET_POLICY = process.env.STAKE_POOL_ASSET_POLICY!;
  const STAKE_POOL_ASSET_NAME = process.env.STAKE_POOL_ASSET_NAME!;

  const [cnctAmount, setCnctAmount] = useState('')
  const [stakeDuration, setStakeDuration] = useState<number>(1)
  const [durations, setDurations] = useState<number[]>([])
  const [ isLoading, setIsLoading ] = useState<boolean>(true);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const walletContext = useWallet();

  useEffect(() => {
    const newArray = options.map(option => option.duration)
    setDurations(newArray)
  }, [])

  
  useEffect(() => {
    const execute = async () => {
      const stakePoolData = await coinectaSyncApi.getStakePool(
        STAKE_POOL_VALIDATOR_ADDRESS,
        STAKE_POOL_OWNER_KEY_HASH,
        STAKE_POOL_ASSET_POLICY,
        STAKE_POOL_ASSET_NAME
      );
      setIsLoading(false);
    };
    execute();
  }, [STAKE_POOL_ASSET_NAME, STAKE_POOL_ASSET_POLICY, STAKE_POOL_OWNER_KEY_HASH, STAKE_POOL_VALIDATOR_ADDRESS])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === 'Enter') {
      if (Number(cnctAmount) !== 0) {
        setOpenConfirmationDialog(true);
      }
      event.preventDefault();
    }
  };

  const total = (Number(cnctAmount) ? (Number(cnctAmount) * (options.find(option => option.duration === stakeDuration)?.interest || 0)) + Number(cnctAmount) : 0).toLocaleString(undefined, { maximumFractionDigits: 1 })

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
                onKeyDown={handleKeyDown}
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
                onClick={() => setOpenConfirmationDialog(true)}
                disabled={Number(cnctAmount) === 0}
              >
                Stake now
              </Button>
            </Box>
          </DashboardCard>
        </Grid>
        <Grid xs={12} md={5} sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
          <DashboardCard>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ mb: 2, textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Total APY
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  { isLoading ? 
                    <div style={{display: "flex", justifyContent: "center"}}><Skeleton animation='wave' width={55} /></div> :
                    `${(calculateAPY(stakeDuration, (options.find(option => option.duration === stakeDuration)?.interest || 1))).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`
                  }
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: 700 }}>
                    Base APY
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    { isLoading ? 
                      <div style={{display: "flex", justifyContent: "center"}}><Skeleton animation='wave' width={55} /></div> : 
                      `${calculateAPY(1, (options.find(option => option.duration === 1)?.interest || 1)).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`
                    }
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: 700 }}>
                    APY Boost
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    { isLoading ? 
                      <div style={{display: "flex", justifyContent: "center"}}><Skeleton animation='wave' width={55} /></div> : 
                      `${(calculateAPY(stakeDuration, (options.find(option => option.duration === stakeDuration)?.interest || 1)) - calculateAPY(1, (options.find(option => option.duration === 1)?.interest || 1))).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`
                    }
                  </Typography>
                </Box>
              </Box>
            </Box>
          </DashboardCard>
          <DashboardCard>
            <DataSpread
              title="Total Available Rewards"
              data={`1,000,000 CNCT`}
              isLoading={isLoading}
            />
            <DataSpread
              title="Unlock Date"
              data={`${calculateFutureDateMonths(stakeDuration)}`}
              isLoading={isLoading}
            />
            <DataSpread
              title="Rewards"
              data={`${(Number(cnctAmount) ? Number(cnctAmount) * (options.find(option => option.duration === stakeDuration)?.interest || 0) : 0).toLocaleString(undefined, { maximumFractionDigits: 1 })} CNCT`}
              isLoading={isLoading}
            />
            <DataSpread
              title="Total interest"
              data={`${((options.find(option => option.duration === stakeDuration)?.interest || 0) * 100).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`}
              isLoading={isLoading}
            />
            <DataSpread
              title="Principal plus rewards"
              margin={0}
              data={`${total} CNCT`}
              isLoading={isLoading}
            />
          </DashboardCard>
        </Grid>
      </Grid>
      <StakeConfirm
        open={openConfirmationDialog}
        setOpen={setOpenConfirmationDialog}
        paymentAmount={cnctAmount}
        paymentCurrency={'CNCT'}
        duration={stakeDuration}
        total={total}
      />
    </Box >
  );
};

export default AddStakePage;