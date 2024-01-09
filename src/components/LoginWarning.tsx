import { Box, Container, Typography } from '@mui/material';
import React, { FC, useState } from 'react';
import { useWalletContext } from '@contexts/WalletContext';
import SignIn from './user/SignIn';
import LoadingButton from '@mui/lab/LoadingButton';

interface ILoginWarningProps {
  message?: string;
}

const LoginWarning: FC<ILoginWarningProps> = ({ message }) => {
  const { providerLoading, setProviderLoading } = useWalletContext()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <Container sx={{ textAlign: 'center', py: '20vh' }}>
      <Typography variant="h3" sx={{ mb: 3 }}>
        Please sign in
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        {message ?? 'You need to sign in or create an account to view this page.'}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: 2 }}>
        <LoadingButton loading={providerLoading} loadingIndicator="Loading…" variant="contained" onClick={() => setModalOpen(true)}>
          Sign in
        </LoadingButton>
      </Box>
      <SignIn open={modalOpen} setOpen={setModalOpen} setLoading={setProviderLoading} />
    </Container>
  );
};

export default LoginWarning;