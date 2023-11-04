import React, { FC } from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { useTheme, Button, Box, ButtonPropsColorOverrides } from '@mui/material';

type TTextFieldWithButtonProps = TextFieldProps & {
  secondaryColor?: boolean;
  buttonText: string;
  buttonFunction: Function;
};

const TextFieldWithButton: FC<TTextFieldWithButtonProps> = (props) => {
  const theme = useTheme();
  const { secondaryColor, buttonText, buttonFunction } = props

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'flex-start',
      borderRadius: '6px',
      flexWrap: 'nowrap',
    }}>
      <TextField
        {...props}
        variant="filled"
        sx={{
          '& .MuiFilledInput-root': {
            borderRadius: '6px 0 0 6px',
            borderStyle: 'solid',
            borderWidth: '1px',
            borderColor: props.error
              ? theme.palette.error.main
              : theme.palette.mode === 'dark'
                ? 'rgba(200, 225, 255, 0.2)'
                : 'rgba(20, 22, 25, 0.15)',
            background: theme.palette.mode === 'dark'
              ? 'radial-gradient(at right top, rgba(16,20,34,0.4), rgba(1, 4, 10, 0.4))'
              : 'radial-gradient(at right top, rgba(16,20,34,0.05), rgba(1, 4, 10, 0.05))',
            fontFamily: 'sans-serif',
            height: '32px',
            '& input': {
              color: props.error ? theme.palette.error.main : undefined,
              py: '3px',
              px: '9px',
            },
            '&:hover': {
              borderColor: props.error
                ? '#f00'
                : theme.palette[secondaryColor ? 'secondary' : 'primary'].main,
            },
            '& .MuiFilledInput-input': {
              // if needed
            },
            '& .MuiFilledInput-before': { display: 'none' },
            '& .MuiFilledInput-after': { display: 'none' },
          },
        }}
      />
      <Button
        variant="contained"
        disableElevation
        color={secondaryColor ? 'secondary' : 'primary'}
        sx={{
          height: '32px',
          borderRadius: '0 6px 6px 0',
          textTransform: 'none'
        }}
        onClick={() => buttonFunction()}
      >
        {buttonText}
      </Button>
    </Box>
  );
};

export default TextFieldWithButton;