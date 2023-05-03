import React, { FC } from 'react';
import {
  Grid,
  Icon,
  TextField,
  Button,
  useTheme
} from '@mui/material'
import { INftPackObject } from '@components/create/PackTokenItem';

interface INumberIncrementNftArrayProps {
  dataArray: INftPackObject[];
  setDataArray: React.Dispatch<React.SetStateAction<INftPackObject[]>>;
  max?: number;
  name?: string;
  label?: string;
  index: number;
}

const NumberIncrementNftArray: FC<INumberIncrementNftArrayProps> = ({ dataArray, setDataArray, name, label, max, index }) => {
  const theme = useTheme()
  const handleChangeNum = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    var regex = /^[0-9]+$/;
    if (e.target.value.match(regex) && Number(e.target.value) != 0) {
      const newArray: INftPackObject[] = dataArray.map((item, i) => {
        if (i === index) {
          var regex = /^[0-9]+$/;
          if (e.target.value.match(regex)) {
            if ((max && Number(e.target.value) <= max) || max === undefined) {
              return {
                ...item,
                count: Number(e.target.value)
              }
            }
            else if (max && Number(e.target.value) > max) {
              return {
                ...item,
                count: max
              }
            }
          }
          else if (e.target.value === '' || e.target.value === undefined || e.target.value === null) {
            return {
              ...item,
              count: ''
            }
          }
        }
        return item
      })
      setDataArray(newArray)
    }
  }
  const handleNumberIncrement = (direction: 'up' | 'down') => {
    if (direction === 'up' && ((max && dataArray[index].count < max) || max === undefined)) {
      const newArray: INftPackObject[] = dataArray.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            count: Number(dataArray[index].count) + 1
          }
        }
        return item
      })
      setDataArray(newArray)
    }
    if (direction === 'down' && dataArray[index].count > 1) {
      const newArray: INftPackObject[] = dataArray.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            count: Number(dataArray[index].count) - 1
          }
        }
        return item
      })
      setDataArray(newArray)
    }
  }
  return (
    <Grid container sx={{ flexWrap: 'nowrap' }}>
      <Grid item sx={{ flexGrow: '0' }}>
        <Button
          variant="contained"
          disableElevation
          sx={{
            height: '100%',
            borderRadius: '6px 0 0 6px',
            background: theme.palette.divider,
            color: theme.palette.text.secondary
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
          variant="filled"
          fullWidth
          label={label ? label : ''}
          name={name ? name : ''}
          value={dataArray[index].count}
          onChange={(e) => handleChangeNum(e)}
          inputProps={{
            inputMode: 'numeric',
            step: 1
          }}
          sx={{
            '& .MuiInputBase-root': {
              borderRadius: '0',
            },
            width: '100%',
            flexGrow: '1',
          }}
        />
      </Grid>
      <Grid item sx={{ flexGrow: '0' }}>
        <Button
          variant="contained"
          disableElevation
          sx={{
            height: '100%',
            borderRadius: '0 6px 6px 0',
            background: theme.palette.divider,
            color: theme.palette.text.secondary
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

export default NumberIncrementNftArray;