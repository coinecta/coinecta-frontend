import { trpc } from '@lib/utils/trpc';
import { FormControl, Select, MenuItem, InputLabel, SelectChangeEvent, Typography } from '@mui/material';
import React, { FC, useEffect } from 'react';

interface ISelectContributionRoundProps {
  selectedRound: number | null;
  setSelectedRound: React.Dispatch<React.SetStateAction<number | null>>;
  roundData: TContributionRound[] | undefined;
}

const SelectContributionRound: FC<ISelectContributionRoundProps> = ({ roundData, selectedRound, setSelectedRound }) => {

  const handleRoundChange = (e: SelectChangeEvent) => {
    setSelectedRound(e.target.value as unknown as number);
  };

  useEffect(() => {
    // Check if selectedRound is no longer valid based on new roundData
    if (roundData && !roundData.some(round => round.id === selectedRound)) {
      setSelectedRound(null);
    } else if (!roundData) {
      setSelectedRound(null);
    }
  }, [roundData, selectedRound, setSelectedRound]);

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