import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery,
  useTheme,
  TableContainer
} from '@mui/material';
import { FC, useMemo, useEffect, useState } from 'react';
import Link from '@components/Link';
import { getShorterAddress } from '@lib/utils/general';
import { trpc } from '@lib/utils/trpc';

const tokenomicsHeading: { [key: string]: string } = {
  name: 'Name',
  amount: 'Amount',
  value: 'Value',
  tge: 'TGE',
  freq: 'Frequency',
  length: 'Length',
  lockup: 'Cliff'
};

interface IDistribution {
  data: TTokenomic[],
}

const Distribution: FC<IDistribution> = ({ data }) => {
  const theme = useTheme()
  const desktop = useMediaQuery(() => theme.breakpoints.up('md'));
  const [tokenomicsKeys, setTokenomicKeys] = useState(Object.keys(tokenomicsHeading));
  const [tokenomicsHeadingValues, setTokenomicsHeadingValues] = useState(Object.values(tokenomicsHeading));

  const dataHasWalletAddress = useMemo(() => {
    return data.some((elem) => elem.walletAddress !== '' && elem.walletAddress !== null && elem.walletAddress !== undefined);
  }, [data]);

  const walletAddresses = useMemo(() => data.map((item) => item.walletAddress || ''), [data]);
  const { data: verifiedAddresses, isLoading } = trpc.project.verifyAdaHandles.useQuery(walletAddresses, {
    enabled: walletAddresses.length > 0
  });

  useEffect(() => {
    // Dynamic Column Wallet Address
    if (dataHasWalletAddress) {
      tokenomicsHeading.walletAddress = 'Wallet Address';
      setTokenomicKeys(Object.keys(tokenomicsHeading));
      setTokenomicsHeadingValues(Object.values(tokenomicsHeading));
    }
  }, [dataHasWalletAddress]);

  return (
    <TableContainer component={Paper} variant="outlined">

      {desktop ? (
        <Table size="small" >
          <TableHead>
            <TableRow>
              {tokenomicsHeadingValues.map((value, i) => {
                return (
                  <TableCell key={i} sx={{ fontWeight: '800' }}>
                    {value}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((round: any, index) => {
              const keysLoop = tokenomicsKeys.map((key) => {
                return (
                  <TableCell key={key}>
                    {key === 'walletAddress' && verifiedAddresses ? (
                      isLoading ? 'Loading...' :
                        <Link href={`https://cardanoscan.io/address/${verifiedAddresses[index]}`} target="_blank">
                          {round.walletAddress.includes('$') ? round.walletAddress : getShorterAddress(verifiedAddresses[index], 4)}
                        </Link>
                    ) : round?.[key]?.toLocaleString(navigator.language, {
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
                      {key === 'walletAddress' && verifiedAddresses ? (
                        isLoading ? 'Loading...' :
                          <Link href={`https://cardanoscan.io/address/${verifiedAddresses[index]}`} target="_blank">
                            {round.walletAddress.includes('$') ? round.walletAddress : getShorterAddress(verifiedAddresses[index], 4)}
                          </Link>
                      ) : round?.[key]?.toLocaleString(navigator.language, {
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
