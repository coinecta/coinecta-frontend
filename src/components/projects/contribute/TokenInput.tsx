import { Box, InputBase, Paper, Typography, useTheme } from '@mui/material';
import React, { FC, useEffect, useState } from 'react';
import { useWallet } from '@meshsdk/react';
import { trpc } from '@lib/utils/trpc';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface ITokenInputProps {
  inputTokenTicker?: string;
  outputTokenTicker: string;
  remainingTokens: number;
  exchangeRate: number; // 1 input token = (exchangeRate * input) output tokens
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  outputValue: string;
  setOutputValue: React.Dispatch<React.SetStateAction<string>>;
}

const TokenInput: FC<ITokenInputProps> = ({
  inputTokenTicker,
  outputTokenTicker,
  remainingTokens,
  exchangeRate,
  inputValue,
  setInputValue,
  outputValue,
  setOutputValue
}) => {
  const theme = useTheme();
  const { data: adaPrice } = trpc.price.getCardanoPrice.useQuery();
  const { wallet, connected } = useWallet();
  const [adaAmount, setAdaAmount] = useState<number | undefined>(undefined);

  const getUserAdaAmount = async () => {
    try {
      if (connected) {
        const lovelace = await wallet.getLovelace();
        const ada = Number(lovelace) * 0.000001;
        if (ada) setAdaAmount(ada);
      }
    } catch (error) {
      console.error(error)
    }
  };

  useEffect(() => {
    if (wallet) {
      getUserAdaAmount();
    }
  }, [wallet]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value.replace(/,/g, '.');

    // Function to count the number of periods in the string
    const countPeriods = (str: string) => (str.match(/\./g) || []).length;

    // Only update the input value if it doesn't result in multiple periods
    if (countPeriods(rawValue) <= 1) {
      setInputValue(rawValue);

      // Convert to a number for output value, handling potential NaN
      const numericValue = Number(rawValue);
      if (!isNaN(numericValue)) {
        setOutputValue((numericValue * exchangeRate).toFixed(0));
      } else {
        setOutputValue('');
      }
    }
  };

  const handleInputMax = () => {
    if (adaAmount) {
      const roundedDown = adaAmount - 1.5
      setInputValue(roundedDown.toFixed(0))
      setOutputValue((Number(roundedDown) * exchangeRate).toFixed(0))
    }
  }

  const calculateUSDValue = () => {
    const numericalValue = Number(inputValue.replace(/,/g, ''));
    return (numericalValue * (adaPrice || 0)).toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  return (
    <Box sx={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Box
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          width: '100%',
          py: 1,
          px: 2,
          mb: 1,
          maxWidth: '400px',
          borderRadius: '8px',
          background: theme.palette.mode === 'dark' ? 'rgba(235,245,255,0.03)' : 'rgba(255,255,255,0.55)'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
          <InputBase
            sx={{
              '& .MuiInputBase-input': {
                fontSize: '32px',
                fontWeight: 700
              }
            }}
            placeholder={"0.00"}
            value={inputValue}
            onChange={handleInputChange}
          />
          <Typography sx={{
            fontSize: '26px!important', fontWeight: 700, whiteSpace: 'nowrap',
          }}>
            ADA ₳
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}>
          <Typography sx={{ fontSize: '1rem!important' }}>
            ${calculateUSDValue()}
          </Typography>
          <Typography sx={{ fontSize: '1rem!important', whiteSpace: 'nowrap' }}>
            Balance:&nbsp;
            {adaAmount
              ? <Box component="span" onClick={handleInputMax} sx={{ cursor: 'pointer' }}>
                {adaAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </Box>
              : '0'}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          width: '100%',
          py: 1,
          px: 2,
          maxWidth: '400px',
          borderRadius: '8px',
          background: theme.palette.mode === 'dark' ? 'rgba(235,245,255,0.03)' : 'rgba(255,255,255,0.55)'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
          <InputBase
            sx={{
              '& .MuiInputBase-input': {
                fontSize: '32px',
                fontWeight: 700
              }
            }}
            placeholder={"0"}
            value={outputValue}
          />
          <Typography sx={{
            fontSize: '26px!important', fontWeight: 700, whiteSpace: 'nowrap',
          }}>
            {outputTokenTicker}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '1rem!important' }}>
          {remainingTokens.toLocaleString(undefined, { maximumFractionDigits: 0 })} {outputTokenTicker} remaining
        </Typography>
      </Box>
      <Paper
        variant="outlined"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          zIndex: 5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <ExpandMoreIcon />
      </Paper>
    </Box>
  );
};

export default TokenInput;