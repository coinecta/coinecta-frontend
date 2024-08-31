import React, { FC, useEffect, useMemo, useState } from 'react';
import { Box, Typography, useTheme, Paper, IconButton, Button, Alert, Skeleton, List, ListItem, Stack } from '@mui/material';
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
import { countryList } from '@lib/utils/countryList';
import axios from 'axios';
import SalesTerm from './SaleTerm';

export type ContributionRoundWithId = Omit<TContributionRound, 'id'> & { id: number }

type TProRataFormProps = {
  contributionRound: ContributionRoundWithId;
  projectIcon: string;

}

const ProRataForm: FC<TProRataFormProps> = ({
  contributionRound,
  projectIcon,
}) => {

  const { id,
    startDate,
    endDate,
    tokenTarget,
    tokenTicker,
    price,
    currency,
    deposited,
    name,
    projectName,
    projectSlug,
    whitelistSlug,
    recipientAddress,
    restrictedCountries,
    saleTerms } = contributionRound;

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
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        // const response = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.IPGEOLOCATION_API_KEY}`);
        const response = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.IPGEOLOCATION_API_KEY}`);
        const data = response.data;

        if (restrictedCountries.includes(data.country_code2)) {
          setAllowed(false);
        } else {
          setAllowed(true)
        }
      } catch (error) {
        console.error('Error fetching geolocation:', error);
        setAllowed(true)
      }
    };

    fetchUserLocation();
  }, []);

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

  const restrictedCountriesFiltered = countryList.filter(country => restrictedCountries.includes(country.code))

  return (
    <>
      <Grid container spacing={2} alignItems="stretch" sx={{ mb: 1 }}>
        <Grid xs={12} md={7}>
          <Paper variant="outlined" sx={{ px: 2, py: 4, height: '100%' }}>
            <ContributeCard
              remainingTokens={tokenTarget - claimedAmount}
              exchangePrice={price}
              exchangeCurrency={currency}
              whitelisted={whitelistSlug ? whitelisted : true}
              live={isCurrentDateBetween}
              allowed={allowed}
              contributionRound={contributionRound}
            />
          </Paper>
        </Grid>
        <Grid xs={12} md={5}>
          <Stack spacing={2} sx={{ height: '100%' }}>
            {whitelistSlug && <WhitelistResult whitelistStatus={whitelistStatus} sessionStatus={sessionStatus} />}
            <Paper variant="outlined" sx={{ px: 3, py: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', height: '100%' }}>
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
                      Start time
                    </Typography>
                    <Typography variant="h5" sx={{ mt: -1 }}>
                      <TimeRemaining noDay endTime={startDate} />
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="overline">
                      End time
                    </Typography>
                    <Typography variant="h5" sx={{ mt: -1 }}>
                      <TimeRemaining noDay endTime={endDate} />
                    </Typography>
                  </Box>
                </Box>
                <Box>
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
                        {/* <Box>
                    <Typography variant="overline">
                      Total {currency} to be refunded
                    </Typography>
                    <Typography variant="h6" sx={{ mt: -1 }}>
                      {(deposited - depositTarget) > 0 ? (deposited - depositTarget).toLocaleString(undefined, { maximumFractionDigits: 2 }) : 0} {currencySymbol}
                    </Typography>
                  </Box> */}
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
                          && usersTransactions.data.length > 0
                          &&
                          <Box>
                            <Typography variant="overline">
                              Your contribution totals
                            </Typography>

                            {usersTransactions.data.map((total, index) => (
                              <Typography key={index} sx={{
                                fontSize: '0.9rem'
                              }}>
                                {formatNumber(total.amount, '')} {total.currency} ({total.blockchain})
                              </Typography>
                            ))}
                          </Box>
                        }
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
      <Grid container spacing={2} alignItems="stretch" direction={{ xs: 'column', md: 'row' }} sx={{ mb: 1 }}>
        <Grid xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Restricted Countries
            </Typography>
            {restrictedCountries.length > 0
              ? <><Typography>
                Please note, the project is unable to accept contributions from residents of the following countries: {' '}
              </Typography>
                <List dense disablePadding sx={{ listStyleType: 'disc', pl: 2 }}>{restrictedCountriesFiltered.map((country, i) => (
                  <ListItem
                    sx={{
                      display: 'list-item',
                      mb: 0,
                      p: 0,
                      ml: 2
                    }} key={country.code}>{`${country.label}`}</ListItem>
                ))}
                </List>
              </>
              : <Typography>
                There are no country restrictions on this project.
              </Typography>
            }
          </Paper>
        </Grid>
        <Grid xs={12} md={7}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Additional Sale Terms
            </Typography>
            {saleTerms && JSON.parse(saleTerms).map((term: ISalesTerm, index: number) => (
              <SalesTerm key={index} header={term.header} bodyText={term.bodyText} />
            ))}
            {defaultSalesTerms && defaultSalesTerms.map((term: ISalesTerm, index: number) => (
              <SalesTerm key={index} header={term.header} bodyText={term.bodyText} />
            ))}
          </Paper>
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
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
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Disclaimer
        </Typography>
        <Typography sx={{ fontSize: '0.9rem!important', mb: 1 }}>
          You must not access and use this Interface where such access and use is prohibited by applicable law. You are responsible for determining your eligibility under applicable laws to access and use this Interface, and for seeking appropriate professional advice in relation to your circumstances before you access and use the Interface.
        </Typography>
        <Typography sx={{ fontSize: '0.9rem!important', mb: 1 }}>
          We will not be liable to you for any issue, loss, or damage you may suffer or have suffered because of your access and use of the Interface including to participate in a token launch or launch a token, or of the Interface being unavailable at any time for any reason.
        </Typography>
        <Typography sx={{ fontSize: '0.9rem!important', mb: 1 }}>
          Coinecta does not endorse any token launch displayed on the Interface.
        </Typography>
        <Typography sx={{ fontSize: '0.9rem!important', mb: 1 }}>
          Any information displayed, or available via a third-party link, on the Interface does not contain all the information a person may require to make a decision in relation to participation in a token launch. Before making any decision in relation to your launch of a token or participation in a token launch, a person should independently verify the information and obtain independent and professional advice, including taxation, financial and legal advice as appropriate.
        </Typography>
        <Typography sx={{ fontSize: '0.9rem!important', mb: 1 }}>
          Any prior statements by third parties of potential benefits of holding, or dealings with any tokens launched via our Interface, are neither verified or endorsed by us. At all times, we assume that a person acquiring a token via the Interface has no actual, contingent or prospective rights to any such benefits and accordingly should have no hope or expectation of any benefits being provided to them by participation in a token launch.
        </Typography>
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

const defaultSalesTerms: ISalesTerm[] = [
  {
    header: 'CNCT Stakers',
    bodyText: `You must have your stake NFTs in the wallet you contributed from at the closing time of the sale. We will do a snapshot at that time. Please let us know if your stake wallet wasn't reflected in your refund amount before the distribution is sent. `
  }
]