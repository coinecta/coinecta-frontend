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

}

// phase tabs

// total raise, open timer, close timer

// progress bar

// details: 
//   - target
//   - amount deposited
//   - amoutn of tokens claimed
//   - tokenomics info
//   - price summary

// individual user's details
//   - my amount deposited
//   - my percent share of the total
//   - if its a pool-weight, my pool weight
//   - my guaranteed allocation

// contribute
//   - terms and conditions
//   - amount available in your wallet
//   - amount to deposit
//   - amount of token you'll get
//   - deposit button
//   - bonus? 

const ContributeTab: FC<ContributeTabProps> = () => {
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <ContainedTabs
        value={tabValue}
        onChange={handleChangeTab}
        aria-label="styled tabs example"
      >
        <ContainedTab label="Public Round" />
        <ContainedTab label="Ergopad Stakers Round" />
      </ContainedTabs>
      <Box sx={{ my: 2 }}>

        {tabValue === 0 && <Box sx={{ p: 3 }}>
          <ProRataForm /></Box>
        }
        {tabValue === 1 && <Box sx={{ p: 3 }}>Coming soon</Box>}
      </Box>
    </Box>
  );
};

export default ContributeTab;
