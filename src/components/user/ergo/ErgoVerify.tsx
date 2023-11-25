import React, { FC, useEffect, useState } from 'react';
import { useAlert } from '@contexts/AlertContext';
import { trpc } from '@lib/utils/trpc';
import {
  Collapse,
  Typography,
  useMediaQuery,
  Box,
  useTheme,
  Avatar,
  Button,
  IconButton,
  Divider
} from '@mui/material';
import Link from '@components/Link';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';
import Ergopay from './Ergopay';
import Ergoauth from './Ergoauth';
import { TransactionBuilder, OutputBuilder } from "@fleet-sdk/core";
import { LinearProgressStyled as LinearProgress } from '@components/styled-components/LinearProgress'
import ClearIcon from '@mui/icons-material/Clear';
import { TRPCError } from '@trpc/server';

declare global {
  interface Window {
    ergoConnector: any;
  }
}

type WalletButtonProps = {
  name: string;
  walletType: string;
  icon: string;
  iconDark: string;
  messageSigning: boolean;
}

const wallets: WalletButtonProps[] = [
  {
    name: 'Nautilus',
    walletType: 'nautilus',
    icon: '/wallets/ergo/nautilus-128.png',
    iconDark: '/wallets/ergo/nautilus-128.png',
    messageSigning: true
  },
  {
    name: 'Terminus/Mobile',
    walletType: 'mobile',
    icon: '/wallets/ergo/mobile.webp',
    iconDark: '/wallets/ergo/mobile.webp',
    messageSigning: true
  },
  {
    name: 'Ledger',
    walletType: 'ledger',
    icon: '/wallets/ergo/ledger.svg',
    iconDark: '/wallets/ergo/ledger-dark.svg',
    messageSigning: false
  }
  //, {
  //   name: 'SAFEW',
  //   walletType: 'safew',
  //   icon: '/wallets/ergo/safew_icon_128.png',
  //   iconDark: '/wallets/ergo/safew_icon_128.png',
  //   messageSigning: false
  // },
  // {
  //   name: 'Satergo',
  //   walletType: 'satergo',
  //   icon: '/wallets/ergo/satergo.svg',
  //   iconDark: '/wallets/ergo/satergo.svg',
  //   messageSigning: false
  // }
]

interface ErgopadStakedResponse {
  project: string;
  tokenName: string;
  totalStaked: number;
  addresses: {
    [key: string]: {
      totalStaked: number;
      stakeBoxes: Array<{
        boxId: string;
        stakeKeyId: string;
        stakeAmount: number;
        penaltyPct: number;
        penaltyEndTime: number;
      }>;
    };
  };
}

