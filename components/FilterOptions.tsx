import React, { FC, useEffect, useMemo, useState } from "react";
import {
  Typography,
  Box,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  Paper,
  Grid,
  TextField,
  Select,
  FilledInput,
  MenuItem,
  ListItemText,
  FormControl,
  useTheme
} from "@mui/material";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";

export interface IFilters {
  price: {
    min: number | '';
    max: number | '';
  };
  saleStatus: {
    name: string;
    selected: boolean;
  }[];
  tokenType: {
    pack: boolean;
    utility: boolean;
    art: boolean;
    music: boolean;
    gaming: boolean;
  }
  options: {
    showExplicit: boolean;
  };
  collection: {
    name: string;
    url: string;
    selected: boolean;
  }[] | [];
  marketplace: {
    name: string;
    id: string;
    url: string;
    logoUrl?: string;
    selected: boolean;
  }[] | [];
}

export const filterInit: IFilters = {
  price: {
    min: '',
    max: ''
  },
  saleStatus: [
    {
      name: 'Mint',
      selected: true,
    },
    {
      name: 'Sale',
      selected: true,
    },
    {
      name: 'Auction',
      selected: true,
    },
    {
      name: 'Not for sale',
      selected: true,
    }
  ],
  tokenType: {
    pack: true,
    utility: true,
    art: true,
    music: true,
    gaming: true,
  },
  options: {
    showExplicit: false,
  },
  collection: [
    {
      name: '',
      url: '',
      selected: true,
    }
  ],
  marketplace: [
    {
      name: 'Sky Harbor',
      id: 'skyharbor',
      url: 'https://skyharbor.io',
      logoUrl: '',
      selected: true,
    },
  ]
}

/* Filters

done: 
- Sale type: mint, auction, sale, not for sale
- Price min/max

in progress:
- Marketplace
- Options: Show Explicit
- Collection -> Search bar with drop-down (complex)
- Token type: pack, utility, art, gaming

*/

const AccordionSx = {
  p: "0 0 6px 0",
  minHeight: 0,
  "& .Mui-expanded": {
    m: "0px",
    minHeight: 0,
  },
  "& .MuiAccordionSummary-content": {
    m: "0 0 0 6px",
  },
  flexDirection: "row-reverse",
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)",
  },
};

interface IFilterOptions {
  data: any[];
  filteredValues: any[];
  setFilteredValues: React.Dispatch<React.SetStateAction<any[]>>;
  filters: IFilters;
  setFilters: React.Dispatch<React.SetStateAction<IFilters>>;
}

