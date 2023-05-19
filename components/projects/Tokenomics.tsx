import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import React from 'react';

function LinearProgressWithLabel(props) {
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

const Distribution = ({ data }) => {
  const tokenomics = data ? data : [];
  const total = tokenomics.reduce((a, data) => a + data.amount, 0);
  const tokenSections = tokenomics.map((data) => {
    return {
      name: data.name,
      percent: (data.amount * 100) / total,
    };
  });

  return (
    <Box width="90%" sx={{ mx: 'auto' }}>
      {tokenSections.map(({ name, percent }) => (
        <React.Fragment key={name}>
          <Box sx={{ width: '100%', mb: 1 }}>
            <Typography color="text.secondary" sx={{ fontWeight: '500' }}>
              {name}
            </Typography>
            <LinearProgressWithLabel value={percent} />
          </Box>
        </React.Fragment>
      ))}
    </Box>
  );
};

export default Distribution;