const ErgoVerify: FC = () => {
  const { addAlert } = useAlert()
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [openAddWallet, setOpenAddWallet] = useState(false)
  const [openManageWallets, setOpenManageWallets] = useState(false)
  const [ergopayOpen, setErgopayOpen] = useState(false)
  const [ergopayInfo, setErgopayInfo] = useState<{ walletType: 'mobile', messageSigning: boolean }>({
    walletType: 'mobile',
    messageSigning: true
  })
  const [transactionVerifyOpen, setTransactionVerifyOpen] = useState(false)
  const [ergoauthOpen, setErgoauthOpen] = useState(false)
  const [defaultAddress, setDefaultAddress] = useState<string | undefined>(undefined);
  const [verificationId, setVerificationId] = useState<string | undefined>(undefined);
  const [usedAddresses, setUsedAddresses] = useState<string[]>([])
  const [unusedAddresses, setUnusedAddresses] = useState<string[]>([])
  const [ergopadStaked, setErgopadStaked] = useState<ErgopadStakedResponse | undefined>(undefined)
  const initVerification = trpc.ergo.initVerification.useMutation();
  const verifyProof = trpc.ergo.verifyProof.useMutation();
  const usersProofs = trpc.ergo.getProofForUser.useQuery();
  const verifyTransaction = trpc.ergo.pollTxApi.useMutation()

  const reset = () => {
    setErgoauthOpen(false)
    setDefaultAddress(undefined)
    setVerificationId(undefined)
    setUsedAddresses([])
    setUnusedAddresses([])
    setTransactionVerifyOpen(false)
    setErgopayOpen(false)
    setOpenAddWallet(true)
    setOpenManageWallets(false)
  }

  const getErgopadStaked = async (addresses: string[]) => {
    try {
      const response = await axios.post<ErgopadStakedResponse>(`${process.env.API_URL}/staking/staked/?project=ergopad`, {
        addresses
      }, {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      setErgopadStaked(response.data)
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (usersProofs?.data && usersProofs?.data?.length > 0) {
      const addressSet = new Set<string>();

      usersProofs.data.forEach(proof => {
        proof.addresses.forEach(address => {
          addressSet.add(address);
        });
      });

      const uniqueAddresses = Array.from(addressSet);

      getErgopadStaked(uniqueAddresses);
    }
  }, [usersProofs.data])

  const handleOpenAddWallet = () => {
    if (!openAddWallet) {
      setErgopayOpen(false)
      setErgoauthOpen(false)
      setOpenManageWallets(false)
    }
    setOpenAddWallet(!openAddWallet)
  }
  const handleOpenManageWallets = () => {
    if (!openManageWallets) {
      setErgopayOpen(false)
      setErgoauthOpen(false)
      setOpenAddWallet(false)
    }
    setOpenManageWallets(!openManageWallets)
  }

  const WalletButtonComponent: FC<WalletButtonProps> = ({
    name,
    walletType,
    messageSigning,
    icon,
    iconDark
  }) => {
    return (
      <Button
        endIcon={<Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          {messageSigning && <Box>
            <Typography sx={{ fontSize: '0.9rem !important', color: theme.palette.text.secondary }}>
              Message signing supported
            </Typography>
          </Box>}
          {/* {link && <OpenInNewIcon sx={{ height: '16px', width: '16px' }} />} */}
        </Box>}
        startIcon={<Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          <Avatar
            alt={
              name + ' Icon'
            }
            src={theme.palette.mode === 'dark' ? iconDark : icon}
            sx={{ height: '24px', width: '24px' }}
            variant={walletType === 'mobile' ? "circular" : "square"}
          />
          <Box>
            <Typography sx={{ fontSize: '1rem !important', color: theme.palette.text.primary }}>
              {name}
            </Typography>
          </Box>
        </Box>}
        sx={{
          background: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '6px',
          mb: 1,
          px: 2,
          py: 1,
          justifyContent: "space-between",
          textTransform: 'none',
          '& .MuiListItemSecondaryAction-root': {
            height: '24px'
          },
          color: theme.palette.text.secondary
        }}
        fullWidth
        onClick={() => {
          if (walletType === 'nautilus' || walletType === 'ledger') {
            connectDapp(walletType, messageSigning)
          } else if (walletType === 'mobile') {
            setOpenAddWallet(false)
            setOpenManageWallets(false)
            setErgopayInfo({ walletType, messageSigning })
            setErgopayOpen(true)
          }
        }}
      />
    )
  }

  const connectDapp = async (walletType: 'nautilus' | 'ledger', messageSigning: boolean) => {
    try {
      // Attempt to disconnect, ignoring any errors that occur
      await window.ergoConnector['nautilus'].disconnect();
    } catch (error) {
      // Ignore the error and continue
    }

    try {
      const isConnected = await connectWallet();
      if (isConnected) {
        console.log(isConnected)
        const addresses = await fetchAndSetAddresses();
        const init = await initializeVerification(walletType, addresses.defaultAddress);

        // we already know nautilus is the only dapp connector with message signing
        // we also know that status success means there is a nonce and verification ID
        if (init?.status === 'success' && messageSigning && walletType === 'nautilus') {
          await verifyOwnership(init?.nonce!, addresses.defaultAddress, walletType, init.verificationId!)
        } else if (init?.status === 'success' && !messageSigning) {
          setTransactionVerifyOpen(true)
          await verifyWithTransaction(init.verificationId!)
        } else if (init?.status === 'warning') addAlert('info', 'Wallet already verified for this user')
        else if (init?.status === 'error') addAlert('error', init.message)
      }
      else {
        addAlert('warning', 'No wallet selected')
        reset()
      }
    } catch (error: any) {
      console.error(error)
      // if (error.message.includes('undefined')) addAlert('error', 'Wallet not found')
      // else 
      handleError(error);
    }
  };

  const connectWallet = async () => {
    try {
      const connect = await window.ergoConnector['nautilus'].connect();
      return connect;
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      throw error;
    }
  };

  const fetchAndSetAddresses = async () => {
    try {
      // @ts-ignore
      const changeAddress = await ergo.get_change_address();
      // @ts-ignore
      const fetchUsedAddresses = await ergo.get_used_addresses();
      // @ts-ignore
      const fetchUnusedAddresses = await ergo.get_unused_addresses();
      setDefaultAddress(changeAddress)
      setUsedAddresses(fetchUsedAddresses);
      setUnusedAddresses(fetchUnusedAddresses);
      return { defaultAddress: changeAddress, usedAddresses: fetchUsedAddresses, unusedAddresses: fetchUnusedAddresses };
    } catch (error) {
      console.error('Error fetching wallet address:', error);
      throw error;
    }
  };

  const initializeVerification = async (walletType: string, defaultAddress: string) => {
    try {
      const initVerify = await initVerification.mutateAsync({ walletType, defaultAddress });
      return initVerify;
    } catch (error) {
      console.error('Error in verification process:', error);
      throw error;
    }
  };

  const handleError = (error: any) => {
    addAlert('error', `Error: ${error.message}`);
  };

  const verifyOwnership = async (nonce: string, address: string, walletType: 'nautilus' | 'mobile', verificationId: string) => {
    try {
      // @ts-ignore
      const signature = await ergo.auth(address, nonce);

      if (!signature.signedMessage || !signature.proof) {
        console.error('Signature failed to generate');
        addAlert('error', 'Signature failed to generate. Please try again.');
        return;
      }

      const combinedAddresses = [...usedAddresses, ...unusedAddresses];
      const filteredAddresses = combinedAddresses.filter(item => item !== address);
      const addresses = [address, ...filteredAddresses];

      try {
        const response = await verifyProof.mutateAsync({
          signedMessage: signature.signedMessage,
          proof: signature.proof,
          address,
          walletType: walletType,
          addresses,
          verificationId
        });
        if (response?.status === 'success') {
          await usersProofs.refetch();
          addAlert('success', 'Verification successful');
        }
      } catch (error: any) {
        console.error('Error during verification:', error);
        // Use the specific error message received from verifyProof mutation
        addAlert('error', error.message || 'Error during verification. Please try again.');
        return;
      }
    } catch (error) {
      console.error('Error during wallet signature:', error);
      addAlert('error', 'Unable to verify wallet signature. Please try again.');
    }
  };

  const verifyWithTransaction = async (thisVerificationId: string) => {
    try {
      // @ts-ignore
      const creationHeight = await ergo.get_current_height()
      // @ts-ignore
      const changeAddress = await ergo.get_change_address()
      const unsignedTx = new TransactionBuilder(creationHeight)
        // @ts-ignore
        .from(await ergo.get_utxos())
        .to(
          new OutputBuilder(
            "100000000",
            changeAddress // recipient address
          )
        )
        .sendChangeTo(changeAddress)
        .payMinFee()
        .build()
        .toEIP12Object()
      // @ts-ignore
      const signedTx = await ergo.sign_tx(unsignedTx);
      // @ts-ignore
      const txId = await ergo.submit_tx(signedTx);
      addAlert('success', <>Transaction submitted: <Link sx={{ color: '#fff' }} href={`https://explorer.ergoplatform.com/en/transactions/${txId}`}>{txId}</Link></>)
      pollVerifyTransaction(txId, thisVerificationId)
    } catch (error) {
      addAlert('warning', 'Transaction was not submitted')
      reset()
    }
  }

  const pollVerifyTransaction = (verificationTransactionId: string, thisVerificationId: string) => {
    verifyTransaction.mutate({
      transactionId: verificationTransactionId,
      verificationId: thisVerificationId
    }, {
      onSuccess: (data) => {
        if (data?.status === 'success') {
          addAlert(
            'success',
            'Wallet successfully verified. '
          )
          setTransactionVerifyOpen(false)
        } else if (data?.status === 'error') {
          addAlert(
            'error',
            'Unable to verify wallet, please try again. '
          )
          setTransactionVerifyOpen(false)
          setOpenAddWallet(true)
        } else {
          setTimeout(() => pollVerifyTransaction(verificationTransactionId, thisVerificationId), 2000);
        }
      },
      onError: (error) => {
        console.error('Transaction verification error:', error);
      }
    });
  };

  const handleErgopayCallback = (success: boolean, address: string, verification: string) => {
    if (success && !ergoauthOpen) {
      setDefaultAddress(address)
      setVerificationId(verification)
      if (ergopayInfo.messageSigning) {
        addAlert('success', 'Address verified, please scan the new QR code and sign the message to verify')
      } else {
        addAlert('success', 'Address verified, please follow the instructions for step 2 to verify ownership')
      }
      setErgopayOpen(false)
      setErgoauthOpen(true)
    }
  }

  const [shouldRefetch, setShouldRefetch] = useState(false)
  const handleErgoauthCallback = async (success: boolean, signedMessage: string, proof: string) => {
    if (success) {
      setErgoauthOpen(false)
      setShouldRefetch(true)
      addAlert('success', 'Wallet successfully verified')
    }
  }

  useEffect(() => {
    if (shouldRefetch) {
      const doRefetch = async () => {
        try {
          await usersProofs.refetch();
          setShouldRefetch(false);
        } catch (error) {
          console.error('Failed to refetch data:', error);
          addAlert('error', 'Failed to update data. Please refresh the page.');
        }
      };

      doRefetch();
    }
  }, [shouldRefetch])

  const deleteItem = trpc.ergo.deleteItem.useMutation()
  const removeItem = async (verificationId: string) => {
    await deleteItem.mutateAsync({ verificationId })
    setShouldRefetch(true)
  }

  return (
    <Box sx={{ display: 'block', position: 'relative', maxWidth: 'sm' }}>
      <Button
        endIcon={<ExpandMoreIcon sx={{ transform: openAddWallet ? 'rotate(180deg)' : null }} />}
        startIcon={
          <Box>
            <Typography sx={{ fontSize: '1rem !important', color: theme.palette.text.primary }}>
              {openAddWallet ? 'Close wallet list' : `Add a wallet`}
            </Typography>
          </Box>
        }
        sx={{
          background: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '6px',
          mb: 1,
          px: 2,
          textTransform: 'none',
          '& .MuiListItemSecondaryAction-root': {
            height: '24px'
          },
          color: theme.palette.text.secondary,
          justifyContent: "space-between"
        }}
        fullWidth
        onClick={() => handleOpenAddWallet()}
      />
      <Collapse in={openAddWallet}>

        {wallets.map((item, i) => (
          <WalletButtonComponent {...item} key={`${item.name}-${i}`} />
        ))}

      </Collapse>
      {/* <Divider sx={{ mb: 2, mt: 1 }} /> */}
      <Button
        endIcon={<ExpandMoreIcon sx={{ transform: openManageWallets ? 'rotate(180deg)' : null }} />}
        startIcon={
          <Box>
            <Typography sx={{ fontSize: '1rem !important', color: theme.palette.text.primary }}>
              {openManageWallets ? 'Close' : `Manage wallets`}
            </Typography>
          </Box>}
        sx={{
          background: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '6px',
          mb: 1,
          px: 2,
          textTransform: 'none',
          '& .MuiListItemSecondaryAction-root': {
            height: '24px'
          },
          color: theme.palette.text.secondary,
          justifyContent: "space-between"
        }}
        fullWidth
        onClick={() => handleOpenManageWallets()}
      />
      <Collapse in={openManageWallets}>
        {usersProofs.data && usersProofs.data.map((item) => {
          const wallet = wallets.find(wallet => item.walletType === wallet.walletType)
          return (
            <Box
              key={item.verificationId}
              sx={{
                p: '3px 12px',
                fontSize: '1rem',
                minWidth: '64px',
                width: '100%',
                background: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '6px',
                mb: 1,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box>
                <Avatar
                  src={theme.palette.mode === 'dark' ? wallet?.iconDark : wallet?.icon}
                  sx={{ height: '24px', width: '24px' }}
                  variant={wallet?.walletType === 'mobile' ? "circular" : "square"}
                />
              </Box>
              <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.defaultAddress}
              </Box>
              <Box>
                <IconButton onClick={() => {
                  removeItem(item.verificationId)
                }}>
                  <ClearIcon sx={{ height: '18px', width: '18px' }} />
                </IconButton>
              </Box>
            </Box>
          )
        })}

      </Collapse>

      <Collapse in={ergopayOpen} mountOnEnter unmountOnExit>
        <Typography sx={{ fontSize: '1.1rem !important', fontWeight: 700, my: 1, lineHeight: 1 }}>
          Step 1: Provide your address by selecting it with Ergopay
        </Typography>
        <Ergopay
          open={ergopayOpen}
          setOpen={setErgopayOpen}
          walletType={ergopayInfo.walletType}
          messageSigning={ergopayInfo.messageSigning}
          callback={handleErgopayCallback}
        />
      </Collapse>
      <Collapse in={ergoauthOpen} mountOnEnter unmountOnExit>
        <Typography sx={{ fontSize: '1.1rem !important', fontWeight: 700, my: 1, lineHeight: 1 }}>
          Step 1: Complete!
        </Typography>
        <Typography sx={{ fontSize: '1.1rem !important', fontWeight: 700, mb: 1, lineHeight: 1 }}>
          Step 2: Sign a message with Ergoauth to verify wallet ownership
        </Typography>
        {defaultAddress && verificationId && <Ergoauth
          walletType={ergopayInfo.walletType}
          verificationId={verificationId}
          defaultAddress={defaultAddress}
          callback={handleErgoauthCallback}
        />}
      </Collapse>
      <Collapse in={transactionVerifyOpen}>
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: '1.1rem !important', fontWeight: 700, mb: 1, lineHeight: 1 }}>
            Please sign the transaction to verify your wallet.
          </Typography>
          <Typography sx={{ fontSize: '0.9rem !important', color: theme.palette.text.secondary, mb: 1, lineHeight: 1 }}>
            The transaction sends 0.1 erg to yourself. We will be able to verify your ownership of the wallet once it hits the blockchain.
          </Typography>
          <LinearProgress />
        </Box>

      </Collapse>
      {usersProofs?.data && usersProofs?.data.length > 0 ? (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography sx={{ fontSize: '1rem !important', color: theme.palette.text.primary, mb: 0, lineHeight: 1 }}>
            You have {usersProofs?.data.length} wallets connected {` with ${ergopadStaked?.totalStaked.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 'no'} Ergopad staked.`}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontSize: '1rem !important', color: theme.palette.text.primary, mb: 0, lineHeight: 1 }}>
            Add a wallet to see how much you have staked.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ErgoVerify;