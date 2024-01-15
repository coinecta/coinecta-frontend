import React, { FC } from 'react';
import Distribution from './Distribution';
import LinearTokenomics from './LinearTokenomics';
import Grid from '@mui/system/Unstable_Grid/Grid';
import { useTheme, Typography, Box, Paper, } from '@mui/material';
import Link from '@components/Link';
import Swap from '@dexhunterio/swaps'
import '@dexhunterio/swaps/lib/assets/style.css'
import { ensureHexColor } from '@lib/utils/general';
import { toTokenId } from '@lib/utils/assets';

const TokenomicsTab: FC<{ tokenomics: TTokenomics }> = ({ tokenomics }) => {
  const theme = useTheme()
  return (
    <>
      <Typography variant="h4" fontWeight="700" sx={{ mb: 2 }}>
        Tokenomics
      </Typography>
      <Box sx={{ mb: 3 }}>
        <Paper variant="outlined">
          <Grid container>
            <Grid xs={6} sx={{ p: 1, textAlign: 'right' }}>
              <Typography color="text.secondary">
                Token Name:
              </Typography>
            </Grid>
            <Grid xs={6} sx={{ p: 1 }}>
              <Typography
                sx={{ fontWeight: '700' }}
              >
                {tokenomics.tokenName}
              </Typography>
            </Grid>
          </Grid>

          <Grid container sx={{ background: theme.palette.background.default }}>
            <Grid xs={6} sx={{ p: 1, textAlign: 'right' }}>
              <Typography color="text.secondary">
                Token Ticker:
              </Typography>
            </Grid>
            <Grid xs={6} sx={{ p: 1 }}>
              <Typography
                sx={{ fontWeight: '700' }}
              >
                {tokenomics.tokenTicker}
              </Typography>
            </Grid>
          </Grid>

          <Grid container>
            <Grid xs={6} sx={{ p: 1, textAlign: 'right' }}>
              <Typography color="text.secondary">
                Max Supply:
              </Typography>
            </Grid>
            <Grid xs={6} sx={{ p: 1 }}>
              <Typography
                sx={{ fontWeight: '700' }}
              >
                {tokenomics.totalTokens.toLocaleString(navigator.language, {
                  maximumFractionDigits: 0,
                })}
              </Typography>
            </Grid>
          </Grid>
          <Grid container>
            <Grid xs={6} sx={{ p: 1, textAlign: 'right', mb: 1 }}>
              <Typography color="text.secondary">
                Policy ID:
              </Typography>
            </Grid>
            <Grid xs={6} sx={{ p: 1 }}>
              <Typography
                sx={{
                  fontWeight: '700',
                  display: 'block',
                  overflow: 'hidden'
                }}
              >
                <Link
                  sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}
                  href={`https://cardanoscan.io/tokenPolicy/${tokenomics.tokenPolicyId}`} target='_blank'>{tokenomics.tokenPolicyId}</Link>
              </Typography>
            </Grid>
          </Grid>
          <Box sx={{ textAlign: 'center' }}>
            <Swap
              orderTypes={["SWAP", "LIMIT"]}
              defaultToken={toTokenId(tokenomics.tokenPolicyId, tokenomics.tokenTicker)}
              colors={{
                "background": ensureHexColor(theme.palette.background.default),
                "containers": ensureHexColor(theme.palette.background.paper),
                "subText": ensureHexColor(theme.palette.text.secondary),
                "mainText": ensureHexColor(theme.palette.text.primary),
                "buttonText": ensureHexColor(theme.palette.background.default),
                "accent": ensureHexColor(theme.palette.secondary.main)
              }}
              theme={theme.palette.mode === 'dark' ? 'dark' : 'light'}
              width="450"
              partnerCode="coinecta61646472317179307973777374716168367a7778766435637368306779747938307063706671663067686532346e37393872303768647a3672366670367a39367267683864767536796a7838736d6d616e793430616e75383236347230656b337373756a747739da39a3ee5e6b4b0d3255bfef95601890afd80709"
              partnerName="Coinecta"
              displayType="BUTTON"
              buttonStyle={{ width: '100%', borderRadius: '8px' }}
              buttonText="Swap with DexHunter"
            />
          </Box>
        </Paper>
      </Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Visual Breakdown
        </Typography>
        {tokenomics.tokenomics.length > 0 ? (
          <LinearTokenomics tokenomics={tokenomics?.tokenomics} />
        ) : <Typography>Coming soon</Typography>}
      </Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Detailed Breakdown
        </Typography>
        {tokenomics.tokenomics.length > 0 ? (
          <Distribution
            data={tokenomics.tokenomics}
          />
        ) : <Typography>Coming soon</Typography>}
      </Box>
    </>
  );
};

export default TokenomicsTab;
