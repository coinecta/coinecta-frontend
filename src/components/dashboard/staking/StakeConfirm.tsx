import React, { ChangeEvent, FC, SyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react';
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
  Link,
  Alert
} from '@mui/material';
import { useWalletContext } from '@contexts/WalletContext';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import { useWallet, useWalletList } from '@meshsdk/react';
import { Transaction } from '@meshsdk/core';
import { filterInstalledWallets, walletsList } from "@lib/walletsList";
import { WalletListItemComponent } from '@components/user/WalletListItem';
import { calculateFutureDateMonths, getShorterAddress } from '@lib/utils/general';
import { useAlert } from '@contexts/AlertContext';
import { trpc } from '@lib/utils/trpc';
import DataSpread from '@components/DataSpread';
import { AddStakeRequest, coinectaSyncApi } from '@server/services/syncApi';
import { set } from 'zod';
import { parseTokenFromString } from '@lib/utils/assets';
import { metadataApi } from '@server/services/metadataApi';

interface IStakeConfirmProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
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
  rewardIndex
}) => {
  const DEFAULT_CNCT_DECIMALS = parseInt(process.env.DEFAULT_CNCT_DECIMALS!);
  const STAKE_POOL_VALIDATOR_ADDRESS = process.env.STAKE_POOL_VALIDATOR_ADDRESS!;
  const STAKE_POOL_OWNER_KEY_HASH = process.env.STAKE_POOL_OWNER_KEY_HASH!;
  const STAKE_POOL_ASSET_POLICY = process.env.STAKE_POOL_ASSET_POLICY!;
  const STAKE_POOL_ASSET_NAME = process.env.STAKE_POOL_ASSET_NAME!;

  const { addAlert } = useAlert()
  const theme = useTheme();
  const { sessionData } = useWalletContext()
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { name, wallet, disconnect, connect, connected } = useWallet()
  const [openAlternativeWallet, setOpenAlternativeWallet] = useState(false)
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const [changeAddress, setChangeAddress] = useState<string | undefined>(undefined)
  const [walletUtxosCbor, setWalletUtxosCbor] = useState<string[] | undefined>()
  const [cnctDecimals, setCnctDecimals] = useState<number>(DEFAULT_CNCT_DECIMALS);
  const [cardanoApi, setCardanoApi] = useState<any>(undefined);


  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const execute = async () => {
      if (connected) {
        const api = await window.cardano[name.toLowerCase()].enable();
        setCardanoApi(api);
        const utxos = await api.getUtxos();
        setWalletUtxosCbor(utxos);
      }
    };
    execute();
  }, [name, connected]);

  useEffect(() => {
    const execute = async () => {
      if(connected) {
        const thisChangeAddress = await wallet.getChangeAddress();
      }
    };
    execute();
  }, [connected, wallet]);

  useEffect(() => {
    const execute = async () => {
      try {
        const cnctMetadata = await metadataApi.postMetadataQuery(`${STAKE_POOL_ASSET_POLICY}${STAKE_POOL_ASSET_NAME}`);
        setCnctDecimals(cnctMetadata.decimals?.value ?? DEFAULT_CNCT_DECIMALS);
      } catch {
        setCnctDecimals(DEFAULT_CNCT_DECIMALS);
      }
    };
    execute();
  }, [DEFAULT_CNCT_DECIMALS, STAKE_POOL_ASSET_NAME, STAKE_POOL_ASSET_POLICY])

  const handleSubmit = async () => {
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
  }


  return (
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
        <Button variant="contained" color="secondary" onClick={handleSubmit} disabled={connected}>
          {/* {`Submit with ${alternateWalletType?.name || sessionData?.user.walletType} wallet`} */}
          {`Confirm stake`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StakeConfirm;