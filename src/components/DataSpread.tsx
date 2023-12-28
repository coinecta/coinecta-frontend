import React, { FC } from 'react';
import { Box, Divider, Typography } from '@mui/material';

interface DataSpreadProps {
  title: string;
  data: string;
}

const DataSpread: FC<DataSpreadProps> = ({ title, data }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'flex-end' },
        gap: { xs: '3px', sm: 1 },
        justifyContent: 'space-between',
        width: '100%',
        mb: 2
      }}
    >
      <Typography variant="overline" sx={{ mb: 0, lineHeight: 1, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
        {title}
      </Typography>
      <Box sx={{ flexGrow: 1 }}>
        <Divider />
      </Box>
      <Typography variant="h6" sx={{ mb: 0, lineHeight: 0.8 }}>
        {data}
      </Typography>
    </Box>
  );
};

export default DataSpread;