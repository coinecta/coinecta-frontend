import { useRouter } from 'next/router';
import React, { FC, useEffect, useState } from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import { trpc } from '@lib/utils/trpc';
import { ContainedTab, ContainedTabs } from '@components/styled-components/ContainedTabs';
import ProRataForm from './ProRataForm';
import axios from 'axios';
import { getShorterAddress } from '@lib/utils/general';
import { formatNumber } from '@lib/utils/assets'

type ContributeTabProps = {
  projectName: string;
  projectIcon: string;
  projectSlug: string;
}

const ContributeTab: FC<ContributeTabProps> = ({ projectName, projectIcon, projectSlug }) => {
  const theme = useTheme();
  const router = useRouter();
  const { data: rounds } = trpc.contributions.getContributionRoundsByProjectSlug.useQuery(
    { projectSlug: projectSlug || '' },
    { enabled: !!projectSlug }
  );
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (rounds && rounds.length > 0) {
      const roundIdFromUrl = Number(router.query.roundId);
      const index = rounds.findIndex(round => round.id === roundIdFromUrl);
      if (index !== -1) {
        setTabValue(index);
      } else {
        const nearestIndex = findNearestRoundIndex(rounds);
        updateUrl(nearestIndex);
      }
    }
  }, [rounds, router.query.roundId]);

  const findNearestRoundIndex = (rounds: TContributionRound[]) => {
    const now = new Date();
    return rounds.reduce((nearestIndex, round, currentIndex, arr) => {
      const nearestDiff = Math.abs(now.getTime() - new Date(arr[nearestIndex].startDate).getTime());
      const currentDiff = Math.abs(now.getTime() - new Date(round.startDate).getTime());
      return currentDiff < nearestDiff ? currentIndex : nearestIndex;
    }, 0);
  };

  const updateUrl = (index: number) => {
    if (rounds && rounds[index]) {
      router.push({
        pathname: router.pathname,
        query: {
          ...router.query,
          tab: 'contribute',
          roundId: rounds[index].id
        },
      }, undefined, { shallow: true });
    }
  };

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    updateUrl(newValue);
  };

  return (
    <Box sx={{ mb: 2 }}>
      {rounds && rounds.length > 0
        ? <>
          <ContainedTabs
            value={tabValue}
            onChange={handleChangeTab}
            aria-label="styled tabs example"
          >
            {rounds.map((round, i) => (
              <ContainedTab key={`tab-${i}`} label={round.name} />
            ))}
          </ContainedTabs>
          <Box sx={{ my: 2 }}>
            {rounds.map((round, i) => (
              tabValue === i &&
              <ProRataForm key={`form-${i}`} contributionRound={round} projectIcon={projectIcon} />
            ))}
          </Box>
        </>
        : <Typography>
          No contribution rounds available at this time. Check back soon.
        </Typography>}
    </Box>
  );
};

export default ContributeTab;