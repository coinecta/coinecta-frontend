import React, { ChangeEvent, FC, SyntheticEvent, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  DialogActions,
  useMediaQuery,
  useTheme,
  Button,
  Box,
  Collapse,
  IconButton,
  Avatar,
  Link
} from '@mui/material';
import { useWalletContext } from '@contexts/WalletContext';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import { useWallet, useWalletList } from '@meshsdk/react';
import { Transaction } from '@meshsdk/core';
import { filterInstalledWallets, walletsList } from "@lib/walletsList";
import { WalletListItemComponent } from '@components/user/WalletListItem';
import { getShorterAddress } from '@lib/utils/general';
import { useAlert } from '@contexts/AlertContext';
import { trpc } from '@lib/utils/trpc';
import EvmPayment from '@components/ethereum-payments/EvmPayment';
import { BLOCKCHAINS } from '@lib/currencies';
import AddWallet from '@components/user/AddWallet';
import CardanoWalletSelector from './CardanoWalletSelector';
import { useQueryParams } from '@contexts/QueryParamsContext';


interface IContributeConfirmProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  paymentAmount: string;
  paymentCurrency: TAcceptedCurrency | undefined;
  receiveAmount: string;
  receiveCurrency: string;
  contributionRoundId: number;
  recipientAddress: string;
  exchangeRateToBaseCurrency: number;
}

