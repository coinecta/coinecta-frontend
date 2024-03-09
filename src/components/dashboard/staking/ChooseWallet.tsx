import { Dialog, DialogContent, DialogTitle, IconButton, useTheme, useMediaQuery } from '@mui/material';
import React, { FC, useEffect, useMemo, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { ConnectedWalletItem } from '@components/user/ConnectedWalletItem';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { trpc } from '@lib/utils/trpc';
import { walletDataByName } from '@lib/walletsList';

interface ChooseWalletProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onChose?: (address: string) => void;
}

const ChooseWallet: FC<ChooseWalletProps> = ({ open, setOpen, onChose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const getWallets = trpc.user.getWallets.useQuery()
  const userWallets = useMemo(() => getWallets.data && getWallets.data.wallets, [getWallets]);
  const userWalletsRendered = useMemo(() => {
    return userWallets?.map((wallet) => {
      return { ...walletDataByName(wallet.type)!, address: wallet.changeAddress } as TWalletListItem & { address: string };
    });
  }, [userWallets]);

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
        {userWalletsRendered?.map((wallet, i) => {
          return (
            <ConnectedWalletItem handleButtonClick={onChose} wallet={wallet} key={i} endIcon={<ChevronRightIcon sx={{ width: '20px', height: '20px' }} />} />
          )
        })}
      </DialogContent>
    </Dialog>
  )
}

export default ChooseWallet;