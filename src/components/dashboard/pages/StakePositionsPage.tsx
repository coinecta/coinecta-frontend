import DataSpread from '@components/DataSpread';
import { usePrice } from '@components/hooks/usePrice';
import { useToken } from '@components/hooks/useToken';
import { useWalletContext } from '@contexts/WalletContext';
import { formatNumber, formatTokenWithDecimals } from '@lib/utils/assets';
import { trpc } from '@lib/utils/trpc';
import { walletNameToId } from '@lib/walletsList';
import { BrowserWallet } from '@meshsdk/core';
import { useWallet } from '@meshsdk/react';
import {
  Box,
  Skeleton,
  Typography,
  useTheme
} from '@mui/material';
import Grid from '@mui/system/Unstable_Grid/Grid';
import { ClaimStakeRequest } from '@server/services/syncApi';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { IActionBarButton } from '../ActionBar';
import DashboardCard from '../DashboardCard';
import DashboardHeader from '../DashboardHeader';
import RedeemConfirm from '../staking/RedeemConfirm';
import StakePositionTable from '../staking/StakePositionTable';
import { useCardano } from '@lib/utils/cardano';
import { useAlert } from '@contexts/AlertContext';

const StakePositions: FC = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [selectedRows, setSelectedRows] = useState<Set<any>>(new Set());
  const [redeemableRows, setRedeemableRows] = useState<Set<number>>(new Set());
  const [lockedRows, setLockedRows] = useState<Set<number>>(new Set());
  const [openRedeemDialog, setOpenRedeemDialog] = useState(false)
  const [redeemRowData, setRedeemRowData] = useState<IRedeemListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addAlert } = useAlert();

  /* Staking API */
  const [stakeKeys, setStakeKeys] = useState<string[]>([]);
  const [stakeKeyWalletMapping, setStakeKeyWalletMapping] = useState<Record<string, string>>({});
  const { wallet, connected } = useWallet();
  const [time, setTime] = useState<number>(0);
  const { sessionData, sessionStatus } = useWalletContext();
  const [walletUtxosCbor, setWalletUtxosCbor] = useState<string[] | undefined>();
  const theme = useTheme();
  const { cnctDecimals } = useToken();
  const { convertToUSD, convertCnctToADA } = usePrice();
  const [isStakingKeysLoaded, setIsStakingKeysLoaded] = useState(false);
  const [changeAddress, setChangeAddress] = useState<string | undefined>(undefined);
  const { selectedAddresses } = useWalletContext();
  const { isWalletConnected } = useCardano();

  const getWallets = trpc.user.getWallets.useQuery()
  const userWallets = useMemo(() => getWallets.data && getWallets.data.wallets, [getWallets]);

  const [currentWallet, setCurrentWallet] = useState<string | undefined>(undefined);

  const queryStakeSummary = trpc.sync.getStakeSummary.useQuery(stakeKeys, { retry: 0, refetchInterval: 5000 });
  const summary = useMemo((() => queryStakeSummary.data), [queryStakeSummary.data]);
  
  const queryStakePositions = trpc.sync.getStakePositions.useQuery(stakeKeys, { retry: 0, refetchInterval: 5000 });
  const positions = useMemo(() => queryStakePositions.data ?? [], [queryStakePositions.data]);

  const STAKE_POOL_SUBJECT = process.env.STAKE_POOL_ASSET_POLICY! + process.env.STAKE_POOL_ASSET_NAME!;

  useEffect(() => {
    setIsLoading(!queryStakeSummary.isSuccess || !isStakingKeysLoaded || !queryStakePositions.isSuccess);
  }, [queryStakeSummary.isSuccess, isStakingKeysLoaded, queryStakePositions.isSuccess]);

  useEffect(() => {
    if (sessionData?.user) {
      setCurrentWallet(sessionData.user.walletType!);
    }
    
  }, [sessionData])

  const processedPositions = useMemo(() => {
    return positions.map((position) => {
      return {
        name: 'CNCT',
        total: formatNumber(parseFloat(formatTokenWithDecimals(BigInt(position.total), cnctDecimals)), ''),
        unlockDate: new Date(position.unlockDate),
        initial: formatNumber(parseFloat(formatTokenWithDecimals(BigInt(position.initial), cnctDecimals)), ''),
        bonus: formatNumber(parseFloat(formatTokenWithDecimals(BigInt(position.bonus), cnctDecimals)), ''),
        interest: formatNumber(position.interest * 100, '%'),
        stakeKey: position.stakeKey,
      };
    });
  }, [cnctDecimals, positions]);

  const selectedPositions = useMemo(() => {
    return Array.from(selectedRows).map((item) => positions.find(p => p.stakeKey === item.stakeKey));
  }, [positions, selectedRows]);

  useEffect(() => {
    const newData = Array.from(selectedRows).filter(index => redeemableRows.has(index)).map(index => {
      const item = positions[index];
      if (item === undefined) return;
      return {
        currency: item.name,
        amount: item.total.toString(),
      };
    }).filter(item => item !== undefined).map(item => item as { currency: string, amount: string });

    setRedeemRowData(newData);
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
    if (selectedPositions.length === 0) {
      addAlert('error', 'Select the positions to redeem');
      return;
    }
    setOpenRedeemDialog(true);
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
      if (connected && sessionStatus === 'authenticated' && currentWallet) {
        try {
          setWalletUtxosCbor([]);
          if (window.cardano[walletNameToId(currentWallet!)!] === undefined) return;
          const api = await window.cardano[walletNameToId(currentWallet!)!].enable();
          const utxos = await api.getUtxos();
          const collateral = await api.experimental.getCollateral() === undefined ? [] : await api.experimental.getCollateral();
          setWalletUtxosCbor([...utxos!, ...collateral!]);
        } catch (ex) {
          console.error("Error getting utxos", ex);
        }
      }
    };
    execute();
  }, [connected, currentWallet, sessionStatus]);

  useEffect(() => {
    const execute = async () => {
      if (connected) setChangeAddress(await wallet.getChangeAddress());
    };
    execute();
  }, [connected, wallet]);

  useEffect(() => {
    const execute = async () => {
      if (connected) {
        const STAKING_KEY_POLICY = process.env.STAKING_KEY_POLICY;
        if (userWallets === undefined || userWallets === null) return;
        const stakeKeyWallet: Record<string, string> = {};
        const stakeKeysPromises = userWallets.map(async userWallet => {
          try {
            if (!(await isWalletConnected(userWallet.type, userWallet.changeAddress))) return [];
            if (selectedAddresses.indexOf(userWallet.changeAddress) === -1) return [];
            const browserWallet = await BrowserWallet.enable(userWallet.type);
            const balance = await browserWallet.getBalance();
            const stakeKeys = balance.filter((asset) => asset.unit.includes(STAKING_KEY_POLICY));
            const processedStakeKeys = stakeKeys.map((key) => key.unit.replace('000de140', ''));
            stakeKeys.forEach((key) => {
              stakeKeyWallet[key.unit.replace('000de140', '')] = userWallet.type;
            });
            return processedStakeKeys;
          } catch {
            addAlert('error', `Failed to load stake positions for ${userWallet.type[0].toUpperCase() + userWallet.type.slice(1)} wallet. Please reload the page.`);
            console.log('Error getting stake keys', userWallet);
          }
        });
        const stakeKeysArrays = await Promise.all(stakeKeysPromises);
        const allStakeKeys = stakeKeysArrays.flat();
        setStakeKeys(allStakeKeys);
        setStakeKeyWalletMapping(stakeKeyWallet);
        setIsStakingKeysLoaded(true);
      }
    };
    execute();
  }, [wallet, connected, time, userWallets, selectedAddresses, addAlert]);

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
            {summary === null && !isLoading ? (
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
                    <Typography align='center' variant='h5'>{formatNumber(convertCnctToADA(formatWithDecimals(summary?.poolStats[STAKE_POOL_SUBJECT]?.totalPortfolio ?? "0")), '₳')}</Typography>
                    <Typography sx={{ color: theme.palette.grey[500] }} align='center'>${formatNumber(convertToUSD(formatWithDecimals(summary?.poolStats[STAKE_POOL_SUBJECT]?.totalPortfolio ?? "0"), "CNCT"), '')}</Typography>
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
            {summary === null && !isLoading ?
              <Box sx={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box component={'p'}>
                  No data available
                </Box>
              </Box> :
              <DataSpread
                title="CNCT"
                margin={0} // last item needs margin 0, the rest don't include the margin prop
                data={formatNumber(formatWithDecimals(summary?.poolStats[STAKE_POOL_SUBJECT]?.totalPortfolio ?? "0"), '')}
                usdValue={`$${formatNumber(convertToUSD(formatWithDecimals(summary?.poolStats[STAKE_POOL_SUBJECT]?.totalPortfolio ?? "0"), "CNCT"), '')}`}
                isLoading={isLoading}
              />
            }
          </DashboardCard>
        </Grid>
      </Grid>
      <StakePositionTable
        error={false}
        data={processedPositions.length > 0 ? processedPositions : (isLoading ? fakeTrpcDashboardData.data : [])}
        connectedWallets={userWallets?.map(uw => uw.type).filter(w => new Set(Object.values(stakeKeyWalletMapping)).has(w)) ?? []}
        stakeKeyWalletMapping={stakeKeyWalletMapping}
        currentWallet={currentWallet!}
        setCurrentWallet={setCurrentWallet}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        actions={actions}
        parentContainerRef={parentRef}
        isLoading={isLoading || (walletUtxosCbor?.length ?? 0) <= 0}
      />
      <RedeemConfirm
        open={openRedeemDialog}
        setOpen={setOpenRedeemDialog}
        redeemList={redeemRowData}
        redeemWallet={currentWallet!}
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
      name: '',
      total: "",
      unlockDate: new Date(),
      initial: "",
      bonus: "",
      interest: ""
    },
    {
      name: '',
      total: "",
      unlockDate: new Date(),
      initial: "",
      bonus: "",
      interest: ""
    },
    {
      name: '',
      total: "",
      unlockDate: new Date(),
      initial: "",
      bonus: "",
      interest: ""
    },
    {
      name: '',
      total: "",
      unlockDate: new Date(),
      initial: "",
      bonus: "",
      interest: ""
    },
    {
      name: '',
      total: "",
      unlockDate: new Date(),
      initial: "",
      bonus: "",
      interest: ""
    }
  ]
}