import React, { FC } from 'react';
import {
  Dialog,
  DialogContent,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Swap from '@dexhunterio/swaps'
import '@dexhunterio/swaps/lib/assets/style.css'
import { ensureHexColor } from '@lib/utils/general';
import { toTokenId } from '@lib/utils/assets';

interface IDexhunterDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  projectData: TProject
}

const DexhunterDialog: FC<IDexhunterDialogProps> = ({
  open,
  setOpen,
  projectData
}) => {
  const theme = useTheme()
  const upSm = useMediaQuery(theme.breakpoints.up('sm'))

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="dexhunter-modal"
      aria-describedby="dexhunter-swap-window"
      sx={{
        p: 0,
        '& .MuiPaper-root': {
          background: 'none',
          lineHeight: 0,
          borderRadius: '26px'
        },
        '& .MuiBackdrop-root': {
          backdropFilter: 'blur(5px)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }
      }}
      scroll="body"
    >
      <DialogContent sx={{ p: 0, borderRadius: '26px' }}>
        <Swap
          orderTypes={["SWAP", "LIMIT"]}
          defaultToken={toTokenId(projectData.tokenomics.tokenPolicyId, projectData.tokenomics.tokenTicker)}
          // @ts-ignore
          supportedTokens={[toTokenId(projectData.tokenomics.tokenPolicyId, projectData.tokenomics.tokenTicker)]}
          colors={{
            "background": ensureHexColor(theme.palette.background.paper),
            "containers": theme.palette.mode === 'dark' ? ensureHexColor('rgb(20, 24, 35)') : ensureHexColor('rgb(227, 229, 228)'),
            "subText": ensureHexColor(theme.palette.text.secondary),
            "mainText": ensureHexColor(theme.palette.text.primary),
            "buttonText": ensureHexColor(theme.palette.background.default),
            "accent": ensureHexColor(theme.palette.secondary.main)
          }}
          theme={theme.palette.mode === 'dark' ? 'dark' : 'light'}
          width={upSm ? "420px" : "300px"}
          partnerCode={process.env.DEXHUNTER_PARTNER_CODE || ''}
          partnerName="Coinecta"
          displayType="DEFAULT"
        />
      </DialogContent>
    </Dialog>
  );
};

export default DexhunterDialog;