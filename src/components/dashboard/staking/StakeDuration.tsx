import React, { FC, useState, useEffect } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, useTheme } from '@mui/material';

interface IStakeInputProps {
  duration: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  durations: number[];
}

const StakeInput: FC<IStakeInputProps> = ({
  duration,
  setDuration,
  durations
}) => {
  const theme = useTheme();

  const [localDuration, setLocalDuration] = useState<string>(duration.toString());

  useEffect(() => {
    setLocalDuration(duration.toString());
  }, [duration]);

  const handleDurationChange = (
    event: React.MouseEvent<HTMLElement>,
    newDuration: string | null
  ) => {
    if (newDuration !== null) {
      setLocalDuration(newDuration);
      setDuration(Number(newDuration));
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <ToggleButtonGroup
        value={localDuration}
        exclusive
        onChange={handleDurationChange}
        sx={{
          mb: 1,
          borderRadius: '8px',
          flexWrap: 'wrap',
          gap: 1,
          justifyContent: 'space-evenly',
          '& .MuiToggleButtonGroup-grouped': {
            margin: theme.spacing(0.5),
            border: 0,
            '&.Mui-disabled': {
              border: 0,
            },
            '&:not(:first-of-type)': {
              borderRadius: theme.shape.borderRadius,
            },
            '&:first-of-type': {
              borderRadius: theme.shape.borderRadius,
            },
          },
        }}
      >
        {durations.map((option, index) => (
          <ToggleButton
            key={`duration-${index}`}
            value={option.toString()}
            sx={{
              border: 'none',
              borderRadius: '8px',
            }}
          >
            {option} month{option > 1 ? 's' : ''}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

export default StakeInput;
