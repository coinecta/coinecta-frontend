import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useTheme
} from '@mui/material';
import dayjs from 'dayjs';
import ActionBar, { IActionBarButton } from '@components/dashboard/ActionBar';
import DashboardCard from '../DashboardCard';

interface IStakePositionTableProps<T> {
  title?: string;
  data: T[];
  isLoading: boolean;
  error: boolean;
  actions?: IActionBarButton[];
  selectedRows?: Set<number>;
  setSelectedRows?: React.Dispatch<React.SetStateAction<Set<number>>>
  parentContainerRef: React.RefObject<HTMLDivElement>;
}

const rowsPerPageOptions = [5, 10, 15];

// NOTE: YOU MAY HAVE TO SET THE PARENT CONTAINER TO overflow: 'clip' TO FIX IPHONE ISSUES

// if you want an action bar (buttons to do actions on specific rows) you need to include
// actions, selectedRows, and setSelectedRows

const StakePositionTable = <T extends Record<string, any>>({
  title,
  data,
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
  const columns: (keyof T)[] = data.length > 0 ? Object.keys(data[0]) as (keyof T)[] : [];

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
    return data.map((d, index) => ({ index, unlockDate: d.unlockDate })).filter(d => d.unlockDate < new Date()).map(d => d.index);
  }, [data]);

  const handleSelectRow = (index: number) => {
    if (setSelectedRows && actions) {
      setSelectedRows((prevSelectedRows) => {
        const newSelectedRows = new Set(prevSelectedRows);
        const currentItem = data[index];
        // Check if the checkbox for this row is not disabled
        if (!isCheckboxDisabled(currentItem)) {
          if (newSelectedRows.has(index)) {
            newSelectedRows.delete(index);
          } else {
            newSelectedRows.add(index);
          }
        }
        return newSelectedRows;
      });
    }
  };

  const handleSelectAllRows = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (setSelectedRows && actions) {
      const newSelectedRows = new Set([] as number[]);
      if (event.target.checked) {
        selectableRows.forEach(index => newSelectedRows.add(index));
      } else {
        selectableRows.forEach(index => newSelectedRows.delete(index));
      }
      setSelectedRows(newSelectedRows);
    }
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const allSelectableSelected = selectableRows.every(index => selectedRows?.has(index));
  const someSelectableSelected = selectableRows.some(index => selectedRows?.has(index)) && !allSelectableSelected;

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
          {actions && data.length > 0 && <ActionBar isDisabled={isLoading} actions={actions} />}
          {data.length > 0 ?
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
                  {actions && data.length > 0 && selectedRows && <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={someSelectableSelected}
                      checked={allSelectableSelected}
                      onChange={handleSelectAllRows}
                      color="secondary"
                    />
                  </TableCell>}

                  {columns.map((column) => (
                    <TableCell key={String(column)}>
                      {camelCaseToTitle(String(column))}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, index) => {
                  const itemIndex = page * rowsPerPage + index;
                  return (
                    <TableRow key={itemIndex}
                      sx={{
                        '&:nth-of-type(odd)': { backgroundColor: theme.palette.mode === 'dark' ? 'rgba(205,205,235,0.05)' : 'rgba(0,0,0,0.05)' },
                        '&:hover': { background: theme.palette.mode === 'dark' ? 'rgba(205,205,235,0.15)' : 'rgba(0,0,0,0.1)' }
                      }}
                    >
                      {actions && selectedRows && <TableCell padding="checkbox" sx={{ borderBottom: 'none' }}>
                        <Checkbox
                          checked={selectedRows.has(itemIndex)}
                          onChange={() => handleSelectRow(itemIndex)}
                          color="secondary"
                          disabled={item.unlockDate > new Date()}
                        />
                      </TableCell>}
                      {Object.keys(item).map((key, colIndex) => (
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
                    colSpan={7}
                    count={data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  // disabled={isLoading} 
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
