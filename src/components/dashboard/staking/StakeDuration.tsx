import React, { FC, useState, useEffect } from 'react';
import { Box, Button, useTheme } from '@mui/material';

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
  const [localDuration, setLocalDuration] = useState<number>(duration);

  useEffect(() => {
    setLocalDuration(duration);
  }, [duration]);

  const handleDurationChange = (newDuration: number) => {
    setLocalDuration(newDuration);
    setDuration(newDuration);
  };

  return (
    <Box sx={{
      position: 'relative', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2,
    }}>
      {durations.map((option, index) => (
        <Button
          key={option}
          variant="text"
          onClick={() => handleDurationChange(option)}
          sx={{
            border: localDuration === option ? '1px solid rgba(99, 161, 199, 0.4)' : 'inherit',
            background: localDuration === option ? 'rgba(99, 161, 199, 0.2)' : 'inherit',
            fontWeight: localDuration === option ? '700' : 'inherit',
            color: localDuration === option ? 'secondary.main' : 'inherit',
            '&:hover': {
              background: localDuration === option ? 'rgba(99, 161, 199, 0.3)' : 'rgba(99, 161, 199, 0.1)',
              borderColor: 'rgba(99, 161, 199, 0.4)',
            }
          }}
        >
          {option} month{option > 1 ? 's' : ''}
        </Button>
      ))}
    </Box>
  );
};

export default StakeInput;