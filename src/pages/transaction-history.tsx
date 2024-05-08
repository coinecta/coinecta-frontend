import DashboardHeader from '@components/dashboard/DashboardHeader';
import TransactionHistoryTable from '@components/dashboard/TransactionHistoryTable';
import { useToken } from '@components/hooks/useToken';
import { useWalletContext } from '@contexts/WalletContext';
import { formatNumberDecimals } from '@lib/utils/assets';
import { trpc } from '@lib/utils/trpc';
import { Box } from '@mui/material';
import { TransactionHistory as TransactionHistoryModel } from '@server/services/syncApi';
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
      type: 'StakePositionTransferred',
      actions: { transactionLink: "#" },
      data: {
        address: "addr1q9cxqfg6xrzqus5qshxmgaa2pj5yv2h9mzm22hj7jct2ad59q2pfxagx7574360xl47vhw79wxtdtze2z83k5a4xpptscvshgp",
        txType: "StakePositionTransferred",
        lovelace: "1000",
        assets: {},
        txHash: "hash1",
        createdAt: 1709995166,
        stakeKey: "61b3802ce748ed1fdaad2d6c744b19f104285f7d318172a5d4f06a4ebbe09406a1d15f65337f801ba7a9439595ebc79fc8947373d8540035",
        unlockTime: 1709995166000,
        transferredToAddress: "addr1q9cxqfg6xrzqus5qshxmgaa2pj5yv2h9mzm22hj7jct2ad59q2pfxagx7574360xl47vhw79wxtdtze2z83k5a4xpptscvshgp"
      } as TransactionHistoryModel
    },
    {
      amount: '2500 CNCT',
      createdAt: "07 Feb, 24 06:42",
      type: 'StakePositionTransferred',
      actions: { transactionLink: "#" },
      data: {
        address: "addr1q9cxqfg6xrzqus5qshxmgaa2pj5yv2h9mzm22hj7jct2ad59q2pfxagx7574360xl47vhw79wxtdtze2z83k5a4xpptscvshgp",
        txType: "StakePositionTransferred",
        lovelace: "1000",
        assets: {},
        txHash: "hash1",
        createdAt: 1709995166,
        stakeKey: "61b3802ce748ed1fdaad2d6c744b19f104285f7d318172a5d4f06a4ebbe09406a1d15f65337f801ba7a9439595ebc79fc8947373d8540035",
        unlockTime: 1709995166000,
        transferredToAddress: "addr1q9cxqfg6xrzqus5qshxmgaa2pj5yv2h9mzm22hj7jct2ad59q2pfxagx7574360xl47vhw79wxtdtze2z83k5a4xpptscvshgp"
      } as TransactionHistoryModel
    },
    {
      amount: '500 CNCT',
      createdAt: "01 Feb, 24 04:22",
      type: 'StakePositionTransferred',
      actions: { transactionLink: "#" },
      data: {
        address: "addr1q9cxqfg6xrzqus5qshxmgaa2pj5yv2h9mzm22hj7jct2ad59q2pfxagx7574360xl47vhw79wxtdtze2z83k5a4xpptscvshgp",
        txType: "StakePositionTransferred",
        lovelace: "1000",
        assets: {},
        txHash: "hash1",
        createdAt: 1709995166,
        stakeKey: "61b3802ce748ed1fdaad2d6c744b19f104285f7d318172a5d4f06a4ebbe09406a1d15f65337f801ba7a9439595ebc79fc8947373d8540035",
        unlockTime: 1709995166000,
        transferredToAddress: "addr1q9cxqfg6xrzqus5qshxmgaa2pj5yv2h9mzm22hj7jct2ad59q2pfxagx7574360xl47vhw79wxtdtze2z83k5a4xpptscvshgp"
      } as TransactionHistoryModel
    },
    {
      amount: '1300 CNCT',
      createdAt: "16 Feb, 24 03:32",
      type: 'StakePositionTransferred',
      actions: { transactionLink: "#" },
      data: {
        address: "addr1q9cxqfg6xrzqus5qshxmgaa2pj5yv2h9mzm22hj7jct2ad59q2pfxagx7574360xl47vhw79wxtdtze2z83k5a4xpptscvshgp",
        txType: "StakePositionTransferred",
        lovelace: "1000",
        assets: {},
        txHash: "hash1",
        createdAt: 1709995166,
        stakeKey: "61b3802ce748ed1fdaad2d6c744b19f104285f7d318172a5d4f06a4ebbe09406a1d15f65337f801ba7a9439595ebc79fc8947373d8540035",
        unlockTime: 1709995166000,
        transferredToAddress: "addr1q9cxqfg6xrzqus5qshxmgaa2pj5yv2h9mzm22hj7jct2ad59q2pfxagx7574360xl47vhw79wxtdtze2z83k5a4xpptscvshgp"
      } as TransactionHistoryModel
    },
    {
      amount: '1000 CNCT',
      createdAt: "27 Feb, 24 10:31",
      type: "StakePositionTransferred",
      actions: { transactionLink: "#" },
      data: {
        address: "addr1q9cxqfg6xrzqus5qshxmgaa2pj5yv2h9mzm22hj7jct2ad59q2pfxagx7574360xl47vhw79wxtdtze2z83k5a4xpptscvshgp",
        txType: "StakePositionTransferred",
        lovelace: "1000",
        assets: {},
        txHash: "hash1",
        createdAt: 1709995166,
        stakeKey: "61b3802ce748ed1fdaad2d6c744b19f104285f7d318172a5d4f06a4ebbe09406a1d15f65337f801ba7a9439595ebc79fc8947373d8540035",
        unlockTime: 1709995166000,
        transferredToAddress: "addr1q9cxqfg6xrzqus5qshxmgaa2pj5yv2h9mzm22hj7jct2ad59q2pfxagx7574360xl47vhw79wxtdtze2z83k5a4xpptscvshgp"
      } as TransactionHistoryModel
    },
    {
      amount: '2500 CNCT',
      createdAt: "07 Feb, 24 06:42",
      type: 'StakeRequestCanceled',
      actions: { transactionLink: "#" },
      data: {
        address: "addr1q9cxqfg6xrzqus5qshxmgaa2pj5yv2h9mzm22hj7jct2ad59q2pfxagx7574360xl47vhw79wxtdtze2z83k5a4xpptscvshgp",
        txType: "StakeRequestCanceled",
        lovelace: "1000",
        assets: {},
        txHash: "hash1",
        lockDuration: "1003200000",
        createdAt: 1709995166,
        stakeKey: "61b3802ce748ed1fdaad2d6c744b19f104285f7d318172a5d4f06a4ebbe09406a1d15f65337f801ba7a9439595ebc79fc8947373d8540035",
        unlockTime: 1709995166000,
        transferredToAddress: "addr1q9cxqfg6xrzqus5qshxmgaa2pj5yv2h9mzm22hj7jct2ad59q2pfxagx7574360xl47vhw79wxtdtze2z83k5a4xpptscvshgp"
      } as TransactionHistoryModel
    }
  ]
}