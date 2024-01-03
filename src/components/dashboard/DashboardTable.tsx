import React, { FC, useRef, useState } from 'react';
import {
  Avatar,
  Box,
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



interface IDashboardTableProps<T> {
  title?: string;
  data: T[];
  isLoading: boolean;
  error: boolean;
}

// NOTE: YOU MAY HAVE TO SET THE PARENT CONTAINER TO overflow: 'clip' TO FIX IPHONE ISSUES

const DashboardTable = <T extends Record<string, any>>({ title, data, isLoading, error }: IDashboardTableProps<T>) => {
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading</div>;

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const tableRef = useRef<HTMLDivElement>(null);

  const sensitivityThreshold = 2;

  const onDragStart = (clientX: number, clientY: number) => {
    if (tableRef.current) {
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
      tableRef.current.style.transform = `translateX(${deltaX}px)`;
    }
  };

  const onDragEnd = () => {
    if (tableRef.current) {
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
        cursor: isDragging ? 'grabbing' : 'grab',
        '&:active': {
          cursor: 'grabbing',
        },
      }}
    >
      <Paper variant="outlined"
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

        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={String(column)}
                  sx={{
                    position: 'sticky',
                    top: '71px',
                    zIndex: 2,
                    background: theme.palette.background.paper,
                  }}
                >
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
