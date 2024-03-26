import DataSpread from '@components/DataSpread';
import { useToken } from '@components/hooks/useToken';
import { useWalletContext } from '@contexts/WalletContext';
import { formatTokenWithDecimals } from '@lib/utils/assets';
import { trpc } from '@lib/utils/trpc';
import { walletNameToId } from '@lib/walletsList';
import { useWallet } from '@meshsdk/react';
import CloseIcon from '@mui/icons-material/Close';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ClaimStakeRequest } from '@server/services/syncApi';
import React, { FC, useEffect, useState } from 'react';
import { useAlert } from '@contexts/AlertContext';

interface IRedeemConfirmProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  redeemList: IRedeemListItem[];
  redeemWallet: string;
  claimStakeRequest: ClaimStakeRequest;
}

const RedeemConfirm: FC<IRedeemConfirmProps> = ({
  open,
  setOpen,
  redeemList,
  redeemWallet,
  claimStakeRequest,
}) => {
  const { cnctDecimals } = useToken();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const { connected, wallet } = useWallet();
  const { sessionData, sessionStatus } = useWalletContext();
  const [cardanoApi, setCardanoApi] = useState<any>(undefined);
  const [isSigning, setIsSigning] = useState(false);
  const { addAlert } = useAlert();

  const claimStakeTxMutation = trpc.sync.claimStakeTx.useMutation();
  const finalizeTxMutation = trpc.sync.finalizeTx.useMutation();

  useEffect(() => {
    const execute = async () => {
      if (connected && sessionStatus === 'authenticated' && redeemWallet) {
        if (window.cardano[walletNameToId(redeemWallet!)!] === undefined) return;
        const api = await window.cardano[walletNameToId(redeemWallet)!].enable();
        setCardanoApi(api);
      }
    };
    execute();
  }, [connected, redeemWallet, sessionStatus]);

  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    try {
      if (connected) {
        setIsSigning(true);
        const unsignedTxCbor = await claimStakeTxMutation.mutateAsync(claimStakeRequest);
        const witnesssetCbor = await cardanoApi.signTx(unsignedTxCbor, true);

        const signedTxCbor = await finalizeTxMutation.mutateAsync({
          txWitnessCbor: witnesssetCbor,
          unsignedTxCbor: unsignedTxCbor
        });

        await cardanoApi.submitTx(signedTxCbor);
        setOpen(false);
        addAlert('success', 'Redeem transaction submitted');
      }
    } catch (e) {
      console.log(e);
      addAlert('error', 'Redeem transaction failed');
    }
    setIsSigning(false);
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
        Confirm Redeem
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
          You are unstaking the following position(s):
        </Typography>
        {redeemList.map((item, i) => (
          <DataSpread
            key={`${item.currency}-${i}`}
            title={item.currency}
            data={`${formatTokenWithDecimals(BigInt(item.amount), cnctDecimals)}`}
          />
        ))}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', mb: 1 }}>
        <Button sx={{ display: isSigning ? "none" : "block" }} variant="contained" color="secondary" onClick={handleSubmit}>
          Redeem
        </Button>
        <CircularProgress sx={{ display: isSigning ? "block" : "none" }} color='secondary' />
      </DialogActions>
    </Dialog>
  );
};

export default RedeemConfirm;