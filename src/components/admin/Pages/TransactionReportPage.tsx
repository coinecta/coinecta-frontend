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
  Typography,
} from '@mui/material';
import { trpc } from '@lib/utils/trpc';
import { useAlert } from '@contexts/AlertContext';
import SelectContributionRound from '@components/admin/contribution/SelectContributionRound';
import SelectProject from '@components/admin/SelectProject';
import AdminMenu from '../AdminMenu';
import { Prisma } from '@prisma/client';

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
  const [selectedRound, setSelectedRound] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [aggregatedTransactions, setAggregatedTransactions] = useState<TransactionDetails[]>([])
  const { data: projectList } = trpc.project.getProjectList.useQuery({});
  const roundQuery = trpc.contributions.getContributionRoundsByProjectSlug.useQuery(
    { projectSlug: selectedProject || '' },
    { enabled: !!selectedProject }
  );
  const transactionQuery = trpc.contributions.listTransactionsByContribution.useQuery(
    { contributionId: formRound?.id || 0 },
    { enabled: !!formRound }
  );

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

  const getTableDataAsString = (transactions: TransactionDetails[]) => {
    // Header row
    let tableString = 'Address\tToken\tContribution\tSumSub ID\n';

    // Data rows
    transactions.forEach(item => {
      const token = (parseFloat(item.amount) / (formRound?.price || 1)).toString();
      const sumSubIdLink = `https://cockpit.sumsub.com/checkus#/applicant/${item.userSumsubId}`;
      tableString += `${item.address}\t${token}\t${item.amount}\t${sumSubIdLink}\n`;
    });

    return tableString;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => console.log('Table copied to clipboard'))
      .catch(err => console.error('Failed to copy: ', err));
  };

  const handleCopy = () => {
    const tableString = getTableDataAsString(aggregatedTransactions);
    copyToClipboard(tableString);
  };

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
        <Button onClick={handleCopy}>Copy Table</Button>
        {
          transactionQuery.isLoading ? (
            <Typography>Loading...</Typography>
          ) : transactionQuery.isError ? (
            <Typography>Error fetching.</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Address</TableCell>
                    <TableCell>Token</TableCell>
                    <TableCell>Contribution</TableCell>
                    <TableCell>SumSub ID</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {aggregatedTransactions.map((item, index) => (
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
                      <TableCell>{item.amount}</TableCell>
                      <TableCell><Link target="_blank" href={`https://cockpit.sumsub.com/checkus#/applicant/${item.userSumsubId}`}>{item.userSumsubId}</Link></TableCell>
                    </TableRow>
                  ))}
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