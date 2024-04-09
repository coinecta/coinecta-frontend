import DataSpread from '@components/DataSpread';
import { useToken } from '@components/hooks/useToken';
import { useAlert } from '@contexts/AlertContext';
import { useWalletContext } from '@contexts/WalletContext';
import { parseTokenFromString } from '@lib/utils/assets';
import { calculateFutureDateMonths } from '@lib/utils/general';
import { trpc } from '@lib/utils/trpc';
import { walletDataByName, walletNameToId } from '@lib/walletsList';
import { BrowserWallet } from '@meshsdk/core';
import { useWallet } from '@meshsdk/react';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  Avatar,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { AddStakeRequest } from '@server/services/syncApi';
import React, { FC, useEffect, useMemo, useState } from 'react';
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
}) => {
  const STAKE_POOL_VALIDATOR_ADDRESS = process.env.STAKE_POOL_VALIDATOR_ADDRESS!;
  const STAKE_POOL_OWNER_KEY_HASH = process.env.STAKE_POOL_OWNER_KEY_HASH!;
  const STAKE_POOL_ASSET_POLICY = process.env.STAKE_POOL_ASSET_POLICY!;
  const STAKE_POOL_ASSET_NAME = process.env.STAKE_POOL_ASSET_NAME!;

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { name, wallet, connected } = useWallet();
  const [cardanoApi, setCardanoApi] = useState<any>(undefined);
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [openChooseWalletDialog, setOpenChooseWalletDialog] = useState(false);
  const { sessionData } = useWalletContext();
  const { addAlert } = useAlert();
  const getWallets = trpc.user.getWallets.useQuery()
  const userWallets = useMemo(() => getWallets.data && getWallets.data.wallets, [getWallets]);

  const utils = trpc.useUtils();
  const addStakeTxMutation = trpc.sync.addStakeTx.useMutation();
  const finaliseTxMutation = trpc.sync.finalizeTx.useMutation();
  
  const handleClose = () => setOpen(false);

  useEffect(() => {
    const execute = async () => {
      if (connected && sessionData !== null) {
        const api = await window.cardano[walletNameToId(sessionData.user.walletType!)!].enable();
        setCardanoApi(api);
      }
    };
    execute();
  }, [connected, sessionData]);

  const userWalletIcon = useMemo(() => {
    const walletData = walletDataByName(sessionData?.user.walletType!);
    return theme.palette.mode === "light" ? walletData?.icon : walletData?.iconDark;
  }, [sessionData?.user.walletType, theme.palette.mode]);

  const { cnctDecimals } = useToken();

  const handleSubmit = async () => {
    setIsSigning(true);
    try {
      await processTxWithApi(name, cardanoApi);
      setOpen(false);
      setPaymentAmount('');
      addAlert('success', 'Stake transaction submitted');
    } catch (ex) {
      addAlert('error', 'Error adding stake!');
      console.error('Error adding stake', ex);
    }
    setIsSigning(false);
  }

  const processTxWithApi = async (walletName: string, api: any) => {
    const browserWallet = await BrowserWallet.enable(walletName);
    const changeAddress = await browserWallet.getChangeAddress();

    let apiUTxos = await utils.client.sync.getRawUtxosMultiAddress.query([changeAddress]);
    const collateralUtxos = await api.experimental.getCollateral();

    if (collateralUtxos !== undefined) {
      apiUTxos = apiUTxos.filter((utxo: any) => !collateralUtxos.includes(utxo));
    }

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
      walletUtxoListCbor: apiUTxos!
    };

    const unsignedTx = await addStakeTxMutation.mutateAsync(addStakeRequest);
    const witnessSetCbor = await api.signTx(unsignedTx, true);
    const signedTx = await finaliseTxMutation.mutateAsync({ unsignedTxCbor: unsignedTx, txWitnessCbor: witnessSetCbor });
    await api.submitTx(signedTx);
  }

  const onChose = async (walletAddress: string) => {
    setOpenChooseWalletDialog(false);
    setIsSigning(true);
    try {
      const wallet = userWallets?.find(w => w.changeAddress === walletAddress);
      if(wallet !== undefined) {
        const api = await window.cardano[walletNameToId(wallet.type!)!].enable();
        await processTxWithApi(wallet.type, api);
        setOpen(false);
        setPaymentAmount('');
        addAlert('success', 'Stake transaction submitted');
      } else {
        addAlert('error', 'Error adding stake!');
      }
    } catch (ex) {
      console.error('Error adding stake', ex);
      addAlert('error', 'Error adding stake!');
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
            title="Stake Key NFT"
            data="1.5 ADA"
          />
          <DataSpread
            title="Locked with Rewards"
            data="3 ADA"
          />
          <DataSpread
            title="Execution Fee"
            data="2 ADA"
          />
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
            data={calculateFutureDateMonths(duration)}
            margin={5}
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
          <Button startIcon={<Avatar variant='square' sx={{ width: '20px', height: '20px' }} src={userWalletIcon} />} sx={{ display: isSigning || openChooseWalletDialog ? 'none' : 'flex', flexGrow: 1 }} variant="outlined" color="secondary" onClick={handleSubmit} disabled={!connected}>
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
      <ChooseWallet open={openChooseWalletDialog} setOpen={setOpenChooseWalletDialog} onChose={onChose}/>
    </>
  );
};

export default StakeConfirm;