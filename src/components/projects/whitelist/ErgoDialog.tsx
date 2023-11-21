import React, { FC, SyntheticEvent } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  DialogActions,
  useMediaQuery,
  useTheme,
  Button
} from '@mui/material';
import ErgoVerify from '@components/user/ergo/ErgoVerify';

interface IErgoDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleSubmit: () => void;
}

const ErgoDialog: FC<IErgoDialogProps> = ({ open, setOpen, handleSubmit }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClose = (event: SyntheticEvent, reason?: string) => {
    if (reason !== 'backdropClick') {
      setOpen(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      PaperProps={{
        variant: 'outlined'
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: "800",
          fontSize: "32px",
        }}
      >
        Connect Ergo Wallet
      </DialogTitle>
      <DialogContent sx={{ minWidth: '350px', maxWidth: !fullScreen ? '460px' : null }}>
        <>
          <Typography variant="body2" sx={{ fontSize: '1rem!important' }}>
            This round offers benefits to Ergopad stakers but you can participate without staking Ergopad tokens. When you&apos;re done adding an Ergo wallet, submit your whitelist below.
          </Typography>
        </>
        <ErgoVerify />
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', m: 1 }}>
        <Button variant="contained" onClick={handleSubmit}>Submit Whitelist</Button>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ErgoDialog;