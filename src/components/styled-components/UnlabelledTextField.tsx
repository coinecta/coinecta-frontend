import React, { FC } from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';

type TUnlabelledTextFieldProps = TextFieldProps & {
  // extended props if needed
};

const UnlabelledTextField: FC<TUnlabelledTextFieldProps> = (props) => {
  const theme = useTheme();

  return (
    <TextField
      {...props}
      variant="filled"
      sx={{
        '& .MuiFilledInput-root': {
          borderRadius: '6px',
          borderStyle: 'solid',
          borderWidth: '1px',
          borderColor: theme.palette.mode === 'dark'
            ? 'rgba(200, 225, 255, 0.2)'
            : 'rgba(20, 22, 25, 0.15)',
          background: theme.palette.mode === 'dark'
            ? 'radial-gradient(at right top, rgba(16,20,34,0.4), rgba(1, 4, 10, 0.4))'
            : 'radial-gradient(at right top, rgba(16,20,34,0.05), rgba(1, 4, 10, 0.05))',
          boxShadow: '2px 2px 5px 3px rgba(0,0,0,0.1)',
          fontFamily: 'sans-serif',
          '& input': {
            py: '3px',
            px: '9px',
          },
          '&:hover': {
            borderColor: theme.palette.primary.main,
          },
          '& .MuiFilledInput-input': {
            // if needed
          },
          '& .MuiFilledInput-before': { display: 'none' },
          '& .MuiFilledInput-after': { display: 'none' },
        },
        '& .Mui-error': {
          borderColor: theme.palette.error.dark,
          borderWidth: '2px'
        }
      }}
    />
  );
};

export default UnlabelledTextField;