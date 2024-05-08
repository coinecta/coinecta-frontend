import { Avatar, Box, Button, Checkbox, FormControlLabel, Typography, useTheme } from '@mui/material';
import React, { ChangeEvent, FC, useState } from 'react';
import TokenInput from './TokenInput';
import Link from '@components/Link';
import ContributeConfirm from './ContributeConfirm';
import { useWalletContext } from '@contexts/WalletContext';

interface IContributeCardProps {
  projectName: string;
  projectIcon: string;
  roundName: string;
  tokenTicker: string;
  remainingTokens: number;
  exchangeRate: number;
  whitelisted: boolean;
  live: boolean;
  contributionRoundId: number;
  recipientAddress: string | null;
  allowed: boolean;
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
  live,
  recipientAddress,
  allowed
}) => {
  const { sessionData } = useWalletContext()

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
            I agree to the&nbsp;<Link href="/terms" target="_blank">Terms of Use</Link> and <Link href="/privacy" target="_blank">Privacy Policy</Link>.
          </Typography>}
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
        <Box sx={{ width: '100%', textAlign: 'center' }}>
          <Button
            variant="contained"
            color="secondary"
            disabled={
              !termsCheck ||
              !whitelisted ||
              !live ||
              !recipientAddress ||
              Number(inputValue) === 0 ||
              sessionData == null ||
              !allowed
            }
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
        {!recipientAddress &&
          <Typography color="error" sx={{ mt: 1, fontSize: '0.9rem!important' }}>
            Contribution form error, please notify support if you are trying to contribute.
          </Typography>
        }
        {!allowed &&
          <Typography color="error" sx={{ mt: 1, fontSize: '0.9rem!important' }}>
            We apologize, but we are unable to accept contributions from the restricted countries listed above.
          </Typography>
        }
        {sessionData == null &&
          <Box sx={{ textAlign: 'center' }}>
            <Typography color="error" sx={{ mt: 1, fontSize: '0.9rem!important' }}>
              Please sign in to contribute
            </Typography>
            <Typography sx={{ mt: 1, fontSize: '0.9rem!important' }}>
              The wallet you send funds from doesn&apos;t need to be the same wallet you sign-in from.
            </Typography>
            <Typography sx={{ mt: 1, fontSize: '0.9rem!important' }}>
              LEDGER USERS: Sign in with another wallet then contribute from your Ledger.
            </Typography>
          </Box>
        }
      </Box>
      {!whitelisted && <Box>
        <Typography color="text.secondary" sx={{ fontSize: '0.9rem!important', fontStyle: 'italic' }}>
          You must be whitelisted to contribute.
        </Typography>
      </Box>}
      {recipientAddress !== null &&
        <ContributeConfirm
          open={openContribution}
          setOpen={setOpenContribution}
          paymentAmount={inputValue}
          receiveAmount={outputValue}
          receiveCurrency={tokenTicker}
          contributionRoundId={contributionRoundId}
          recipientAddress={recipientAddress}
        />
      }
    </Box>
  );
};

export default ContributeCard;