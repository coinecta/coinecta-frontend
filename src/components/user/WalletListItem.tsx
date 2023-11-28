import { Typography, Avatar, useTheme, Box, Button } from "@mui/material";
import { FC } from "react";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface WalletListItemProps extends TWalletListItem {
  link?: boolean;
  handleConnect: (walletName: string) => void
}

export const WalletListItemComponent: FC<WalletListItemProps> = ({
  name,
  connectName,
  icon,
  iconDark,
  mobile,
  url,
  link = false,
  handleConnect
}) => {
  const theme = useTheme()
  return (
    <Button
      endIcon={<Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 3 }}>
        {mobile && <Box>
          <Typography sx={{ fontSize: '0.9rem !important', color: theme.palette.text.secondary }}>
            Mobile supported
          </Typography>
        </Box>}
        {link && <OpenInNewIcon sx={{ height: '16px', width: '16px' }} />}
      </Box>}
      startIcon={<Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 3 }}>
        <Avatar
          alt={
            name + ' Icon'
          }
          src={theme.palette.mode === 'dark' ? iconDark : icon}
          sx={{ height: '24px', width: '24px' }}
          variant="square"
        />
        <Box>
          <Typography sx={{ fontSize: '1rem !important', color: theme.palette.text.primary }}>
            {name}
          </Typography>
        </Box>
      </Box>}
      sx={{
        background: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: '6px',
        mb: 1,
        px: 2,
        py: 1,
        justifyContent: "space-between",
        textTransform: 'none',
        '& .MuiListItemSecondaryAction-root': {
          height: '24px'
        },
        color: theme.palette.text.secondary
      }}
      fullWidth
      onClick={
        link
          ? () => window.open(url, '_blank', 'noopener,noreferrer')
          : () => handleConnect(connectName)
      }
    />
  )
}