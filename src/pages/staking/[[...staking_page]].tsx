import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import ErrorPage from '@components/ErrorPage';
import DashboardMenu from '@components/dashboard/DashboardMenu';
import DashboardPage from '@components/dashboard/pages/DashboardPage';
import StakePositionsPage from '@components/dashboard/pages/StakePositionsPage';
import AddStakePage from '@components/dashboard/pages/AddStakePage';


const Staking: NextPage = () => {
  const router = useRouter()
  const { staking_page } = router.query
  const route = staking_page?.toString()
  console.log(route)

  const pageMapper: { [key: string]: React.ReactElement } = {
    "add": <AddStakePage />,
    "manage-stake": <StakePositionsPage />
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

export default Staking;
