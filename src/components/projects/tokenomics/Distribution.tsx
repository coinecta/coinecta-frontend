import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery,
  Typography,
  useTheme,
  TableContainer
} from '@mui/material';
import { Fragment, FC } from 'react';

const tokenomicsHeading: { [key: string]: string } = {
  name: 'Name',
  amount: 'Amount',
  value: 'Value',
  tge: 'TGE',
  freq: 'Frequency',
  length: 'Length',
  lockup: 'Cliff',
};

const tokenomicsKeys = Object.keys(tokenomicsHeading);
const tokenomicsHeadingValues = Object.values(tokenomicsHeading);

interface IDistribution {
  data: TTokenomic[],
}

const Distribution: FC<IDistribution> = ({ data }) => {
  const theme = useTheme()
  const desktop = useMediaQuery(() => theme.breakpoints.up('md'));

  const largeHeading = tokenomicsHeadingValues.map((value, i) => {
    return (
      <TableCell key={i} sx={{ fontWeight: '800' }}>
        {value}
      </TableCell>
    );
  });

  return (
    <TableContainer component={Paper} variant="outlined">

      {desktop ? (
        <Table size="small" >
          <TableHead>
            <TableRow>{largeHeading}</TableRow>
          </TableHead>
          <TableBody>
            {data.map((round: any) => {
              const keysLoop = tokenomicsKeys.map((key) => {
                return (
                  <TableCell key={key}>
                    {round?.[key].toLocaleString(navigator.language, {
                      maximumFractionDigits: 0,
                    })}
                  </TableCell>
                );
              });
              return <TableRow sx={{
                '&:nth-of-type(odd)': {
                  backgroundColor: theme.palette.background.default,
                },
                // hide last border
                '&:last-child td, &:last-child th': {
                  border: 0,
                },
              }} key={round.name}>{keysLoop}</TableRow>;
            })}
          </TableBody>
        </Table>
      ) : (
        <Table sx={{
          p: 0,
        }}>
          {data.map((round: any, index) => {
            const keysLoop = tokenomicsKeys.map((key, i) => {
              if (round?.[key]) {
                return (
                  <TableRow key={i}>
                    <TableCell
                      sx={{
                        color: theme.palette.text.secondary,
                        textAlign: 'right',
                        p: 1,
                        border: 0
                      }}
                    >
                      {tokenomicsHeading[key]}:
                    </TableCell>
                    <TableCell sx={{ p: 1, fontWeight: 700, border: 0 }}>
                      {round?.[key].toLocaleString(navigator.language, {
                        maximumFractionDigits: 0,
                      })}
                    </TableCell>
                  </TableRow>
                );
              }
              return null;
            });

            // Check if this TableBody is the last one
            const isLastTableBody = index === data.length - 1;

            return (
              <TableBody
                key={round.name}
                sx={{
                  '&:nth-of-type(even)': {
                    backgroundColor: theme.palette.background.default,
                  },
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  ...(isLastTableBody && {
                    border: 0,
                  }),
                }}
              >
                {keysLoop}
              </TableBody>
            );
          })}
        </Table>

      )}
    </TableContainer>
  );
};

export default Distribution;
