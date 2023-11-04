

import React, { FC, useEffect, useState } from 'react';
import {
  Collapse,
  Typography,
  Checkbox,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  useMediaQuery,
  useTheme,
  CircularProgress
} from '@mui/material';
import { formatNumber, roundToTwo } from '@lib/utils/general';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Grid from '@mui/system/Unstable_Grid/Grid';
import { getShorterAddress } from '@lib/utils/general';

type FisoListItemProps = {
  stakepoolData: TStakePoolWithStats;
  approvedData?: TFisoApprovedStakePool;
  keyString: string;
  checked: string[];
  setChecked: React.Dispatch<React.SetStateAction<string[]>>;
  loadingItem?: boolean;
}

const FisoListItem: FC<FisoListItemProps> = ({ stakepoolData, approvedData, keyString, checked, setChecked, loadingItem }) => {
  const theme = useTheme()
  const upSm = useMediaQuery(theme.breakpoints.up('sm'))
  const [open, setOpen] = useState(false);

  const handleDropdown = () => {
    setOpen(!open);
  };

  const handleToggle = (value: string) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const text = approvedData
    ? `${stakepoolData.ticker} - 
  ${formatNumber(Number(stakepoolData.stats.live_stake) * 0.000001)} ₳${upSm ? ` - 
  start: ${approvedData.startEpoch}, end: ${approvedData.endEpoch} - 
  ${getShorterAddress(stakepoolData.pool_id, 12)}` : ''}`
    : `${stakepoolData.ticker} - 
  ${formatNumber(Number(stakepoolData.stats.live_stake) * 0.000001)} ₳${upSm ? ` - 
  ${stakepoolData.pool_id}` : ''}`

  return (
    <>
      <Grid container spacing={1} alignItems="center" sx={{ px: 2 }}>
        <Grid>
          <Checkbox
            onClick={handleToggle(keyString)}
            edge="start"
            checked={checked.indexOf(keyString) !== -1}
            tabIndex={-1}
            disableRipple
          />
        </Grid>
        <Grid xs>
          <Typography
            sx={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',

            }}
          >
            {loadingItem
              ? <CircularProgress />
              : text}
          </Typography>
        </Grid>
        <Grid>
          <IconButton edge="end" aria-label="expand-info" onClick={handleDropdown}>
            {open ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Grid>
      </Grid>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">
            {stakepoolData.ticker}
          </Typography>
          <Typography color="text.secondary">
            {stakepoolData.name}
          </Typography>
          <Typography>
            {stakepoolData.pool_id}
          </Typography>
          {approvedData && (
            <>
              <Typography>
                Start epoch: {approvedData.startEpoch}
              </Typography>
              <Typography>
                End epoch: {approvedData.endEpoch}
              </Typography>
            </>
          )}
          <Typography>
            Live stake: {formatNumber(Number(stakepoolData.stats.live_stake) * 0.000001)} ₳
          </Typography>
          <Typography>
            Fixed Fee: {Number(stakepoolData.stats.fixed_cost) * 0.000001} ₳
          </Typography>
          <Typography>
            Margin cost: {roundToTwo(stakepoolData.stats.margin_cost * 100)}%
          </Typography>
          <Typography>
            Delegators: {stakepoolData.stats.live_delegators}
          </Typography>
          <Typography>
            Saturation: {roundToTwo(stakepoolData.stats.live_saturation * 100)}%
          </Typography>
        </Box>
      </Collapse>
    </>
  );
};

export default FisoListItem;
