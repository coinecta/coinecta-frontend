import React, { FC } from 'react';
import { Box, Button, Checkbox, FormControlLabel, Grid, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { slugify } from '@lib/utils/general';
import { formatDateForInput } from '@lib/utils/daytime';

interface IWhitelistInputProps {
  data: TWhitelist[];
  setData: (updatedData: TWhitelist[]) => void;
  projectSlug: string;
}

const WhitelistInput: FC<IWhitelistInputProps> = ({ data, setData, projectSlug }) => {
  const handleChange = (e: any, index: number) => {
    const updatedData = data.map((elem, i) => {
      if (index === i && e.target.name === 'name') {
        return {
          ...elem,
          [e.target.name]: e.target.value,
          slug: slugify(`${projectSlug}-${e.target.value}`)
        };
      } else if (index === i) {
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

  const handleChangeDate = (e: any, index: number) => {
    const updatedData = data.map((elem, i) => {
      if (index === i) {
        return {
          ...elem,
          [e.target.name]: new Date(e.target.value),
        };
      } else {
        return elem;
      }
    });
    setData(updatedData);
  };

  const handleChangeCheckbox = (e: any, index: number) => {
    const updatedData = data.map((elem, i) => {
      if (index === i) {
        return {
          ...elem,
          [e.target.name]: e.target.checked,
        };
      } else {
        return elem;
      }
    });
    setData(updatedData);
  };

  return (
    <>
      {data.map((whitelist, index) => {
        return (
          <Grid container key={index} spacing={1} sx={{ mb: 3 }}>
            <Grid item md={6} xs={12}>
              <TextField
                name="name"
                label="Whitelist Name"
                required
                fullWidth
                variant="filled"
                value={whitelist.name}
                onChange={(e) => handleChange(e, index)}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                name="slug"
                label="Whitelist Slug"
                fullWidth
                disabled
                variant="filled"
                value={whitelist.slug}
                onChange={(e) => handleChange(e, index)}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                name="startDateTime"
                label="Start Date"
                required
                fullWidth
                variant="filled"
                type="datetime-local"
                value={formatDateForInput(whitelist.startDateTime)}
                onChange={(e) => handleChangeDate(e, index)}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                name="endDateTime"
                label="End Date"
                required
                fullWidth
                variant="filled"
                type="datetime-local"
                value={formatDateForInput(whitelist.endDateTime)}
                onChange={(e) => handleChangeDate(e, index)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="maxPerSignup"
                label="Individual Max Contribution"
                fullWidth
                variant="filled"
                type="number"
                value={whitelist.maxPerSignup}
                onChange={(e) => handleChange(e, index)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="hardCap"
                label="Hard Cap"
                fullWidth
                variant="filled"
                type="number"
                value={whitelist.hardCap}
                onChange={(e) => handleChange(e, index)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="ergoProofs"
                    checked={whitelist.ergoProofs}
                    onChange={(e) => handleChangeCheckbox(e, index)}
                  />
                }
                label="Ask users to add Ergo wallets"
                sx={{ mb: 0 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <TextField
                  name="externalLink"
                  label="External Link"
                  fullWidth
                  variant="filled"
                  value={whitelist.externalLink}
                  helperText="Use this if the signup is on Ergopad or elsewhere"
                  onChange={(e) => handleChange(e, index)}
                />
                <Button
                  sx={{ textTransform: 'none', ml: 1, height: '62px' }}
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  onClick={() => {
                    const updatedData = data.filter((whitelist, i) => {
                      return index !== i;
                    });
                    setData(updatedData);
                  }}
                >
                  Remove
                </Button>
              </Box>
            </Grid>
          </Grid>
        )
      })}
      <Button
        sx={{ textTransform: 'none', mt: -1 }}
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() =>
          setData([
            ...data,
            { name: '', slug: '', startDateTime: new Date(), endDateTime: new Date(), ergoProofs: false },
          ])
        }
      >
        Add whitelist event
      </Button>
    </>
  );
};

export default WhitelistInput;