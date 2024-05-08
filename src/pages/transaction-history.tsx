import DashboardHeader from '@components/dashboard/DashboardHeader';
import TransactionHistoryTable from '@components/dashboard/TransactionHistoryTable';
import { useToken } from '@components/hooks/useToken';
import { useWalletContext } from '@contexts/WalletContext';
import { formatNumberDecimals } from '@lib/utils/assets';
import { trpc } from '@lib/utils/trpc';
import { Box } from '@mui/material';
import dayjs from 'dayjs';
import { FC, useEffect, useMemo, useRef, useState } from 'react';

const TransactionHistory: FC = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(true);
  const [currentRequestPage, setCurrentRequestPage] = useState<number>(1);
  const [requestPageLimit, setRequestPageLimit] = useState<number>(5);
  const { selectedAddresses } = useWalletContext();

  const queryGetTransactionHistory = trpc.sync.getTransactionHistory.useQuery({ addresses: selectedAddresses, offset: (currentRequestPage - 1) * requestPageLimit, limit: requestPageLimit }, { refetchInterval: 5000 });
  const transactionHistory = useMemo(() => queryGetTransactionHistory.data, [queryGetTransactionHistory.data]);

  useEffect(() => {
    setIsLoading(queryGetTransactionHistory.isLoading);
  }, [queryGetTransactionHistory.isLoading]);


  const { cnctDecimals } = useToken();

  const processedTransactionHistory = useMemo(() => {
    return transactionHistory?.data.map((request) => {

      const STAKE_POOL_ASSET_POLICY = process.env.STAKE_POOL_ASSET_POLICY!;
      const STAKE_POOL_ASSET_NAME = process.env.STAKE_POOL_ASSET_NAME!;
      const CARDANO_TX_EXPLORER_URL = process.env.CARDANO_TX_EXPLORER_URL!;

      return {
        address: request.address,
        amount: `${formatNumberDecimals(request.assets[STAKE_POOL_ASSET_POLICY][STAKE_POOL_ASSET_NAME], cnctDecimals)} CNCT`,
        createdAt: dayjs.unix(request.createdAt).format("DD MMM, YY - HH:mm").toString(),
        type: request.txType,
        actions: { transactionLink: `${CARDANO_TX_EXPLORER_URL}/${request.txHash}`},
        data: request
      }
    });
  }, [transactionHistory, cnctDecimals]);

  return (
    <Box
      ref={parentRef}
      sx={{
        maxWidth: '1536px',
        margin: 'auto',
        pt: '20px',
        px: '16px'
      }}>
      <DashboardHeader title="Transaction History" />
      <TransactionHistoryTable
        data={processedTransactionHistory ?? fakeTrpcDashboardData.data}
        error={false}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        parentContainerRef={parentRef}
        isLoading={isLoading}
        totalRequests={queryGetTransactionHistory.data?.total ?? 0}
        currentRequestPage={currentRequestPage}
        requestPageLimit={requestPageLimit}
        setCurrentRequestPage={setCurrentRequestPage}
        setRequestPageLimit={setRequestPageLimit}
      />
    </Box>
  );
};

export default TransactionHistory;

const fakeTrpcDashboardData = {
  error: false,
  data: [
    {
      amount: '1000 CNCT',
      createdAt: "27 Feb, 24 10:31",
      type: 'StakeRequestPending',
      actions: { transactionLink: "#" },
      data: {}
    },
    {
      amount: '2500 CNCT',
      createdAt: "07 Feb, 24 06:42",
      type: 'Unlock Stake',
      actions: { transactionLink: "#" },
      data: {}
    },
    {
      amount: '500 CNCT',
      createdAt: "01 Feb, 24 04:22",
      type: 'Contribute',
      actions: { transactionLink: "#" },
      data: {}
    },
    {
      amount: '1300 CNCT',
      createdAt: "16 Feb, 24 03:32",
      type: 'Stake',
      actions: { transactionLink: "#" },
      data: {}
    },
    {
      amount: '1000 CNCT',
      createdAt: "27 Feb, 24 10:31",
      type: 'Unlock Stake',
      actions: { transactionLink: "#" },
      data: {}
    },
    {
      amount: '2500 CNCT',
      createdAt: "07 Feb, 24 06:42",
      type: 'Contribute',
      actions: { transactionLink: "#" },
      data: {}
    }
  ]
}