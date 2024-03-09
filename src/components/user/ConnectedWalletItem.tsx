import { getShorterAddress } from "@lib/utils/general";
import { Avatar, useTheme, Box, Button, IconButton } from "@mui/material";
import { FC } from "react";

interface ConnectedWalletItemProps {
    wallet: TWalletListItem & { address: string };
    key: number;
    endIcon?: React.ReactNode;
    handleButtonClick?: (address: string) => void;
}

export const ConnectedWalletItem: FC<ConnectedWalletItemProps> = ({ wallet, key, endIcon: EndIcon, handleButtonClick }) => {
    const theme = useTheme();

    return (
        <Button
            onClick={() => handleButtonClick ? handleButtonClick(wallet.address) : null}
            key={key}
            sx={{
                p: '3px 12px',
                fontSize: '1rem',
                minWidth: '64px',
                width: '100%',
                background: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '6px',
                mb: 1,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
                color: 'white'
            }}
        >
            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: 3
            }}>
                <Box>
                    <Avatar
                        src={wallet.icon}
                        sx={{ height: '24px', width: '24px' }}
                        variant="square"
                    />
                </Box>
                <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {getShorterAddress(wallet.address, 12)}
                </Box>
            </Box>
            <Box sx={{ display: EndIcon ? "block" : "none" }}>
                <IconButton
                    onClick={() => handleButtonClick ? handleButtonClick(wallet.address) : null}>
                    {EndIcon}
                </IconButton>
            </Box>
        </Button>
    )
}