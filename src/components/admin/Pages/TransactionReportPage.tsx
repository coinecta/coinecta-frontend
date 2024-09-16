import React, { ChangeEvent, FC, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { trpc } from '@lib/utils/trpc';
import { useAlert } from '@contexts/AlertContext';
import SelectContributionRound from '@components/admin/contribution/SelectContributionRound';
import SelectProject from '@components/admin/SelectProject';
import AdminMenu from '../AdminMenu';
import { Prisma } from '@prisma/client';
import { getSymbol } from '@lib/utils/currencies';

type TransactionDetails = {
  userDefaultAddress: string | null;
  userSumsubId: string | null;
  user: {
    sumsubResult: Prisma.JsonValue;
    defaultAddress: string | null;
    sumsubId: string | null;
  };
  id: string;
  description: string | null;
  amount: string;
  currency: string;
  address: string;
  completed: boolean;
  txId: string | null;
  created_at: Date;
  updated_at: Date;
  user_id: string;
  contribution_id: number;
}

const aggregateTransactions = (transactions: TransactionDetails[]): TransactionDetails[] => {
  const aggregationMap = new Map<string, TransactionDetails>();

  transactions.forEach(transaction => {
    const existingEntry = aggregationMap.get(transaction.address);

    if (existingEntry) {
      // Convert string amounts to numbers for summation
      existingEntry.amount = (parseFloat(existingEntry.amount) + parseFloat(transaction.amount)).toString();
    } else {
      // Clone the transaction object to avoid mutating the original array
      aggregationMap.set(transaction.address, { ...transaction });
    }
  });

  return Array.from(aggregationMap.values());
};

const TransactionReport: FC = () => {
  const { addAlert } = useAlert();
  const [formRound, setFormRound] = useState<TContributionRound | undefined>(undefined);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [aggregatedTransactions, setAggregatedTransactions] = useState<TransactionDetails[]>([])
  const [minUsdValue, setMinUsdValue] = useState<number | null>(null);
  const [maxUsdValue, setMaxUsdValue] = useState<number | null>(null);
  const { data: projectList } = trpc.project.getProjectList.useQuery({});
  const roundQuery = trpc.contributions.getContributionRoundsByProjectSlug.useQuery(
    { projectSlug: selectedProject || '' },
    { enabled: !!selectedProject }
  );
  const transactionQuery = trpc.contributions.listTransactionsByContribution.useQuery(
    { contributionId: formRound?.id || 0 },
    { enabled: !!formRound }
  );
  const priceHistory = trpc.price.getCardanoPriceHistory.useQuery(
    {
      startDate: formRound?.startDate || new Date(0),
      endDate: formRound?.endDate || new Date(0)
    },
    { enabled: !!formRound }
  )

  const onchainTransactions = trpc.contributions.getOnchainTransactions.useQuery(
    {
      address: formRound?.recipientAddress || '',
      contributionId: formRound?.id || 0
    },
    { enabled: !!formRound }
  )

  useEffect(() => {
    const round = roundQuery.data?.find(round => round.id === Number(selectedRound))
    if (round) {
      setFormRound(round)
    }
    else setFormRound(undefined)
  }, [selectedRound, roundQuery.data])

  useEffect(() => {
    if (transactionQuery.data) {
      const aggregated = aggregateTransactions(transactionQuery.data)
      setAggregatedTransactions(aggregated)
    }
  }, [transactionQuery.data])

  const getTableDataAsString = (transactions: CombinedTransactionInfo[]) => {
    // Header row
    let tableString = 'Address\tContribution\tTx ID\tPool Weight\n';

    // Data rows
    transactions.forEach(item => {
      const token = item.amountAda
      tableString += `${item.address}\t${token}\t${item.txId}\t${item.userPoolWeight ?? ''}\n`;
    });

    return tableString;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => console.log('Table copied to clipboard'))
      .catch(err => console.error('Failed to copy: ', err));
  };

  const handleCopy = () => {
    const tableString = getTableDataAsString(onchainTransactions.data || []);
    copyToClipboard(tableString);
  };

  type ExchangeRate = {
    date: Date;
    price: number;
  };

  const findClosestExchangeRate = (transactionDate: Date, exchangeRates: ExchangeRate[]): number => {
    const closestRate = exchangeRates.reduce((closest, current) => {
      const currentDiff = Math.abs(current.date.getTime() - transactionDate.getTime());
      const closestDiff = Math.abs(closest.date.getTime() - transactionDate.getTime());

      return currentDiff < closestDiff ? current : closest;
    });

    return closestRate.price;
  };

  const filterTransactionsByUsdValue = (transactions: TransactionDetails[]) => {
    return transactions.filter(item => {
      if (item.currency !== 'ADA' || !priceHistory.data) {
        return false;
      }
      const usdValue = parseFloat(item.amount) * findClosestExchangeRate(item.created_at, priceHistory.data);
      return (!minUsdValue || usdValue >= minUsdValue) && (!maxUsdValue || usdValue <= maxUsdValue);
    });
  };

  const filteredTransactions = filterTransactionsByUsdValue(aggregatedTransactions);

  return (
    <AdminMenu>
      <Box>
        <Typography variant="h3" sx={{ mb: 1 }}>
          Display Transactions
        </Typography>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Select a project
          </Typography>
          <Box sx={{ maxWidth: '350px' }}>
            <SelectProject selectedProject={selectedProject} setSelectedProject={setSelectedProject} projectList={projectList} />
          </Box>
        </Box>
        <Box sx={{ mb: 1, maxWidth: '350px' }}>
          <SelectContributionRound roundData={roundQuery.data} selectedRound={selectedRound} setSelectedRound={setSelectedRound} />
        </Box>
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Min USD Value"
            type="number"
            value={minUsdValue ?? ''}
            onChange={(e) => setMinUsdValue(e.target.value ? parseFloat(e.target.value) : null)}
            sx={{ mr: 1 }}
          />
          <TextField
            label="Max USD Value"
            type="number"
            value={maxUsdValue ?? ''}
            onChange={(e) => setMaxUsdValue(e.target.value ? parseFloat(e.target.value) : null)}
          />
        </Box>
        <Button onClick={handleCopy}>Copy Table</Button>
        {/* {
          transactionQuery.isLoading ? (
            <Typography>Loading...</Typography>
          ) : transactionQuery.isError ? (
            <Typography>Error fetching.</Typography>
          ) : (
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Address</TableCell>
                    <TableCell>Token</TableCell>
                    <TableCell>Contribution</TableCell>
                    <TableCell>USD Value</TableCell>
                    <TableCell>SumSub ID</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTransactions.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell
                        sx={{
                          maxWidth: '200px',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {item.address}
                      </TableCell>
                      <TableCell>{(parseFloat(item.amount) / (formRound?.price || 1))}</TableCell>
                      <TableCell>{item.amount} {getSymbol(item.currency)}</TableCell>
                      <TableCell>{
                        item.currency === 'ADA' && priceHistory.data ?
                          `$${(parseFloat(item.amount) * findClosestExchangeRate(item.created_at, priceHistory.data)).toFixed(2)}`
                          : 'N/A'
                      }</TableCell>
                      <TableCell><Link target="_blank" href={`https://cockpit.sumsub.com/checkus#/applicant/${item.userSumsubId}`}>{item.userSumsubId}</Link></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )
        } */}
        {
          onchainTransactions.isLoading ? (
            <Typography>Loading...</Typography>
          ) : onchainTransactions.isError ? (
            <Typography>Error fetching.</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Address</TableCell>
                    <TableCell>Contribution</TableCell>

                    <TableCell>Tx ID</TableCell>
                    <TableCell>User pool weight</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {onchainTransactions.data.map((item, index) => {
                    return (
                      <TableRow key={index}>
                        <TableCell
                          sx={{
                            maxWidth: '200px',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {item.address}
                        </TableCell>
                        <TableCell>{`${item.amountAda} ${getSymbol('ada')}`}</TableCell>

                        <TableCell>{item.txId}</TableCell>
                        <TableCell>{item.userPoolWeight}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )
        }
      </Box>
    </AdminMenu>
  );
};

export default TransactionReport;
