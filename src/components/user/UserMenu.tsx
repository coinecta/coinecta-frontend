import React, { FC, useState, useEffect } from 'react';
import {
  IconButton,
  Icon,
  useTheme,
  Avatar,
  Typography,
  Button,
  useMediaQuery
} from '@mui/material'
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
import SignIn from '@components/user/SignIn';
import { useWallet, useWalletList } from '@meshsdk/react';
import { getShortAddress } from '@lib/utils/general';
import { trpc } from "@lib/utils/trpc";
import { signIn, signOut } from "next-auth/react"
import { useWalletContext } from '@contexts/WalletContext';
import { useAlert } from '@contexts/AlertContext';

interface IWalletType {
  name: string;
  icon: string;
  version: string;
}

interface IUserMenuProps {
}

const UserMenu: FC<IUserMenuProps> = () => {
  const theme = useTheme()
  const desktop = useMediaQuery(theme.breakpoints.up('md'))
  const router = useRouter();
  const { addAlert } = useAlert()
  const [modalOpen, setModalOpen] = useState(false)
  const { wallet, connected, name, connecting, connect, disconnect, error } = useWallet()
  const [rewardAddress, setRewardAddress] = useState<string | undefined>(undefined);
  const [changeAddress, setChangeAddress] = useState<string | undefined>(undefined)
  const [usedAddresses, setUsedAddresses] = useState<string[] | undefined>(undefined)
  const [unusedAddresses, setUnusedAddresses] = useState<string[] | undefined>(undefined)
  const getNonce = trpc.user.getNonce.useQuery({ rewardAddress }, { enabled: false, retry: false });
  const deleteEmptyUser = trpc.user.deleteEmptyUser.useMutation()
  const [newNonce, setNewNonce] = useState<TNonceResponse | undefined>(undefined)
  const { providerLoading, setProviderLoading, sessionStatus, sessionData, fetchSessionData } = useWalletContext()
  const [walletIcon, setWalletIcon] = useState<string | undefined>(undefined)
  const walletsList = useWalletList();

  useEffect(() => {
    // console.log(`connected: ${connected}`)
    // console.log(`rewardAddress: ${rewardAddress}`)
    // console.log(`sessionStatus: ${sessionStatus}`)
    // console.log(`sessionData: ${sessionData?.user.walletType}`)

    // user has a wallet connected, we've got the reward address, but they still need to sign in
    if (connected && !rewardAddress && sessionStatus === 'unauthenticated') {
      // console.log('getting addresses')
      getAddresses()
    }

    if (connected && rewardAddress && sessionStatus === 'unauthenticated') {
      // console.log('refetching (initiate login flow)')
      refetchData()
    }

    // user doesn't have a wallet connected, but navigates to the page with an active session
    // we have to verify the wallet type that should automatically be connected
    if (!connected && !rewardAddress && sessionStatus === 'authenticated' && sessionData?.user.walletType) {
      // console.log('connect first then get addresses')
      connectFirstThenGetAddresses()
    }

    if (connected && sessionData?.user.walletType) {
      // console.log('setting wallet icon')
      if (!rewardAddress) getAddresses()
      const thisWallet = walletsList.filter(wallet => wallet.name === sessionData.user.walletType)
      setWalletIcon(thisWallet[0].icon)
    }
  }, [rewardAddress, connected, sessionStatus]);

  const connectFirstThenGetAddresses = async () => {
    try {
      if (sessionStatus === 'authenticated' && sessionData?.user.walletType) {
        if (sessionData?.user.walletType === 'Begin Wallet') await connect('VESPR');
        else await connect(sessionData.user.walletType);
      }
      else throw new Error('not authenticated')
    } catch (error) {
      // Handle or log error as appropriate
      console.error('An error occurred:', error);
    }
  }

  const getAddresses = async () => {
    const thisChangeAddress = await wallet.getChangeAddress();
    const thisRewardAddress = await wallet.getRewardAddresses();
    const thisUnusedAddresses = await wallet.getUnusedAddresses();
    const thisUsedAddresses = await wallet.getUsedAddresses();
    setRewardAddress(thisRewardAddress[0]);
    setChangeAddress(thisChangeAddress)
    setUsedAddresses(thisUsedAddresses)
    setUnusedAddresses(thisUnusedAddresses)
    // console.log('connected Wallet Address: ' + connectedWalletAddress)
    // console.log('got user address: ' + address[0])
  }

  // get the new nonce
  const refetchData = () => {
    getNonce.refetch()
      .then((response: any) => {
        if (response && response.error) {
          throw new Error(response.error.message);
        }
        setNewNonce(response.data.nonce)
      })
      .catch((error: any) => {
        console.error('Nonce error: ' + error);
      });
  }

  useEffect(() => {
    if (newNonce && rewardAddress) {
      if (sessionStatus === 'unauthenticated' && newNonce) {
        verifyOwnership(newNonce, rewardAddress)
      }
    }
  }, [newNonce, sessionStatus])

  const verifyOwnership = async (nonce: TNonceResponse, address: string) => {
    if (!nonce) {
      console.error('Invalid nonce');
      cleanup();
      return;
    }

    setProviderLoading(true)

    try {
      const signature = await wallet.signData(address, nonce.nonce)
      if (!signature.signature || !signature.key) {
        console.error('signature failed to generate');
        addAlert('error', 'Message signing failed. ')
        cleanupForAuth(nonce);
        return;
      }

      try {
        const response = await signIn("credentials", {
          nonce: nonce.nonce,
          userId: nonce.userId,
          signature: JSON.stringify(signature),
          wallet: JSON.stringify({
            type: name,
            rewardAddress,
            changeAddress,
            unusedAddresses,
            usedAddresses
          }),
          redirect: false
        });

        if (!response?.status || response.status !== 200) {
          // console.log(response)
          cleanupForAuth(nonce);
          return;
        }

      } catch (error) {
        console.error('Error during signIn:', error);
        addAlert('error', `Error during signIn: ${error}`)
        cleanupForAuth(nonce);
        return;
      }

    } catch (error) {
      console.error('Error during wallet signature:', error);
      cleanupForAuth(nonce);
    } finally {
      await fetchSessionData();
      setProviderLoading(false)
      setModalOpen(false);
    }
  }

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const cleanupForAuth = (nonce: TNonceResponse) => {
    deleteEmptyUser.mutateAsync({
      userId: nonce.userId
    });
    cleanup()
  };

  const cleanup = () => {
    setRewardAddress(undefined)
    setChangeAddress(undefined)
    setUsedAddresses([])
    setUnusedAddresses([])
    disconnect()
  };

  return (
    <>
      {(sessionStatus === 'unauthenticated' || sessionStatus === 'loading') && (
        <Button
          className="btn-ghost rounded-btn btn"
          onClick={() => setModalOpen(true)}
          variant="contained"
          disabled={providerLoading}
        >
          {providerLoading ? 'Loading...' : 'Sign in'}
        </Button>
      )}
      {sessionStatus === 'authenticated' && sessionData && (
        <>
          <IconButton
            sx={{
              color: theme.palette.text.primary,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '4px',
              mr: desktop ? 0 : 1
            }}
            disabled={providerLoading}
            onClick={handleClick}
          >
            {providerLoading ? <Typography>Loading...</Typography> :
              (
                <>
                  <Avatar src={sessionData.user.image ?? walletIcon} sx={{ width: '24px', height: '24px', mr: desktop ? 1 : null }} variant="square" />
                  {changeAddress && desktop &&
                    <Typography>
                      {getShortAddress(changeAddress)}
                    </Typography>
                  }
                </>
              )}
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            slotProps={{
              paper: {
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
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {/* <MenuItem
              sx={{ mt: '6px' }}
              onClick={() => router.push('/users/' + wallet.getChangeAddress)}
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
            </MenuItem> */}
            <MenuItem onClick={() => router.push('/user/connected-wallets')}>
              <ListItemIcon>
                <AccountBalanceWalletIcon fontSize="small" />
              </ListItemIcon>
              Connected Wallets
            </MenuItem>
            <MenuItem onClick={() => {
              cleanup()
              setProviderLoading(true)
              signOut()
            }}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </>
      )}
      <SignIn open={modalOpen} setOpen={setModalOpen} setLoading={setProviderLoading} />
    </>
  );
}

export default UserMenu;