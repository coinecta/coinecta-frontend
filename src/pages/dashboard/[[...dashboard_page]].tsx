import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import ErrorPage from '@components/ErrorPage';
import DashboardMenu from '@components/dashboard/DashboardMenu';
import DashboardPage from '@components/dashboard/pages/DashboardPage';
import StakePositionsPage from '@components/dashboard/pages/StakePositionsPage';
import AddStakePage from '@components/dashboard/pages/AddStakePage';
import UnlockVested from '@components/dashboard/pages/UnlockVested';
import ClaimTokens from '@components/dashboard/pages/ClaimTokens';

const Dashboard: NextPage = () => {
  const router = useRouter()
  const { dashboard_page } = router.query
  const route = dashboard_page?.toString()

  const pageMapper: { [key: string]: React.ReactElement } = {
    "add-stake": <AddStakePage />,
    "manage-stake": <StakePositionsPage />,
    "unlock-vested": <UnlockVested />,
    "claim-tokens": <ClaimTokens />
  }

  return <DashboardMenu>
    {route && pageMapper[route]
      ? pageMapper[route]
      : !route
        ? <DashboardPage />
        : <ErrorPage />
    }
  </DashboardMenu>
};

export default Dashboard;
