import React from 'react';
import { NextPage } from 'next';
import { useWalletContext } from '@contexts/WalletContext';
import { useRouter } from 'next/router';
import CreateProjectPage from '@components/admin/Pages/CreateProjectPage';
import ErrorPage from '@components/ErrorPage';
import EditProjectPage from '@components/admin/Pages/EditProjectPage';
import AddSpoSignupsManuallyPage from '@components/admin/Pages/AddSpoSignupsManuallyPage';
import FisoManagementPage from '@components/admin/Pages/FisoManagementPage';
import { Container } from '@mui/material';
import HeroCarouselPage from '@components/admin/Pages/HeroCarouselPage';
import WhitelistPage from '@components/admin/Pages/WhitelistPage';

const AdminPage: NextPage = () => {
  const { sessionData, sessionStatus } = useWalletContext()
  const router = useRouter()
  const { admin_page } = router.query
  const route = admin_page?.toString()

  const pageMapper: { [key: string]: React.ReactElement } = {
    "create-project": <CreateProjectPage />,
    "edit-project": <EditProjectPage />,
    "add-spo-signups-manually": <AddSpoSignupsManuallyPage />,
    "fiso-management": <FisoManagementPage />,
    "hero-carousel": <HeroCarouselPage />,
    "whitelist": <WhitelistPage />
  }

  return (
    <>
      {sessionStatus === 'loading' ? (
        <Container sx={{ textAlign: 'center', py: '20vh' }}>
          Loading...
        </Container>
      ) : sessionStatus === 'authenticated' ? (
        sessionData?.user.isAdmin ? (
          route && pageMapper[route] ? (
            <>{pageMapper[route]}</>
          ) : (
            <ErrorPage />
          )
        ) : (
          <ErrorPage
            title="403"
            subtitle="You do not have permission to access this resource. "
            message="You are not authorized to access this page. Please go back where you came from before someone sees you. "
          />
        )
      ) : (
        <ErrorPage
          title="401"
          subtitle="You are not authenticated and need to be to access this resource. "
          message="If you are not signed in, please sign in to an account that has access. Otherwise, return to the home page. "
        />
      )}
    </>
  )
};

export default AdminPage;
