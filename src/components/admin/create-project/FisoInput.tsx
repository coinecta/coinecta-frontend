import React, { FC, useEffect, useState } from 'react';
import { Box, Button, Grid, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { formatDateForInput } from '@lib/utils/daytime';
import { trpc } from '@lib/utils/trpc';
import { resolveEpochNo } from '@meshsdk/core';

interface IFisoInputProps {
  data: TFiso[];
  setData: (updatedData: TFiso[]) => void;
}

const FisoInput: FC<IFisoInputProps> = ({ data, setData }) => {
  const currentEpoch = resolveEpochNo('mainnet');

  const handleChange = (e: any, index: number) => {
    const updatedData = data.map((elem, i) => {
      if (index === i) {
        return {
          ...elem,
          [e.target.name]: e.target.value,
        };
      } else {
        return elem;
      }
    });
    setData(updatedData);
  };

  return (
    <>
      <Typography sx={{ mb: 2 }}>
        Current epoch: {currentEpoch}
      </Typography>
      {data?.map((fiso, index) => {
        return (
          <Grid container key={index} spacing={1} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <TextField
                  name="tokenName"
                  label="Token Name"
                  fullWidth
                  variant="filled"
                  value={fiso.tokenName}
                  onChange={(e) => handleChange(e, index)}
                />
                <Button
                  sx={{ textTransform: 'none', ml: 1 }}
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  onClick={() => { setData([]); }}
                >
                  Remove
                </Button>
              </Box>
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                name="tokenTicker"
                label="Token Ticker"
                fullWidth
                variant="filled"
                value={fiso.tokenTicker}
                onChange={(e) => handleChange(e, index)}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                name="tokenAmount"
                label="Amount to distribute"
                fullWidth
                type="number"
                variant="filled"
                value={fiso.tokenAmount}
                onChange={(e) => handleChange(e, index)}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                name="startEpoch"
                label="Start Epoch"
                fullWidth
                type="number"
                variant="filled"
                value={fiso.startEpoch}
                onChange={(e) => handleChange(e, index)}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                name="endEpoch"
                label="End Epoch"
                fullWidth
                type="number"
                variant="filled"
                value={fiso.endEpoch}
                onChange={(e) => handleChange(e, index)}
              />
            </Grid>
          </Grid >
        )
      })}
      {
        (!data || data.length === 0) &&
        <Button
          sx={{ textTransform: 'none', mt: -1, mb: 3 }}
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() =>
            setData([
              {
                tokenName: '',
                tokenTicker: '',
                tokenAmount: 0,
                startEpoch: currentEpoch,
                endEpoch: currentEpoch + 10,
                approvedStakepools: [],
                spoSignups: []
              },
            ])
          }
        >
          Add fiso item
        </Button>
      }
    </>
  );
};

export default FisoInput;