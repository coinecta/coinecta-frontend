import { Button, Avatar, Box, Badge, useTheme, Typography } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { BLOCKCHAINS } from '@lib/currencies';

const CurrencyButton: React.FC<{ selectedCurrency: TAcceptedCurrency | undefined; onClick: () => void }> = ({ selectedCurrency, onClick }) => {
  const theme = useTheme()
  return (
    <Button
      onClick={onClick}
      sx={{
        fontSize: '26px',
        color: theme.palette.text.primary,
        fontWeight: 700,
        textTransform: 'none',
        padding: '6px 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: 'auto',
        minWidth: 'fit-content',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {selectedCurrency?.currency &&
          <Box sx={{ position: 'relative', width: 32, height: 32 }}>
            <Avatar
              src={BLOCKCHAINS.find(blockchain => selectedCurrency?.blockchain === blockchain.name)?.tokens.find(token => selectedCurrency?.currency === token.symbol)?.imageUrl}
              sx={{ width: 32, height: 32 }}
            />
            <Avatar
              src={BLOCKCHAINS.find(blockchain => selectedCurrency?.blockchain === blockchain.name)?.imageUrl}
              sx={{
                width: 16,
                height: 16,
                position: 'absolute',
                bottom: -2,
                right: -2
                // border: `2px solid ${theme.palette.background.paper}`,
              }}
            />
          </Box>
        }
        {selectedCurrency?.currency
          ? <Typography sx={{ fontWeight: 'inherit', fontSize: 'inherit', mb: 0, lineHeight: 1 }}>
            {selectedCurrency?.currency}
          </Typography>
          : <Typography sx={{ fontSize: '16px', fontWeight: 500 }}>Select currency</Typography>}
        <ArrowDropDownIcon />
      </Box>
    </Button>
  )
};

export default CurrencyButton;