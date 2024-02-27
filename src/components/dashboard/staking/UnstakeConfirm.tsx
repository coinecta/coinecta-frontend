import React, { FC } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  DialogActions,
  useMediaQuery,
  useTheme,
  Button,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DataSpread from '@components/DataSpread';

interface IUnstakeConfirmProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  unstakeList: IUnstakeListItem[]
}

const UnstakeConfirm: FC<IUnstakeConfirmProps> = ({
  open,
  setOpen,
  unstakeList
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClose = () => {
    setOpen(false);
  };


  const handleSubmit = async () => {
    console.log('submitted')
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
        Confirm Unstake
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
        {unstakeList.map((item, i) => (
          <DataSpread
            title={item.currency}
            data={`${item.amount}`}
          />
        ))}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', mb: 1 }}>
        <Button variant="contained" color="secondary" onClick={handleSubmit}>
          {/* {`Submit with ${alternateWalletType?.name || sessionData?.user.walletType} wallet`} */}
          {`Unstake`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnstakeConfirm;