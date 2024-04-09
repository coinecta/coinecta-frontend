import { useAlert } from '@contexts/AlertContext';
import { useWalletContext } from '@contexts/WalletContext';
import { useCardano } from '@lib/utils/cardano';
import { trpc } from '@lib/utils/trpc';
import { walletNameToId, walletsList } from '@lib/walletsList';
import { useWallet } from '@meshsdk/react';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LaunchIcon from '@mui/icons-material/Launch';
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { TimeIcon } from '@mui/x-date-pickers';
import copy from 'copy-to-clipboard';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ActionBar, { IActionBarButton } from './ActionBar';
import DashboardCard from './DashboardCard';

interface ITransactionHistoryTableProps<T> {
  title?: string;
  data: T[];
  isLoading: boolean;
  error: boolean;
  actions?: IActionBarButton[];
  selectedRows?: Set<number>;
  setSelectedRows?: React.Dispatch<React.SetStateAction<Set<number>>>;
  parentContainerRef: React.RefObject<HTMLDivElement>;
  totalRequests: number;
  currentRequestPage: number;
  setCurrentRequestPage: React.Dispatch<React.SetStateAction<number>>;
  requestPageLimit: number;
  setRequestPageLimit: React.Dispatch<React.SetStateAction<number>>;
}

const rowsPerPageOptions = [5, 10, 15];

// NOTE: YOU MAY HAVE TO SET THE PARENT CONTAINER TO overflow: 'clip' TO FIX IPHONE ISSUES

// if you want an action bar (buttons to do actions on specific rows) you need to include
// actions, selectedRows, and setSelectedRows

