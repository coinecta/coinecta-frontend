import SortByWalletDropdown from '@components/SortByWalletDropdown';
import ActionBar, { IActionBarButton } from '@components/dashboard/ActionBar';
import { walletsList } from '@lib/walletsList';
import {
  Avatar,
  Box,
  Checkbox,
  Paper,
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
import React, { useEffect, useMemo, useRef, useState } from 'react';
import DashboardCard from '../DashboardCard';

interface IStakePositionTableProps<T> {
  title?: string;
  data: T[];
  stakeKeyWalletMapping: Record<string, string>;
  currentWallet: string;
  setCurrentWallet: (wallet: string) => void;
  connectedWallets: string[];
  isLoading: boolean;
  error: boolean;
  actions?: IActionBarButton[];
  selectedRows?: Set<T>;
  setSelectedRows?: React.Dispatch<React.SetStateAction<Set<any>>>
  parentContainerRef: React.RefObject<HTMLDivElement>;
}

const rowsPerPageOptions = [5, 10, 15];

// NOTE: YOU MAY HAVE TO SET THE PARENT CONTAINER TO overflow: 'clip' TO FIX IPHONE ISSUES

// if you want an action bar (buttons to do actions on specific rows) you need to include
// actions, selectedRows, and setSelectedRows

const StakePositionTable = <T extends Record<string, any>>({
  title,
  data,
  currentWallet,
  setCurrentWallet,
  stakeKeyWalletMapping,
  connectedWallets,
  isLoading,
  error,
  actions,
  selectedRows,
  setSelectedRows,
  parentContainerRef
}: IStakePositionTableProps<T>) => {
  const [parentWidth, setParentWidth] = useState(0);
  const [paperWidth, setPaperWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const tableRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const [sortedData, setSortedData] = useState<T[]>(data);

  const sensitivityThreshold = 2;

  useEffect(() => {
    const handleResize = () => {
      if (paperRef?.current && parentContainerRef?.current) {
        setPaperWidth(paperRef.current.offsetWidth);
        setParentWidth(parentContainerRef.current.offsetWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => setSortedData(data), [data]);

  useEffect(() => {
    if (currentWallet)
    {
      setSelectedRows!(new Set());
    }
  }, [currentWallet, setSelectedRows])

  useEffect(() => {
    data.sort((a, b) => {
      // If a's wallet matches currentWallet, it should come before b
      if (stakeKeyWalletMapping[a.stakeKey] === currentWallet && stakeKeyWalletMapping[b.stakeKey] !== currentWallet) {
        return -1;
      }
      // If b's wallet matches currentWallet, it should come before a
      if (stakeKeyWalletMapping[b.stakeKey] === currentWallet && stakeKeyWalletMapping[a.stakeKey] !== currentWallet) {
        return 1;
      }
      
      // If neither a nor b is the currentWallet, keep their original order
      return 0;
    });

    setSortedData([...data]);
  }, [data, currentWallet, stakeKeyWalletMapping])

  const isTableWiderThanParent = parentWidth < paperWidth

  const onDragStart = (clientX: number, clientY: number) => {
    if (tableRef.current && isTableWiderThanParent) {
      setIsDragging(true);
      setStartX(clientX - translateX)
      setStartY(clientY);
      tableRef.current.style.cursor = 'grabbing';
      tableRef.current.style.userSelect = 'none';
    }
  };

  const onDragMove = (e: React.MouseEvent<Element, MouseEvent> | React.TouchEvent<Element>, clientX: number, clientY: number) => {
    if (!isDragging || !tableRef.current) return;

    let deltaX = clientX - startX;
    const deltaY = clientY - startY;

    // Check if the swipe is more horizontal than vertical using the sensitivity threshold
    if (Math.abs(deltaX) > Math.abs(deltaY) * sensitivityThreshold) {
      e.preventDefault(); // Prevent default only for horizontal swipes
      const maxTranslate = tableRef.current.offsetWidth - tableRef.current.scrollWidth;
      deltaX = Math.min(Math.max(deltaX, maxTranslate), 0);
      setTranslateX(deltaX);
      tableRef.current.style.cursor = 'grabbing'
      tableRef.current.style.transform = `translateX(${deltaX}px)`;
    }
  };

  const onDragEnd = () => {
    if (tableRef.current && isTableWiderThanParent) {
      setIsDragging(false);
      tableRef.current.style.cursor = 'grab';
      tableRef.current.style.removeProperty('user-select');
    }
  };

  const onMouseDown = (e: React.MouseEvent) => onDragStart(e.pageX, e.pageY);
  const onMouseMove = (e: React.MouseEvent) => onDragMove(e, e.pageX, e.pageY);
  const onMouseUpOrLeave = () => onDragEnd();

  const onTouchStart = (e: React.TouchEvent) => onDragStart(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchMove = (e: React.TouchEvent) => onDragMove(e, e.touches[0].clientX, e.touches[0].clientY);
  const onTouchEnd = () => onDragEnd();

  const theme = useTheme();
  const columns: (keyof T)[] = sortedData.length > 0 ? Object.keys(sortedData[0]) as (keyof T)[] : [];

  const renderCellContent = (item: T, key: keyof T) => {
    const cellData = item[key];
    if (cellData && typeof cellData === 'object' && 'render' in cellData) {
      if (cellData.render) {
        return cellData.render(cellData.value, item);
      } else {
        return cellData.value;
      }
    } else {
      return formatData(item, key);
    }
  };

  const isCheckboxDisabled = (item: T) => {
    return item.unlockDate > new Date();
  };

  const selectableRows = useMemo(() => {
    return sortedData
      .filter(d => d.unlockDate < new Date());
  }, [sortedData]);

  const handleSelectRow = (item: T) => {
    if (setSelectedRows && actions) {
      setSelectedRows((prevSelectedRows) => {
        const newSelectedRows = new Set(prevSelectedRows);
        // Check if the checkbox for this row is not disabled
        if (!isCheckboxDisabled(item)) {
          if (newSelectedRows.has(item)) {
            newSelectedRows.delete(item);
          } else {
            newSelectedRows.add(item);
          }
        }
        return newSelectedRows;
      });
    }
  };

  const handleSelectAllRows = () => {
    if (setSelectedRows && actions) {
      sortedData
        .filter(item => stakeKeyWalletMapping[item.stakeKey] == currentWallet && !isCheckboxDisabled(item))
        .forEach((item) => handleSelectRow(item));
    }
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const allSelectableSelected = selectableRows.every(item => selectedRows?.has(item));
  const someSelectableSelected = selectableRows.some(item => selectedRows?.has(item)) && !allSelectableSelected;

  // if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading</div>;
  return (
    <Box
      ref={tableRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseUpOrLeave}
      onMouseUp={onMouseUpOrLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      sx={{
        cursor: isDragging ? 'grabbing' : (isTableWiderThanParent ? 'grab' : 'auto'),
        '&:active': {
          cursor: isTableWiderThanParent ? 'grabbing' : 'auto',
        },
        zIndex: 0
      }}
    >
      <Paper variant="outlined"
        ref={paperRef}
        sx={{
          mb: 2,
          overflowX: 'visible',
          width: 'auto',
          minWidth: 'max-content'
        }}
      >
        {title &&
          <Typography variant="h5" sx={{ p: 2 }}>
            {title}
          </Typography>
        }
        <DashboardCard sx={{ border: 'none', paddingLeft: '0', paddingRight: '0' }}>
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '8px' }}>
            {actions && sortedData.length > 0 && <ActionBar isDisabled={isLoading} actions={actions} />}
            <SortByWalletDropdown 
              wallet={currentWallet} 
              setWallet={setCurrentWallet} 
              connectedWallets={connectedWallets} />
          </Box>
          {sortedData.length > 0 ?
            <Table>
              <TableHead>
                <TableRow sx={{
                  '& th': {
                    position: 'sticky',
                    top: actions ? '121px' : '71px',
                    zIndex: 2,
                    background: theme.palette.background.paper,
                  }
                }}>
                  <TableCell></TableCell>
                  {actions && sortedData.length > 0 && selectedRows && <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={someSelectableSelected}
                      checked={allSelectableSelected}
                      onChange={handleSelectAllRows}
                      color="secondary"
                    />
                  </TableCell>}

                  {columns.map((column) => (
                    column !== 'stakeKey' && 
                    <TableCell key={String(column)}> {camelCaseToTitle(String(column))} </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, index) => {
                  const itemIndex = page * rowsPerPage + index;
                  const walletType = stakeKeyWalletMapping[item.stakeKey];
                  const wallet = walletsList.find(w => w.connectName === walletType);
                  const icon = theme.palette.mode === 'dark' ? wallet?.iconDark : wallet?.icon;

                  return ( 
                    <TableRow key={itemIndex}
                      sx={{
                        '&:nth-of-type(odd)': { backgroundColor: theme.palette.mode === 'dark' ? 'rgba(205,205,235,0.05)' : 'rgba(0,0,0,0.05)' },
                        '&:hover': { background: theme.palette.mode === 'dark' ? 'rgba(205,205,235,0.15)' : 'rgba(0,0,0,0.1)' }
                      }}
                    >
                      <TableCell sx={{ borderBottom: 'none', width: '22px' }}>
                        <Avatar variant='square' sx={{ width: '22px', height: '22px' }} src={icon} />
                      </TableCell>
                      {actions && selectedRows && <TableCell padding="checkbox" sx={{ borderBottom: 'none' }}>
                        <Checkbox
                          checked={selectedRows.has(item)}
                          onChange={() => handleSelectRow(item)}
                          color="secondary"
                          disabled={item.unlockDate > new Date() || stakeKeyWalletMapping[item.stakeKey] !== currentWallet}
                        />
                      </TableCell>}
                      {Object.keys(item).map((key, colIndex) => (
                        key !== 'stakeKey' && 
                        <TableCell key={`${key}-${colIndex}`} sx={{ borderBottom: 'none' }}>
                          {isLoading ? <Skeleton width={100} /> : renderCellContent(item, key)}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    component="td"
                    rowsPerPageOptions={rowsPerPageOptions}
                    colSpan={8}
                    count={sortedData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TableRow>
              </TableFooter>
            </Table> :
            <Box sx={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box component={'p'}>
                No data available
              </Box>
            </Box>
          }
        </DashboardCard>
      </Paper>
    </Box>
  );
};

export default StakePositionTable;

const formatData = <T,>(data: T, key: keyof T): string => {
  const value = data[key];
  if (typeof value === 'number') {
    return value.toLocaleString();
  } else if (value instanceof Date) {
    return dayjs(value).format('YYYY/MM/DD');
  }
  // Default to string conversion
  return String(value);
}

const camelCaseToTitle = (camelCase: string) => {
  const withSpaces = camelCase.replace(/([A-Z])/g, ' $1').trim();
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}
