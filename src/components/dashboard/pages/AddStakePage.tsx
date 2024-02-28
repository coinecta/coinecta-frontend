import React, { FC, useCallback, useEffect, useState } from 'react';
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
import { useWallet } from '@meshsdk/react';
import { Data, Transaction } from '@meshsdk/core';
import StakeConfirm from '../staking/StakeConfirm';
import { calculateFutureDateMonths } from '@lib/utils/general'

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
  const [ isLoading, setIsLoading ] = useState<boolean>(true);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const walletContext = useWallet();

  const stakeCNCT = useCallback(async () => {
    try {
      const cnctPolicy = "8b05e87a51c1d4a0fa888d2bb14dbc25e8c343ea379a171b63aa84a0";
      const cnctAssetName = "434e4354";

      const datum: Data = {
        alternative: 0,
        fields: [
          {
            alternative: 0,
            fields: ['0c61f135f652bc17994a5411d0a256de478ea24dbc19759d2ba14f03']
          } as Data
        ]
      };

      const tx = new Transaction({ initiator: walletContext.wallet })
        .sendAssets({
          address: "addr_test1wq6ladcf2n5h7fsphpx8xnf22v27uzj7xg0ykncwfzwyevs6lsajv", // store in config later
          datum: {
            value: datum
          }
        },
        [
          {
            unit: `${cnctPolicy}${cnctAssetName}`,
            quantity: cnctAmount
          }
        ]);

      const unsignedTx = await tx.build();
      console.log("UnsignedTx", unsignedTx);
      // const signedTx = await walletContext.wallet.signTx(unsignedTx);
      // console.log("SignedTx", signedTx.toString());
    }
    catch(ex) {
      console.error(ex);
    }
  }, [cnctAmount, walletContext.wallet]);

  useEffect(() => {
    const newArray = options.map(option => option.duration)
    setDurations(newArray)
  }, []) // replace with TRPC query when its available

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

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
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: 700 }}>
                    APY Boost
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {`${(calculateAPY(stakeDuration, (options.find(option => option.duration === stakeDuration)?.interest || 1)) - calculateAPY(1, (options.find(option => option.duration === 1)?.interest || 1))).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </DashboardCard>
          <DashboardCard>
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