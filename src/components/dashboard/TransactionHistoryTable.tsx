import { useAlert } from '@contexts/AlertContext';
import { useWalletContext } from '@contexts/WalletContext';
import { useCardano } from '@lib/utils/cardano';
import { trpc } from '@lib/utils/trpc';
import { walletNameToId, walletsList } from '@lib/walletsList';
import { useWallet } from '@meshsdk/react';
import CallMadeIcon from '@mui/icons-material/CallMade';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LaunchIcon from '@mui/icons-material/Launch';
import LockOpenIcon from '@mui/icons-material/LockOpen';
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
import Collapse from '@mui/material/Collapse';
import { TimeIcon } from '@mui/x-date-pickers';
import { TransactionHistory } from '@server/services/syncApi';
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
  const [openRowIndex, setOpenRowIndex] = useState(-1)


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

  const transactionTypeLabel = (type: string) => {
    switch (type) {
      case 'StakePositionReceived':
        return 'Stake Receive';
      case 'StakePositionRedeemed':
        return 'Unlock Stake';
      case 'StakePositionTransferred':
        return 'Stake Send';
      case 'StakeRequestPending':
        return 'Pending';
      case 'StakeRequestExecuted':
        return 'Executed';
      case 'StakeRequestCanceled':
        return 'Canceled';
      default:
        return type;
    }
  }

