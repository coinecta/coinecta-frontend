import React, { FC, useContext } from 'react';
import {
  IconButton,
  Icon,
  useTheme,
  Avatar
} from '@mui/material'
import { WalletContext } from '@contexts/WalletContext';
import { useRouter } from 'next/router';
import AddWallet from '@components/wallet/AddWallet';
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

interface IUserMenuProps {

}

const UserMenu: FC<IUserMenuProps> = ({ }) => {
  const theme = useTheme()
  const router = useRouter();
  const {
    walletAddress,
    setWalletAddress,
    dAppWallet,
    setDAppWallet,
    addWalletModalOpen,
    setAddWalletModalOpen,
    expanded,
    setExpanded
  } = useContext(WalletContext);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const clearWallet = async () => {
    if (dAppWallet.name === 'safew' || dAppWallet.name === 'nautilus') {
      // @ts-ignore
      await ergoConnector[dAppWallet.name].disconnect()
    }
    // clear state and local storage
    setWalletAddress('');
    // clear dApp state
    setDAppWallet({
      connected: false,
      name: '',
      addresses: [],
    });
    setExpanded(false)
  };

  return (
    <>
      {walletAddress ? (
        <>
          <IconButton sx={{ color: theme.palette.text.primary }} onClick={handleClick}>
            <Icon color="inherit">
              account_circle
            </Icon>
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
              onClick={() => router.push('/users/' + walletAddress)}
            >
              <Avatar /> View Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => router.push('/open-packs')}>
              <ListItemIcon>
                <RedeemIcon fontSize="small" />
              </ListItemIcon>
              Open Packs
            </MenuItem>
            <MenuItem onClick={() => router.push('/sell')}>
              <ListItemIcon>
                <SellIcon fontSize="small" />
              </ListItemIcon>
              Sell Tokens
            </MenuItem>
            <MenuItem onClick={() => router.push('/manage-sales')}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              Manage Sales
            </MenuItem>
            <MenuItem onClick={() => router.push('/user-settings/')}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Edit Profile
            </MenuItem>
            <MenuItem onClick={() => setAddWalletModalOpen(true)}>
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
        <IconButton sx={{ color: theme.palette.text.primary }} onClick={() => setAddWalletModalOpen(true)}>
          <Icon color="inherit">
            account_balance_wallet
          </Icon>
        </IconButton>
      )}
      <AddWallet />
    </>
  );
};

export default UserMenu;