import React, { FC, useState, useEffect, useRef } from 'react';
import {
  IconButton,
  Icon,
  useTheme,
  Typography,
  Box,
  Button,
  Grid,
  Badge,
  Popover,
  MenuList,
  MenuItem,
  ListItemIcon,
  useMediaQuery,
  Dialog
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ErrorIcon from '@mui/icons-material/Error';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import Link from '@components/Link';
import CloseIcon from '@mui/icons-material/Close';

interface IMenuItemProps {
  icon: React.ReactElement;
  txType: string;
  txId: string;
  success: string;
  time: string;
  unread: boolean;
  index: number;
}

const NotificationsMenu: FC = ({ }) => {
  const theme = useTheme()

  // const router = useRouter();
  // const {
  //   walletAddress,
  //   setWalletAddress,
  //   dAppWallet,
  //   setDAppWallet,
  //   addWalletModalOpen,
  //   setAddWalletModalOpen
  // } = useContext(WalletContext);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const id = open ? 'notification-menu' : undefined;

  const [currentMenuItems, setCurrentMenuItems] = useState(sampleMenuItems)
  const [numberUnread, setNumberUnread] = useState(0)

  useEffect(() => {
    const array = currentMenuItems.filter((item) => item.unread === true)
    setNumberUnread(array.length)
  }, [currentMenuItems])

  const setRead = (i: number) => {
    setCurrentMenuItems((prevArray) => {
      const newArray = prevArray.map((item, index) => {
        if (index === i) {
          return {
            ...item,
            unread: !prevArray[index].unread
          }
        }
        return item
      })
      return newArray
    })
  }

  const markAllRead = () => {
    setCurrentMenuItems((prevArray) => {
      const newArray = prevArray.map((item) => {
        return {
          ...item,
          unread: false
        }
      })
      return newArray
    })
  }

  const isLg = useMediaQuery('(min-width:534px)')

  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleClickDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const CustomMenuItem: FC<IMenuItemProps> = ({ icon, txType, txId, success, time, unread, index }) => {
    return (
      <MenuItem
        onClick={() => setRead(index)}
        sx={{ background: unread ? 'rgba(255,255,255,0.05)' : 'none' }}
      >
        <ListItemIcon>
          {icon}
        </ListItemIcon>
        <Grid container direction="column" sx={{ whiteSpace: 'normal' }}>
          <Grid item>
            {txType + ' '}
            <Link href={'https://explorer.ergoplatform.com/en/transactions/' + txId}>{txId}</Link>
            {' '}
            {success}
          </Grid>
          <Grid item sx={{ fontSize: '0.8rem', color: theme.palette.text.secondary }}>
            {time + ' ago'}
          </Grid>
        </Grid>
        <ListItemIcon>
          <FiberManualRecordIcon
            sx={{
              fontSize: '12px',
              ml: '18px',
              color: unread ? theme.palette.text.primary : theme.palette.background.paper
            }}
          />
        </ListItemIcon>
      </MenuItem>
    )
  }

  const Contents: FC = () => {
    const heightOneRef = useRef<HTMLInputElement>()
    const heightTwoRef = useRef<HTMLInputElement>()
    const [subtractHeight, setSubtractHeight] = useState(0)

    useEffect(() => {
      const heightOne = heightOneRef.current
      const heightTwo = heightTwoRef.current
      if (heightOne !== undefined && heightTwo !== undefined) {
        setSubtractHeight(heightOne.offsetHeight + heightTwo.offsetHeight)
      }
    }, [heightOneRef, heightTwoRef])

    return (
      <Box
        sx={{
          minWidth: '230px',
          maxWidth: isLg ? '420px' : '534px',
        }}
      >
        <Box ref={heightOneRef} sx={{ width: '100%', px: '12px', py: '12px', display: 'block' }}>
          <Typography variant="h6">
            Notifications
          </Typography>
        </Box>
        <Box
          sx={{
            height: isLg ? '75vh' : `calc(100vh - ${subtractHeight}px)`,
            overflowY: 'scroll',
            display: 'block'
          }}
        >
          <MenuList sx={{ py: 0 }}>
            {currentMenuItems.map((item, i) => {
              return (
                <CustomMenuItem
                  txType={item.txType}
                  txId={item.txId}
                  success={item.success}
                  icon={item.icon}
                  time={item.time}
                  unread={item.unread}
                  key={i}
                  index={i}
                />
              )
            })}
          </MenuList>
        </Box>
        <Box
          sx={{
            width: '100%',
            px: '6px',
            display: 'block',
            // position: isLg ? 'relative' : 'absolute',
            bottom: 0
          }}
          onClick={markAllRead}
          ref={heightTwoRef}
        >
          <Button fullWidth>
            Mark all as read
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <>
      <IconButton
        sx={{ color: theme.palette.text.primary }}
        aria-describedby={id}
        onClick={(e) => isLg ? handleClick(e) : handleClickDialogOpen()}
      >
        <Badge badgeContent={numberUnread} color="primary">
          <Icon color="inherit">
            notifications
          </Icon>
        </Badge>
      </IconButton>
      <Dialog
        fullScreen
        open={dialogOpen}
        onClose={handleDialogClose}
        sx={{ overflowY: 'hidden' }}
      >
        <IconButton
          edge="start"
          color="inherit"
          onClick={handleDialogClose}
          aria-label="close"
          sx={{
            position: 'absolute',
            top: 3,
            right: 3
          }}
        >
          <CloseIcon />
        </IconButton>
        <Contents />
      </Dialog>
      <Popover
        id={id}
        open={open}
        onClose={handleClose}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          // zIndex: 100,
          '& .MuiPopover-paper': {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))'
          }
        }}
      >
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            content: '""',
            display: "block",
            position: "absolute",
            width: 12,
            height: 12,
            top: -6,
            right: 14,
            transform: "rotate(45deg)",
          }}
        />
        <Contents />
      </Popover>
    </>
  );
};

