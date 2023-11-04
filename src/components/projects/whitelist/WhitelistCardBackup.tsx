

import React, { ChangeEvent, FC, useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material';
import TextFieldWithButton from '@components/styled-components/TextFieldWithButton';
import TimeRemaining from '@components/TimeRemaining';
import Grid from '@mui/system/Unstable_Grid/Grid';
import { trpc } from '@lib/utils/trpc';

type WhitelistCardProps = {
  name: string;
  slug: string;
  startDateTime: Date;
  endDateTime: Date;
  maxPerSignup?: number | undefined;
  hardCap?: number | undefined;
  externalLink?: string | undefined;
  projectSlug: string;
}

const WhitelistCard: FC<WhitelistCardProps> = ({
  name,
  slug,
  startDateTime,
  endDateTime,
  maxPerSignup,
  hardCap,
  externalLink,
  projectSlug
}) => {
  const [dateStatus, setDateStatus] = useState('');
  const [contributionAmount, setContributionAmount] = useState<string | number | undefined>('Max')
  const [contributionAmountError, setContributionAmountError] = useState(false)
  const [buttonLoading, setButtonLoading] = useState(false)
  const submitWhitelist = trpc.whitelist.submitWhitelist.useMutation()
  const getUserWhitelistSignups = trpc.whitelist.getUserWhitelistSlugs.useQuery({ projectSlug })

  const handleChangeContributionAmount = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^\d]/g, ''); // Remove non-digits

    if (contributionAmount === 'Max') {
      setContributionAmount(numericValue);
    } else if ((numericValue.length === 0 || parseInt(numericValue, 10) > 0)) {
      // Allow empty input to enable deletion and ensure no leading zeros
      setContributionAmount(numericValue);
    }
    if ((maxPerSignup && parseInt(numericValue, 10) > maxPerSignup)) {
      setContributionAmountError(true)
    } else setContributionAmountError(false)
  };

  const setMaxAmount = () => {
    setContributionAmount('Max')
    setContributionAmountError(false)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const currentDate = new Date();
      if (currentDate > startDateTime && currentDate < endDateTime) {
        setDateStatus('started');
      } else if (currentDate < startDateTime) {
        setDateStatus('countdown');
      } else {
        setDateStatus('ended');
      }
    }, 1000); // Update every second

    // Cleanup interval on component unmount
    return () => {
      clearInterval(interval);
    };
  }, [startDateTime, endDateTime]);

  const handleSubmit = async () => {
    if (contributionAmount) {
      setButtonLoading(true)
      const submitResponse = await submitWhitelist.mutateAsync({
        amountRequested: contributionAmount.toString(),
        whitelistSlug: slug
      })
      setButtonLoading(false)
      if (submitResponse.status === 'success') {
        console.log(submitResponse.message)
      }
      else {
        console.log(submitResponse.message)
      }
    }
  }

  return (
    <>
      <Paper
        variant="outlined"
        sx={{
          borderRadius: '12px',
          p: 2,
          gap: 2,
          mb: 2
        }}
      >
        <Grid container spacing={2} sx={{
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Grid xs={12} md={5}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: { xs: 'center', md: 'flex-start' } }}>
              <Typography variant="h5">
                {name}
              </Typography>

              {dateStatus === 'countdown'
                ? <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                  <Typography component="span">Opens in&nbsp;</Typography>
                  <TimeRemaining endTime={startDateTime} />
                </Box>
                : dateStatus === 'started'
                  ? <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    <Typography component="span">Closes in&nbsp;</Typography>
                    <TimeRemaining endTime={endDateTime} />
                  </Box>
                  : dateStatus === 'ended'
                    ? 'This round is closed'
                    : 'Loading...'}
            </Box>
          </Grid>
          {externalLink
            ? (
              <Grid xs={12} md={7} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
                <Button
                  variant="contained"
                  disabled={dateStatus !== 'started' || contributionAmountError}
                  color="secondary"
                  sx={{
                    textTransform: 'none',
                    fontSize: '20px',
                    fontWeight: 600,
                    borderRadius: '12px'
                  }}
                  href={externalLink}
                  target="_blank"
                >
                  Go to whitelist
                </Button>
              </Grid>
            ) :
            getUserWhitelistSignups.data?.data
              && getUserWhitelistSignups.data?.data.includes(slug) ? (
              <Grid xs={12} md={7} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
                <Button
                  variant="contained"
                  disabled
                  color="secondary"
                  sx={{
                    textTransform: 'none',
                    fontSize: '20px',
                    fontWeight: 600,
                    borderRadius: '12px'
                  }}
                >
                  Already signed up
                </Button>
              </Grid>
            )
              : (
                <>
                  <Grid xs={12} md={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                      <Typography>
                        Amount requested in USD:
                      </Typography>
                      <TextFieldWithButton
                        id="amount-requested"
                        secondaryColor
                        error={contributionAmountError}
                        helperText={contributionAmountError
                          && `Please reduce below $${maxPerSignup?.toLocaleString()}`}
                        buttonText="Max"
                        buttonFunction={() => setMaxAmount()}
                        value={contributionAmount}
                        onChange={handleChangeContributionAmount}
                      />
                    </Box>
                  </Grid>
                  <Grid xs={12} md={3} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                      <Button
                        variant="contained"
                        disabled={dateStatus !== 'started' || contributionAmountError || buttonLoading}
                        color="secondary"
                        onClick={handleSubmit}
                        sx={{
                          textTransform: 'none',
                          fontSize: '20px',
                          fontWeight: 600,
                          borderRadius: '12px'
                        }}
                      >
                        Submit Whitelist
                      </Button>
                      {buttonLoading &&
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            height: '30px'
                          }}
                        >
                          <CircularProgress size={30} />
                        </Box>
                      }
                    </Box>
                  </Grid>
                </>
              )}

        </Grid>
      </Paper>
    </>
  );
};

export default WhitelistCard;
