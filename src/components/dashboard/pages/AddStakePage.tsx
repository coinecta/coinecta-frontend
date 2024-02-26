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

  return (
    <Box sx={{ mb: 4 }}>
      <DashboardHeader title="Add stake" />
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
                onClick={() => stakeCNCT()}
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