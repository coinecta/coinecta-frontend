

import React, { FC, ReactNode, useEffect, useState } from 'react';
import { Box, Paper, TextField, FilledInput, Chip, Button, Link, useTheme } from '@mui/material';
import { formatNumber, roundToTwo } from '@lib/utils/general';
import { Transaction } from '@meshsdk/core';
import { useWalletContext } from '@contexts/WalletContext';
import { useWallet } from '@meshsdk/react';
import Typography, { TypographyProps } from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAlert } from '@contexts/AlertContext';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

type FisoFullCardProps = {
  stakepoolData: TStakePoolWithStats;
  projectSlug: string;
  epochInfo?: {
    startEpoch: number;
    endEpoch: number;
    poolId: string;
  }[];
  currentEpoch?: number;
}

interface SmParagraphProps extends TypographyProps {
  children: ReactNode;
}

const SmParagraph: FC<SmParagraphProps> = (props) => {
  return (
    <Typography {...props} sx={{ ...props.sx, fontSize: '1rem !important' }}>
      {props.children}
    </Typography>
  )
}

const FisoFullCard: FC<FisoFullCardProps> = ({ stakepoolData, projectSlug, epochInfo, currentEpoch }) => {
  const { addAlert } = useAlert()
  const { wallet } = useWallet()
  const theme = useTheme()

  const thisEpoch = epochInfo?.find(epoch => epoch.poolId === stakepoolData.pool_id)

  const delegateStake = async () => {
    try {
      // Attempt to get the wallet's reward addresses
      const rewardAddresses = await wallet.getRewardAddresses();

      // Ensure that there is at least one reward address
      if (rewardAddresses.length === 0) {
        throw new Error('No reward addresses found.');
      }

      // Create a new transaction
      const tx = new Transaction({ initiator: wallet });

      // Register the stake with the first reward address
      tx.registerStake(rewardAddresses[0]);

      // Delegate the stake
      tx.delegateStake(rewardAddresses[0], stakepoolData.pool_id);

      // Build the transaction
      const unsignedTx = await tx.build();

      // Sign the transaction
      const signedTx = await wallet.signTx(unsignedTx);

      // Submit the transaction
      const txHash = await wallet.submitTx(signedTx);

      // Notify the user of successful staking
      addAlert('success', <>Successfully staked with transaction hash: <a href={`https://cardanoscan.io/transaction/${txHash}`} target="_blank">{txHash}</a></>);
    } catch (error: any) {
      // Log the error (optional, for debugging purposes)
      console.error('Staking failed:', error);

      // Notify the user of the error
      addAlert('error', `Staking failed: ${error.message || 'Unknown error'}`);
    }
  };


  const isActive: boolean = !!currentEpoch && !!thisEpoch && (thisEpoch.startEpoch <= currentEpoch && thisEpoch.endEpoch >= currentEpoch)
  const showStakeNowButton: boolean = !!currentEpoch && !!thisEpoch && (thisEpoch.startEpoch - 3 <= currentEpoch && thisEpoch.endEpoch >= currentEpoch)

  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {stakepoolData.homepage
          ? <Link
            variant="h6"
            sx={{
              color: theme.palette.text.primary,
              textDecoration: 'underline',
              '&:hover': {
                textDecoration: 'none'
              }
            }}
            href={stakepoolData.homepage} target="_blank">
            {stakepoolData.ticker}
          </Link>
          : <Typography variant="h6">
            {stakepoolData.ticker}
          </Typography>
        }

        {isActive && (
          <Chip
            icon={<CheckCircleIcon />}
            label="Active"
            color="success"
            size="small"
            variant="outlined"
          />
        )}
        {!isActive && showStakeNowButton && (
          <Chip
            icon={<InfoOutlinedIcon />}
            label="Active soon"
            color="info"
            size="small"
            variant="outlined"
          />
        )}
      </Box>
      <Typography color="text.secondary" sx={{ mb: 1 }}>
        {stakepoolData.name}
      </Typography>
      {thisEpoch && (
        <Typography sx={{ mb: 1 }}>
          Active epochs: {thisEpoch.startEpoch} - {thisEpoch.endEpoch}
        </Typography>
      )}
      <SmParagraph>
        Live stake: {formatNumber(Number(stakepoolData.stats.live_stake) * 0.000001)} ₳
      </SmParagraph>
      <SmParagraph>
        Fixed Fee: {Number(stakepoolData.stats.fixed_cost) * 0.000001} ₳
      </SmParagraph>
      <SmParagraph>
        Margin cost: {roundToTwo(stakepoolData.stats.margin_cost * 100)}%
      </SmParagraph>
      <SmParagraph>
        Delegators: {stakepoolData.stats.live_delegators}
      </SmParagraph>
      <SmParagraph>
        Saturation: {roundToTwo(stakepoolData.stats.live_saturation * 100)}%
      </SmParagraph>
      <SmParagraph>
        Live Pledge: {formatNumber(Number(stakepoolData.stats.live_pledge) * 0.000001)} ₳
      </SmParagraph>
      <Box sx={{ width: '100%', textAlign: 'center', mt: 1 }}>
        {showStakeNowButton && (
          <Button
            onClick={delegateStake}
            startIcon={<AccountBalanceWalletIcon />}
            variant="contained"
            color="secondary"
            size="small"
            sx={{ textTransform: 'none' }}
          >
            Stake now
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default FisoFullCard;
