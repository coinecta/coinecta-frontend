import { FormControl, Select, MenuItem, InputLabel, SelectChangeEvent, Typography } from '@mui/material';
import React, { FC } from 'react';

interface ISelectWhitelistProps {
  selectedWhitelist: string | null;
  setSelectedWhitelist: React.Dispatch<React.SetStateAction<string | null>>;
  whitelistData: TWhitelistFull[] | undefined;
}

const SelectWhitelist: FC<ISelectWhitelistProps> = ({ whitelistData, selectedWhitelist, setSelectedWhitelist }) => {

  const handleRoundChange = (e: SelectChangeEvent) => {
    setSelectedWhitelist(e.target.value as string);
  };

  return (
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel id="whitelist-select-label">Whitelist</InputLabel>
      <Select
        labelId="whitelist-select-label"
        id="whitelist-select"
        value={selectedWhitelist?.toString() || ''}
        label="Whitelist"
        onChange={handleRoundChange}
      >
        <MenuItem value={''}>
          <Typography sx={{ fontStyle: 'italic' }}>
            None
          </Typography>
        </MenuItem>
        {whitelistData?.map((whitelist) => (
          <MenuItem key={whitelist.slug} value={whitelist.slug}>
            {whitelist.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SelectWhitelist;