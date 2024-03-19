import { walletsList } from '@lib/walletsList';
import {
  Avatar,
  FormControl,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  useTheme
} from '@mui/material';

interface SortByWalletDropdownProps {
  wallet: string;
  connectedWallets: string[];
  setWallet: (wallet: string) => void;
}

const SortByWalletDropdown = ({
  wallet,
  setWallet,
  connectedWallets
}: SortByWalletDropdownProps) => {
  const theme = useTheme()

  const handleChange = (event: SelectChangeEvent) => {
    const { target: { value } } = event;
    if (wallet === value) return;
    setWallet(value);
  };

  return (
    <FormControl sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      <Typography sx={{ fontWeight: 900 }}>Sort by</Typography>
      <Select
        variant="filled"
        value={wallet}
        onChange={handleChange}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 420,
            },
          }
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
          minWidth: '150px',
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
          },
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }
        }}
      >
        {connectedWallets.map((connectedWallet) => {

          const walletData = walletsList.find(w => w.connectName === connectedWallet);
          const icon = theme.palette.mode === 'dark' ? walletData?.iconDark : walletData?.icon;
          return (
            <MenuItem key={connectedWallet} value={connectedWallet} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar variant='square' sx={{ width: '22px', height: '22px' }} src={icon} />
              <ListItemText primary={connectedWallet} />
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};

export default SortByWalletDropdown;

const fakeWalletsData = [
    {
        name: 'Nami',
        icon: '/wallets/nami-light.svg',
    },
    {
        name: 'Lace',
        icon: '/wallets/lace.svg',
    },
    {
        name: 'Eternl',
        icon: '/wallets/eternl-light.svg',
    }
]