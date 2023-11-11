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

interface IAdminMenuProps {
  children: ReactNode;
}

const drawerWidth = 240;

type LinkItem = {
  name: string;
  link: string;
}

const links = {
  Projects: [
    {
      name: 'Create Project',
      link: '/admin/create-project'
    },
    {
      name: 'Edit Project',
      link: '/admin/edit-project'
    }
  ],
  Fisos: [
    {
      name: 'FISO Management',
      link: '/admin/fiso-management'
    },
    {
      name: 'Add spo signups manually',
      link: '/admin/add-spo-signups-manually'
    },
  ],
  Other: [
    {
      name: 'Hero Carousel',
      link: '/admin/hero-carousel'
    },
    {
      name: 'Whitelist Review',
      link: '/admin/whitelist'
    }
  ]
}

const AdminMenu: FC<IAdminMenuProps> = ({ children }) => {
  const theme = useTheme()
  const desktop = useMediaQuery(theme.breakpoints.up('md'))
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const renderLinkItems = (linkItems: LinkItem[]) => {
    return linkItems.map((link, index) => (
      <Link href={link.link} key={link.name + index}>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemText primary={link.name} />
          </ListItemButton>
        </ListItem>
      </Link>
    ));
  };

  const drawer = (
    <div>
      {Object.entries(links).map(([category, linkItems], categoryIndex) => (
        <div key={category + categoryIndex}>
          {category !== "Other" && <Typography variant="h6" >
            {category}
          </Typography>}
          <List>
            {renderLinkItems(linkItems)}
          </List>
          {categoryIndex < Object.keys(links).length - 1 && <Divider sx={{ mb: 2 }} />}
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