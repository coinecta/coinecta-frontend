import React, { FC, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useWallet } from '@meshsdk/react';
import { calculateFutureDateMonths } from '@lib/utils/general';
import DataSpread from '@components/DataSpread';
import { AddStakeRequest, coinectaSyncApi } from '@server/services/syncApi';
import { parseTokenFromString } from '@lib/utils/assets';
import { useToken } from '@components/hooks/useToken';
import NamiLogo from '@components/svgs/NamiLogo';
import { useWalletContext } from '@contexts/WalletContext';
import { walletNameToId } from '@lib/walletsList';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ChooseWallet from './ChooseWallet';

interface IStakeConfirmProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setPaymentAmount: React.Dispatch<React.SetStateAction<string>>;
  paymentAmount: string;
  paymentCurrency?: string;
  total: string;
  duration: number;
  rewardIndex: number;
  onTransactionSubmitted: (status: boolean) => void;
  onTransactionFailed: (status: boolean) => void;
}

const StakeConfirm: FC<IStakeConfirmProps> = ({
  open,
  setOpen,
  paymentAmount,
  paymentCurrency = 'ADA',
  total,
  duration,
  rewardIndex,
  setPaymentAmount,
  onTransactionSubmitted,
  onTransactionFailed
}) => {
  const STAKE_POOL_VALIDATOR_ADDRESS = process.env.STAKE_POOL_VALIDATOR_ADDRESS!;
  const STAKE_POOL_OWNER_KEY_HASH = process.env.STAKE_POOL_OWNER_KEY_HASH!;
  const STAKE_POOL_ASSET_POLICY = process.env.STAKE_POOL_ASSET_POLICY!;
  const STAKE_POOL_ASSET_NAME = process.env.STAKE_POOL_ASSET_NAME!;

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { name, wallet, connected } = useWallet()
  const [changeAddress, setChangeAddress] = useState<string | undefined>(undefined)
  const [walletUtxosCbor, setWalletUtxosCbor] = useState<string[] | undefined>()
  const [cardanoApi, setCardanoApi] = useState<any>(undefined);
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [openChooseWalletDialog, setOpenChooseWalletDialog] = useState(false);
  const { sessionData } = useWalletContext();

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const execute = async () => {
      if (connected) {
        const api = await window.cardano[walletNameToId(sessionData?.user.walletType!)!].enable();
        setCardanoApi(api);
        const utxos = await api.getUtxos();
        setWalletUtxosCbor(utxos);
      }
    };
    execute();
  }, [name, connected, sessionData?.user.walletType]);

  useEffect(() => {
    const execute = async () => {
      if (connected) {
        setChangeAddress(await wallet.getChangeAddress());
      }
    };
    execute();
  }, [connected, wallet]);

  const { cnctDecimals } = useToken();

  const handleSubmit = async () => {
    setIsSigning(true);
    try {
      const addStakeRequest: AddStakeRequest = {
        stakePool: {
          address: STAKE_POOL_VALIDATOR_ADDRESS,
          ownerPkh: STAKE_POOL_OWNER_KEY_HASH,
          policyId: STAKE_POOL_ASSET_POLICY,
          assetName: STAKE_POOL_ASSET_NAME
        },
        ownerAddress: changeAddress!,
        destinationAddress: changeAddress!,
        rewardSettingIndex: rewardIndex,
        amount: parseTokenFromString(paymentAmount, cnctDecimals).toString(),
        walletUtxoListCbor: walletUtxosCbor!
      };

      const unsignedTx = await coinectaSyncApi.addStakeTx(addStakeRequest);
      const witnessSetCbor = await cardanoApi.signTx(unsignedTx);
      const signedTx = await coinectaSyncApi.finalizeTx({ unsignedTxCbor: unsignedTx, txWitnessCbor: witnessSetCbor });
      await cardanoApi.submitTx(signedTx);
      setOpen(false);
      setPaymentAmount('');
      onTransactionSubmitted(true);
    } catch (ex) {
      onTransactionFailed(true);
      console.error('Error adding stake', ex);
    }
    setIsSigning(false);
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen={fullScreen}
        PaperProps={{
          variant: 'outlined',
          elevation: 0
        }}
        sx={{
          '& .MuiBackdrop-root': {
            backdropFilter: 'blur(3px)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: "800",
            fontSize: "32px",
          }}
        >
          Confirm Add Stake
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
          <DataSpread
            title="Staked Amount"
            data={`${Number(paymentAmount).toLocaleString(undefined, { maximumFractionDigits: 1 })} ${paymentCurrency}`}
          />
          <DataSpread
            title="Total after unlock"
            data={`${total} ${paymentCurrency}`}
          />
          <DataSpread
            title="Unlock Date"
            margin={5}
            data={calculateFutureDateMonths(duration)}
          />
          <Alert
            variant="outlined"
            severity="warning"
            sx={{ justifyContent: 'center', alignItems: 'center' }}
          >
            <span style={{ fontWeight: 700 }}>It is impossible to unlock your tokens early!</span> Don&apos;t stake if you may need them before the unlock date.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', mb: 1 }}>
          <Button startIcon={<NamiLogo />} sx={{ display: isSigning || openChooseWalletDialog ? 'none' : 'flex', flexGrow: 1 }} variant="outlined" color="secondary" onClick={handleSubmit} disabled={!connected}>
            Confirm stake
          </Button>
          <Button
            startIcon={<AccountBalanceWalletOutlinedIcon />}
            sx={{ flexGrow: 1, display: isSigning || openChooseWalletDialog ? 'none' : 'flex' }}
            variant='outlined'
            color='secondary'
            disabled={!connected}
            onClick={() => setOpenChooseWalletDialog(true)}
          >
            Choose wallet
          </Button>
          <CircularProgress sx={{ display: isSigning || openChooseWalletDialog ? 'block' : 'none' }} color='secondary' />
        </DialogActions>
      </Dialog>
      <ChooseWallet open={openChooseWalletDialog} setOpen={setOpenChooseWalletDialog} />
    </>
  );
};

export default StakeConfirm;