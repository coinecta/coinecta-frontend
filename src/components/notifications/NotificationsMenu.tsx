import React, { FC, useState, useEffect } from 'react';
import {
  IconButton,
  useTheme,
  Typography,
  Box,
  Badge,
  Popover,
  MenuList,
  MenuItem,
  useMediaQuery,
  Avatar,
  Divider,
  SwipeableDrawer,
  Button
} from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications';
import EastIcon from '@mui/icons-material/East';
import { IImportMenuItem } from '@pages/notifications';
import CustomMenuItem from "@components/notifications/CustomMenuItem";
import { useRouter } from 'next/router';
import { nanoid } from 'nanoid';

const NotificationsMenu: FC = ({ }) => {
  const theme = useTheme()
  const router = useRouter()
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const id = open ? 'notification-menu' : undefined;
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleDrawer =
    (open: boolean) =>
      (event: React.KeyboardEvent | React.MouseEvent) => {
        if (
          event &&
          event.type === 'keydown' &&
          ((event as React.KeyboardEvent).key === 'Tab' ||
            (event as React.KeyboardEvent).key === 'Shift')
        ) {
          return;
        }

        setMobileOpen(open);
      };

  const [currentMenuItems, setCurrentMenuItems] = useState<IImportMenuItem[]>(sampleMenuItems)
  const [numberUnread, setNumberUnread] = useState(0)

  useEffect(() => {
    const array = currentMenuItems.filter((item) => item.unread === true)
    setNumberUnread(array.length)
  }, [currentMenuItems])

  const handleSeeAllButton = () => {
    router.push(`/notifications`);
    setMobileOpen(false)
  }

  const Contents: FC = () => {
    return (
      <Box
        sx={{
          minWidth: '230px',
          maxWidth: '500px',
        }}
      >
        <Box sx={{
          width: '100%', mb: 2, display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6">
            Notifications
          </Typography>
          <Button variant="contained" endIcon={<EastIcon />} onClick={handleSeeAllButton}>
            See all
          </Button>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box
          sx={{
            display: 'block'
          }}
        >
          <MenuList sx={{ py: 0 }}>
            {currentMenuItems.length > 0
              ? currentMenuItems.map((item, i) => {
                const key = nanoid()
                return (
                  <CustomMenuItem
                    key={key}
                    menuItems={currentMenuItems}
                    setMenuItems={setCurrentMenuItems}
                    {...item}
                  />
                )
              })
              : <MenuItem>

              </MenuItem>
            }
          </MenuList>
        </Box>
      </Box>
    )
  }

  return (
    <>
      <Badge badgeContent={numberUnread} color="primary">
        <Avatar sx={{ bgcolor: "rgba(235, 232, 255, 1)" }}>
          <IconButton
            sx={{ color: theme.palette.primary.main }}
            aria-describedby={id}
            onClick={(e) => isMobile ? setMobileOpen(true) : handleClick(e)}
          >
            <NotificationsIcon />
          </IconButton>
        </Avatar>
      </Badge>
      <SwipeableDrawer
        anchor="bottom"
        open={mobileOpen}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
        sx={{
          '& .MuiPaper-root': {
            background: theme.palette.background.default,
            borderRadius: '48px 48px 0 0',
            p: '0 24px 24px'
          }
        }}
      >
        <Box
          sx={{
            height: '5px',
            background: '#E7EAEE',
            width: '25vw',
            mx: 'auto',
            borderRadius: "48px 48px 0px 0px",
            mt: '9px',
            mb: '48px'
          }}>
        </Box>
        <Contents />
      </SwipeableDrawer>
      <Popover
        id={id}
        open={open}
        onClose={handleClose}
        anchorEl={anchorEl}
        elevation={1}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPopover-paper': {
            background: theme.palette.background.default,
            p: '24px',
            overflow: 'visible',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 15,
              width: 10,
              height: 10,
              bgcolor: theme.palette.background.default,
              transform: 'rotate(45deg)',
              zIndex: 10,
            },
          },
        }}
      >
        <Box
          sx={{
            backgroundColor: theme.palette.background.default,
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

const sampleMenuItems: IImportMenuItem[] = [
  {
    message: 'Ornella just updated the status on your transaction. Check it out!',
    userName: 'Ornella May',
    userPfp: '',
    id: nanoid(),
    userVerfied: false,
    time: new Date(),
    unread: true
  },
  {
    message: 'Jake just updated the status on your transaction. Check it out!',
    userName: 'Jake Jones',
    userPfp: '/thoreau.png',
    id: nanoid(),
    userVerfied: true,
    time: new Date(),
    unread: true
  },
  {
    message: 'Ornella just updated the status on your transaction. Check it out!',
    userName: 'Ornella May',
    userPfp: '',
    id: nanoid(),
    userVerfied: false,
    time: new Date(),
    unread: false
  }
]