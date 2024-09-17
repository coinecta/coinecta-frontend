import React from 'react';
import { Typography, Box } from '@mui/material';
import MarkdownRender from '@components/MarkdownRender';

interface SalesTermProps {
  header: string;
  bodyText: string;
}

const SalesTerm: React.FC<SalesTermProps> = ({ header, bodyText }) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 1, fontSize: '1.2rem!important' }}>
        {header}
      </Typography>
      {/* <Typography variant="body1" sx={{ fontSize: '1rem!important' }}> */}
      <Box sx={{ '& p': { fontSize: '1rem!important' } }}>
        <MarkdownRender description={bodyText} />
      </Box>
      {/* </Typography> */}
    </Box>
  );
};

export default SalesTerm;