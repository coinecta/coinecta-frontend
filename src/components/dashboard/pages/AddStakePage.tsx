import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  Paper,
  Skeleton,
  Snackbar,
  Typography,
} from '@mui/material';
import Grid from '@mui/system/Unstable_Grid/Grid';
import DashboardCard from '@components/dashboard/DashboardCard';
import StakeInput from '@components/dashboard/staking/StakeInput';
import StakeDuration from '../staking/StakeDuration';
import DataSpread from '@components/DataSpread';
import DashboardHeader from '../DashboardHeader';
import { useWallet } from '@meshsdk/react';
import StakeConfirm from '../staking/StakeConfirm';
import { calculateFutureDateMonths } from '@lib/utils/general'
import { StakePoolResponse, coinectaSyncApi } from '@server/services/syncApi';
import { metadataApi } from '@server/services/metadataApi';
import { formatTokenWithDecimals } from '@lib/utils/assets';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { trpc } from '@lib/utils/trpc';

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
  const DEFAULT_CNCT_DECIMALS = parseInt(process.env.DEFAULT_CNCT_DECIMALS!);

  const [cnctAmount, setCnctAmount] = useState('')
  const [stakeDuration, setStakeDuration] = useState<number>(1)
  const [durations, setDurations] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [isStakeTransactionSubmitted, setIsStakeTransactionSubmitted] = useState<boolean>(false);
  const [isStakeTransactionFailed, setIsStakeTransactionFailed] = useState<boolean>(false);

  const getStakePoolQuery = trpc.sync.getStakePool.useQuery({
    address: STAKE_POOL_VALIDATOR_ADDRESS,
    ownerPkh: STAKE_POOL_OWNER_KEY_HASH,
    policyId: STAKE_POOL_ASSET_POLICY,
    assetName: STAKE_POOL_ASSET_NAME
  });

  const metadataQuery  = trpc.tokens.getMetadata.useQuery({
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

  const rewardSettings = useMemo(() => {
    return getStakePoolQuery.data?.stakePool.rewardSettings;
  }, [getStakePoolQuery.data?.stakePool.rewardSettings]);

  const rewardSettingIndex = useMemo(() => {
    return options.indexOf(options.find(option => option.duration === stakeDuration) || options[0]);
  }, [stakeDuration]);

  if (rewardSettings !== undefined)
    console.log('rewardSettingIndex', rewardSettings[rewardSettingIndex]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === 'Enter') {
      if (Number(cnctAmount) !== 0) {
        setOpenConfirmationDialog(true);
      }
      event.preventDefault();
    }
  };

  const handleTransactionSubmitted = () => setIsStakeTransactionSubmitted(true);
  const handleTransactionFailed = () => setIsStakeTransactionFailed(true);
  const handleSuccessSnackbarClose = () => setIsStakeTransactionSubmitted(false);
  const handleFailedSnackbarClose = () => setIsStakeTransactionFailed(false);

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
              data={`${formatTokenWithDecimals(totalRewards, cnctDecimals)} CNCT`}
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
          </DashboardCard>
        </Grid>
      </Grid>
      <StakeConfirm
        open={openConfirmationDialog}
        setOpen={setOpenConfirmationDialog}
        paymentAmount={cnctAmount}
        setPaymentAmount={setCnctAmount}
        paymentCurrency={'CNCT'}
        duration={stakeDuration}
        total={total}
        rewardIndex={rewardSettingIndex}
        onTransactionSubmitted={handleTransactionSubmitted}
        onTransactionFailed={handleTransactionFailed}
      />
      <Snackbar open={isStakeTransactionSubmitted} autoHideDuration={6000} onClose={handleSuccessSnackbarClose}>
        <Alert
          onClose={handleSuccessSnackbarClose}
          severity="success"
          variant="outlined"
          sx={{ width: '100%' }}
          icon={<TaskAltIcon fontSize='medium' />}
        >
          Stake transaction submitted
        </Alert>
      </Snackbar>
      <Snackbar open={isStakeTransactionFailed} autoHideDuration={6000} onClose={handleFailedSnackbarClose}>
        <Alert
          onClose={handleFailedSnackbarClose}
          severity="error"
          variant="outlined"
          sx={{ width: '100%' }}
          icon={<ErrorOutlineOutlinedIcon fontSize='medium' />}
        >
          Error adding stake!
        </Alert>
      </Snackbar>
    </Box >
  );
};

export default AddStakePage;