const TransactionHistoryTable = <T extends Record<string, any>>({
  title,
  data,
  error,
  isLoading,
  actions,
  parentContainerRef,
  totalRequests,
  currentRequestPage,
  setCurrentRequestPage,
  requestPageLimit,
  setRequestPageLimit
}: ITransactionHistoryTableProps<T>) => {
  const [parentWidth, setParentWidth] = useState(0);
  const [paperWidth, setPaperWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const { addAlert } = useAlert();
  const tableRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();
  const cancelStakeTxMutation = trpc.sync.cancelStakeTx.useMutation();
  const finaliseTxMutation = trpc.sync.finalizeTx.useMutation();
  
  const cardano = useCardano();

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
  }, [parentContainerRef]);

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

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setCurrentRequestPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRequestPageLimit(parseInt(event.target.value, 10));
    setCurrentRequestPage(1);
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

  const { name, connected, wallet } = useWallet()
  const [cardanoApi, setCardanoApi] = useState<any>(undefined);
  const { sessionData } = useWalletContext();

  const getRawUtxosMultiAddress = trpc.sync.getRawUtxosMultiAddress.useMutation();

  useEffect(() => {
    const execute = async () => {
      if (connected) {
        const api = await window.cardano[walletNameToId(sessionData?.user.walletType!)!].enable();
        setCardanoApi(api);
      }
    };
    execute();
  }, [name, connected, sessionData?.user.walletType]);

  const cancelTx = useCallback(async (txHash: string, txIndex: string, address: string) => {
    if (connected && cardanoApi !== undefined) {
      try {
        const walletType = cardano.getAddressWalletType(address);
        const api = await window.cardano[walletNameToId(walletType!)!].enable();
        const utxos = await getRawUtxosMultiAddress.mutateAsync([address]);
        const cancelStakeTxCbor = await cancelStakeTxMutation.mutateAsync({
          stakeRequestOutputReference: {
            txHash,
            index: txIndex
          },
          walletUtxoListCbor: utxos,
        });
        const witnessSetCbor = await api.signTx(cancelStakeTxCbor, true);
        const signedTxCbor = await finaliseTxMutation.mutateAsync({ unsignedTxCbor: cancelStakeTxCbor, txWitnessCbor: witnessSetCbor });
        api.submitTx(signedTxCbor);
        addAlert('success', 'Cancel transaction submitted');
      } catch (ex) {
        console.error('Error cancelling stake', ex);
        addAlert('error', 'Cancel transaction failed')
      }
    }
  }, [connected, cardanoApi, cancelStakeTxMutation, finaliseTxMutation]);

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
        <DashboardCard sx={{ border: 'none', paddingLeft: '0', paddingRight: '0' }}>
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
                  <TableCell></TableCell>
                  {columns.map((column) => {
                    if (column === "txHash" || column === "txIndex" || column == "address") return null;
                    return <TableCell key={String(column)}>
                      {camelCaseToTitle(String(column))}
                    </TableCell>
                  })}
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item, index) => {
                  const wallet = walletsList.find(w => w.connectName === cardano.getAddressWalletType(item.address));
                  const icon = theme.palette.mode === 'dark' ? wallet?.iconDark : wallet?.icon;

                  return (
                    <TableRow key={index}
                    sx={{
                      '&:nth-of-type(odd)': { backgroundColor: theme.palette.mode === 'dark' ? 'rgba(205,205,235,0.05)' : 'rgba(0,0,0,0.05)' },
                      '&:hover': { background: theme.palette.mode === 'dark' ? 'rgba(205,205,235,0.15)' : 'rgba(0,0,0,0.1)' }
                    }}
                  >
                    <TableCell sx={{ borderBottom: 'none', width: '22px' }}>
                      <Avatar variant='square' sx={{ width: '22px', height: '22px' }} src={icon} />
                    </TableCell>
                    {Object.keys(item).map((key, colIndex) => {
                      if (key === "txHash" || key === "txIndex" || key === "address") return null;
                      if (key === "status") {
                        return (
                          <TableCell key={`${key}-${colIndex}`} sx={{ borderBottom: 'none' }}>
                            {isLoading ?
                              (<Skeleton>
                                <Chip icon={<CheckIcon fontSize='small' />} variant='outlined' sx={{ width: '104px' }} />
                              </Skeleton>) :
                              <>
                                {(item[key] === "Executed" &&
                                  <Chip icon={<CheckIcon fontSize='small' />} variant='outlined' label="Executed" color='success' sx={{ width: '120px' }} />)}
                                {(item[key] === "Pending" &&
                                  <Chip icon={<TimeIcon fontSize='small' />} variant='outlined' label="Pending" color='primary' sx={{ width: '120px' }} />)}
                                {(item[key] === "Cancelled" &&
                                  <Chip icon={<ClearIcon fontSize='small' />} variant='outlined' label="Cancelled" color='error' sx={{ width: '120px' }} />)}
                              </>
                            }
                          </TableCell>
                        )
                      }

                      if (key === "actions") {
                        return (
                          <TableCell key={`${key}-${colIndex}`} sx={{ borderBottom: 'none' }}>
                            {isLoading ?
                              (<Box sx={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                <Skeleton>
                                  <LaunchIcon fontSize='small' />
                                </Skeleton>
                                <Skeleton>
                                  <ContentCopyIcon fontSize='small' />
                                </Skeleton>
                              </Box>) :
                              (<Box sx={{ display: 'flex', gap: '5px', marginTop: '8px' }}>
                                <Tooltip title='View transaction details'>
                                  <IconButton href={item[key].transactionLink} size='small' target='_blank'>
                                    <LaunchIcon fontSize='small' sx={{ '&:hover': { color: theme.palette.secondary.main, transition: 'color 0.3s ease 0.2s' } }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title='Copy transaction link' >
                                  <IconButton size='small' onClick={() => { copy(item[key].transactionLink) }}>
                                    <ContentCopyIcon fontSize='small' sx={{ '&:hover': { color: theme.palette.secondary.main, transition: 'color 0.3s ease 0.2s' } }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>)}
                          </TableCell>)
                      }

                      return (
                        <TableCell key={`${key}-${colIndex}`} sx={{ borderBottom: 'none' }}>
                          {isLoading ? <Skeleton width={100} /> : renderCellContent(item, key)}
                        </TableCell>
                      )
                    })}
                    <TableCell sx={{ borderBottom: 'none' }}>
                      {item.status === "Pending" && !isLoading && <>
                        <Button disabled={isLoading} key={index} variant="contained" color="secondary" onClick={() => cancelTx(item.txHash, item.txIndex, item.address)}>
                          Cancel
                        </Button>
                      </>}
                    </TableCell>
                  </TableRow>
                  )
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={rowsPerPageOptions}
                    component={'td'}
                    colSpan={6}
                    count={totalRequests}
                    rowsPerPage={requestPageLimit}
                    page={currentRequestPage - 1}
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

export default TransactionHistoryTable;

const formatData = <T,>(data: T, key: keyof T): string => {
  const value = data[key];
  if (typeof value === 'number') {
    return value.toLocaleString();
  } else if (value instanceof Date) {
    return dayjs(value).format('YYYY/MM/DD HH:mm:ss a');
  }
  // Default to string conversion
  return String(value);
}

const camelCaseToTitle = (camelCase: string) => {
  const withSpaces = camelCase.replace(/([A-Z])/g, ' $1').trim();
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}
