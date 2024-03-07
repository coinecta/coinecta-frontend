import { Dialog, DialogContent, DialogTitle, IconButton, useTheme, useMediaQuery } from '@mui/material';
import React, { FC, useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { ConnectedWalletItem } from '@components/user/ConnectedWalletItem';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface ChooseWalletProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChooseWallet: FC<ChooseWalletProps> = ({ open, setOpen }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClose = () => {
    setOpen(false);
  };

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
        }}>
        Choose Wallet
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
      <DialogContent>
        {fakeWalletsData.map((wallet, i) => {
          return (
            <ConnectedWalletItem handleButtonClick={handleClose} handleEndIconClick={handleClose} wallet={wallet} key={i} endIcon={<ChevronRightIcon sx={{ width: '20px', height: '20px' }} />} />
          )
        })}
      </DialogContent>
    </Dialog>
  )
}

export default ChooseWallet;

const testAddress = 'addr_test1qrr86cuspxp7e3cnpcweyeenmsl46llt3h9k5ugg7cc4kn6u0nrh4agzpe7wlsr3rnyj0huzcu7fmuxrutcqs6td4tas36a9xq';

const fakeWalletsData = [
  {
    icon: '/wallets/nami-light.svg',
    address: testAddress,
    connectName: 'Nami',
    name: '',
    url: '',
    iconDark: '',
    mobile: false
  },
  {
    icon: '/wallets/lace.svg',
    address: testAddress,
    connectName: 'lace',
    name: '',
    url: '',
    iconDark: '',
    mobile: false
  },
  {
    icon: '/wallets/eternl-light.svg',
    address: testAddress,
    connectName: 'eternl',
    name: '',
    url: '',
    iconDark: '',
    mobile: false
  },
  {
    icon: '/wallets/typhon-light.svg',
    address: testAddress,
    connectName: 'typhon',
    name: '',
    url: '',
    iconDark: '',
    mobile: false
  },
  {
    icon: '/wallets/gerowallet.svg',
    address: testAddress,
    connectName: 'gero',
    name: '',
    url: '',
    iconDark: '',
    mobile: false
  }
]