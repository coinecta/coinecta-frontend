import { Box, InputBase, Paper, Typography, useTheme } from '@mui/material';
import React, { FC, use, useEffect, useState } from 'react';
import { useWallet } from '@meshsdk/react';
import { trpc } from '@lib/utils/trpc';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface IStakeInputProps {
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const StakeInput: FC<IStakeInputProps> = ({
  inputValue,
  setInputValue,
  onKeyDown
}) => {
  const theme = useTheme();
  const [cnctBalance, setCnctBalance] = useState<number | undefined>(undefined);
  const { wallet, connected } = useWallet();

  // useEffect(() => {
  //   async function fetchBalance() {
  //     try {
  //       const balances = await wallet.getBalance();
  //       const targetBalance = balances.find(balance =>
  //         balance.unit === "c27600f3aff3d94043464a33786429b78e6ab9df5e1d23b774acb34c434e4354"
  //       );

  //       if (targetBalance) {
  //         setCnctBalance(targetBalance.quantity * 0.0001);
  //       } else {
  //         setCnctBalance(0)
  //       }
  //     } catch (error) {
  //       console.error('Error fetching wallet balance:', error);
  //     }
  //   }

  //   fetchBalance();
  // }, [wallet]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow numbers, a dot, or a comma
    const regex = /^[0-9]*[.,]?[0-9]*$/;
    const value = e.target.value;
    if (regex.test(value)) {
      setInputValue(value);
    }
  }

  const handleInputMax = () => {
    if (cnctBalance) {
      setInputValue(cnctBalance.toString())
    }
  }

  return (
    <Box sx={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <Box sx={{ maxWidth: '500px' }}>

        <Box
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            py: 1,
            px: 2,
            mb: 1,
            borderRadius: '8px',
            background: theme.palette.mode === 'dark' ? 'rgba(235,245,255,0.03)' : 'rgba(255,255,255,0.55)'
          }}
        >
          <Typography variant="overline">
            Amount to stake:
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <InputBase
              fullWidth
              onKeyDown={onKeyDown}
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
              CNCT
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-end'
            }}>
            <Typography sx={{ fontSize: '1rem!important', whiteSpace: 'nowrap' }}>
              Balance:&nbsp;
              {cnctBalance
                ? <Box component="span" onClick={handleInputMax} sx={{ cursor: 'pointer' }}>
                  {cnctBalance.toLocaleString()}
                </Box>
                : '0'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default StakeInput;