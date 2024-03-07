import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, useTheme, Typography, Collapse, useMediaQuery } from '@mui/material';
import React, { FC, useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ConnectedWalletItem } from '@components/user/ConnectedWalletItem';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

interface ChooseWalletProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChooseWallet: FC<ChooseWalletProps> = ({ open, setOpen }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [openDropDown, setOpenDropDown] = useState<boolean>(false);

  const handleOpenDropDown = () => {
    setOpenDropDown(!openDropDown);
  }

  const handleClose = () => {
    setOpen(false);
    setOpenDropDown(false);
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
        <Button
          endIcon={<ExpandMoreIcon sx={{ transform: openDropDown ? 'rotate(180deg)' : null }} />}
          startIcon={
            <Box>
              <Typography sx={{ fontSize: '1rem !important', color: theme.palette.text.primary }}>
                Choose wallet
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
            justifyContent: "space-between",
            minWidth: "350px",
            paddingRight: "24px"
          }}
          fullWidth
          onClick={handleOpenDropDown}
        />
        <Collapse in={openDropDown}>
          {fakeWalletsData.map((wallet, i) => {
            return (
              <ConnectedWalletItem wallet={wallet} key={i} endIcon={<ChevronRightIcon sx={{ width: '20px', height: '20px' }} />} />
            )
          })}
        </Collapse>
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