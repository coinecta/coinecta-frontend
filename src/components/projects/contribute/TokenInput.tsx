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
    const rawValue = event.target.value.replace(/,/g, '');

    // Check if the value is a valid number or a valid number with a decimal point
    if (!isNaN(Number(rawValue)) || rawValue.match(/^\d+\.?\d*$/)) {
      // Determine whether the value ends with a decimal point or has decimal digits
      const endsWithDecimal = rawValue.includes('.') && rawValue.split('.')[1] === '';
      const hasDecimalDigits = rawValue.includes('.') && rawValue.split('.')[1].length > 0;

      // Format the input value according to its content
      if (endsWithDecimal) {
        setInputValue(rawValue); // Keep as is, user might be typing decimal part
      } else if (hasDecimalDigits) {
        // Format but keep decimal digits
        setInputValue(Number(rawValue).toLocaleString(undefined, { minimumFractionDigits: rawValue.split('.')[1].length, maximumFractionDigits: 20 }));
      } else {
        // Standard formatting for whole numbers
        setInputValue(Number(rawValue).toLocaleString(undefined, { maximumFractionDigits: 2 }));
      }

      // Set output value, formatted with two decimal places
      setOutputValue((Number(rawValue) * exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 2 }));
    }
  };

  const handleInputMax = () => {
    if (adaAmount) {
      setInputValue(adaAmount.toLocaleString(undefined, { maximumFractionDigits: 2 }))
      setOutputValue((Number(adaAmount) * exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 2 }))
    }
  }

  const calculateUSDValue = () => {
    const numericalValue = Number(inputValue.replace(/,/g, ''));
    return (numericalValue * (adaPrice || 0)).toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  return (
    <Box sx={{ position: 'relative' }}>
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