import type { NextPage } from 'next'
import {
  Container,
  useTheme,
  useMediaQuery,
  Select,
  Button,
  MenuItem,
  TextField,
  Box,
  SelectChangeEvent,
  Link,
  TextareaAutosize
} from '@mui/material'
import ButtonLink from '@components/ButtonLink'
import { useAssets, useWallet } from '@meshsdk/react';
import React, { useEffect, useState } from 'react';
import { Transaction } from '@meshsdk/core';
import { useAlert } from '@contexts/AlertContext';
import { trpc } from '@lib/utils/trpc';

type Recipients = {
  address: string;
  amount: string;
}[]

const Airdrop: NextPage = () => {
  const assets = useAssets();
  const { wallet } = useWallet()
  const { addAlert } = useAlert()
  const [recipients, setRecipients] = useState([{ address: '', amount: '' }]);
  const [pasteData, setPasteData] = useState('');
  const [token, setToken] = useState<string>('')

  const metadataQuery = trpc.tokens.getMetadata.useQuery(
    { unit: token },
    {
      enabled: !!token,
      retry: false,
      refetchOnWindowFocus: false
    }
  )

  console.log(metadataQuery.status)

  const handleTokenChange = (e: SelectChangeEvent) => {
    setToken(e.target.value)
  }

  const handleRecipientChange = (index: number, field: 'address' | 'amount', value: string) => {
    const newRecipients: Recipients = [...recipients];
    newRecipients[index][field] = value;
    setRecipients(newRecipients);
  };

  const addRecipient = () => {
    setRecipients([...recipients, { address: '', amount: '' }]);
  };
  console.log(token)

  const submitAirdrop = async () => {
    try {
      const tx = new Transaction({ initiator: wallet })

      const decimals = metadataQuery.data?.decimals?.value

      console.log(decimals)

      recipients.forEach(recipient => {
        if (recipient.address && recipient.amount) {
          tx.sendAssets(
            recipient.address,
            [
              {
                unit: token,
                quantity: decimals ? (Number(recipient.amount) * Math.pow(10, decimals)).toString() : recipient.amount,
                // quantity: (Number(recipient.amount) * Math.pow(10, 4)).toString(),
              },
            ]
          );
        }
      });

      // Below never worked, TypeError: Cannot read properties of undefined (reading 'slice')
      // recipients.forEach(recipient => {
      //   if (recipient.address && recipient.amount) {
      //     tx.sendToken(
      //       recipient.address,
      //       ticker,
      //       decimals ? (Number(recipient.amount) * Math.pow(10, decimals)).toString() : recipient.amount
      //     )
      //   }
      // });

      let unsignedTx, signedTx, txHash;

      try {
        unsignedTx = await tx.build();
      } catch (error) {
        console.error("Error building the transaction:", error);
        addAlert('error', 'Failed to build the transaction. Please try again.');
        return;
      }

      try {
        signedTx = await wallet.signTx(unsignedTx);
        try {
          txHash = await wallet.submitTx(signedTx);
          console.log("Transaction submitted successfully. Transaction Hash: ", txHash);
          addAlert('success', <>Transaction submitted successfully.
            Hash: <Link target="_blank" sx={{ color: '#fff' }} href={`https://cardanoscan.io/transaction/${txHash}`}>{txHash}</Link>
          </>);
        } catch (error) {
          console.error("Error submitting the transaction:", error);
          addAlert('error', `Error submitting the transaction: ${error}`);
        }
      } catch (error) {
        console.error("Error signing the transaction:", error);
        addAlert('error', 'Failed to sign the transaction. Please try again.');
      }
    } catch (error) {
      // Handle the final error
      console.error("Transaction failed:", error);
      addAlert('error', `Transaction failed: ${error}`);
    }
  }

  const handlePaste = (event: React.ClipboardEvent) => {
    const pasteContent = event.clipboardData.getData('text');
    const lines = pasteContent.split('\n');

    const newRecipients = lines.map((line) => {
      const [address, amount] = line.split('\t').map(s => s.trim()); // Assuming tab-separated values
      return { address, amount };
    });

    setRecipients(newRecipients);
  };

  return (
    <Container maxWidth="md">
      <Select
        label="Token"
        value={token}
        onChange={handleTokenChange}
      >
        {assets && assets.map((asset, i) => (
          // @ts-ignore
          <MenuItem key={i} value={asset.unit}>{asset.assetName}</MenuItem>
        ))}
      </Select>
      <TextareaAutosize
        minRows={3}
        placeholder="Paste spreadsheet data here"
        value={pasteData}
        onPaste={handlePaste}
        onChange={(e) => { }}
      />
      {recipients.map((recipient, index) => (
        <Box key={index}>
          <TextField
            label="Recipient Address"
            value={recipient.address}
            onChange={(e) => handleRecipientChange(index, 'address', e.target.value)}
          />
          <TextField
            label="Amount"
            value={recipient.amount}
            onChange={(e) => handleRecipientChange(index, 'amount', e.target.value)}
          />
        </Box>
      ))}
      <Button onClick={addRecipient}>Add Another Recipient</Button>
      <Button
        variant="contained"
        color="secondary"
        onClick={submitAirdrop}
        disabled={!metadataQuery.isFetched}
      >
        Submit Airdrop
      </Button>
    </Container>
  );
};

export default Airdrop;
