import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Skeleton,
  Typography,
  useTheme
} from '@mui/material';
import Grid from '@mui/system/Unstable_Grid/Grid';
import DashboardCard from '../DashboardCard';
import DataSpread from '@components/DataSpread';
import { IActionBarButton } from '../ActionBar';
import DashboardHeader from '../DashboardHeader';
import { useWallet } from '@meshsdk/react';
import { ClaimStakeRequest, StakePosition, StakeSummary, coinectaSyncApi } from '@server/services/syncApi';
import UnstakeConfirm from '../staking/UnstakeConfirm';
import StakePositionTable from '../staking/StakePositionTable';
import { useWalletContext } from '@contexts/WalletContext';
import { useToken } from '@components/hooks/useToken';
import { formatTokenWithDecimals } from '@lib/utils/assets';
import { usePrice } from '@components/hooks/usePrice';
import { walletNameToId } from '@lib/walletsList';

const StakePositions: FC = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [redeemableRows, setRedeemableRows] = useState<Set<number>>(new Set());
  const [lockedRows, setLockedRows] = useState<Set<number>>(new Set());
  const [openUnstakeDialog, setOpenUnstakeDialog] = useState(false)
  const [unstakeRowData, setUnstakeRowData] = useState<IUnstakeListItem[]>([])
  const [isLoading, setIsLoading] = useState(true);

  /* Staking API */
  const [stakeKeys, setStakeKeys] = useState<string[]>([]);
  const { wallet, connected } = useWallet();
  const [time, setTime] = useState<number>(0);
  const [positions, setPositions] = useState<StakePosition[]>([]);
  const [summary, setSummary] = useState<StakeSummary | null>(null);
  const { sessionData, sessionStatus } = useWalletContext();
  const [walletUtxosCbor, setWalletUtxosCbor] = useState<string[] | undefined>();
  const theme = useTheme();
  const { cnctDecimals } = useToken();
  const { convertToUSD, convertCnctToADA } = usePrice();
  const [isStakingKeysLoaded, setIsStakingKeysLoaded] = useState(false);
  const [changeAddress, setChangeAddress] = useState<string | undefined>(undefined);

  const formatNumber = (num: number, key: string) => `${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} ${key}`;

  const processedPositions = useMemo(() => {
    return positions.map((position) => {
      return {
        name: position.name,
        total: formatTokenWithDecimals(BigInt(position.total), cnctDecimals),
        unlockDate: new Date(position.unlockDate),
        initial: formatTokenWithDecimals(BigInt(position.initial), cnctDecimals),
        bonus: formatTokenWithDecimals(BigInt(position.bonus), cnctDecimals),
        interest: formatNumber(position.interest * 100, '%')
      };
    });
  }, [cnctDecimals, positions]);

  const selectedPositions = useMemo(() => {
    return Array.from(selectedRows).map((index) => positions[index]);
  }, [positions, selectedRows]);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

  useEffect(() => {
    const newData = Array.from(selectedRows).filter(index => redeemableRows.has(index)).map(index => {
      const item = positions[index];
      return {
        currency: item.name,
        amount: item.total.toString(),
      };
    });

    console.log(newData);

    setUnstakeRowData(newData);
  }, [selectedRows, redeemableRows, positions])

  useEffect(() => {
    const newRedeemableRows = new Set<number>();
    const newLockedRows = new Set<number>();
    const now = new Date();

    selectedRows.forEach((index) => {
      const item = processedPositions[index];
      if (item && item.unlockDate) {
        if (item.unlockDate <= now) {
          newRedeemableRows.add(index);
        } else {
          newLockedRows.add(index);
        }
      }
    });

    setRedeemableRows(newRedeemableRows);
    setLockedRows(newLockedRows);

  }, [processedPositions, selectedRows]);

  const handleRedeem = () => {
    if (selectedPositions.length === 0) return;
    setOpenUnstakeDialog(true)
  }


  // Refresh data every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(time => time + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const execute = async () => {
      if (connected && sessionStatus === 'authenticated') {
        const api = await window.cardano[walletNameToId(sessionData?.user.walletType!)!].enable();
        const utxos = await api.getUtxos();
        setWalletUtxosCbor(utxos);
      }
    };
    execute();
  }, [connected, sessionData?.user.walletType, sessionStatus]);

  useEffect(() => {
    const execute = async () => {
      if (connected) {
        setChangeAddress(await wallet.getChangeAddress());
      }
    };
    execute();
  }, [connected, wallet]);

  useEffect(() => {
    const execute = async () => {
      const STAKING_KEY_POLICY = process.env.STAKING_KEY_POLICY;

      if (connected) {
        const balance = await wallet.getBalance();
        const stakeKeys = balance.filter((asset) => asset.unit.indexOf(STAKING_KEY_POLICY) !== -1);
        const processedStakeKeys = stakeKeys.map((key) => key.unit.split('000de140').join(''));
        setStakeKeys(processedStakeKeys);
        setIsStakingKeysLoaded(true);
      }
    };
    execute();
  }, [wallet, connected, time]);

  const queryPositions = useCallback(() => {
    const execute = async () => {
      if (stakeKeys.length === 0) {
        setPositions([]);
        return;
      }
      const positions = await coinectaSyncApi.getStakePositions(stakeKeys);
      setPositions(positions);
    };
    execute();
  }, [stakeKeys]);

  useEffect(() => {
    queryPositions();
  }, [queryPositions]);

  const querySummary = useCallback(() => {
    const execute = async () => {
      if (connected && isStakingKeysLoaded) {
        if (stakeKeys.length === 0) {
          setSummary(null);
        } else {
          const summary = await coinectaSyncApi.getStakeSummary(stakeKeys);
          if (summary.poolStats.CNCT === undefined) {
            setSummary(null);
          } else {
            setSummary(summary);
          }
        }
        setIsLoading(false);
      }
    };
    execute();
  }, [stakeKeys, connected, isStakingKeysLoaded]);

  useEffect(() => {
    querySummary();
  }, [querySummary]);

  const formatWithDecimals = (value: string) => parseFloat(formatTokenWithDecimals(BigInt(value), cnctDecimals));

  const claimStakeRequest = useMemo(() => {
    return {
      stakeUtxoOutputReferences: selectedPositions.map((position) => {
        
        if (position === undefined) {
          return {
            txHash: "",
            index: 0
          }
        };

        return {
          txHash: position.txHash,
          index: position.txIndex
        }
      }),
      walletUtxoListCbor: walletUtxosCbor,
      changeAddress: changeAddress
    } as ClaimStakeRequest
  }, [changeAddress, selectedPositions, walletUtxosCbor]);

  const actions: IActionBarButton[] = [
    {
      label: 'Redeem',
      count: selectedPositions.length,
      handler: handleRedeem
    },
  ]

  return (
    <Box sx={{ position: 'relative' }} ref={parentRef}>
      <DashboardHeader title="Manage Staked Positions" />
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid xs={12} md={4}>
          <DashboardCard sx={{
            alignItems: 'center',
            height: '100%',
            justifyContent: 'center',
            py: 4
          }}>
            {summary === null ? (
              <Box sx={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box component={'p'}>
                  No data available
                </Box>
              </Box>
            ) :
              (<>
                <Typography>Total value staked</Typography>
                {isLoading ?
                  <Box sx={{ mb: 1 }}>
                    <Skeleton animation='wave' width={100} />
                    <Skeleton animation='wave' width={100} />
                  </Box> :
                  <Box sx={{ mb: 1 }}>
                    <Typography align='center' variant='h5'>{formatNumber(convertCnctToADA(formatWithDecimals(summary?.poolStats.CNCT.totalPortfolio ?? "0")), '₳')}</Typography>
                    <Typography sx={{ color: theme.palette.grey[500] }} align='center'>${formatNumber(convertToUSD(formatWithDecimals(summary?.poolStats.CNCT.totalPortfolio ?? "0"), "CNCT"), '')}</Typography>
                  </Box>}
              </>
              )
            }
          </DashboardCard>
        </Grid>
        <Grid xs={12} md={8}>
          <DashboardCard center sx={{
            justifyContent: sessionStatus === 'unauthenticated' ? 'center' : 'space-between',
          }}>
            {summary === null ?
              <Box sx={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box component={'p'}>
                  No data available
                </Box>
              </Box> :
              <DataSpread
                title="CNCT"
                margin={0} // last item needs margin 0, the rest don't include the margin prop
                data={formatNumber(formatWithDecimals(summary?.poolStats.CNCT.totalPortfolio ?? "0"), '')}
                usdValue={`$${formatNumber(convertToUSD(formatWithDecimals(summary?.poolStats.CNCT.totalPortfolio ?? "0"), "CNCT"), '')}`}
                isLoading={isLoading}
              />
            }
          </DashboardCard>
        </Grid>
      </Grid>
      <StakePositionTable
        error={false}
        data={processedPositions.length > 0 ? processedPositions : (isLoading ? fakeTrpcDashboardData.data : [])}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        actions={actions}
        parentContainerRef={parentRef}
        isLoading={isLoading}
      />
      <UnstakeConfirm
        open={openUnstakeDialog}
        setOpen={setOpenUnstakeDialog}
        unstakeList={unstakeRowData}
        claimStakeRequest={claimStakeRequest}
      />
    </Box>
  );
};

export default StakePositions;

const fakeTrpcDashboardData = {
  error: false,
  data: [
    {
      name: 'CNCT',
      total: "63000",
      unlockDate: new Date(),
      initial: "60000",
      bonus: "3000",
      interest: "21.6%"
    },
    {
      name: 'CNCT',
      total: "63000",
      unlockDate: new Date(),
      initial: "60000",
      bonus: "3000",
      interest: "21.6%"
    },
    {
      name: 'CNCT',
      total: "63000",
      unlockDate: new Date(),
      initial: "60000",
      bonus: "3000",
      interest: "21.6%"
    },
    {
      name: 'CNCT',
      total: "63000",
      unlockDate: new Date(),
      initial: "60000",
      bonus: "3000",
      interest: "21.6%"
    },
    {
      name: 'CNCT',
      total: "63000",
      unlockDate: new Date(),
      initial: "60000",
      bonus: "3000",
      interest: "21.6%"
    },
  ]
}