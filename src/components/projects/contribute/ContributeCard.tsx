import { Avatar, Box, Button, Checkbox, FormControlLabel, Typography, useTheme } from '@mui/material';
import React, { ChangeEvent, FC, useState } from 'react';
import TokenInput from './TokenInput';
import Link from '@components/Link';
import ContributeConfirm from './ContributeConfirm';

interface IContributeCardProps {
  projectName: string;
  projectIcon: string;
  roundName: string;
  tokenTicker: string;
  remainingTokens: number;
  exchangeRate: number;
  whitelisted: boolean;
  live: boolean;
  contributionRoundId: number
}

const ContributeCard: FC<IContributeCardProps> = ({
  projectName,
  projectIcon,
  roundName,
  contributionRoundId,
  tokenTicker,
  remainingTokens,
  exchangeRate,
  whitelisted,
  live
}) => {
  const theme = useTheme()
  const [termsCheck, setTermsCheck] = useState(false)
  const [openContribution, setOpenContribution] = useState(false)
  const [inputValue, setInputValue] = useState('');
  const [outputValue, setOutputValue] = useState('');

  const handleCheckTerms = (e: ChangeEvent) => {
    setTermsCheck(!termsCheck)
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      height: '100%',
      justifyContent: 'space-between'
    }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h3" sx={{ mb: 1 }}>
          {projectName}
        </Typography>
        <Typography variant="h4" sx={{ mb: 3 }}>
          {roundName} contribution
        </Typography>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ mb: 2 }}>
          <TokenInput
            outputTokenTicker={tokenTicker}
            remainingTokens={remainingTokens}
            exchangeRate={exchangeRate}
            inputValue={inputValue}
            setInputValue={setInputValue}
            outputValue={outputValue}
            setOutputValue={setOutputValue}
          />
        </Box>
        <FormControlLabel
          control={
            <Checkbox checked={termsCheck} onChange={handleCheckTerms} name="terms" size="small" color="secondary" />
          }
          sx={{ mb: 2 }}
          label={<Typography sx={{ fontSize: '1rem !important', color: theme.palette.text.secondary }}>
            I agree to the&nbsp;<Link href="/terms" target="_blank">Terms &amp; Conditions</Link> and <Link href="/privacy" target="_blank">Privacy Policy</Link>.
          </Typography>}
        />
      </Box>
      <Box>
        <Button
          variant="contained"
          color="secondary"
          disabled={!termsCheck || !whitelisted || !live}
          sx={{
            textTransform: 'none',
            fontSize: '20px',
            fontWeight: 600,
            borderRadius: '6px'
          }}
          onClick={() => setOpenContribution(true)}
        >
          Contribute now
        </Button>
      </Box>
      {!whitelisted && <Box>
        <Typography color="text.secondary" sx={{ fontSize: '0.9rem!important', fontStyle: 'italic' }}>
          You must be whitelisted to contribute
        </Typography>
      </Box>}
      <ContributeConfirm
        open={openContribution}
        setOpen={setOpenContribution}
        paymentAmount={inputValue}
        receiveAmount={outputValue}
        receiveCurrency={tokenTicker}
        contributionRoundId={contributionRoundId}
      />
    </Box>
  );
};

export default ContributeCard;