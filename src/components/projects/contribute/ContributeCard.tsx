import { Avatar, Box, Button, Typography } from '@mui/material';
import React, { FC } from 'react';
import TokenInput from './TokenInput';

interface IContributeCardProps {
  projectName: string;
  projectIcon: string;
  roundName: string;
  tokenTicker: string;
  remainingTokens: number;
  exchangeRate: number;
}

const ContributeCard: FC<IContributeCardProps> = ({
  projectName,
  projectIcon,
  roundName,
  tokenTicker,
  remainingTokens,
  exchangeRate
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="overline" sx={{ mb: 2 }}>
        Contribute to the {projectName} {roundName}
      </Typography>
      <Box sx={{ mb: 2 }}>
        <TokenInput outputTokenTicker={tokenTicker} remainingTokens={remainingTokens} exchangeRate={exchangeRate} />
      </Box>
      <Button
        variant="contained"
        color="secondary"
        sx={{
          textTransform: 'none',
          fontSize: '20px',
          fontWeight: 600,
          borderRadius: '6px'
        }}
      >
        Contribute now
      </Button>
    </Box>
  );
};

export default ContributeCard;