//   <Tooltip title='View transaction details'>
//   <IconButton href={item[key].transactionLink} size='small' target='_blank'>
//     <LaunchIcon fontSize='small' sx={{ '&:hover': { color: theme.palette.secondary.main, transition: 'color 0.3s ease 0.2s' } }} />
//   </IconButton>
// </Tooltip>
  // column -> value -> render
  const renderAdditionalTxHistoryData = (data: TransactionHistory) => {

    const STAKE_KEY_PREFIX = process.env.STAKE_KEY_PREFIX!;
    const CARDANO_ASSET_EXPLORER_URL = process.env.CARDANO_ASSET_EXPLORER_URL!;
    const CARDANO_ADDRESS_EXPLORER_URL = process.env.CARDANO_ADDRESS_EXPLORER_URL!;

    let policyId;
    let assetName;

    switch (data.txType)
    {
      case 'StakePositionReceived':
      case 'StakePositionRedeemed':
        policyId = data.stakeKey?.substring(0, 56);
        assetName = STAKE_KEY_PREFIX + data.stakeKey?.substring(56);
        return {
          assetLink: `${CARDANO_ASSET_EXPLORER_URL}/${policyId + assetName}`,
          unlockTime: dayjs.unix(data.unlockTime ?? 0 / 1_000).format('DD MMM, YY HH:mm'),
        }
      case 'StakeRequestPending':
      case 'StakeRequestExecuted':
      case 'StakeRequestCanceled':
        return {
          lockDuration: "1 month",
        }
      case 'StakePositionTransferred':
        policyId = data.stakeKey?.substring(0, 56);
        assetName = STAKE_KEY_PREFIX + data.stakeKey?.substring(56);
        return {
          assetLink: `${CARDANO_ASSET_EXPLORER_URL}/${policyId + assetName}`,
          unlockTime: dayjs.unix(data.unlockTime ?? 0 / 1_000).format('DD MMM, YY HH:mm'),
          transferAddressLink: `${CARDANO_ADDRESS_EXPLORER_URL}/${data.transferredToAddress}`,
        }
    }
  }

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

  useEffect(() => {
    const execute = async () => {
      if (connected) {
        const api = await window.cardano[walletNameToId(sessionData?.user.walletType!)!]?.enable();
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
        const utxos = await api.getUtxos(undefined);
        const collateral = api.experimental.getCollateral === undefined ? [] : await api.experimental.getCollateral();
        const cancelStakeTxCbor = await cancelStakeTxMutation.mutateAsync({
          stakeRequestOutputReference: {
            txHash,
            index: txIndex
          },
          walletUtxoListCbor: [...utxos!, ...(collateral ?? [])],
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
                  <TableCell />
                  {columns.map((column) => {
                    if (column === "txHash" || column === "txIndex" || column == "address" || column == "data") return null;
                    if (column === "type") return (
                      <TableCell key={String(column)} sx={{ pl: '58px' }}>
                        {camelCaseToTitle(String(column))}
                      </TableCell>
                    )
                    if (column === "status") return (
                      <TableCell key={String(column)} sx={{ pl: '50px' }}>
                        {camelCaseToTitle(String(column))}
                      </TableCell>
                    )
                    return <TableCell key={String(column)}>
                      {camelCaseToTitle(String(column))}
                    </TableCell>
                  })}
                  <TableCell />
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item, index) => {
                  const wallet = walletsList.find(w => w.connectName === cardano.getAddressWalletType(item.address));
                  const icon = theme.palette.mode === 'dark' ? wallet?.iconDark : wallet?.icon;
                  let isOpen = index === openRowIndex;

                  const toggleOpen = () => {
                    if (isOpen) {
                      setOpenRowIndex(-1);
                    } else {
                      setOpenRowIndex(index);
                    }
                  };

                  return (
                    <>
                      <TableRow
                        key={index}
                        sx={{
                          backgroundColor: index % 2 === 0 ? 'rgba(205,205,235,0.05)' : 'rgba(0,0,0,0.05)',
                          '&:hover': { background: theme.palette.mode === 'dark' ? 'rgba(205,205,235,0.15)' : 'rgba(0,0,0,0.1)', cursor: 'pointer' }
                        }}
                        onClick={toggleOpen}
                      >
                        <TableCell sx={{ borderBottom: 'none', width: '22px' }}>
                          <Avatar variant='square' sx={{ width: '22px', height: '22px' }} src={icon} />
                        </TableCell>
                        {Object.keys(item).map((key, colIndex) => {
                          if (key === "txHash" || key === "txIndex" || key === "address" || key === "data") return null;

                          if (key === "type") {
                            return (
                              <TableCell key={`${key}-${colIndex}`} sx={{ borderBottom: 'none' }}>
                                {isLoading ?
                                  (<Skeleton>
                                    <Chip icon={<CheckIcon fontSize='small' />} variant='outlined' sx={{ width: '104px' }} />
                                  </Skeleton>) :
                                  <>
                                    {(item[key] === "StakePositionReceived" &&
                                      <Chip icon={<CallReceivedIcon fontSize='small' />} variant='outlined' label="Stake Receive" color='success' sx={{ width: '140px' }} />)}
                                    {(item[key] === "StakePositionRedeemed" &&
                                      <Chip icon={<LockOpenIcon fontSize='small' />} variant='outlined' label="Unlock Stake" color='secondary' sx={{ width: '140px' }} />)}
                                    {(item[key] === "StakePositionTransferred" &&
                                      <Chip icon={<CallMadeIcon fontSize='small' />} variant='outlined' label="Stake Send" color='error' sx={{ width: '140px' }} />)}
                                    {(item[key] === "StakeRequestPending" &&
                                      <Chip icon={<TimeIcon fontSize='small' />} variant='outlined' label="Pending" color='warning' sx={{ width: '140px' }} />)}
                                    {(item[key] === "StakeRequestExecuted" &&
                                      <Chip icon={<CheckIcon fontSize='small' />} variant='outlined' label="Executed" color='success' sx={{ width: '140px' }} />)}
                                    {(item[key] === "StakeRequestCanceled" &&
                                      <Chip icon={<ClearIcon fontSize='small' />} variant='outlined' label="Canceled" color='error' sx={{ width: '140px' }} />)}
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
                          {item.type === "StakeRequestPending" && !isLoading && <>
                            <Button disabled={isLoading} key={index} variant="contained" color="secondary" onClick={() => cancelTx(item.txHash, item.txIndex, item.address)}>
                              Cancel
                            </Button>
                          </>}
                        </TableCell>
                        <TableCell sx={{ borderBottom: 'none', width: '22px' }}>
                          <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={toggleOpen}
                          >
                            {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ paddingBottom: 0, paddingTop: 0, paddingLeft: '45px', borderBottom: 'none' }} colSpan={8}>
                          <Collapse in={isOpen} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ color: 'gray', borderBottom: 'none' }}>Wallet</TableCell>
                                    {columns.map((column) => {
                                      if (column === "txHash" || column === "txIndex" || column == "address" || column === "actions" || column === "data") return null;
                                      return <TableCell key={String(column)} sx={{ color: 'gray', borderBottom: 'none' }}>
                                        {column === "data" ? 
                                        "Data" : 
                                        camelCaseToTitle(String(column) as string)}
                                      </TableCell>
                                    })}
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  <TableRow>
                                    <TableCell sx={{ borderBottom: 'none' }}>
                                      {isLoading ?
                                        <Skeleton width={100} /> : <>
                                          <Avatar component={'span'} variant='square' sx={{ width: '22px', height: '22px', display: 'inline-flex', marginRight: '5px', transform: 'translate(0px, 4px)' }} src={icon} />
                                          <span>{wallet?.name}</span>
                                        </>}
                                    </TableCell>
                                    {Object.keys(item).map((key, colIndex) => {
                                      if (key === "txHash" || key === "txIndex" || key === "address" || key === "actions" || key === "data") return null;
                                      if (key === "type") {
                                        return (
                                          <TableCell key={`${key}-${colIndex}`} sx={{ borderBottom: 'none' }}>
                                            {isLoading ?
                                              (<Skeleton>
                                                <Chip icon={<CheckIcon fontSize='small' />} variant='outlined' sx={{ width: '104px' }} />
                                              </Skeleton>) :
                                              transactionTypeLabel(item[key])
                                            } 
                                          </TableCell>
                                        )
                                      }

                                      if (key == "data") {
                                        const additionalData = renderAdditionalTxHistoryData(item[key]);
                                        return (
                                          <TableCell key={`${key}-${colIndex}`} sx={{ borderBottom: 'none' }}>
                                            {isLoading ?
                                              (<Skeleton>
                                                <Chip icon={<CheckIcon fontSize='small' />} variant='outlined' sx={{ width: '104px' }} />
                                              </Skeleton>) :
                                              <>
                                                {additionalData?.assetLink && (
                                                  <Tooltip title='View asset details'>
                                                    <IconButton href={additionalData?.assetLink} size='small' target='_blank'>
                                                      <LaunchIcon fontSize='small' sx={{ '&:hover': { color: theme.palette.secondary.main, transition: 'color 0.3s ease 0.2s' } }} />
                                                    </IconButton>
                                                  </Tooltip>
                                                )}
                                                {additionalData?.unlockTime && (
                                                  <Typography variant='body2' sx={{ display: 'block' }}>
                                                    Unlock Time: {additionalData?.unlockTime}
                                                  </Typography>
                                                )}
                                                {additionalData?.transferAddressLink && (
                                                  <Tooltip title='View transfer address details'>
                                                    <IconButton href={additionalData?.transferAddressLink} size='small' target='_blank'>
                                                      <LaunchIcon fontSize='small' sx={{ '&:hover': { color: theme.palette.secondary.main, transition: 'color 0.3s ease 0.2s' } }} />
                                                    </IconButton>
                                                  </Tooltip>
                                                )}
                                                {additionalData?.lockDuration && (
                                                  <Typography variant='body2' sx={{ display: 'block' }}>
                                                    Lock Duration: {additionalData?.lockDuration}
                                                  </Typography>
                                                )}
                                              </>
                                            }
                                          </TableCell>
                                        )
                                      }

                                      return (
                                        <TableCell key={`${key}-${colIndex}`} sx={{ borderBottom: 'none' }}>
                                          {isLoading ? <Skeleton width={100} /> : renderCellContent(item, key)}
                                        </TableCell>
                                      )
                                    })}
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </>
                  )
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={rowsPerPageOptions}
                    component={'td'}
                    colSpan={8}
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
