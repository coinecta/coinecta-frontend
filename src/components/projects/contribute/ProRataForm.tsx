import React, { FC, useEffect, useMemo, useState } from 'react';
import { Box, Typography, useTheme, Paper, IconButton, Button, Alert, Skeleton } from '@mui/material';
import TimeRemaining from '@components/TimeRemaining';
import { LinearProgressStyled } from '@components/styled-components/LinearProgress';
import Grid from '@mui/system/Unstable_Grid/Grid';
import { getSymbol } from '@lib/utils/currencies';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import ContributeCard from './ContributeCard';
import { trpc } from '@lib/utils/trpc';
import { useWalletContext } from '@contexts/WalletContext';
import { formatNumber, formatNumberDecimals } from '@lib/utils/assets';
import UnlabelledTextField from '@components/styled-components/UnlabelledTextField';
import { checkPoolWeight } from '@lib/utils/checkPoolWeight';
import { useAlert } from '@contexts/AlertContext';
import { getShorterAddress } from '@lib/utils/general';

const ProRataForm: FC<TProRataFormProps> = ({
  id,
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
  const usersTransactions = trpc.contributions.sumTransactions.useQuery({ contributionId: id })
  const { addAlert } = useAlert()


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

  const poolData = trpc.contributions.contributedPoolWeight.useQuery({
    contributionId: id
  })

  const [userPoolWeight, setUserPoolWeight] = useState<number | undefined>(undefined)
  const [userStakedAmount, setUserStakedAmount] = useState<number | undefined>(undefined)
  const [customAddressText, setCustomAddressText] = useState('')

  const handleCheckPoolWeight = async (address: string) => {
    const weight = await checkPoolWeight(address)
    setUserPoolWeight(weight.cummulativeWeight)
    setUserStakedAmount(Number(weight.totalStake))
  }

  const handleChangeCustomAddress = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomAddressText(e.target.value)
  }

  const getWallets = trpc.user.getWallets.useQuery()
  const wallets = useMemo(() => getWallets.data && getWallets.data.wallets, [getWallets]);
  const [usersStake, setUsersStake] = useState<IPoolWeightDataItem[]>([])
  useEffect(() => {
    if (wallets && poolData.data?.apiResponse?.data && poolData.data?.apiResponse?.data.length > 0) {
      const walletList = wallets.map((wallet) => wallet.changeAddress)
      setUsersStake(poolData.data?.apiResponse?.data.filter(item => walletList.includes(item.address)))
    }
  }, [wallets, poolData.data?.apiResponse])

  return (
    <>
      <Grid container spacing={2} alignItems="stretch" direction={{ xs: 'column-reverse', md: 'row' }} sx={{ mb: 2 }}>
        <Grid xs={12} md={7}>
          <Paper variant="outlined" sx={{ px: 2, py: 4, height: '100%' }}>
            <ContributeCard
              projectName={projectName}
              projectIcon={projectIcon}
              roundName={name}
              tokenTicker={tokenTicker}
              remainingTokens={tokenTarget - claimedAmount}
              exchangeRate={1 / price}
              whitelisted={whitelistSlug ? whitelisted : true}
              live={isCurrentDateBetween}
              contributionRoundId={id}
            />
          </Paper>
        </Grid>
        <Grid xs={12} md={5}>
          {whitelistSlug && <WhitelistResult whitelistStatus={whitelistStatus} sessionStatus={sessionStatus} />}
          <Paper variant="outlined" sx={{ px: 3, py: 2, height: '100%' }}>
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
            <Grid container>
              <Grid xs={12} sm={6}>
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
                      Total {currency} Deposited
                    </Typography>
                    <Typography variant="h6" sx={{ mt: -1 }}>
                      {(deposited).toLocaleString(undefined, { maximumFractionDigits: 2 })} {currencySymbol}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="overline">
                      Total {currency} to be refunded
                    </Typography>
                    <Typography variant="h6" sx={{ mt: -1 }}>
                      {(deposited - depositTarget) > 0 ? (deposited - depositTarget).toLocaleString(undefined, { maximumFractionDigits: 2 }) : 0} {currencySymbol}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid xs={12} sm={6}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    mb: 2,
                    textAlign: { xs: 'left', sm: 'right' }
                  }}
                >
                  <Box>
                    <Typography variant="overline">
                      Pool Weight of Contributors
                    </Typography>
                    <Typography variant="h6" sx={{ mt: -1 }}>
                      {poolData.isLoading ?
                        <Skeleton variant="text" />
                        : poolData.data?.totalPoolWeight !== undefined
                          ? formatNumber(poolData.data?.totalPoolWeight, '')
                          : 'Error loading'}
                    </Typography>
                  </Box>
                  {usersTransactions.data !== undefined
                    && usersTransactions.data > 0
                    &&
                    <Box>
                      <Typography variant="overline">
                        Your contribution
                      </Typography>

                      <Typography variant="h6" sx={{ mt: -1 }}>
                        {formatNumber(usersTransactions.data, '')} ₳
                      </Typography>
                    </Box>
                  }
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      <Paper variant="outlined" sx={{ px: 2, py: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Pool weight checker
        </Typography>
        {usersStake.length > 0 &&
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6">Connected wallets</Typography>
            {usersStake.map((stakeKey) => (
              <Box key={stakeKey.address}>
                Address: {getShorterAddress(stakeKey.address, 8)}, Stake amount: {formatNumberDecimals(Number(stakeKey.totalStake), 4)}, Pool Weight: {formatNumberDecimals(stakeKey.cummulativeWeight)}
              </Box>
            ))}
          </Box>}
        <Typography variant="h6">Pool Weight By Address</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid xs>
            <UnlabelledTextField
              id="wallet-address"
              variant="filled"
              value={customAddressText}
              onChange={handleChangeCustomAddress}
              fullWidth
              placeholder="Paste an address to check pool weight"
            />
          </Grid>
          <Grid xs="auto">
            <Button
              variant="contained"
              onClick={() => handleCheckPoolWeight(customAddressText)}>
              Submit
            </Button>
          </Grid>
          <Grid xs="auto">
            <Button variant="outlined"
              onClick={() => {
                setCustomAddressText('')
              }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
        {userPoolWeight !== undefined && customAddressText &&
          <Box>
            Address: {getShorterAddress(customAddressText, 8)}, Stake amount: {formatNumberDecimals(Number(userStakedAmount), 4)}, Pool weight: {formatNumberDecimals(Number(userPoolWeight))}
          </Box>
        }
      </Paper>
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