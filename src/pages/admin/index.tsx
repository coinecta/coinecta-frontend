import React from 'react';
import { NextPage } from 'next';
import { useWalletContext } from '@contexts/WalletContext';
import { useRouter } from 'next/router';
import CreateProjectPage from '@components/admin/Pages/CreateProjectPage';
import ErrorPage from '@components/ErrorPage';
import EditProjectPage from '@components/admin/Pages/EditProjectPage';
import AddSpoSignupsManuallyPage from '@components/admin/Pages/AddSpoSignupsManuallyPage';
import FisoManagementPage from '@components/admin/Pages/FisoManagementPage';
import { Box, Container } from '@mui/material';
import AdminMenu from '@components/AdminMenu';

const AdminIndex: NextPage = () => {
  const { sessionData, sessionStatus } = useWalletContext()
  const router = useRouter()

  return (
    <>
      {sessionStatus === 'loading' ? (
        <Container sx={{ textAlign: 'center', py: '20vh' }}>
          Loading...
        </Container>
      ) : sessionStatus === 'authenticated' ? (
        sessionData?.user.isAdmin ? (
          <AdminMenu>
            <Box sx={{ py: '20vh' }}>
              Please choose a page from the menu.
            </Box>
          </AdminMenu>
        )
          : (
            <ErrorPage
              title="403"
              subtitle="You do not have permission to access this resource. "
              message="You are not authorized to access this page. Please go back where you came from before someone sees you. "
            />
          )
      )
        : (
          <ErrorPage
            title="401"
            subtitle="You are not authenticated and need to be to access this resource. "
            message="If you are not signed in, please sign in to an account that has access. Otherwise, return to the home page. "
          />
        )}
    </>
  )
};

export default AdminIndex;
