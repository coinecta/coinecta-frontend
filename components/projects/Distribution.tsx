import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery,
  Typography,
  useTheme
} from '@mui/material';
import { Fragment, FC } from 'react';
import { ITokenomic } from '@pages/projects/[project_id]';

const tokenomicsHeading: {[key: string]: string} = {
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
  data: ITokenomic[], 
}

const Distribution: FC<IDistribution> = ({ data }) => {
  const theme = useTheme()
  const checkSmall = useMediaQuery(() => theme.breakpoints.up('md'));

  const largeHeading = tokenomicsHeadingValues.map((value, i) => {
    return (
      <TableCell key={i} sx={{ fontWeight: '800' }}>
        {value}
      </TableCell>
    );
  });

  return (
    <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3 }}>
      
      {checkSmall ? (
        <Table>
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
              return <TableRow key={round.name}>{keysLoop}</TableRow>;
            })}
          </TableBody>
        </Table>
      ) : (
        <Table sx={{ p: 0 }}>
          {data.map((round: any) => {
            const keysLoop = tokenomicsKeys.map((key, i) => {
              if (round?.[key]) {
                if (i == 0) {
                  return (
                    <TableRow key={i} sx={{ borderTop: `1px solid #444` }}>
                      <TableCell
                        sx={{
                          color: theme.palette.text.secondary,
                          border: 'none',
                          p: 1,
                        }}
                      >
                        {tokenomicsHeading[key]}:
                      </TableCell>
                      <TableCell sx={{ border: 'none', p: 1, pt: 2 }}>
                        {round?.[key]}
                      </TableCell>
                    </TableRow>
                  );
                } else if (i < tokenomicsKeys.length - 1) {
                  return (
                    <TableRow key={i}>
                      <TableCell
                        sx={{
                          color: theme.palette.text.secondary,
                          border: 'none',
                          p: 1,
                        }}
                      >
                        {tokenomicsHeading[key]}:
                      </TableCell>
                      <TableCell sx={{ border: 'none', p: 1 }}>
                        {round?.[key].toLocaleString(navigator.language, {
                          maximumFractionDigits: 0,
                        })}
                      </TableCell>
                    </TableRow>
                  );
                } else {
                  return (
                    <TableRow key={i}>
                      <TableCell
                        sx={{
                          color: theme.palette.text.secondary,
                          border: 'none',
                          p: 1,
                        }}
                      >
                        {tokenomicsHeading[key]}:
                      </TableCell>
                      <TableCell sx={{ border: 'none', p: 1, pb: 2 }}>
                        {round?.[key]}
                      </TableCell>
                    </TableRow>
                  );
                }
              }
            });
            return <Fragment key={round.name}>{keysLoop}</Fragment>;
          })}
        </Table>
      )}
    </Paper>
  );
};

export default Distribution;
