import React, { FC } from 'react';
import Distribution from './Distribution';
import LinearTokenomics from './LinearTokenomics';
import Grid from '@mui/system/Unstable_Grid/Grid';
import { useTheme, Typography, Box, Paper, } from '@mui/material';
import Link from '@components/Link';

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
            <Grid xs={6} sx={{ p: 1, textAlign: 'right' }}>
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
