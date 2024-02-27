import React, { FC, ReactNode, useState } from 'react';
import Link from 'next/link';
import {
  Box,
  useMediaQuery,
  Drawer,
  useTheme,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Container,
  Fab,
  Zoom,
  Typography
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { useRouter } from 'next/router';

interface IDashboardMenuProps {
  children: ReactNode;
}

const drawerWidth = 240;

type LinkItem = {
  name: string;
  link: string;
}

const links = {
  Other: [
    {
      name: 'Overview',
      link: '/dashboard'
    },
    {
      name: 'Transaction History',
      link: '/dashboard/transaction-history'
    }
  ],
  Staking: [
    {
      name: 'Add Stake',
      link: '/dashboard/add-stake'
    },
    {
      name: 'Manage Positions',
      link: '/dashboard/manage-stake'
    }
  ],
  Vesting: [
    {
      name: 'Unlock Vested',
      link: '/dashboard/unlock-vested'
    },
    {
      name: 'Claim Tokens',
      link: '/dashboard/claim-tokens'
    },
  ]
}

const DashboardMenu: FC<IDashboardMenuProps> = ({ children }) => {
  const theme = useTheme()
  const desktop = useMediaQuery(theme.breakpoints.up('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const renderLinkItems = (linkItems: LinkItem[]) => {
    return linkItems.map((link, index) => (
      <Link href={link.link} key={link.name + index}>
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton sx={{
            background: router.asPath === link.link ? theme.palette.background.paper : 'none',
            borderRadius: '8px',
            transition: 'transform 100ms',
            '&:hover': {
              background: theme.palette.background.paper,
              transform: 'scale(1.01)',
            }
          }}>
            <ListItemText primary={link.name} primaryTypographyProps={{ sx: { fontSize: '1rem!important', fontWeight: 700 } }} />
          </ListItemButton>
        </ListItem>
      </Link>
    ));
  };

  const drawer = (
    <div>
      {Object.entries(links).map(([category, linkItems], categoryIndex) => (
        <div key={category + categoryIndex}>
          {category !== "Other" && <Typography variant="overline">
            {category}
          </Typography>}
          <List>
            {renderLinkItems(linkItems)}
          </List>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {!desktop &&
        <>
          <Box
            component="nav"
            aria-label="dashboard-menu"
            onClick={handleDrawerToggle}
          >
            <Drawer
              variant={"temporary"}
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile.
              }}
              sx={{
                zIndex: 10000,
                display: 'block',
                [`& .MuiDrawer-paper`]: {
                  borderRadius: 0,
                  background: theme.palette.background.paper,
                  width: drawerWidth,
                  boxSizing: 'border-box',
                  zIndex: 100,
                  mt: 0,
                  px: 2,
                  pt: 3,
                },
              }}
            >
              {drawer}
            </Drawer>
          </Box>
          <Zoom
            in={!mobileOpen}
            timeout={200}
            style={{
              transitionDelay: `100ms`,
            }}
          >
            <Fab
              variant="extended"
              color="primary"
              onClick={handleDrawerToggle}
              sx={{
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                zIndex: 200
              }}
            >
              <MenuOpenIcon />
              Menu
            </Fab>
          </Zoom>
          <Container maxWidth="md" sx={{ overflow: 'clip' }}>
            {children}
          </Container>
        </>
      }
      {desktop &&
        <Box maxWidth="xl" sx={{ display: 'flex', flexDirection: 'row', mx: 'auto' }}>
          <Box
            component="nav"
            aria-label="dashboard-menu"
            sx={{
              width: drawerWidth,
              pl: 2,
              pr: 3,
              pt: 3,
              position: 'relative',
              flexShrink: 0,
              zIndex: 5,
              background: theme.palette.background.default
            }}
          >
            <Box sx={{ position: 'sticky', top: '90px' }}>
              {drawer}
            </Box>
          </Box>
          <Box sx={{ pt: 2, px: 2, flexGrow: 1, maxWidth: `calc(100% - ${drawerWidth}px)` }}>
            {children}
          </Box>
        </Box>
      }
    </>
  );
};

export default DashboardMenu;