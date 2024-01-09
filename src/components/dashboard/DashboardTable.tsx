import React, { FC, useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme
} from '@mui/material';
import dayjs from 'dayjs';
import ActionBar, { IActionBarButton } from './ActionBar';

interface IDashboardTableProps<T> {
  title?: string;
  data: T[];
  isLoading: boolean;
  error: boolean;
  actions?: IActionBarButton[];
  selectedRows?: Set<number>;
  setSelectedRows?: React.Dispatch<React.SetStateAction<Set<number>>>
  parentContainerRef: React.RefObject<HTMLDivElement>;
}

// NOTE: YOU MAY HAVE TO SET THE PARENT CONTAINER TO overflow: 'clip' TO FIX IPHONE ISSUES

// if you want an action bar (buttons to do actions on specific rows) you need to include
// actions, selectedRows, and setSelectedRows

const DashboardTable = <T extends Record<string, any>>({
  title,
  data,
  isLoading,
  error,
  actions,
  selectedRows,
  setSelectedRows,
  parentContainerRef
}: IDashboardTableProps<T>) => {
  const [parentWidth, setParentWidth] = useState(0);
  const [paperWidth, setPaperWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [translateX, setTranslateX] = useState(0);
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

  const handleSelectRow = (index: number) => {
    if (setSelectedRows && actions) {
      setSelectedRows((prevSelectedRows) => {
        const newSelectedRows = new Set(prevSelectedRows);
        if (newSelectedRows.has(index)) {
          newSelectedRows.delete(index);
        } else {
          newSelectedRows.add(index);
        }
        return newSelectedRows;
      });
    }
  };

  const handleSelectAllRows = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (setSelectedRows && actions) {
      if (event.target.checked) {
        const newSelectedRows = new Set<number>();
        data.forEach((_, index) => newSelectedRows.add(index));
        setSelectedRows(newSelectedRows);
      } else {
        setSelectedRows(new Set());
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;
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
        {actions && <ActionBar actions={actions} />}
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
              {actions && selectedRows && <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedRows.size > 0 && selectedRows.size < data.length}
                  checked={data.length > 0 && selectedRows.size === data.length}
                  onChange={handleSelectAllRows}
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
            {data.map((item, index) => (
              <TableRow key={index}
                sx={{
                  '&:nth-of-type(odd)': { backgroundColor: theme.palette.mode === 'dark' ? 'rgba(205,205,235,0.05)' : 'rgba(0,0,0,0.05)' },
                  '&:hover': { background: theme.palette.mode === 'dark' ? 'rgba(205,205,235,0.15)' : 'rgba(0,0,0,0.1)' }
                }}
              >
                {actions && selectedRows && <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedRows.has(index)}
                    onChange={() => handleSelectRow(index)}
                  />
                </TableCell>}
                {Object.keys(item).map((key, colIndex) => (
                  <TableCell key={`${key}-${colIndex}`} sx={{ borderBottom: 'none' }}>
                    {renderCellContent(item, key)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default DashboardTable;

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
