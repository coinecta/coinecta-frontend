import { trpc } from '@lib/utils/trpc';
import { FormControl, Select, MenuItem, InputLabel, SelectChangeEvent, Typography } from '@mui/material';
import React, { FC } from 'react';

interface ISelectContributionRoundProps {
  selectedRound: string | null;
  setSelectedRound: React.Dispatch<React.SetStateAction<string | null>>;
  roundData: TContributionRound[] | undefined;
}

const SelectContributionRound: FC<ISelectContributionRoundProps> = ({ roundData, selectedRound, setSelectedRound }) => {

  const handleRoundChange = (e: SelectChangeEvent) => {
    setSelectedRound(e.target.value as string);
  };

  return (
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel id="contribution-round-select-label">Contribution Round</InputLabel>
      <Select
        labelId="contribution-round-select-label"
        id="contribution-round-select"
        value={selectedRound?.toString() || ''}
        label="Contribution Round"
        onChange={handleRoundChange}
      >
        <MenuItem value={''}>
          <Typography sx={{ fontStyle: 'italic' }}>
            None
          </Typography>
        </MenuItem>
        {roundData?.map((round) => (
          <MenuItem key={round.id} value={round.id}>
            {round.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SelectContributionRound;