import DataSpread from '@components/DataSpread';
import DashboardCard from '@components/dashboard/DashboardCard';
import StakeInput from '@components/dashboard/staking/StakeInput';
import { formatNumber, formatTokenWithDecimals } from '@lib/utils/assets';
import { calculateFutureDateMonths } from '@lib/utils/general';
import { trpc } from '@lib/utils/trpc';
import {
  Box,
  Button,
  Skeleton,
  Typography,
  useTheme
} from '@mui/material';
import Grid from '@mui/system/Unstable_Grid/Grid';
import React, { FC, useEffect, useMemo, useState } from 'react';
import DashboardHeader from '../DashboardHeader';
import StakeConfirm from '../staking/StakeConfirm';
import StakeDuration from '../staking/StakeDuration';
import { pink, orange, purple } from '@mui/material/colors';

const options = [
  {
    duration: 1,
    interest: 0.005
  },
  {
    duration: 3,
    interest: 0.025
  },
  {
    duration: 6,
    interest: 0.075
  },
  {
    duration: 12,
    interest: 0.20
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
  const DEFAULT_CNCT_DECIMALS = parseInt(process.env.DEFAULT_CNCT_DECIMALS!);

  const [cnctAmount, setCnctAmount] = useState('')
  const [stakeDuration, setStakeDuration] = useState<number>(1)
  const [durations, setDurations] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);

  const theme = useTheme();

  const getStakePoolQuery = trpc.sync.getStakePool.useQuery({
    address: STAKE_POOL_VALIDATOR_ADDRESS,
    ownerPkh: STAKE_POOL_OWNER_KEY_HASH,
    policyId: STAKE_POOL_ASSET_POLICY,
    assetName: STAKE_POOL_ASSET_NAME
  });

  const metadataQuery = trpc.tokens.getMetadata.useQuery({
    unit: `${STAKE_POOL_ASSET_POLICY}${STAKE_POOL_ASSET_NAME}`
  });

  const cnctDecimals = useMemo(() => {
    return metadataQuery.data?.decimals?.value ?? DEFAULT_CNCT_DECIMALS;
  }, [DEFAULT_CNCT_DECIMALS, metadataQuery.data?.decimals?.value]);

  useEffect(() => {
    setIsLoading(!getStakePoolQuery.isSuccess && !metadataQuery.isSuccess);
  }, [getStakePoolQuery.isSuccess, metadataQuery.isSuccess])

  useEffect(() => {
    const newArray = options.map(option => option.duration)
    setDurations(newArray)
  }, []);

  const totalRewards = useMemo(() => {
    return BigInt(getStakePoolQuery.data?.amount.multiAsset[STAKE_POOL_ASSET_POLICY][STAKE_POOL_ASSET_NAME] ?? 0);
  }, [STAKE_POOL_ASSET_NAME, STAKE_POOL_ASSET_POLICY, getStakePoolQuery.data?.amount.multiAsset]);

  const rewardSettingIndex = useMemo(() => {
    return options.indexOf(options.find(option => option.duration === stakeDuration) || options[0]);
  }, [stakeDuration]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === 'Enter') {
      if (Number(cnctAmount) !== 0) {
        setOpenConfirmationDialog(true);
      }
      event.preventDefault();
    }
  };

  const total = (Number(cnctAmount) ? (Number(cnctAmount) * (options.find(option => option.duration === stakeDuration)?.interest || 0)) + Number(cnctAmount) : 0).toLocaleString(undefined, { maximumFractionDigits: 1 })
  const rewards = (Number(cnctAmount) ? Number(cnctAmount) * (options.find(option => option.duration === stakeDuration)?.interest || 0) : 0)

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <DashboardHeader title="Add stake" />
        <Grid container spacing={2}>
          <Grid xs={12} md={7}>
            <DashboardCard center>
              <Typography variant="h3" sx={{ mb: 2 }}>
                Stake Coinecta
              </Typography>
              <Box sx={{ width: '100%', mb: 3 }}>
                {isLoading ?
                  <div style={{ display: "flex", justifyContent: "center" }}><Skeleton animation='wave' width={200} /></div> :
                  <StakeDuration
                    duration={stakeDuration}
                    setDuration={setStakeDuration}
                    durations={durations}
                  />
                }
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
                  sx={{
                    textTransform: 'none',
                    fontSize: '20px',
                    fontWeight: 600,
                    borderRadius: '6px'
                  }}
                  onClick={() => setOpenConfirmationDialog(true)}
                  disabled={Number(cnctAmount) === 0 || Number(formatTokenWithDecimals(totalRewards, cnctDecimals)) < rewards + 2000}
                >
                  Stake now
                </Button>
              </Box>
              {/* {Number(formatTokenWithDecimals(totalRewards, cnctDecimals)) < rewards + 2000 && 
              <Typography sx={{ fontSize: '13px!important', mt: 2, textAlign: 'center', color: theme.palette.error.main }}>
                The stake pool needs to be reloaded, please follow the announcements in Telegram or Discord for updates.
              </Typography>
            } */}
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
                    {isLoading ?
                      <div style={{ display: "flex", justifyContent: "center" }}><Skeleton animation='wave' width={55} /></div> :
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
                      {isLoading ?
                        <div style={{ display: "flex", justifyContent: "center" }}><Skeleton animation='wave' width={55} /></div> :
                        `${calculateAPY(1, (options.find(option => option.duration === 1)?.interest || 1)).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`
                      }
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontWeight: 700 }}>
                      APY Boost
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {isLoading ?
                        <div style={{ display: "flex", justifyContent: "center" }}><Skeleton animation='wave' width={55} /></div> :
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
                data={`${formatNumber(parseFloat(formatTokenWithDecimals(totalRewards, cnctDecimals)), '')} CNCT`}
                isLoading={isLoading}
              />
              <DataSpread
                title="Unlock Date"
                data={`${calculateFutureDateMonths(stakeDuration)}`}
                isLoading={isLoading}
              />
              <DataSpread
                title="Rewards"
                data={`${rewards.toLocaleString(undefined, { maximumFractionDigits: 2 })} CNCT`}
                isLoading={isLoading}
              />
              <DataSpread
                title="Total interest"
                data={`${((options.find(option => option.duration === stakeDuration)?.interest || 0) * 100).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`}
                isLoading={isLoading}
              />
            </DashboardCard>
          </Grid>
        </Grid>
      </Box >

      <Box sx={{ mb: 4 }}>
        <DashboardHeader title="Stake tiers" isDropdownHidden />
        <Grid container spacing={2}>
          <Grid xs={12} md={12} sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', textAlign: 'center' }}>
              <Box sx={{ textAlign: 'center', py: 1, px: 3, backgroundColor: pink[400], borderRadius: '6px' }}>
                <Typography variant='h6'>TIER 6</Typography>
              </Box>
              <DashboardCard sx={{ display: 'grid', gridTemplateRows: 'repeat(3, 1fr)' }} center>
                <Typography sx={{ fontWeight: 700 }}>1,500,000 $IDP</Typography>
                <Typography>Seed Round with allocation capped at:</Typography>
                <Typography sx={{ fontWeight: 900 }}>10K USD</Typography>
              </DashboardCard>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', textAlign: 'center' }}>
              <Box sx={{ textAlign: 'center', py: 1, px: 3, backgroundColor: pink[400], borderRadius: '6px' }}>
                <Typography variant='h6'>TIER 5</Typography>
              </Box>
              <DashboardCard sx={{ display: 'grid', gridTemplateRows: 'repeat(3, 1fr)' }} center>
                <Typography sx={{ fontWeight: 700 }}>700,000 $IDP</Typography>
                <Typography>Private round with allocation capped at:</Typography>
                <Typography sx={{ fontWeight: 900 }}>2.5k USD</Typography>
              </DashboardCard>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', textAlign: 'center' }}>
              <Box sx={{ textAlign: 'center', py: 1, px: 3, backgroundColor: orange[400], borderRadius: '6px' }}>
                <Typography variant='h6'>TIER 4</Typography>
              </Box>
              <DashboardCard sx={{ display: 'grid', gridTemplateRows: 'repeat(3, 1fr)' }} center>
                <Typography sx={{ fontWeight: 700 }}>400,000 $IDP</Typography>
                <Typography>Guaranteed allocation capped at:</Typography>
                <Typography sx={{ fontWeight: 900 }}>1.25K USD</Typography>
              </DashboardCard>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', textAlign: 'center' }}>
              <Box sx={{ textAlign: 'center', py: 1, px: 3, backgroundColor: orange[400], borderRadius: '6px' }}>
                <Typography variant='h6'>TIER 3</Typography>
              </Box>
              <DashboardCard sx={{ display: 'grid', gridTemplateRows: 'repeat(3, 1fr)' }} center>
                <Typography sx={{ fontWeight: 700 }}>150,000 $IDP</Typography>
                <Typography>Guaranteed allocation capped at:</Typography>
                <Typography sx={{ fontWeight: 900 }}>600 USD</Typography>
              </DashboardCard>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', textAlign: 'center' }}>
              <Box sx={{ textAlign: 'center', py: 1, px: 3, backgroundColor: purple[400], borderRadius: '6px' }}>
                <Typography variant='h6'>TIER 2</Typography>
              </Box>
              <DashboardCard sx={{ display: 'grid', gridTemplateRows: 'repeat(3, 1fr)' }} center>
                <Typography sx={{ fontWeight: 700 }}>50,000 $IDP</Typography>
                <Typography>Lottery-based allocation of up to:</Typography>
                <Typography sx={{ fontWeight: 900 }}>200 USD</Typography>
              </DashboardCard>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', textAlign: 'center' }}>
              <Box sx={{ textAlign: 'center', py: 1, px: 3, backgroundColor: purple[400], borderRadius: '6px' }}>
                <Typography variant='h6'>TIER 1</Typography>
              </Box>
              <DashboardCard sx={{ display: 'grid', gridTemplateRows: 'repeat(3, 1fr)' }} center>
                <Typography sx={{ fontWeight: 700 }}>25,000 $IDP</Typography>
                <Typography>Lottery-based allocation of up to:</Typography>
                <Typography sx={{ fontWeight: 900 }}>75 USD</Typography>
              </DashboardCard>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <StakeConfirm
        open={openConfirmationDialog}
        setOpen={setOpenConfirmationDialog}
        paymentAmount={cnctAmount}
        setPaymentAmount={setCnctAmount}
        paymentCurrency={'CNCT'}
        duration={stakeDuration}
        total={total}
        rewardIndex={rewardSettingIndex}
      />
    </>
  );
};

export default AddStakePage;