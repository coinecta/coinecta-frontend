import React, { FC } from 'react';
import {
  Grid,
  Icon,
  TextField,
  useTheme,
  Button,
} from '@mui/material'

interface INumberIncrementProps {
  value: number;
  setValue: React.Dispatch<React.SetStateAction<number>>;
  max?: number;
  name?: string;
  label?: string;
  variantContained?: boolean;
}

const NumberIncrement: FC<INumberIncrementProps> = ({ value, setValue, max, name, label, variantContained }) => {
  const theme = useTheme()
  const handleChangeNum = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    var regex = /^[0-9]+$/;
    if (e.target.value.match(regex) && Number(e.target.value) != 0) {
      setValue(Number(e.target.value))
    }
  }
  const handleNumberIncrement = (direction: 'up' | 'down') => {
    if (direction === 'up' && ((max && value < max) || max === undefined)) {
      setValue(value + 1)
    }
    if (direction === 'down' && value > 1) {
      setValue(value - 1)
    }
  }
  return (
    <Grid container sx={{ flexWrap: 'nowrap' }}>
      <Grid item sx={{ flexGrow: '0' }}>
        <Button
          variant={variantContained ? 'contained' : 'outlined'}
          disableElevation
          sx={variantContained ? {
            height: '100%',
            borderRadius: '6px 0 0 6px',
            background: theme.palette.divider,
            color: theme.palette.text.secondary
          } :
            {
              height: '100%',
              minWidth: '24px',
              width: '48px',
              borderRadius: '12px 0 0 12px',
            }}
          onClick={() => handleNumberIncrement('down')}
        >
          <Icon>
            remove
          </Icon>
        </Button>
      </Grid>
      <Grid item sx={{ flexGrow: '1' }}>
        <TextField
          variant={variantContained ? 'filled' : 'outlined'}
          fullWidth
          id={name}
          label={label ? label : ''}
          name={name ? name : ''}
          value={value}
          onChange={(e) => handleChangeNum(e)}
          inputProps={{
            inputMode: 'numeric',
            step: 1
          }}
          sx={{
            '& .MuiInputBase-root': {
              borderRadius: '0'
            },
            width: '100%',
            flexGrow: '1',

          }}
          size={variantContained ? undefined : "small"}
        />
      </Grid>
      <Grid item sx={{ flexGrow: '0' }}>
        <Button
          variant={variantContained ? 'contained' : 'outlined'}
          disableElevation
          sx={variantContained ?
            {
              height: '100%',
              borderRadius: '0 6px 6px 0',
              background: theme.palette.divider,
              color: theme.palette.text.secondary
            } :
            {
              height: '100%',
              minWidth: '24px',
              width: '48px',
              borderRadius: '0 12px 12px 0',
            }}
          onClick={() => handleNumberIncrement('up')}
        >
          <Icon>
            add
          </Icon>
        </Button>
      </Grid>
    </Grid>
  );
};

export default NumberIncrement;