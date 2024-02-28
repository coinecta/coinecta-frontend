import React, { FC } from 'react';
import { Box, Divider, Typography } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';

interface DataSpreadProps {
  title: string;
  data: string;
  margin?: number;
  isLoading?: boolean;
}

const DataSpread: FC<DataSpreadProps> = ({ title, data, margin, isLoading }) => {
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
      <Typography variant="h6" sx={{ mb: 0, lineHeight: 0.8 }}>
        {isLoading ? <Skeleton animation='wave' width={160} /> : data}
      </Typography>
    </Box>
  );
};

export default DataSpread;