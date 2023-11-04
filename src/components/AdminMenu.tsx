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
  Zoom
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';

interface IAdminMenuProps {
  children: ReactNode;
}

const drawerWidth = 240;

const links = [
  {
    name: 'Create Project',
    link: '/admin/create-project'
  },
  {
    name: 'Edit Project',
    link: '/admin/edit-project'
  },
  {
    name: 'FISO Management',
    link: '/admin/fiso-management'
  },
  {
    name: 'Whitelist Review',
    link: '/admin/whitelist'
  },
  {
    name: 'Add spo signups manually',
    link: '/admin/add-spo-signups-manually'
  },
]

const AdminMenu: FC<IAdminMenuProps> = ({ children }) => {
  const theme = useTheme()
  const desktop = useMediaQuery(theme.breakpoints.up('md'))
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <List>
        {links.map((item, index) => (
          <Link href={item.link} key={index}>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemText primary={item.name} />
              </ListItemButton>
            </ListItem>
          </Link>
        ))}
      </List>
      <Divider sx={{ mb: 2 }} />
      <List>
        <Link href='/'>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary={'Home'} />
            </ListItemButton>
          </ListItem>
        </Link>
      </List>
    </div>
  );

  return (
    <>
      {!desktop &&
        <>
          <Box
            component="nav"
            aria-label="admin-menu"
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
                zIndex: 1000
              }}
            >
              <MenuOpenIcon />
              Menu
            </Fab>
          </Zoom>
          <Container maxWidth="md">
            {children}
          </Container>
        </>
      }
      {desktop &&
        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          <Box
            component="nav"
            aria-label="admin-menu"
            sx={{
              width: drawerWidth,
              px: 2,
              pt: 3,
              position: 'relative',
              flexShrink: 0,
            }}
          >
            <Box sx={{ position: 'sticky', top: '90px' }}>
              {drawer}
            </Box>
          </Box>
          <Box sx={{ px: 2, flexGrow: 1, maxWidth: `calc(100% - ${drawerWidth}px)` }}>
            {children}
          </Box>
        </Box>
      }
    </>
  );
};

export default AdminMenu;