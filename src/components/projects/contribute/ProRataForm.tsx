import React, { FC } from 'react';
import { Box, Typography, useTheme, Paper } from '@mui/material';

import TimeRemaining from '@components/TimeRemaining';
import { LinearProgressStyled } from '@components/styled-components/LinearProgress';
import Grid from '@mui/system/Unstable_Grid/Grid';

const api = {
  open: new Date(1698835989000),
  close: new Date(1699008789000),
  tokenTicker: 'CNCT',
  target: 20000000,
  currencySymbol: '₳',
  currencyName: 'Ada',
  price: 0.16,
  deposited: 2213516,
}

type ProRataFormProps = {

}

const ProRataForm: FC<ProRataFormProps> = () => {
  const theme = useTheme()

  const claimedAmount = api.deposited / api.price
  const depositTarget = api.target * api.price

  return (
    <Paper variant="outlined" sx={{ px: 3, py: 2 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          mb: 2,
          textAlign: 'center'
        }}
      >
        <Box>
          <Typography variant="overline">
            Round open
          </Typography>
          <Typography variant="h4" sx={{ mt: -1 }}>
            <TimeRemaining noDay endTime={api.open} />
          </Typography>
        </Box>
        <Box>
          <Typography variant="overline">
            Round closed
          </Typography>
          <Typography variant="h4" sx={{ mt: -1 }}>
            <TimeRemaining noDay endTime={api.close} />
          </Typography>
        </Box>
      </Box>

      <Grid container>
        <Grid xs={12} md={8}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, }}>
            <Box>
              <Typography variant="overline">
                {api.tokenTicker} Target
              </Typography>
              <Typography variant="h6" sx={{ mt: -1 }}>
                {api.target.toLocaleString()}
              </Typography>
            </Box>
            <Box>
              <Typography variant="overline">
                {api.tokenTicker} Claimed
              </Typography>
              <Typography variant="h6" sx={{ mt: -1 }}>
                {(claimedAmount > api.target ? api.target : claimedAmount).toLocaleString()}
              </Typography>
            </Box>
            <Box>
              <Typography variant="overline">
                Total raised
              </Typography>
              <Typography variant="h6" sx={{ mt: -1 }}>
                {(claimedAmount / api.target * 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}%
              </Typography>
            </Box>
          </Box>
          <LinearProgressStyled
            variant="determinate"
            value={((claimedAmount / api.target) * 100) <= 100 ? ((claimedAmount / api.target) * 100) : 100}
            barColorStart={theme.palette.secondary.main}
            barColorEnd={theme.palette.secondary.light}
            sx={{ mb: 2 }}
            bgColor={theme.palette.divider}
          />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              mb: 2
            }}
          >
            <Box>
              <Typography variant="overline">
                Price
              </Typography>
              <Typography variant="h6" sx={{ mt: -1 }}>
                1 {api.tokenTicker} = {api.price} {api.currencySymbol}
              </Typography>
            </Box>
            <Box>
              <Typography variant="overline">
                {api.currencyName} Deposited
              </Typography>
              <Typography variant="h6" sx={{ mt: -1 }}>
                {(api.deposited).toLocaleString(undefined, { maximumFractionDigits: 2 })} {api.currencySymbol}
              </Typography>
            </Box>
            <Box>
              <Typography variant="overline">
                {api.currencyName} to be refunded
              </Typography>
              <Typography variant="h6" sx={{ mt: -1 }}>
                {(api.deposited - depositTarget) > 0 ? (api.deposited - depositTarget).toLocaleString(undefined, { maximumFractionDigits: 2 }) : 0} {api.currencySymbol}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid xs={12} md={4}>

        </Grid>
      </Grid>


    </Paper>
  );
};

export default ProRataForm;
