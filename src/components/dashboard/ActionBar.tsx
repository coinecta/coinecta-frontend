import React, { FC } from 'react';
import { Box, Button, useTheme } from '@mui/material';

export interface IActionBarButton {
  label: string;
  count: number;
  handler: Function;
}

interface IActionBarProps {
  actions: IActionBarButton[]
}

const ActionBar: FC<IActionBarProps> = ({ actions }) => {
  const theme = useTheme()
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: 1,
        p: 1,
        position: 'sticky',
        top: '71px',
        zIndex: 2,
        background: theme.palette.background.paper,
        height: '50px'
      }}
    >
      {actions.map((action, index) => (
        <Button key={index} variant="contained" onClick={() => action.handler()}>
          {action.label} {action.count}
        </Button>
      ))}
    </Box>
  );
};

export default ActionBar;