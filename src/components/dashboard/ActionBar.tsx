import React, { FC } from 'react';
import { Box, Button, useTheme } from '@mui/material';

export interface IActionBarButton {
  label: string;
  count: number;
  handler: Function;
}

interface IActionBarProps {
  actions: IActionBarButton[];
  isDisabled?: boolean;
}

const ActionBar: FC<IActionBarProps> = ({ actions, isDisabled }) => {
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
        <Button disabled={isDisabled} key={index} variant="contained" color="secondary" onClick={() => action.handler()}>
          {action.label} {action.count}
        </Button>
      ))}
    </Box>
  );
};

export default ActionBar;