import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Divider,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useTheme
} from '@mui/material';
import dayjs from 'dayjs';
import DashboardCard from '@components/dashboard/DashboardCard';
import { trpc } from '@lib/utils/trpc';
import { ClaimEntriesResponse, ClaimTreasuryDataResponse } from '@server/services/vestingApi';
import { ClaimEntry } from './pages/VestingDashboardPage';
import WalletSelectDropdown from '@components/WalletSelectDropdown';
import { useWallet } from '@meshsdk/react';

interface IVestingPositionTableProps<T> {
  data: T[];
  isLoading: boolean;
  connectedAddress?: string;
  walletName?: string;
}

const rowsPerPageOptions = [5, 10, 15];

const VestingPositionTable = <T extends Record<string, any>>({
  data,
  isLoading,
  connectedAddress,
  walletName
} : IVestingPositionTableProps<T>) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const { connected, name } = useWallet();
  const [clicked, setClicked] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<any>>(new Set());
  const [cborAddresses, setCborAddresses] = useState<string[] | undefined>(undefined);

  const _connectedAddress = useMemo(() => connectedAddress, [connectedAddress]);
  const _walletName = useMemo(() => walletName, [walletName]);

  const createClaimTreasuryDataMutation = trpc.vesting.createClaimTreasuryData.useMutation();
  const fetchClaimEntriesByAddressMutation = trpc.vesting.fetchClaimEntriesByAddress.useMutation();

  useEffect(() => {
    const execute = async () => {
      if (connected) {
        const api = await window.cardano[name.toLowerCase()].enable();

        const addresses = await api.getUsedAddresses();
        setCborAddresses(addresses);
      }
    }
    execute();
  }, [connected, name]);

  const fetchClaimEntries = useCallback(async () => {
    if (cborAddresses === undefined) return;
    const _claimEntries: ClaimEntriesResponse[] = await fetchClaimEntriesByAddressMutation.mutateAsync({
      addresses: cborAddresses
    });

    console.log('Claim Entries', _claimEntries);
  }, [cborAddresses, fetchClaimEntriesByAddressMutation]);

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatData = <T,>(data: T, key: keyof T): string => {
    const value = data[key];
    if (typeof value === 'number') {
      return value.toLocaleString();
    } else if (value instanceof Date) {
      return dayjs(value).format('YYYY/MM/DD');
    }
    return String(value);
  };

  const camelCaseToTitle = (camelCase: string) => {
    const withSpaces = camelCase.replace(/([A-Z])/g, ' $1').trim();
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
  };

  const handleSelectRow = (item: T) => {
    if (setSelectedRows) {
      setSelectedRows((prevSelectedRows) => {
        const newSelectedRows = new Set(prevSelectedRows);
        if(newSelectedRows.has(item)) {
            newSelectedRows.delete(item);
        } else {
            newSelectedRows.add(item);
        }
        setClicked((newSelectedRows.size == 0) ? false : true);
        return newSelectedRows;
      });
    }
  };

  const getRawUtxos = useCallback(async () => {
    if (_walletName !== undefined) {
      const api = await window.cardano[_walletName].enable();

      const rawUtxos = await api.getUtxos();

      if (rawUtxos === undefined) return;
      return rawUtxos;
    }
  }, [_walletName]);

  const handleOnRedeemClick = useCallback(async () => {
    const rawUtxos = await getRawUtxos();

    const rootHash: string = '617bb218ba8815fe5bd1ee82dddcc7dacda548837409c5963b74b9dce1e0d14d';
    
    if (rawUtxos === undefined) return;
    console.log('Raw UTxOs', rawUtxos);

    if (_connectedAddress === undefined) return;
    const newTreasuryData: ClaimTreasuryDataResponse = await createClaimTreasuryDataMutation.mutateAsync({
      ownerAddress: _connectedAddress,
      rootHash: rootHash
    });

    console.log('New Treasury Data', newTreasuryData);
  }, [getRawUtxos, _connectedAddress, createClaimTreasuryDataMutation]);

  return (
    <>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'center', sm: 'flex-end' },
        mb: 1,
        gap: 1
      }}>
        <Typography variant="h5">
          Your Vesting Positions
        </Typography>
        <Box sx={{ minWidth: '250px', display: 'block' }}>
          <WalletSelectDropdown />
        </Box>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <DashboardCard sx={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2}}>
        {data.length > 0 ? (
        <Table>
          <TableHead>
            <TableRow sx={{
              '& th': {
                position: 'sticky',
                top: '71px',
                zIndex: 2,
                background: theme.palette.background.paper,
              }
            }}>
              <TableCell></TableCell>
              <TableCell padding="checkbox"></TableCell>
              {Object.keys(data[0]).map((column) => (
                <TableCell key={String(column)} sx={{ color: theme.palette.mode === 'dark' ? '#ffffff' : 'black' }}>
                  {camelCaseToTitle(String(column))}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, index) => (
                <TableRow key={index}
                  sx={{
                    '&:nth-of-type(odd)': { backgroundColor: theme.palette.mode === 'dark' ? 'rgba(205,205,235,0.05)' : 'rgba(0,0,0,0.05)' },
                    '&:hover': { background: theme.palette.mode === 'dark' ? 'rgba(205,205,235,0.15)' : 'rgba(0,0,0,0.1)' }
                  }}
                >
                  <TableCell sx={{ borderBottom: 'none', width: '30px' }}>
                    <Avatar variant='rounded' sx={{ width: '30px', height: '30px', marginLeft: '15px', marginRight: '10px' }} src={'https://i.imgur.com/0689zZr.png'}/>
                  </TableCell>
                  <TableCell padding="checkbox" sx={{ borderBottom: 'none', paddingRight: '15px' }}>
                  <Checkbox
                      checked={selectedRows?.has(item)}
                      onChange={() => handleSelectRow(item)}
                      color="secondary"
                      disabled={false}
                  />
                  </TableCell>
                  {Object.keys(item).map((key, colIndex) => (
                  <TableCell key={`${key}-${colIndex}`} sx={{ borderBottom: 'none', color: theme.palette.mode === 'dark' ? '#ffffff' : '#424242' }}>
                    {key === 'projectName' ? (
                      <Box sx={{ display: 'flex', alignItems: 'center'}}>
                          <Avatar variant='rounded' sx={{ width: '30px', height: '30px', marginRight: '10px', borderRadius: '9999px' }} src={'https://i.imgur.com/4KkO0mV.jpg'}/>
                          {isLoading ? <Skeleton width={100} /> : formatData(item, key)}
                      </Box>
                    ) : (
                      isLoading ? <Skeleton width={100} /> : formatData(item, key as keyof T)
                    )}  
                  </TableCell>
                  ))}
                </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                component="td"
                rowsPerPageOptions={rowsPerPageOptions}
                colSpan={9}
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableRow>
          </TableFooter>
        </Table>
        ) : (
        <Box sx={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box component={'p'}>
            No data available
          </Box>
        </Box>
        )}
      </DashboardCard>
      <Box sx={{ display: 'flex', justifyContent: 'end' }}>
        <Button color="primary" 
          sx={{ px: '50px', py: '5px', color: 'white'}} 
          variant="contained" 
          disabled={_connectedAddress === undefined}
          onClick={fetchClaimEntries}
        >
          Redeem
        </Button>
      </Box>
    </>
  );
};

export default VestingPositionTable;
