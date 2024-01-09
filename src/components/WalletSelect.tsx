import React, { useState } from 'react';
import {
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  ListSubheader,
  Button,
  SelectChangeEvent,
  useTheme,
  Checkbox,
  ListItemText
} from '@mui/material';
import { getShorterAddress } from '@lib/utils/general';
import { useRouter } from 'next/router';

const WalletSelectDropdown = () => {
  const theme = useTheme()
  const router = useRouter()
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const items = ['addr1qy0yswstqah6zwxvd5csh0gyty80pc243672347234572345707hdz6r6fp6z96rgh8dvu6yjx8smmany40anu8264r0ek3ssuabc9', 'addr1qy0yswstqah6zwxvd5csh0gyty80pc243672347234572345707hdz6r6fp6z96rgh8dvu6yjx8smmany40anu8264r0ek3ssgdsfg2', 'addr1qy0yswstqah6zwxvd5csh0gyty80pc243672347234572345707hdz6r6fp6z96rgh8dvu6yjx8smmany40anu8264r0ek3ssutvwy', 'addr1qy0yswstqah6zwxvd5csh0gyty80pc243672347234572345707hdz6r6fp6z96rgh8dvu6yjx8smmany40anu8264r0ek3ss322as1'];

  const handleChange = (event: SelectChangeEvent<typeof selectedItems>) => {
    const {
      target: { value },
    } = event;
    setSelectedItems(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const handleAddWallet = () => {
    router.push('/user/connected-wallets')
  };

  return (
    <FormControl fullWidth>
      <Select
        multiple
        displayEmpty
        variant="filled"
        value={selectedItems}
        onChange={handleChange}
        renderValue={() => selectedItems.length === 0 ? 'No wallet selected' : 'Select displayed wallets'}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 420,
            },
          },
        }}
        sx={{
          borderRadius: '6px',
          borderStyle: 'solid',
          borderWidth: '1px',
          borderColor: theme.palette.mode === 'dark'
            ? 'rgba(200, 225, 255, 0.2)'
            : 'rgba(20, 22, 25, 0.15)',
          background: theme.palette.mode === 'dark'
            ? 'radial-gradient(at right top, rgba(16,20,34,0.4), rgba(1, 4, 10, 0.4))'
            : 'radial-gradient(at right top, rgba(16,20,34,0.05), rgba(1, 4, 10, 0.05))',
          boxShadow: '2px 2px 5px 3px rgba(0,0,0,0.03)',
          fontFamily: 'sans-serif',
          fontSize: '1rem',
          '& .MuiInputBase-input': {
            py: '3px',
            px: '9px',
          },
          '&:hover': {
            borderColor: theme.palette.primary.main,
          },
          '& .MuiFilledInput-before': { display: 'none' },
          '& .MuiFilledInput-after': { display: 'none' },
          '& .Mui-error': {
            borderColor: theme.palette.error.dark,
            borderWidth: '2px'
          }
        }}
      >
        <ListSubheader>
          <Button fullWidth onClick={handleAddWallet} sx={{ my: 1 }}>
            Add wallet
          </Button>
        </ListSubheader>
        {items.map((item, i) => (
          <MenuItem key={item} value={item}>
            <Checkbox checked={selectedItems.indexOf(item) > -1} />
            <ListItemText primary={getShorterAddress(item, 6)} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default WalletSelectDropdown;