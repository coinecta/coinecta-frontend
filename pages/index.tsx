import React, { FC, useRef } from 'react';
import type { NextPage } from 'next'
import {
  Container,
  Typography,
  useTheme,
  useMediaQuery,
  Grid,
  Button,
  Card,
  CardActions,
  CardHeader,
  CardContent,
  CardMedia,
  Box,
  Stack,
  IconButton
} from '@mui/material'
import ErgopadLogo from '@components/svgs/ErgopadLogo';
import BlockheadsLogo from '@components/svgs/BlockheadsLogo';
import TeddyswapLogo from '@components/svgs/TeddyswapLogo';
import PaideiaLogo from '@components/svgs/PaideiaLogo';
import { v4 as uuidv4 } from 'uuid';
import Projects from '@components/landing/Projects';

const Home: NextPage = () => {
  const theme = useTheme()
  const upMd = useMediaQuery(theme.breakpoints.up('md'))

  return (
    <>
      {/* Hero section */}
      <Container
        sx={{
          pt: '20vh',
          minHeight: '100vh',
          // mb: 12
        }}
      >
        <Box maxWidth="md" sx={{ mx: 'auto' }}>
          <Typography
            variant="h2"
            fontWeight={600}
            align="center"
            gutterBottom
          >
            Unlock the Cardano Community&apos;s Full Potential
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph>
            We believe the community is one of Cardano&apos;s greatest strengths. Working together, we can grow the ecosystem to provide inclusive financial services to the entire globe.
          </Typography>
          <Stack
            sx={{ pt: 3 }}
            direction="row"
            spacing={2}
            justifyContent="center"
          >
            <Button variant="contained">Support an IDO</Button>
            <Button variant="outlined">Read the docs</Button>
          </Stack>
          <Typography variant="body1" sx={{ pt: 12, textTransform: 'uppercase' }} align="center" color="text.secondary" paragraph>
            In partnership with:
          </Typography>
        </Box>
        <Box maxWidth='lg' sx={{ mx: 'auto' }}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <TeddyswapLogo sx={{ fontSize: '160px', height: '100px' }} />
            </Grid>
            <Grid item>
              <ErgopadLogo sx={{ fontSize: '160px', height: '100px' }} />
            </Grid>
            <Grid item>
              <PaideiaLogo sx={{ fontSize: '140px', height: '100px' }} />
            </Grid>
            <Grid item>
              <BlockheadsLogo sx={{ fontSize: '160px', height: '100px' }} />
            </Grid>
          </Grid>
        </Box>
      </Container>
      {/* End hero section */}


      {/* How it works */}
      <Container sx={{ mb: 24 }}>
        <Grid container sx={{ mb: 3 }}>
          <Grid item md={1}></Grid>
          <Grid item md={5}>
            <Typography
              variant="h2"
              fontWeight={600}

              gutterBottom
            >
              How it works
            </Typography>
          </Grid>
          <Grid item md={6}></Grid>
        </Grid>
        <Grid container sx={{ mb: 6 }}>
          <Grid item md={2}></Grid>
          <Grid item md={5}>
            <Typography variant="h4" fontWeight={600}>Crowd-funding With Benefits</Typography>
            <Typography variant="subtitle1">Rather than being backed by a few VCs, we believe blockchain projects should be funded by the community, and the community should profit from their successes. By investing in IDOs, you get in before the token is listed and receive preferential pricing as appreciation for your faith in the project. </Typography>
          </Grid>
          <Grid item md={5}></Grid>
        </Grid>
        <Grid container>
          <Grid item md={3}></Grid>
          <Grid item md={8}>
            <Grid container spacing={6}>
              <Grid item md={6}>
                <Typography variant="h5" fontWeight={600}>1. Stake The Token</Typography>
                <Typography variant="body2">To participate, first you have to get the Coinnecta Finance token and stake it to reach a staking tier. Your tier will represent your pool weight in IDOs. </Typography>
                <Grid container spacing={3}>
                  <Grid item>
                    <Button variant="contained" color="secondary">Get CNCT</Button>
                  </Grid>
                  <Grid item>
                    <Button variant="outlined" color="secondary">Stake Now</Button>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item md={6}>
                <Typography variant="h5" fontWeight={600}>2. Whitelist For IDOs</Typography>
                <Typography variant="body2">Keep an eye out for IDOs you like, and whitelist to invest. You will be approved for a specific number of tokens based on your staking tier weight. </Typography>
                <Button variant="contained" color="secondary">View Projects</Button>
              </Grid>
              <Grid item md={6}>
                <Typography variant="h5" fontWeight={600}>3. Contribute</Typography>
                <Typography variant="body2">You will receive whitelist tokens in your wallet and can use those to contribute to the project. Send ADA or DJED to the Vesting Contract to receive your vesting key which will unlock tokens over time</Typography>
                <Button variant="contained" color="secondary">Learn More</Button>
              </Grid>
              <Grid item md={6}>
                <Typography variant="h5" fontWeight={600}>4. Redeem</Typography>
                <Typography variant="body2">Each seed round will have a specific vesting period, depending on how deep the discount is. You can redeem your tokens as they unlock on the Redeem panel. </Typography>
                <Button variant="contained" color="secondary">Redeem Now</Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item md={1}></Grid>
        </Grid>
      </Container>
      {/* END How it works */}

      <Projects />

      {/* Whos it for? */}
      <Container sx={{ mb: 14 }}>
        <Typography
          variant="h5"
          fontWeight={600}
          align="center"
          gutterBottom
          color="primary"
          textTransform="uppercase"
          sx={{ mb: 0, lineHeight: 1 }}
        >
          Who&apos;s It For
        </Typography>
        <Box maxWidth="md" sx={{ margin: 'auto', textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" fontWeight={600}>
            We connect investors and creators to fuel ecosystem growth and deliver innovative new dApps
          </Typography>
        </Box>

        <Grid container spacing={12} sx={{ mb: 3, mx: 'auto' }} maxWidth="lg">
          <Grid item md={6}>
            <Typography variant="h4">
              Investors
            </Typography>
            <Typography variant="body2">
              We believe that when a team raises funds for their project, there should be a great deal of accountability to their community. We use smart contracts to help enforce transparency, honesty, and add rugpull resistance.
            </Typography>
            <Typography variant="body2">
              Vested tokens are locked on-chain and released based on the schedule set at the outset. All the details are outlined clearly, so that investors can make informed decisions.
            </Typography>
            <Typography variant="body2">
              Teams are encouraged to use their tokens for governance, and operate as a DAO when possible, to give the community an opportunity to vote on expendatures.
            </Typography>
            <Typography variant="body2">
              In addition, we will draw on our own experience to vet projects before approving them to IDO on Coinecta. We encourage teams to put together a roadmap that clearly outlines their goals and gives consideration to the amount of funds needed to achieve them. 
            </Typography>
            <Grid container spacing={3}>
              <Grid item>
                <Button variant="contained" color="secondary">Get Started</Button>
              </Grid>
              <Grid item>
                <Button variant="outlined" color="secondary">Read the Docs</Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item md={6}>
            <Typography variant="h4">
              Teams
            </Typography>
            <Typography variant="body2">
              We help secure funding to turn your aspirations into achievements. Our dedicated efforts ensure you receive the necessary resources to manifest your vision successfully.
            </Typography>
            <Typography variant="body2">
              When needed, we can offer consultation on project management and tokenomics design. Through our community connections, we can often help fill in the gaps in team structure. 
            </Typography>
            <Button variant="contained" color="secondary">Apply for IDO</Button>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}

export default Home


