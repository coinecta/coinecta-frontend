import React from 'react';
import Autocomplete, { AutocompleteChangeReason } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { countryList } from '@lib/utils/countryList';

interface Props {
  selectedCountries: string[];
  setSelectedCountries: React.Dispatch<React.SetStateAction<string[]>>;
}

const MultiSelectCountry: React.FC<Props> = ({ selectedCountries, setSelectedCountries }) => {
  const selectedCountryObjects = countryList.filter(country =>
    selectedCountries.includes(country.code)
  );

  const handleChange = (
    event: React.ChangeEvent<{}>,
    value: Country[],
    reason: AutocompleteChangeReason
  ) => {
    if (reason === 'selectOption' || reason === 'removeOption') {
      setSelectedCountries(value.map(country => country.code));
    }
  };

  return (
    <Autocomplete
      id="country-select-demo"
      multiple
      options={countryList}
      value={selectedCountryObjects}
      onChange={handleChange}
      autoHighlight
      getOptionLabel={(option) => option.label}
      renderOption={(props, option) => (
        <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
          <img
            loading="lazy"
            width="20"
            src={`/country-icons/${option.code.toLowerCase()}.png`}
            alt=""
          />
          {option.label} ({option.code})
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          placeholder="Select countries"
          inputProps={{
            ...params.inputProps,
            autoComplete: 'country',
          }}
        />
      )}
    />
  );
};

export default MultiSelectCountry;
