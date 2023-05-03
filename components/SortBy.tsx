import React, { FC, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
} from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { SxProps } from "@mui/material";

interface ISortByProps {
  sx?: SxProps;
  sortOption: string;
  setSortOption: React.Dispatch<React.SetStateAction<string>>;
}

const SortBy: FC<ISortByProps> = ({
  sx,
  sortOption,
  setSortOption
}) => {

  const handleChange = (event: SelectChangeEvent) => {
    setSortOption(event.target.value as string);
  };

  return (
    <FormControl fullWidth sx={sx} variant="filled">
      <InputLabel id="sort-select-box-input">Sort By</InputLabel>
      <Select
        labelId="sort-select-box-label"
        id="sort-select-box"
        value={sortOption}
        label="Sort By"
        onChange={handleChange}
      >
        <MenuItem value="">
          No sorting
        </MenuItem>
        <MenuItem value={"price-asc"}>Price: low to high</MenuItem>
        <MenuItem value={"price-desc"}>Price: high to low</MenuItem>
        {/* <MenuItem value={"ending-soonest"}>Ending Soonest</MenuItem>
        <MenuItem value={"ending-latest"}>Ending Latest</MenuItem>
        <MenuItem value={"newest-first"}>Newest Listings First</MenuItem>
        <MenuItem value={"newest-last"}>Oldest Listings First</MenuItem> */}
      </Select>
    </FormControl>
  );
};

export default SortBy;