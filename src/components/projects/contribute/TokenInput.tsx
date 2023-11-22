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
}

const TokenInput: FC<ITokenInputProps> = ({ inputTokenTicker, outputTokenTicker, remainingTokens, exchangeRate }) => {
  const theme = useTheme();
  const { data: adaPrice } = trpc.price.getCardanoPrice.useQuery();
  const { wallet } = useWallet();
  const [adaAmount, setAdaAmount] = useState<number | undefined>(undefined);
  const [inputValue, setInputValue] = useState('');
  const [outputValue, setOutputValue] = useState('');

  const getUserAdaAmount = async () => {
    const lovelace = await wallet.getLovelace();
    const ada = Number(lovelace) * 0.000001;
    if (ada) setAdaAmount(ada);
  };

  useEffect(() => {
    if (wallet) {
      getUserAdaAmount();
    }
  }, [wallet]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/,/g, '');
    if (!isNaN(Number(value))) {
      setInputValue(Number(value).toLocaleString());
      setOutputValue((Number(value) * exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 2 }))
    }
  };

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
            fontSize: '32px!important', fontWeight: 700, whiteSpace: 'nowrap',
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
            Balance: {adaAmount && adaAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
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
            fontSize: '32px!important', fontWeight: 700, whiteSpace: 'nowrap',
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