const ContributeConfirm: FC<IContributeConfirmProps> = ({
  open,
  setOpen,
  paymentAmount,
  paymentCurrency,
  receiveAmount,
  receiveCurrency,
  contributionRoundId,
  recipientAddress,
  exchangeRateToBaseCurrency
}) => {
  const { addAlert } = useAlert()
  const theme = useTheme();
  const { sessionData } = useWalletContext()
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { wallet, disconnect, connect, connecting } = useWallet()
  const wallets = useWalletList();
  const [openAlternativeWallet, setOpenAlternativeWallet] = useState(false)
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const [errorMessage, setErrorMessage] = useState(false)
  const [alternateWalletType, setAlternateWalletType] = useState<TWalletListItem | undefined>(undefined)
  const [changeAddress, setChangeAddress] = useState<string | undefined>(undefined)
  const [selectedCardanoAddress, setSelectedCardanoAddress] = useState<string | undefined>(undefined);
  const { queryParams } = useQueryParams();

  const createTransaction = trpc.contributions.createTransaction.useMutation();

  const handleOpenAlternativeWallet = () => {
    setOpenAlternativeWallet(!openAlternativeWallet)
  }

  const handleClose = (event: SyntheticEvent, reason?: string) => {

    setOpen(false);

  };

  const handleConnect = async (walletName: string) => {
    try {
      setButtonDisabled(true)
      disconnect();
    } catch (e: any) {
      addAlert('error', 'Unable to disconnect from connected wallet. Please refresh the page')
    }

    try {
      console.log(`Connecting to ${walletName}`);
      await connect(walletName);
    } catch (e: any) {
      // NOTE meshJS resolves the Promise, even with an error, so you never hit this catch block
      addAlert('error', 'Unable to connect to selected wallet. Please try again')
    } finally {
      const niceName = walletsList.find(wallet => wallet.connectName === walletName);
      if (niceName) {
        setAlternateWalletType(niceName);
      }
      setOpenAlternativeWallet(false);
    }
  };

  const updateChangeAddress = async () => {
    try {
      const thisChangeAddress = await wallet.getChangeAddress();
      setChangeAddress(thisChangeAddress);
      const balance = await wallet.getLovelace();
      if (Number(paymentAmount) * 1000000 > Number(balance)) {
        // addAlert('error', `Wallet doesn't have ${Number(paymentAmount)} ADA available, please choose another wallet. `)
        setButtonDisabled(true)
        setErrorMessage(true)
      } else {
        setButtonDisabled(false)
        setErrorMessage(false)
      }
    } catch (e: any) {
      addAlert('error', `Error connecting to wallet. Please try again, or contact support for help. `)
    }
  }

  useEffect(() => {
    if (alternateWalletType && !openAlternativeWallet) {
      updateChangeAddress()
    }
  }, [alternateWalletType, openAlternativeWallet]);

  useEffect(() => {
    if (open && sessionData?.user.walletType) {
      handleConnect(sessionData.user.walletType)
    }
    else setAlternateWalletType(undefined)
  }, [open])

  const handleSubmitCardano = async () => {
    if ((changeAddress || sessionData?.user.address) && paymentCurrency) {
      try {
        const paymentObject = BLOCKCHAINS.find(item => item.name === paymentCurrency.blockchain)?.tokens.find(item => item.symbol === paymentCurrency.currency)
        if (paymentObject) {
          let tx: Transaction;
          if (paymentObject.symbol === 'ADA') {
            tx = new Transaction({ initiator: wallet })
              .sendLovelace(
                recipientAddress,
                (Number(paymentAmount) * 1000000).toString()
              );
          }
          else {
            tx = new Transaction({ initiator: wallet })
              .sendAssets(
                recipientAddress,
                [{
                  unit: `${paymentObject.contractAddress}${paymentObject.hexName}`,
                  quantity: (Number(paymentAmount) * Math.pow(10, paymentObject.decimals)).toString(),
                }]
              );
          }

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
                Hash: <Link target="_blank" href={`https://cardanoscan.io/transaction/${txHash}`}>{txHash}</Link>
              </>);
              const integerValue = parseInt(paymentAmount, 10).toString();
              try {
                await createTransaction.mutateAsync({
                  amount: integerValue,
                  currency: paymentCurrency.currency,
                  blockchain: paymentCurrency.blockchain,
                  adaReceiveAddress: changeAddress || sessionData?.user.address!,
                  address: changeAddress || sessionData?.user.address!,
                  exchangeRate: exchangeRateToBaseCurrency,
                  txId: txHash,
                  contributionId: contributionRoundId,
                  referralCode: queryParams.ref
                })
              } catch (e: any) {
                console.log(e)
              }
              setOpen(false)
            } catch (error) {
              console.error("Error submitting the transaction:", error);
              addAlert('error', `Error submitting the transaction: ${error}`);
            }
          } catch (error) {
            console.error("Error signing the transaction:", error);
            addAlert('error', 'Failed to sign the transaction. Please try again.');
          }
        }
      } catch (error) {
        // Handle the final error
        console.error("Transaction failed:", error);
        addAlert('error', `Transaction failed: ${error}`);
      }
    }
  }

  const installedWallets = filterInstalledWallets(wallets)

  const onSuccessEvm = () => {
    // success message is already sent in EvmPayment
    // Leaving this here in case its needed in the future. 
    // Can add a callback to the parent to refetch data when they close this Dialog if necessary
    // console.log('Success')
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      sx={{
        '& .MuiPaper-root': {
          background: theme.palette.background.paper,
          minWidth: '350px', // Added minimum width
        },
        '& .MuiBackdrop-root': {
          backdropFilter: 'blur(5px)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }
      }}
      PaperProps={{
        variant: 'outlined',
        elevation: 0
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: "800",
          fontSize: "32px",
        }}
      >
        Confirm Payment
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent sx={{ minWidth: '350px', maxWidth: !fullScreen ? '460px' : null }}>
        <Typography sx={{ mb: 2 }}>
          You are contributing {paymentAmount} {paymentCurrency?.currency} on {paymentCurrency?.blockchain} for {receiveAmount} {receiveCurrency}
        </Typography>
        {paymentCurrency?.blockchain === 'Cardano'
          ? <>
            <Typography sx={{ fontSize: '1rem!important', mb: 1 }}>
              You may choose an alternate wallet to contribute from, other than your signed in wallet.
            </Typography>
            <Button
              endIcon={<ExpandMoreIcon sx={{ transform: openAlternativeWallet ? 'rotate(180deg)' : null }} />}
              startIcon={
                <Box>
                  <Typography sx={{ fontSize: '1rem !important', color: theme.palette.text.primary }}>
                    {openAlternativeWallet ? 'Close' : `Use alternative wallet`}
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
              onClick={() => handleOpenAlternativeWallet()}
            />
            <Collapse in={openAlternativeWallet}>
              {installedWallets.map((wallet) => (
                <WalletListItemComponent {...wallet} key={wallet.name} handleConnect={() => handleConnect(wallet.connectName)} />
              ))}
            </Collapse>
            {alternateWalletType &&
              <>
                <Typography sx={{ mb: 1, fontWeight: 700, textAlign: 'center' }}>
                  Selected wallet:
                </Typography>
                {connecting
                  ? 'Loading wallet...'
                  : <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'center' }}>
                      <Avatar src={theme.palette.mode === 'dark' ? alternateWalletType?.iconDark : alternateWalletType?.icon} sx={{ width: '24px', height: '24px', mr: 1 }} variant="square" />
                      {changeAddress &&
                        <Typography>
                          {getShorterAddress(changeAddress, 12)}
                        </Typography>
                      }
                    </Box>
                    <Collapse in={errorMessage}><Box>
                      <Typography color="text.secondary" sx={{ fontSize: '0.9rem!important', fontStyle: 'italic', mt: 1 }}>
                        Please choose a wallet with at least {paymentAmount} {paymentCurrency.currency} available
                      </Typography>
                    </Box></Collapse>
                  </Box>}
              </>
            }
          </>
          : <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', width: '100%' }}>
            <Box sx={{ mb: 3 }}>
              <w3m-button />
            </Box>
            <Box>
              <CardanoWalletSelector
                tokenName={receiveCurrency}
                onAddressSelect={(address) => setSelectedCardanoAddress(address)}
              />
            </Box>
          </Box>
        }

      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', mb: 1 }}>
        {paymentCurrency?.blockchain === 'Cardano'
          ? <Button variant="contained" color="secondary" onClick={handleSubmitCardano} disabled={buttonDisabled}>
            {`Submit with ${alternateWalletType?.name || sessionData?.user.walletType} wallet`}
          </Button>
          : <EvmPayment
            paymentAmount={paymentAmount}
            exchangeRate={exchangeRateToBaseCurrency}
            paymentCurrency={paymentCurrency}
            blockchain={paymentCurrency?.blockchain || ''}
            recipientAddress={recipientAddress}
            contributionRoundId={contributionRoundId}
            userAdaAddress={selectedCardanoAddress}
            onSuccess={onSuccessEvm}
          />
        }
      </DialogActions>
    </Dialog>
  );
};

export default ContributeConfirm;