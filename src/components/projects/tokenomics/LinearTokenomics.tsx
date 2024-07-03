import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { LinearProgressStyled } from '@components/styled-components/LinearProgress';
import React, { FC } from 'react';
import { useTheme } from '@mui/material';

function LinearProgressWithLabel(props: any) {
  const theme = useTheme()
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgressStyled
          variant="determinate"
          barColorStart={theme.palette.secondary.main}
          barColorEnd={theme.palette.secondary.light}
          {...props}
        />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography color="text.secondary">
          {`${(Math.round(props.value * 10) / 10).toFixed(1).replace(/\.0$/, '')}%`}
        </Typography>
      </Box>
    </Box>
  );
}

const LinearTokenomics: FC<{ tokenomics: TTokenomic[] }> = ({ tokenomics }) => {
  const total = tokenomics.reduce((a: any, data: any) => a + data.amount, 0);
  const tokenSections = tokenomics.map((data: any) => {
    return {
      name: data.name,
      percent: (data.amount * 100) / total,
    };
  });

  return (
    <Box width="90%" sx={{ mx: 'auto' }}>
      {tokenSections.map((item: any, i: number) => (
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

export default LinearTokenomics;
