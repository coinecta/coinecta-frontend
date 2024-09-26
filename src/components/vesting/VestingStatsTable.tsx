import React from 'react';
import dayjs from 'dayjs';
import {
  Avatar,
  Box,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  useTheme
} from '@mui/material';
import DashboardCard from '@components/dashboard/DashboardCard';

interface IVestingStatsTableProps<T> {
  data: T[];
  isLoading: boolean;
}

const VestingStatsTable = <T extends Record<string, any>>({data,isLoading}: IVestingStatsTableProps<T>) => {
  const theme = useTheme();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const formatData = <T,>(data: T, key: keyof T): string => {
    const value = data[key];
    if (typeof value === 'number') {
      return value.toLocaleString();
    } else if (value instanceof Date) {
      return dayjs(value).format('YYYY/MM/DD');
    }
    return String(value);
  }

  const camelCaseToTitle = (camelCase: string) => {
    const withSpaces = camelCase.replace(/([A-Z])/g, ' $1').trim();
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
  }

  const columns: (keyof T)[] = data.length > 0 ? Object.keys(data[0]).filter(key => !key.includes('icon')) as (keyof T)[] : [];

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <DashboardCard sx={{padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {data.length > 0 ?
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
              {columns.map((column) => (
                <TableCell key={String(column)} sx={{ color: theme.palette.mode === 'dark' ? '#ffffff' : 'black'}}> {camelCaseToTitle(String(column))} </TableCell>
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
                        {item.icon && <Avatar variant='rounded' sx={{ width: '30px', height: '30px', marginLeft: '15px', marginRight: '10px', borderRadius: '9999px' }} src={item.icon} />}
                    </TableCell>
                    {Object.keys(item).map((key, colIndex) => (
                        key !== 'icon' &&
                        <TableCell key={`${key}-${colIndex}`} sx={{ borderBottom: 'none', color: theme.palette.mode === 'dark' ? '#ffffff' :'#424242'}}>
                            {isLoading ? <Skeleton width={100} /> : formatData(item, key as keyof T)}
                        </TableCell>
                    ))}
                </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                component="td"
                rowsPerPageOptions={[5, 10, 15]}
                colSpan={7}
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableRow>
          </TableFooter>
        </Table> :
        <Box sx={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Box component={'p'} sx={{margin:'50px'}}>
            No data available
          </Box>
        </Box>
      }
    </DashboardCard>
  );
}

export default VestingStatsTable;
