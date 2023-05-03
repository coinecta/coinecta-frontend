import React, { FC, useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  InputAdornment,
  FilledInput,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { SxProps } from "@mui/material";

interface IBasicSearchBar {
  sx?: SxProps;
  searchString: string;
  setSearchString: React.Dispatch<React.SetStateAction<string>>;
}

const BasicSearchBar: FC<IBasicSearchBar> = ({ sx, searchString, setSearchString }) => {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchString(event.target.value);
  };

  return (
    <FormControl fullWidth variant="filled" sx={sx}>
      <InputLabel htmlFor="component-filled">Search</InputLabel>
      <FilledInput
        id="search"
        value={searchString}
        onChange={handleSearchChange}
        endAdornment={
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        }
      />
    </FormControl>
  );
};

export default BasicSearchBar;