const FilterOptions: FC<IFilterOptions> = ({ data, setFilteredValues, filteredValues, filters, setFilters }) => {
  const theme = useTheme();
  const [saleStatusList, setSaleStatusList] = useState('Select sales types')
  const [saleStatusSelectAll, setSaleStatusSelectAll] = useState<boolean>(true);

  const handleChangeMinMaxFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const [parent, child] = name.split('-'); // split the name into parent and child properties
    setFilters(prevFilters => ({
      ...prevFilters,
      [parent]: {
        ...prevFilters[parent as keyof IFilters],
        [child]: value // update the child property with the new value
      }
    }));
  };

  const filterData = () => {
    const filteredData = data.filter(item => {
      const saleType = item.saleType
      const selectedSaleStatusNames = filters.saleStatus
        .filter(status => status.selected)
        .map(status => status.name.toLowerCase());
      const notForSaleSelected = filters.saleStatus.find(status => status.name === 'Not for sale')?.selected;
      return saleType === undefined ? notForSaleSelected : selectedSaleStatusNames.includes(saleType);
    });
    const filterMax = filteredData.filter(item => {
      return !filters.price.max || item.price < filters.price.max;
    })
    const filterMin = filterMax.filter(item => {
      return !filters.price.min || item.price > filters.price.min;
    })
    setFilteredValues(filterMin);
  }

  useEffect(() => {
    filterData()
  }, [filters, data])

  const saleStatusCheckHandleChange = (i: number) => {
    setFilters(prevFilters => {
      const newSaleStatus = [
        ...prevFilters.saleStatus.slice(0, i),
        {
          ...prevFilters.saleStatus[i],
          selected: !prevFilters.saleStatus[i].selected,
        },
        ...prevFilters.saleStatus.slice(i + 1),
      ];

      // Check if the last item is being unchecked
      const lastItemChecked = newSaleStatus.filter(item => item.selected).length > 0;

      // If it's the last item and it's being unchecked, don't update the filters
      if (!lastItemChecked && !newSaleStatus[i].selected) {
        return prevFilters;
      }

      return {
        ...prevFilters,
        saleStatus: newSaleStatus,
      };
    });
  }

  const saleStatusCheckSelectAll = (all: boolean) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      saleStatus: prevFilters.saleStatus.map((item) =>
        item.name === 'Not for sale' && !all ?
          {
            ...item,
            selected: true
          } :
          all ?
            {
              ...item,
              selected: true
            } :
            {
              ...item,
              selected: false
            }),
    }));
    setSaleStatusSelectAll(!saleStatusSelectAll)
  }

  useEffect(() => {
    const check = filters.saleStatus.every((item) => item.selected === true)
    if (check) {
      setSaleStatusSelectAll(true)
    }
    if (!check) {
      setSaleStatusSelectAll(false)
    }
    const selectedSaleStatusNames = filters.saleStatus
      .filter(item => item.selected)
      .map(item => item.name);
    setSaleStatusList(selectedSaleStatusNames.join(', '))
  }, [saleStatusCheckHandleChange])

  return (
    <>
      <Typography variant="h5" sx={{ mb: 0 }}>Filter</Typography>
      <Divider sx={{ mb: 2 }} />

      {/* FILTER BY SALE STATUS */}
      <Typography variant="h6" sx={{ mb: 1 }}>
        Sale Types
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Select
          fullWidth
          value="blank"
          variant="filled"
          sx={{ 
            '& .MuiInputBase-input': { pt: '8px' }, 
            color: theme.palette.text.secondary,
          }}
          // MenuProps={{
          //   sx: {
          //     '& .MuiList-root': {
          //       background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.09)' : theme.palette.background.paper,
          //     }
          //   }
          // }}
        >
          <MenuItem disabled value="blank" sx={{ display: 'none' }}>
            {saleStatusList}
          </MenuItem>
          {filters.saleStatus.map((item, i) => {
            return (
              <MenuItem
                key={i}
                onClick={() => saleStatusCheckHandleChange(i)}
              >
                <Checkbox checked={filters.saleStatus[i].selected} />
                <ListItemText primary={item.name} />
              </MenuItem>
            )
          })}
          <MenuItem onClick={() => saleStatusCheckSelectAll(!saleStatusSelectAll)}>
            <Checkbox checked={saleStatusSelectAll} />
            <ListItemText primary="Select All" />
          </MenuItem>
        </Select>
      </Box>

      {/* FILTER BY PRICE RANGE */}
      <MinMaxFilter
        filters={filters}
        handleChangeFilters={handleChangeMinMaxFilter}
        title="Price Range"
        variableName="price"
        currency="Erg"
      />


    </>
  );
};

export default FilterOptions;

const MinMaxFilter: FC<{
  filters: IFilters;
  handleChangeFilters: Function;
  title: string;
  variableName: string;
  currency?: string;
}> = ({
  filters,
  handleChangeFilters,
  title,
  variableName,
  currency
}) => {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          spacing={1}
        >
          <Grid item xs={4}>
            <TextField
              fullWidth
              variant="filled"
              id={variableName + '-filter-min'}
              placeholder="Min"
              name={variableName + '-min'}
              type="number"
              value={filters.price.min}
              sx={{ '& .MuiInputBase-input': { pt: '8px' } }}
              onChange={(e: any) => handleChangeFilters(e)}
            />
          </Grid>
          <Grid item xs={1} sx={{ textAlign: 'center' }}>
            —
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              variant="filled"
              id={variableName + '-filter-max'}
              placeholder="Max"
              type="number"
              name={variableName + '-max'}
              value={filters.price.max}
              sx={{ '& .MuiInputBase-input': { pt: '8px' } }}
              onChange={(e: any) => handleChangeFilters(e)}
            />
          </Grid>
          <Grid item xs={3}>
            {currency}
          </Grid>
        </Grid>
      </Box>
    )
  }