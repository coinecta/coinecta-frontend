import React, { FC } from 'react';
import { Box, Button, Grid, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

interface ITokenomicInputProps {
  data: TTokenomic[];
  setData: React.Dispatch<React.SetStateAction<TTokenomic[]>>
}

const TokenomicInput: FC<ITokenomicInputProps> = ({ data, setData }) => {
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
      {data.map((elem, index) => (
        <Grid container key={index} spacing={1} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <TextField
                name="name"
                label="Name"
                InputProps={{ disableUnderline: true }}
                fullWidth
                variant="filled"
                value={elem.name}
                onChange={(e) => handleChange(e, index)}
              />
              <Button
                sx={{ textTransform: 'none', ml: 1 }}
                variant="outlined"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  const updatedData = data.filter((data, i) => {
                    return index !== i;
                  });
                  setData(updatedData);
                }}
              >
                Remove
              </Button>
            </Box>
          </Grid>
          <Grid item md={6} xs={12}>
            <TextField
              name="amount"
              label="Amount"
              InputProps={{ disableUnderline: true }}
              fullWidth
              variant="filled"
              value={elem.amount.toString()}
              onChange={(e) => handleChange(e, index)}
            />
          </Grid>
          <Grid item md={6} xs={12}>
            <TextField
              name="value"
              label="Value"
              InputProps={{ disableUnderline: true }}
              fullWidth
              variant="filled"
              value={elem.value}
              onChange={(e) => handleChange(e, index)}
            />
          </Grid>
          <Grid item md={6} xs={12}>
            <TextField
              name="tge"
              label="TGE"
              InputProps={{ disableUnderline: true }}
              fullWidth
              variant="filled"
              value={elem.tge}
              onChange={(e) => handleChange(e, index)}
            />
          </Grid>
          <Grid item md={6} xs={12}>
            <TextField
              name="freq"
              label="Freq"
              InputProps={{ disableUnderline: true }}
              fullWidth
              variant="filled"
              value={elem.freq}
              onChange={(e) => handleChange(e, index)}
            />
          </Grid>
          <Grid item md={6} xs={12}>
            <TextField
              name="length"
              label="Length"
              InputProps={{ disableUnderline: true }}
              fullWidth
              variant="filled"
              value={elem.length}
              onChange={(e) => handleChange(e, index)}
            />
          </Grid>
          <Grid item md={6} xs={12}>
            <TextField
              name="lockup"
              label="Lock Up"
              InputProps={{ disableUnderline: true }}
              fullWidth
              variant="filled"
              value={elem.lockup}
              onChange={(e) => handleChange(e, index)}
            />
          </Grid>
          <Grid item md={12} xs={12}>
            <TextField
              name="walletAddress"
              label="Wallet Address"
              InputProps={{ disableUnderline: true }}
              fullWidth
              variant="filled"
              value={elem.walletAddress}
              onChange={(e) => handleChange(e, index)}
            />
          </Grid>
        </Grid>
      ))}
      <Button
        sx={{ textTransform: 'none', mt: -1 }}
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() =>
          setData([
            ...data,
            {
              name: '',
              amount: BigInt(0),
              value: '',
              tge: '',
              freq: '',
              length: '',
              lockup: '',
              walletAddress: '',
            },
          ])
        }
      >
        Add tokenomics item
      </Button>
    </>
  );
};

export default TokenomicInput;