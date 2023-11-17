import React, { ChangeEvent, FC, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { trpc } from '@lib/utils/trpc';
import { useAlert } from '@contexts/AlertContext';
import Grid from '@mui/system/Unstable_Grid/Grid';
import AddIcon from '@mui/icons-material/Add';

const WhitelistStats: FC = () => {
  const { addAlert } = useAlert();
  const numberUsers = trpc.whitelist.getNumUsers.useQuery()
  const listWhitelists = trpc.whitelist.listWhitelists.useQuery()
  const whitelistCounts = trpc.whitelist.getNumSignups.useQuery();
  const [selectedWhitelists, setSelectedWhitelists] = useState<string[]>([])

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleSelectWhitelist = (slug: string) => {
    setSelectedWhitelists(prev => [...prev, slug]);
    handleClose();
  };

  const unslugify = (slug: string) => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Whitelist Stats
      </Typography>
      <Grid container spacing={2}>
        <Grid xs={6} md={3}>
          <Paper variant="outlined" sx={{ p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Typography>
              Total users
            </Typography>
            <Typography sx={{ fontWeight: 700 }}>
              {numberUsers.data}
            </Typography>
          </Paper>
        </Grid>
        {selectedWhitelists.map(slug => {
          const count = whitelistCounts.data?.find(item => item.whitelist_slug === slug)?._count.whitelist_slug || 0;
          return (
            <Grid xs={6} md={3} key={slug}>
              <Paper variant="outlined" sx={{ p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Typography>
                  {unslugify(slug)}
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>
                  {count}
                </Typography>
              </Paper>
            </Grid>
          );
        })}
        {listWhitelists.data?.filter(item => !selectedWhitelists.includes(item.slug)).length! > 0 &&
          <Grid xs={6} md={3}>
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              sx={{ height: '100%' }}
              aria-controls={open ? 'long-menu' : undefined}
              aria-expanded={open ? 'true' : undefined}
              aria-haspopup="true"
              onClick={handleClick}
            >
              <AddIcon sx={{ fontSize: '72px' }} />
            </Button>
          </Grid>
        }
      </Grid>
      <Menu
        id="whitelist-menu"
        MenuListProps={{
          'aria-labelledby': 'whitelist-menu-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            style: {
              maxHeight: '300px',
              width: '300px',
            },
          }
        }}
      >
        {listWhitelists.data?.filter(item => !selectedWhitelists.includes(item.slug)).map((option) => (
          <MenuItem key={option.slug} onClick={() => handleSelectWhitelist(option.slug)}>
            {option.slug}
          </MenuItem>
        ))}
      </Menu>
    </Box >
  );
};

export default WhitelistStats;


