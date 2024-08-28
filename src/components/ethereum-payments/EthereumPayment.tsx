import React, { useState, useEffect } from 'react';
import { ethers, Contract } from 'ethers';
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import { TOKENS, ERC20_ABI } from '@lib/constants/evm';
import { trpc } from '@lib/utils/trpc';

const NETWORK_CHAIN_IDS: Record<NetworkType, number> = {
  Ethereum: 1,
  Base: 8453
};

const EthereumBasePayment: React.FC = () => {
  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const [amount, setAmount] = useState<string>('');
  const [selectedToken, setSelectedToken] = useState<TokenSymbol>('ETH');
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>('Ethereum');
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    if (chainId) {
      const network = chainId === NETWORK_CHAIN_IDS.Base ? 'Base' : 'Ethereum'
      setSelectedNetwork(network);
      console.log("Network: ", network)
    }
  }, [chainId]);

  const handleNetworkSwitch = async (network: NetworkType) => {
    if (!walletProvider) {
      console.log("No wallet provider")
      return;
    }
    try {
      const changeNetwork = await walletProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${NETWORK_CHAIN_IDS[network].toString(16)}` }],
      });
      console.log("New network: ", changeNetwork)
    } catch (error) {
      console.error('Failed to switch network', error);
      setStatus('Failed to switch network. Please try manually.');
    }
  };

  const handlePayment = async (): Promise<void> => {
    setStatus("Initiating payment...");
    await handleNetworkSwitch(selectedNetwork)
    try {
      if (!walletProvider) {
        setStatus('Please connect your wallet first.');
        console.log("Wallet not connected")
        return;
      }
      if (!isConnected) throw Error('User disconnected');

      // if (chainId !== NETWORK_CHAIN_IDS[selectedNetwork]) {
      //   setStatus('Please switch to the correct network.');
      //   console.log("Please switch to the correct network.")
      //   await handleNetworkSwitch(selectedNetwork);
      //   return;
      // }

      const ethersProvider = new ethers.BrowserProvider(walletProvider);
      console.log(ethersProvider)
      const signer = await ethersProvider.getSigner();
      console.log(signer)

      const recipientAddress = '0xc28a8a0e62be9da694c77c3e9c0e8c9845f86611';
      console.log("Selected token: ", selectedToken)
      const token = TOKENS[selectedNetwork][selectedToken];
      console.log("Token: ", token)

      if (selectedToken === 'ETH') {
        const transaction = {
          to: recipientAddress,
          value: ethers.parseEther(amount)
        };
        const tx = await signer.sendTransaction(transaction);

        setStatus(`${selectedToken} Transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();
        setStatus(`${selectedToken} Transaction confirmed in block ${receipt?.blockNumber}`);
      } else {
        if (!token.address) throw new Error('Token address not found');
        const tokenContract = new Contract(token.address, ERC20_ABI, signer);
        const tokenAmount = ethers.parseUnits(amount, token.decimals);

        console.log('Token Transfer Details:', {
          tokenAddress: token.address,
          recipientAddress,
          amount: amount,
          tokenAmount: tokenAmount.toString(),
          decimals: token.decimals
        });

        console.log('Populating transaction...');
        const populatedTx = await tokenContract.transfer.populateTransaction(recipientAddress, tokenAmount);
        console.log("Populated transaction:", populatedTx);

        console.log('Sending transaction...');
        const tx = await signer.sendTransaction(populatedTx);
        console.log("Transaction sent:", tx);

        setStatus(`${selectedToken} Transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();
        setStatus(`${selectedToken} Transaction confirmed in block ${receipt?.blockNumber}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setStatus(`Payment failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div>
      <select
        value={selectedNetwork}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedNetwork(e.target.value as NetworkType)}
      >
        {Object.keys(TOKENS).map((network) => (
          <option key={network} value={network}>{network}</option>
        ))}
      </select>
      <input
        type="text"
        value={amount}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
        placeholder="Amount"
      />
      <select
        value={selectedToken}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedToken(e.target.value as TokenSymbol)}
      >
        {Object.keys(TOKENS[selectedNetwork]).map((token) => (
          <option key={token} value={token}>{token}</option>
        ))}
      </select>
      <button onClick={handlePayment}>
        {walletProvider ? 'Send Payment' : 'Connect Wallet'}
      </button>
      <p>{status}</p>
    </div>
  );
};

export default EthereumBasePayment;