export default NotificationsMenu;

////////////////////////////////
// START SAMPLE DATA ///////////
////////////////////////////////

const sampleMenuItems = [
  {
    icon: <CheckCircleIcon fontSize="small" color="success" />,
    txType: 'Purchase transaction',
    txId: 'xyzjdfkkals',
    success: 'confirmed',
    time: '8 minutes',
    unread: true
  },
  {
    icon: <ErrorIcon fontSize="small" color="warning" />,
    txType: 'Purchase transaction',
    txId: 'xyzjdfkkals',
    success: 'submitted to mempool',
    time: '12 minutes',
    unread: true
  },
  {
    icon: <CancelIcon fontSize="small" color="error" />,
    txType: 'Purchase transaction',
    txId: 'abcdalkdsjflkjasdf',
    success: 'failed',
    time: '2 hours',
    unread: false
  },
  {
    icon: <CheckCircleIcon fontSize="small" color="success" />,
    txType: 'Purchase transaction',
    txId: 'xyzjdfkkals',
    success: 'confirmed',
    time: '8 minutes',
    unread: true
  },
  {
    icon: <ErrorIcon fontSize="small" color="warning" />,
    txType: 'Purchase transaction',
    txId: 'xyzjdfkkals',
    success: 'submitted to mempool',
    time: '12 minutes',
    unread: true
  },
  {
    icon: <CancelIcon fontSize="small" color="error" />,
    txType: 'Purchase transaction',
    txId: 'abcdalkdsjflkjasdf',
    success: 'failed',
    time: '2 hours',
    unread: false
  },
  {
    icon: <CheckCircleIcon fontSize="small" color="success" />,
    txType: 'Purchase transaction',
    txId: 'xyzjdfkkals',
    success: 'confirmed',
    time: '8 minutes',
    unread: true
  },
  {
    icon: <ErrorIcon fontSize="small" color="warning" />,
    txType: 'Purchase transaction',
    txId: 'xyzjdfkkals',
    success: 'submitted to mempool',
    time: '12 minutes',
    unread: true
  },
  {
    icon: <CancelIcon fontSize="small" color="error" />,
    txType: 'Purchase transaction',
    txId: 'abcdalkdsjflkjasdf',
    success: 'failed',
    time: '2 hours',
    unread: false
  },
  {
    icon: <CheckCircleIcon fontSize="small" color="success" />,
    txType: 'Purchase transaction',
    txId: 'xyzjdfkkals',
    success: 'confirmed',
    time: '8 minutes',
    unread: true
  },
  {
    icon: <ErrorIcon fontSize="small" color="warning" />,
    txType: 'Purchase transaction',
    txId: 'xyzjdfkkals',
    success: 'submitted to mempool',
    time: '12 minutes',
    unread: true
  },
  {
    icon: <CancelIcon fontSize="small" color="error" />,
    txType: 'Purchase transaction',
    txId: 'abcdalkdsjflkjasdf',
    success: 'failed',
    time: '2 hours',
    unread: false
  },
  {
    icon: <CheckCircleIcon fontSize="small" color="success" />,
    txType: 'Purchase transaction',
    txId: 'xyzjdfkkals',
    success: 'confirmed',
    time: '8 minutes',
    unread: true
  },
  {
    icon: <ErrorIcon fontSize="small" color="warning" />,
    txType: 'Purchase transaction',
    txId: 'xyzjdfkkals',
    success: 'submitted to mempool',
    time: '12 minutes',
    unread: true
  },
  {
    icon: <CancelIcon fontSize="small" color="error" />,
    txType: 'Purchase transaction',
    txId: 'abcdalkdsjflkjasdf',
    success: 'failed',
    time: '2 hours',
    unread: false
  },
  {
    icon: <CheckCircleIcon fontSize="small" color="success" />,
    txType: 'Purchase transaction',
    txId: 'xyzjdfkkals',
    success: 'confirmed',
    time: '8 minutes',
    unread: true
  },
  {
    icon: <ErrorIcon fontSize="small" color="warning" />,
    txType: 'Purchase transaction',
    txId: 'xyzjdfkkals',
    success: 'submitted to mempool',
    time: '12 minutes',
    unread: true
  },
  {
    icon: <CancelIcon fontSize="small" color="error" />,
    txType: 'Purchase transaction',
    txId: 'abcdalkdsjflkjasdf',
    success: 'failed',
    time: '2 hours',
    unread: false
  },
]

////////////////////////////////
// END SAMPLE DATA /////////////
////////////////////////////////