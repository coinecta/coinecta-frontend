import DataSpread from "@components/DataSpread";
import { useAlert } from "@contexts/AlertContext";
import { trpc } from "@lib/utils/trpc";
import { useWallet } from "@meshsdk/react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { FC, useState, useCallback } from "react";

type ClaimEntry = {
  id: string;
  rootHash: string;
  ownerPkh: string;
  token: string;
  total: number | string;
  claimable: number | string;
  frequency: string;
  nextUnlockDate: string;
  endDate: string;
  remainingPeriods: string;
  ownerAddress: string;
  walletType: string;
};

interface IVestingConfirmProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  claimEntry: ClaimEntry | null;
  // removeClaimEntry: (claimEntry: ClaimEntry) => void;
}

const VestingConfirm: FC<IVestingConfirmProps> = ({
  open,
  setOpen,
  claimEntry,
  // removeClaimEntry
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const { addAlert } = useAlert();
  const { connected } = useWallet();

  const finalizeTransaction = trpc.vesting.finalizeTransaction.useMutation();
  const createClaimTreasuryDataMutation =
    trpc.vesting.createClaimTreasuryData.useMutation();
  const claimTreasuryMutation = trpc.vesting.claimTreasury.useMutation();
  const submitClaimTreasuryTransaction =
    trpc.vesting.submitClaimTreasuryTransaction.useMutation();

  const getRawUtxos = useCallback(async (walletType: string) => {
    const api = await window.cardano[walletType].enable();

    const rawUtxos = await api.getUtxos();

    if (rawUtxos === undefined) return;
    return rawUtxos;
  }, []);

  const getRawCollateralUtxo = useCallback(async (walletType: string) => {
    const api = await window.cardano[walletType].enable();

    const collateral = await api.experimental.getCollateral();

    if (collateral === undefined) return;
    return collateral[0];
  }, []);

  const signTx = useCallback(async (walletType: string, unsignedTx: string) => {
    const api = await window.cardano[walletType].enable();

    const signedTx = await api.signTx(unsignedTx, true);

    if (signedTx === undefined) return;
    return signedTx;
  }, []);

  const handleClose = () => setOpen(false);

  const handleSubmit = useCallback(async () => {
    setIsSigning(true);
    try {
      if (claimEntry === null) return;
      const walletType = claimEntry.walletType;

      const rawUtxos = await getRawUtxos(walletType);
      const rawCollateralUtxo = await getRawCollateralUtxo(walletType);
      if (rawUtxos === undefined || rawCollateralUtxo === undefined) return;

      const rootHash: string = claimEntry.rootHash;
      const ownerAddress: string = claimEntry.ownerAddress;

      const { updatedRootHash, rawProof, rawClaimEntry } =
        await createClaimTreasuryDataMutation.mutateAsync({
          rootHash,
          ownerAddress,
        });

      const id: string = claimEntry.id;

      const { unsignedTxRaw, treasuryUtxoRaw } =
        await claimTreasuryMutation.mutateAsync({
          id,
          ownerAddress,
          updatedRootHash,
          rawProof,
          rawClaimEntry,
          rawCollateralUtxo,
          rawUtxos,
        });

      const signedTx = await signTx(walletType, unsignedTxRaw);

      if (signedTx === undefined) return;

      const { txHash } = await finalizeTransaction.mutateAsync({
        unsignedTxCbor: unsignedTxRaw,
        txWitnessCbor: signedTx,
      });

      const ownerPkh = claimEntry.ownerPkh;

      const response = await submitClaimTreasuryTransaction.mutateAsync({
        id,
        ownerPkh,
        utxoRaw: treasuryUtxoRaw,
        txRaw: txHash,
      });
      console.log(response);
      setOpen(false);
      addAlert("success", "Redeemed Treasury");
      // removeClaimEntry(claimEntry);
    } catch (ex: any) {
      addAlert("error", "Error redeeming treasury");
      console.error("Error adding stake", ex);
    }
    setIsSigning(false);
  }, [
    getRawUtxos,
    getRawCollateralUtxo,
    createClaimTreasuryDataMutation,
    signTx,
    finalizeTransaction,
    claimTreasuryMutation,
    submitClaimTreasuryTransaction,
    claimEntry,
    addAlert,
    setOpen,
    // removeClaimEntry
  ]);

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen={fullScreen}
        PaperProps={{
          variant: "outlined",
          elevation: 0,
        }}
        sx={{
          "& .MuiBackdrop-root": {
            backdropFilter: "blur(3px)",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: "800",
            fontSize: "32px",
          }}
        >
          Redeem Treasury
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent
          sx={{ minWidth: "350px", maxWidth: !fullScreen ? "460px" : null }}
        >
          <DataSpread title="ADA" data={`${claimEntry?.claimable}`} />
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", mb: 1 }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleSubmit}
            disabled={!connected}
            sx={{ display: isSigning ? "none" : "flex" }}
          >
            Confirm redeem
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClose}
            disabled={!connected}
            sx={{ display: isSigning ? "none" : "flex" }}
          >
            Cancel redeem
          </Button>
          <CircularProgress
            sx={{ display: isSigning ? "block" : "none" }}
            color="secondary"
          />
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VestingConfirm;
