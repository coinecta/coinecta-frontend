import React, { FC } from 'react';
import {
  Avatar,
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  useMediaQuery,
  useTheme,
  Box,
  Typography,
  ListItemButton,
} from '@mui/material';
import { BLOCKCHAINS, getToken } from '@lib/currencies';

interface ICurrencySelectDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  acceptedCurrencies: TAcceptedCurrency[];
  onCurrencySelect: (currency: TAcceptedCurrency) => void;
}

const CurrencySelectDialog: FC<ICurrencySelectDialogProps> = ({
  open,
  setOpen,
  acceptedCurrencies,
  onCurrencySelect
}) => {
  const theme = useTheme();
  const upSm = useMediaQuery(theme.breakpoints.up('sm'));

  const handleCurrencySelect = (currency: TAcceptedCurrency) => {
    onCurrencySelect(currency);
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="currency-select-dialog"
      aria-describedby="select-a-currency"
      sx={{
        '& .MuiPaper-root': {
          background: theme.palette.background.paper,
          minWidth: '350px', // Added minimum width
        },
        '& .MuiBackdrop-root': {
          backdropFilter: 'blur(5px)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }
      }}
      scroll="paper"
    >
      <DialogTitle>Select a Currency</DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <List>
          {acceptedCurrencies.map((currency) => (
            <ListItemButton onClick={() => handleCurrencySelect(currency)}>
              <ListItem
                key={`${currency.blockchain}-${currency.currency}`}
                alignItems="flex-start"
              >
                <ListItemAvatar>
                  <Box sx={{ position: 'relative', width: 40, height: 40 }}>
                    <Avatar
                      src={BLOCKCHAINS.find(blockchain => currency.blockchain === blockchain.symbol)?.tokens.find(token => currency.currency === token.symbol)?.imageUrl}
                      sx={{ width: 40, height: 40 }}
                    />
                    <Avatar
                      src={BLOCKCHAINS.find(blockchain => currency.blockchain === blockchain.symbol)?.imageUrl}
                      sx={{
                        width: 20,
                        height: 20,
                        position: 'absolute',
                        bottom: -2,
                        right: -2,
                      }}
                    />
                  </Box>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {currency.currency}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0 }}>
                      on {getToken(currency.blockchain, currency.currency)?.parentBlockchainName}
                    </Typography>
                  }
                />
              </ListItem>
            </ListItemButton>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default CurrencySelectDialog;