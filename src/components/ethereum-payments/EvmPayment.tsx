import React, { useState, useEffect } from 'react';
import { ethers, Contract } from 'ethers';
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import { TOKENS, ERC20_ABI } from '@lib/constants/evm';
import { trpc } from '@lib/utils/trpc';
import { Box, Button, Typography } from '@mui/material';
import { useAlert } from '@contexts/AlertContext';
import { BLOCKCHAINS } from '@lib/currencies';
import { useWalletContext } from '@contexts/WalletContext';
import { getShorterAddress } from '@lib/utils/general';
import { useQueryParams } from '@contexts/QueryParamsContext';

interface EvmPaymentProps {
  paymentAmount: string;
  paymentCurrency: TAcceptedCurrency | undefined;
  blockchain: string;
  exchangeRate: number;
  recipientAddress: string;
  userAdaAddress?: string;
  contributionRoundId: number;
  onSuccess: () => void;
}

const EvmPayment: React.FC<EvmPaymentProps> = ({
  paymentAmount,
  paymentCurrency,
  exchangeRate,
  blockchain,
  recipientAddress,
  contributionRoundId,
  userAdaAddress,
  onSuccess
}) => {
  const { sessionData } = useWalletContext()
  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const [status, setStatus] = useState<string>('');
  const { addAlert } = useAlert();
  const createTransaction = trpc.contributions.createTransaction.useMutation();
  const { queryParams } = useQueryParams();

  console.log(queryParams.ref)

  const NETWORK_CHAIN_IDS: Record<string, number> = {
    Ethereum: 1,
    Base: 8453
  };

  useEffect(() => {
    if (chainId && blockchain) {
      const currentNetwork = chainId === NETWORK_CHAIN_IDS[blockchain] ? blockchain : 'Wrong Network';
      console.log("Current Network: ", currentNetwork);
    }
  }, [chainId, blockchain]);

  const handleNetworkSwitch = async () => {
    if (!walletProvider) {
      console.log("No wallet provider");
      return;
    }
    try {
      await walletProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${NETWORK_CHAIN_IDS[blockchain].toString(16)}` }],
      });
    } catch (error) {
      console.error('Failed to switch network', error);
      addAlert('error', 'Failed to switch network. Please try manually.');
    }
  };

  const handlePayment = async (): Promise<void> => {
    setStatus("Initiating payment...");
    await handleNetworkSwitch();
    try {
      if (!walletProvider) {
        addAlert('error', 'Please connect your wallet first.');
        return;
      }
      if (!isConnected) throw Error('User disconnected');

      const ethersProvider = new ethers.BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();

      const token = BLOCKCHAINS.find(item => item.name === blockchain)?.tokens.find(item => item.symbol === paymentCurrency?.currency);

      if (paymentCurrency?.currency === 'ETH') {
        const transaction = {
          to: recipientAddress,
          value: ethers.parseEther(paymentAmount)
        };
        const tx = await signer.sendTransaction(transaction);

        setStatus(`${paymentCurrency.currency} Transaction sent: ${getShorterAddress(tx.hash, 6)}`);
        await createTransaction.mutateAsync({
          amount: paymentAmount,
          currency: paymentCurrency.currency,
          adaReceiveAddress: userAdaAddress || sessionData?.user.address || '',
          exchangeRate: exchangeRate,
          blockchain: paymentCurrency.blockchain,
          address: address!,
          txId: tx.hash,
          contributionId: contributionRoundId,
          referralCode: queryParams.ref
        });

        const receipt = await tx.wait();
        setStatus(`${paymentCurrency.currency} Transaction confirmed in block ${receipt?.blockNumber}`);



        addAlert('success', `Transaction successful: ${tx.hash}`);
        setStatus("Transaction Successful!");
        onSuccess();
      } else {
        if (!token?.contractAddress) throw new Error('Token address not found');
        if (!paymentCurrency) throw new Error('No payment currency selected')
        const tokenContract = new Contract(token.contractAddress, ERC20_ABI, signer);
        const tokenAmount = ethers.parseUnits(paymentAmount, token.decimals);

        const tx = await tokenContract.transfer(recipientAddress, tokenAmount);

        setStatus(`${paymentCurrency.currency} Transaction sent: ${getShorterAddress(tx.hash, 6)}`);
        await createTransaction.mutateAsync({
          amount: paymentAmount,
          currency: paymentCurrency.currency,
          address: address!,
          adaReceiveAddress: userAdaAddress || sessionData?.user.address || '',
          exchangeRate: exchangeRate,
          blockchain: paymentCurrency.blockchain,
          txId: tx.hash,
          contributionId: contributionRoundId,
          referralCode: queryParams.ref
        });

        const receipt = await tx.wait();

        setStatus(`${paymentCurrency.currency} Transaction confirmed in block ${receipt?.blockNumber}`);

        addAlert('success', `Transaction successful: ${tx.hash}`);
        setStatus("Transaction Successful!");
        onSuccess();
      }
    } catch (error) {
      console.error('Payment error:', error);
      if (error instanceof Error && error.message.includes('rejected')) {
        addAlert('error', `User rejected payment`);
      }
      else addAlert('error', `Payment failed: ${error instanceof Error ? error.message : String(error)}`);
      setStatus("Payment error, please try again.");
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Button disabled={
        !paymentCurrency
        || !blockchain
        || !userAdaAddress
      } variant="contained" color="secondary" onClick={handlePayment} fullWidth>
        {`Submit with ${paymentCurrency?.currency} on ${blockchain}`}
      </Button>
      {status && <Typography sx={{ textAlign: 'center' }}>{status}</Typography>}
    </Box>
  );

};

export default EvmPayment;