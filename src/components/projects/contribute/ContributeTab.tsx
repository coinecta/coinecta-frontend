import React, { FC, useState } from 'react';
import { Collapse, Box, Typography, useTheme } from '@mui/material';
import { trpc } from '@lib/utils/trpc';
import { useWalletContext } from '@contexts/WalletContext';
import { calculatePageRange } from '@server/utils/userRewardsFiso';
import { ContainedTab, ContainedTabs } from '@components/styled-components/ContainedTabs';
import TimeRemaining from '@components/TimeRemaining';
import { LinearProgressStyled } from '@components/styled-components/LinearProgress';
import ProRataForm from './ProRataForm';

type ContributeTabProps = {
  projectName: string;
  projectIcon: string;
  projectSlug: string;
}

const ContributeTab: FC<ContributeTabProps> = ({ projectName, projectIcon, projectSlug }) => {
  const theme = useTheme()
  const { data: rounds } = trpc.contributions.getContributionRoundsByProjectSlug.useQuery(
    { projectSlug: projectSlug || '' },
    { enabled: !!projectSlug }
  );

  const [tabValue, setTabValue] = useState(0)
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
              <ProRataForm key={`form-${i}`} {...round} projectName={projectName} projectIcon={projectIcon} />
            ))}
          </Box></>
        : <Typography>
          No contribution rounds available at this time. Check back soon.
        </Typography>}

    </Box>
  );
};

export default ContributeTab;
