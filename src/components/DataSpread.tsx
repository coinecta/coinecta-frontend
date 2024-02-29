import React, { FC } from 'react';
import { Box, Divider, Typography, useTheme } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';

interface DataSpreadProps {
  title: string;
  data: string;
  margin?: number;
  isLoading?: boolean;
  usdValue?: string;
}

const DataSpread: FC<DataSpreadProps> = ({ title, data, margin, isLoading, usdValue }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'flex-end' },
        gap: { xs: '3px', sm: 1 },
        justifyContent: 'space-between',
        width: '100%',
        mb: margin ?? 2
      }}
    >
      <Typography variant="overline" sx={{ mb: 0, lineHeight: 1, fontSize: { xs: '0.9rem', sm: '1rem' }, textTransform: 'none' }}>
        {isLoading ? <Skeleton animation='wave' width={35} /> : title}
      </Typography>
      <Box sx={{ flexGrow: 1 }}>
        {isLoading ? <Skeleton animation='wave' width='100%' height={1} /> : <Divider />}
      </Box>
      <Typography variant="h6" sx={{ mb: 0, lineHeight: 0.8, display: 'flex', alignItems: 'center', gap: '4px' }}>
        {isLoading ?
          <Skeleton animation='wave' width={75} /> :
          <Box>
            {data}
          </Box>}  
        {isLoading && usdValue ?
          <Skeleton animation='wave' width={55} /> :
          <Box component={'span'} sx={{ fontSize: '1rem', color: theme.palette.grey[500] }}>{usdValue ? `(${usdValue})` : null}</Box>}
      </Typography>
    </Box>
  );
};

export default DataSpread;