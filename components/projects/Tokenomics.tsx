import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import React from 'react';

function LinearProgressWithLabel(props: any) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props.value
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

const Distribution = ( data: any ) => {
  const tokenomics = data ? data : [];
  const total = tokenomics.reduce((a: any, data: any) => a + data.amount, 0);
  const tokenSections = tokenomics.map((data: any) => {
    return {
      name: data.name,
      percent: (data.amount * 100) / total,
    };
  });

  return (
    <Box width="90%" sx={{ mx: 'auto' }}>
      {tokenSections.map(( item: any, i: number ) => (
        <React.Fragment key={item.name}>
          <Box sx={{ width: '100%', mb: 1 }}>
            <Typography color="text.secondary" sx={{ fontWeight: '500' }}>
              {item.name}
            </Typography>
            <LinearProgressWithLabel value={item.percent} />
          </Box>
        </React.Fragment>
      ))}
    </Box>
  );
};

export default Distribution;
