import React, { FC, useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  InputAdornment,
  FilledInput,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { SxProps } from "@mui/material";

interface ISearchBar {
  sx?: SxProps;
  data: any[];
  searchKey: string;
  setFilteredValue: React.Dispatch<React.SetStateAction<any[]>>;
}

const SearchBar: FC<ISearchBar> = ({ sx, data, searchKey, setFilteredValue }) => {
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const filterData = (data: any[], searchKey: string, searchText: string) => {
      const keys = searchKey.split(".");
      return data.filter((item) => {
        let value = item;
        for (const key of keys) {
          value = value[key];
          if (value === undefined) {
            return false;
          }
        }
        return value.toLowerCase().includes(searchText.toLowerCase());
      });
    };

    if (searchText !== "") {
      const filteredData = filterData(data, searchKey, searchText);
      setFilteredValue(filteredData);
    } else {
      setFilteredValue(data);
    }
  }, [searchText, data, searchKey, setFilteredValue]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  return (
    <FormControl fullWidth variant="filled" sx={sx}>
      <InputLabel htmlFor="component-filled">Search</InputLabel>
      <FilledInput
        id="search"
        value={searchText}
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

export default SearchBar;