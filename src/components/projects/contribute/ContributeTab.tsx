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

const ContributeTab: FC<ContributeTabProps> = ({ projectName, projectIcon }) => {
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const forms: any[] = [
    // {
    //   roundName: 'Public Round',
    //   saleType: 'pro-rata',
    //   startDate: new Date(1698835989000),
    //   endDate: new Date(1701610416000),
    //   tokenTicker: 'CNCT',
    //   tokenTarget: 20000000,
    //   currency: 'ADA',
    //   price: 0.12,
    //   deposited: 2213516,
    // },
    // {
    //   roundName: 'Ergopad Staker Round',
    //   saleType: 'pro-rata',
    //   startDate: new Date(1701228385000),
    //   endDate: new Date(1701314785000),
    //   tokenTicker: 'CNCT',
    //   tokenTarget: 5000000,
    //   currency: 'ADA',
    //   price: 0.12,
    //   deposited: 0,
    // }
  ]

  return (
    <Box sx={{ mb: 2 }}>
      {forms.length > 0
        ? <>
          <ContainedTabs
            value={tabValue}
            onChange={handleChangeTab}
            aria-label="styled tabs example"
          >
            {forms.map((round, i) => (
              <ContainedTab key={`tab-${i}`} label={round.roundName} />
            ))}
          </ContainedTabs>
          <Box sx={{ my: 2 }}>
            {forms.map((round, i) => (
              tabValue === i &&
              <ProRataForm key={`form-${i}`} {...round} projectName={projectName} projectIcon={projectIcon} />
            ))}
          </Box></>
        : <Typography>
          No contribution forms available at this time. Check back soon.
        </Typography>}

    </Box>
  );
};

export default ContributeTab;
