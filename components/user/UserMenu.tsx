import React, { FC, useState, useEffect } from 'react';
import {
  IconButton,
  Icon,
  useTheme,
  Avatar,
  Typography
} from '@mui/material'
import { WalletContext } from '@contexts/WalletContext';
import { useRouter } from 'next/router';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import RedeemIcon from '@mui/icons-material/Redeem';
import SellIcon from '@mui/icons-material/Sell';
import EditIcon from '@mui/icons-material/Edit';
import AddWallet from '@components/user/AddWallet';
import { useWallet, useWalletList, useAddress } from '@meshsdk/react';
import { getShortAddress } from '@utils/general';
import { SxProps } from '@mui/system';

const WALLET_ADDRESS = "wallet_address_coinecta";
const WALLET_NAME = "wallet_name_coinecta";

interface IWalletType {
  name: string;
  icon: string;
  version: string;
}

interface IUserMenuProps {
  sx?: SxProps;
}

const UserMenu: FC<IUserMenuProps> = React.memo(({ sx }) => {
  const theme = useTheme()
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false)
  const walletContext = useWallet()
  const walletList = useWalletList();
  const connectedWalletAddress = useAddress(0);

  const filterByName = (arr: IWalletType[], name: string) => {
    return arr.filter(item => item.name === name);
  }

  const walletTypeObject = filterByName(walletList, walletContext.name);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const clearWallet = async () => {
    localStorage.setItem(WALLET_ADDRESS, '');
    localStorage.setItem(WALLET_NAME, '');
    walletContext.disconnect()
  };

  return (
    <>
      {walletContext.connected ? (
        <>
          <IconButton
            sx={{
              color: theme.palette.text.primary,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '4px',
              mr: 2
            }}
            onClick={handleClick}
          >
            <Avatar src={walletTypeObject[0].icon} sx={{ width: '24px', height: '24px', mr: 1 }} variant="square" />
            {connectedWalletAddress &&
              <Typography>
                {getShortAddress(connectedWalletAddress)}
              </Typography>
            }
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              elevation: 1,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                minWidth: '230px',
                mt: 0,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 15,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem
              sx={{ mt: '6px' }}
              onClick={() => router.push('/users/' + walletContext.wallet.getChangeAddress)}
            >
              <Avatar /> View Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => router.push('/user-settings/')}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Edit Profile
            </MenuItem>
            <MenuItem onClick={() => setModalOpen(true)}>
              <ListItemIcon>
                <AccountBalanceWalletIcon fontSize="small" />
              </ListItemIcon>
              Change Wallet
            </MenuItem>
            <MenuItem onClick={() => clearWallet()}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </>
      ) : (
        <IconButton sx={{
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '4px',
          mr: 2
        }} onClick={() => setModalOpen(true)}>
          <Icon color="inherit" sx={{ mr: 1 }}>
            account_balance_wallet
          </Icon>
          <Typography>
            Connect wallet
          </Typography>
        </IconButton>
      )}
      <AddWallet open={modalOpen} setOpen={setModalOpen} />
    </>
  );
});

export default UserMenu;