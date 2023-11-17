import { FC } from 'react';
import {
  Box,
  Typography,
} from '@mui/material';
import AdminMenu from '@components/admin/AdminMenu';
import { useAlert } from '@contexts/AlertContext';
import SumsubId from '../whitelist/SumsubId';
import WhitelistStats from '../whitelist/WhitelistStats';

const WhitelistPage: FC = () => {
  const { addAlert } = useAlert();

  return (
    <AdminMenu>
      <Box>
        <Typography variant="h2" sx={{ mt: 10, mb: 4, fontWeight: '700' }}>
          Whitelist Review
        </Typography>
        <Box sx={{ mb: 4 }}>
          <SumsubId />
        </Box>
        <Box sx={{ mb: 4 }}>
          <WhitelistStats />
        </Box>
      </Box>
    </AdminMenu>
  );
};

export default WhitelistPage;
