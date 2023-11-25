import React, { FC, useEffect, useState } from 'react';
import { Box, Typography, useTheme, Paper, IconButton, Button, Alert } from '@mui/material';
import TimeRemaining from '@components/TimeRemaining';
import { LinearProgressStyled } from '@components/styled-components/LinearProgress';
import Grid from '@mui/system/Unstable_Grid/Grid';
import { getSymbol } from '@lib/utils/currencies';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import ContributeCard from './ContributeCard';
import { trpc } from '@lib/utils/trpc';
import { useWalletContext } from '@contexts/WalletContext';

const ProRataForm: FC<TProRataFormProps> = ({
  startDate,
  endDate,
  tokenTarget,
  tokenTicker,
  price,
  currency,
  deposited,
  name,
  projectName,
  projectIcon,
  projectSlug,
  whitelistSlug
}) => {
  const theme = useTheme()
  const { sessionStatus } = useWalletContext()
  const currencySymbol = getSymbol(currency)
  const priceToCurrency = `1 ${currency} = ${(1 / price).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })} ${tokenTicker}`
  const [priceSet, setPriceSet] = useState<string>(priceToCurrency)
  const getUserWhitelistSignups = trpc.whitelist.getUserWhitelistSlugs.useQuery({ projectSlug })
  const [whitelistStatus, setWhitelistStatus] = useState<"pending" | "whitelisted" | "notWhitelisted">('pending');
  const [whitelisted, setWhitelisted] = useState(false)
  const currentDate = new Date();
  const isCurrentDateBetween = currentDate >= startDate && currentDate <= endDate;

  useEffect(() => {
    if (sessionStatus === 'authenticated' && getUserWhitelistSignups.data?.data) {
      const isWhitelisted = getUserWhitelistSignups.data?.data.some(item => whitelistSlug === item);
      if (isWhitelisted) {
        setWhitelistStatus('whitelisted')
        setWhitelisted(true)
      }
      else {
        setWhitelistStatus('notWhitelisted')
        setWhitelisted(false)
      }
    }
    else {
      setWhitelistStatus('pending')
      setWhitelisted(false)
    }
  }, [getUserWhitelistSignups.data, sessionStatus])

  const claimedAmount = deposited / price
  const depositTarget = tokenTarget * price

  const handleFlipPrice = () => {
    if (priceSet === priceToCurrency) {
      setPriceSet(`1 ${tokenTicker} = ${price} ${currency}`)
    }
    else setPriceSet(priceToCurrency)
  }

  return (
    <>
      <Grid container spacing={2} alignItems="stretch" direction={{ xs: 'column-reverse', md: 'row' }}>
        <Grid xs={12} md={7}>
          <Paper variant="outlined" sx={{ px: 2, py: 4, height: '100%' }}>
            <ContributeCard
              projectName={projectName}
              projectIcon={projectIcon}
              roundName={name}
              tokenTicker={tokenTicker}
              remainingTokens={tokenTarget - claimedAmount}
              exchangeRate={1 / price}
              whitelisted={whitelisted}
              live={isCurrentDateBetween}
            />
          </Paper>
        </Grid>
        <Grid xs={12} md={5}>
          <WhitelistResult whitelistStatus={whitelistStatus} sessionStatus={sessionStatus} />
          <Paper variant="outlined" sx={{ px: 3, py: 2 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around',
                mb: 2,
                textAlign: 'center'
              }}
            >
              <Box>
                <Typography variant="overline">
                  Round open
                </Typography>
                <Typography variant="h5" sx={{ mt: -1 }}>
                  <TimeRemaining noDay endTime={startDate} />
                </Typography>
              </Box>
              <Box>
                <Typography variant="overline">
                  Round closed
                </Typography>
                <Typography variant="h5" sx={{ mt: -1 }}>
                  <TimeRemaining noDay endTime={endDate} />
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', mb: 2, }}>
              <Box>
                <Typography variant="overline">
                  {tokenTicker} Claimed
                </Typography>
                <Typography variant="h6" sx={{ mt: -1 }}>
                  {(claimedAmount > tokenTarget ? tokenTarget : claimedAmount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="overline">
                  {tokenTicker} Target
                </Typography>
                <Typography variant="h6" sx={{ mt: -1 }}>
                  {tokenTarget.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </Typography>
              </Box>
            </Box>
            <Box sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
              gap: 1
            }}>
              <LinearProgressStyled
                variant="determinate"
                value={((claimedAmount / tokenTarget) * 100) <= 100 ? ((claimedAmount / tokenTarget) * 100) : 100}
                barColorStart={theme.palette.secondary.main}
                barColorEnd={theme.palette.secondary.light}
                sx={{ width: '100%' }}
                bgColor={theme.palette.divider}
              />
              <Typography sx={{ fontWeight: '700' }}>
                {(claimedAmount / tokenTarget * 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}%
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                mb: 2
              }}
            >
              <Box>
                <Typography variant="overline">
                  Price
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: -1 }}>
                  <Box>
                    <Typography variant="h6">
                      {priceSet}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    color="inherit"
                    sx={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '3px',
                      background: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      ml: 1,
                      minWidth: '0!important',
                      p: 0
                    }}
                    onClick={handleFlipPrice}
                  >
                    <AutorenewIcon sx={{
                      width: '20px',
                      height: '20px',
                      color: theme.palette.text.secondary
                    }} />
                  </Button>
                </Box>
              </Box>
              <Box>
                <Typography variant="overline">
                  {currency} Deposited
                </Typography>
                <Typography variant="h6" sx={{ mt: -1 }}>
                  {(deposited).toLocaleString(undefined, { maximumFractionDigits: 2 })} {currencySymbol}
                </Typography>
              </Box>
              <Box>
                <Typography variant="overline">
                  {currency} to be refunded
                </Typography>
                <Typography variant="h6" sx={{ mt: -1 }}>
                  {(deposited - depositTarget) > 0 ? (deposited - depositTarget).toLocaleString(undefined, { maximumFractionDigits: 2 }) : 0} {currencySymbol}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default ProRataForm;

const WhitelistResult: FC<{ whitelistStatus: 'whitelisted' | 'notWhitelisted' | 'pending', sessionStatus: "loading" | "authenticated" | "unauthenticated" }> = ({ whitelistStatus, sessionStatus }) => {
  if (sessionStatus === 'loading') {
    return <Alert
      variant="outlined"
      severity="info"
      sx={{ mb: 2, justifyContent: 'center', alignItems: 'center' }}
    >
      Loading whitelist status...
    </Alert>
  }
  else {
    let content;
    switch (whitelistStatus) {
      case 'whitelisted':
        content = (
          <Alert
            variant="outlined"
            severity="success"
            sx={{ mb: 2, justifyContent: 'center', alignItems: 'center' }}
          >
            Your account is whitelisted.
          </Alert>
        );
        break;
      case 'notWhitelisted':
        content = (
          <Alert
            variant="outlined"
            severity="error"
            sx={{ mb: 2, justifyContent: 'center', alignItems: 'center' }}
          >
            Your account is not whitelisted.
          </Alert>
        );
        break;
      case 'pending':
        content = (
          <Alert
            variant="outlined"
            severity="warning"
            sx={{ mb: 2, justifyContent: 'center', alignItems: 'center' }}
          >
            Please sign in to verify status
          </Alert>
        );
        break;
      default:
        content = null;
    }

    return <>{content}</>;
  }
};