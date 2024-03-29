import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Snackbar,
} from '@mui/material';
import DashboardHeader from '../DashboardHeader';
import TransactionHistoryTable from '../TransactionHistoryTable';
import { StakeRequest, StakeRequestsResponse, coinectaSyncApi } from '@server/services/syncApi';
import { useWallet } from '@meshsdk/react';
import { formatTokenWithDecimals, formatNumber } from '@lib/utils/assets';
import { useToken } from '@components/hooks/useToken';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { useWalletContext } from '@contexts/WalletContext';
import { trpc } from '@lib/utils/trpc';

const TransactionHistory: FC = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(true);
  const [currentRequestPage, setCurrentRequestPage] = useState<number>(1);
  const [requestPageLimit, setRequestPageLimit] = useState<number>(5);
  const [isCancellationSuccessful, setIsCancellationSuccessful] = useState<boolean>(false);
  const [isCancellationFailed, setIsCancellationFailed] = useState<boolean>(false);
  const [stakeRequestResponse, setStakeRequestResponse] = useState<StakeRequestsResponse | null>(null);
  const { selectedAddresses } = useWalletContext();

  const queryGetStakeRequests = trpc.sync.getStakeRequests.useQuery({ walletAddresses: selectedAddresses, page: currentRequestPage, limit: requestPageLimit }, { refetchInterval: 5000 });

  useEffect(() => {
    setIsLoading(queryGetStakeRequests.isLoading);
  }, [queryGetStakeRequests.isLoading]);

  useEffect(() => {
    if (queryGetStakeRequests.data !== undefined) {
      setStakeRequestResponse(queryGetStakeRequests.data);
    }
  }, [queryGetStakeRequests.data]);

  const { cnctDecimals } = useToken();

  const statusToString = (status: number) => {
    switch (status) {
      case 0:
        return "Pending";
      case 1:
        return "Executed";
      case 2:
        return "Cancelled";
      default:
        return "Unknown";
    }
  }

  const processedStakeRequests = useMemo(() => {
    return stakeRequestResponse?.data?.map((request) => {
      const STAKE_POOL_ASSET_POLICY = process.env.STAKE_POOL_ASSET_POLICY!;
      const STAKE_POOL_ASSET_NAME = process.env.STAKE_POOL_ASSET_NAME!;
      const formattedTokenAmount = formatNumber(parseFloat(formatTokenWithDecimals(BigInt(request.amount.multiAsset[STAKE_POOL_ASSET_POLICY][STAKE_POOL_ASSET_NAME]), cnctDecimals)), '');
      const formattedDate = dayjs(stakeRequestResponse?.extra.slotData[request.slot]! * 1000).format('DD MMM, YY HH:mm');
      const status = statusToString(request.status);
      const CARDANO_TX_EXPLORER_URL = process.env.CARDANO_TX_EXPLORER_URL!;

      dayjs.extend(duration);
      dayjs.extend(relativeTime);
      const lockDuration = dayjs.duration(parseInt(request.stakePoolProxy.lockTime)).humanize();

      return {
        amount: `${formattedTokenAmount} CNCT`,
        lockDuration,
        "Date & Time": formattedDate,
        status,
        txHash: request.txHash,
        txIndex: request.txIndex,
        actions: { transactionLink: `${CARDANO_TX_EXPLORER_URL}/${request.txHash}` }
      };
    });
  }, [stakeRequestResponse, cnctDecimals]);

  const handleCancellationSuccessful = (status: boolean) => setIsCancellationSuccessful(status);
  const handleCancellationFailed = (status: boolean) => setIsCancellationFailed(status)
  const handleSuccessSnackbarClose = () => setIsCancellationSuccessful(false);
  const handleFailedSnackbarClose = () => setIsCancellationFailed(false);

  return (
    <Box ref={parentRef}>
      <DashboardHeader title="Transaction History" />
      <TransactionHistoryTable
        data={processedStakeRequests ?? fakeTrpcDashboardData.data}
        error={false}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        parentContainerRef={parentRef}
        isLoading={isLoading}
        totalRequests={queryGetStakeRequests.data?.total ?? 0}
        currentRequestPage={currentRequestPage}
        requestPageLimit={requestPageLimit}
        setCurrentRequestPage={setCurrentRequestPage}
        setRequestPageLimit={setRequestPageLimit}
        onCancellationSuccessful={handleCancellationSuccessful}
        onCancellationFailed={handleCancellationFailed}
      />
      <Snackbar open={isCancellationSuccessful} autoHideDuration={6000} onClose={handleSuccessSnackbarClose}>
        <Alert
          onClose={handleSuccessSnackbarClose}
          severity="success"
          variant="outlined"
          sx={{ width: '100%' }}
          icon={<TaskAltIcon fontSize='medium' />}
        >
          Cancel transaction submitted
        </Alert>
      </Snackbar>
      <Snackbar open={isCancellationFailed} autoHideDuration={6000} onClose={handleFailedSnackbarClose}>
        <Alert
          onClose={handleFailedSnackbarClose}
          severity="error"
          variant="outlined"
          sx={{ width: '100%' }}
          icon={<ErrorOutlineOutlinedIcon fontSize='medium' />}
        >
          Cancel transaction failed
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TransactionHistory;

const fakeTrpcDashboardData = {
  error: false,
  data: [
    {
      amount: '1000 CNCT',
      lockDuration: '1 Month',
      "Date & Time": "27 Feb, 24 10:31",
      status: "Executed",
      actions: { transactionLink: "#" },
      txHash: "",
      txIndex: "0"
    },
    {
      amount: '2500 CNCT',
      lockDuration: '6 Months',
      "Date & Time": "07 Feb, 24 06:42",
      status: "Pending",
      actions: { transactionLink: "#" },
      txHash: "",
      txIndex: "0"
    },
    {
      amount: '500 CNCT',
      lockDuration: '1 Month',
      "Date & Time": "01 Feb, 24 04:22",
      status: "Pending",
      actions: { transactionLink: "#" },
      txHash: "",
      txIndex: "0"
    },
    {
      amount: '1300 CNCT',
      lockDuration: '3 Months',
      "Date & Time": "16 Feb, 24 03:32",
      status: "Executed",
      actions: { transactionLink: "#" },
      txHash: "",
      txIndex: "0"
    },
    {
      amount: '1000 CNCT',
      lockDuration: '1 Month',
      "Date & Time": "27 Feb, 24 10:31",
      status: "Executed",
      actions: { transactionLink: "#" },
      txHash: "",
      txIndex: "0"
    },
    {
      amount: '2500 CNCT',
      lockDuration: '6 Months',
      "Date & Time": "07 Feb, 24 06:42",
      status: "Pending",
      actions: { transactionLink: "#" },
      txHash: "",
      txIndex: "0"
    }
  ]
}