import React, { FC, useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  InputAdornment,
  FilledInput,
  TextField
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { SxProps } from "@mui/material";

interface ISearchBar {
  sx?: SxProps;
  searchString: string;
  setSearchString: React.Dispatch<React.SetStateAction<string>>;
}

const SearchBar: FC<ISearchBar> = ({ sx, searchString, setSearchString }) => {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchString(event.target.value);
  };

  return (
    <TextField
      label="Search"
      id="search"
      fullWidth
      value={searchString}
      onChange={handleSearchChange}
      sx={sx}
      variant="filled"
      InputProps={{
        endAdornment:
          <InputAdornment position="end">
            <SearchIcon />
          </InputAdornment>
      }}
    />
  );
};

export default SearchBar;