import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  FC,
} from "react";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Divider,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import DashboardCard from "@components/dashboard/DashboardCard";
import { trpc } from "@lib/utils/trpc";
import {
  ClaimEntriesResponse,
  ClaimTreasuryDataResponse,
} from "@server/services/vestingApi";
import WalletSelectDropdown from "@components/WalletSelectDropdown";
import { useWallet } from "@meshsdk/react";
import { walletDataByName } from "@lib/walletsList";

interface IVestingPositionTableProps {
  isLoading: boolean;
  connectedAddress?: string;
  walletName?: string;
}

type ClaimEntry = {
  id: string;
  rootHash: string;
  ownerPkh: string;
  token: string;
  total: number | string;
  claimable: number | string;
  frequency: string;
  nextUnlockDate: string;
  endDate: string;
  remainingPeriods: string;
  ownerAddress: string;
  walletType: string;
};

type ClaimEntriesResponseWithWalletType = {
  claimEntry: ClaimEntriesResponse;
  ownerAddress: string;
  walletType: string;
};

const rowsPerPageOptions = [5, 10, 15];

export const shortenString = (input: string): string => {
  if (input.length <= 11) {
    return input;
  }

  const start = input.slice(0, 7);
  const end = input.slice(-4);

  return `${start}...${end}`;
};

const mapClaimEntriesResponseToClaimEntries = (
  claimEntriesResponsesWithWalletType: ClaimEntriesResponseWithWalletType[],
): ClaimEntry[] => {
  return claimEntriesResponsesWithWalletType.map((entry) => {
    const total = entry.claimEntry.vestingValue
      ? Object.values(entry.claimEntry.vestingValue).reduce(
          (acc, val) =>
            acc + Object.values(val).reduce((sum, num) => sum + num, 0),
          0,
        )
      : "N/A";

    const claimable = entry.claimEntry.directValue
      ? Object.values(entry.claimEntry.directValue).reduce(
          (acc, val) =>
            acc + Object.values(val).reduce((sum, num) => sum + num, 0),
          0,
        )
      : "N/A";

    return {
      id: entry.claimEntry.id,
      rootHash: entry.claimEntry.rootHash,
      ownerPkh: entry.claimEntry.claimantPkh,
      token: "CNCT", // Assuming claimantPkh is used as a token here
      total: typeof total === "number" ? total : "N/A",
      claimable: typeof claimable === "number" ? claimable : "N/A",
      frequency: "N/A",
      nextUnlockDate: "N/A",
      endDate: "N/A",
      remainingPeriods: "N/A",
      ownerAddress: entry.ownerAddress,
      walletType: entry.walletType,
    };
  });
};

const VestingPositionTable: FC<IVestingPositionTableProps> = ({
  isLoading,
  connectedAddress,
  walletName,
}: IVestingPositionTableProps) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [clicked, setClicked] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<any>>(new Set());
  const [claimEntries, setClaimEntries] = useState<ClaimEntry[]>([]);

  const _connectedAddress = useMemo(() => connectedAddress, [connectedAddress]);
  const _walletName = useMemo(() => walletName, [walletName]);

  const finalizeTransaction = trpc.vesting.finalizeTransaction.useMutation();
  const createClaimTreasuryDataMutation =
    trpc.vesting.createClaimTreasuryData.useMutation();
  const fetchClaimEntriesByAddressMutation =
    trpc.vesting.fetchClaimEntriesByAddress.useMutation();
  const claimTreasuryMutation = trpc.vesting.claimTreasury.useMutation();
  const submitClaimTreasuryTransaction =
    trpc.vesting.submitClaimTreasuryTransaction.useMutation();

  const getWallets = trpc.user.getWallets.useQuery();

  const wallets = useMemo(
    () => getWallets.data && getWallets.data.wallets,
    [getWallets],
  );

  const walletByName = useCallback(
    (name: string) => walletDataByName(name),
    [],
  );

  const getWalletTypeOfAddress = useCallback(
    (address: string) => {
      if (wallets === undefined || wallets === null) return;

      const wallet = wallets.find((wallet) => wallet.changeAddress == address);

      if (wallet === undefined) return;

      return wallet.type;
    },
    [wallets],
  );

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatData = <ClaimEntry,>(
    data: ClaimEntry,
    key: keyof ClaimEntry,
  ): string => {
    const value = data[key];

    if (typeof value === "number") {
      return value.toLocaleString();
    } else if (value instanceof Date) {
      return dayjs(value).format("YYYY/MM/DD");
    }
    return shortenString(String(value));
  };

  const camelCaseToTitle = (camelCase: string) => {
    const withSpaces = camelCase.replace(/([A-Z])/g, " $1").trim();
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
  };

  const handleSelectRow = (item: ClaimEntry) => {
    if (setSelectedRows) {
      setSelectedRows((prevSelectedRows) => {
        const newSelectedRows = new Set(prevSelectedRows);
        if (newSelectedRows.has(item)) {
          newSelectedRows.delete(item);
        } else {
          newSelectedRows.add(item);
        }
        setClicked(newSelectedRows.size == 0 ? false : true);
        return newSelectedRows;
      });
    }
  };

  const getRawUtxos = useCallback(async () => {
    if (_walletName !== undefined) {
      const api = await window.cardano[_walletName].enable();

      const rawUtxos = await api.getUtxos();

      if (rawUtxos === undefined) return;
      return rawUtxos;
    }
  }, [_walletName]);

  const getRawCollateralUtxo = useCallback(async () => {
    if (_walletName !== undefined) {
      const api = await window.cardano[_walletName].enable();

      const collateral = await api.experimental.getCollateral();

      if (collateral === undefined) return;
      return collateral[0];
    }
  }, [_walletName]);

  const signTx = useCallback(
    async (unsignedTx: string) => {
      if (_walletName !== undefined) {
        const api = await window.cardano[_walletName].enable();

        const signedTx = await api.signTx(unsignedTx, true);

        if (signedTx === undefined) return;
        return signedTx;
      }
    },
    [_walletName],
  );

  const fetchClaimEntries = useCallback(
    async (addresses: string[]) => {
      const claimEntriesResponsesWithWalletType: ClaimEntriesResponseWithWalletType[] =
        [];

      for (const address of addresses) {
        const _claimEntriesResponses: ClaimEntriesResponse[] =
          await fetchClaimEntriesByAddressMutation.mutateAsync({
            addresses: [address],
          });

        const walletType = getWalletTypeOfAddress(address);

        const _claimEntriesResponsesWithWalletType: ClaimEntriesResponseWithWalletType[] =
          _claimEntriesResponses.map((claimEntriesResponse) => ({
            claimEntry: claimEntriesResponse,
            ownerAddress: address,
            walletType: walletType !== undefined ? walletType : "",
          }));

        claimEntriesResponsesWithWalletType.push(
          ..._claimEntriesResponsesWithWalletType,
        );
      }

      const mappedClaimEntries = mapClaimEntriesResponseToClaimEntries(
        claimEntriesResponsesWithWalletType,
      );

      setClaimEntries(mappedClaimEntries);

      console.log("Claim Entries", mappedClaimEntries);
    },
    [fetchClaimEntriesByAddressMutation],
  );

  const handleOnRedeemClick = useCallback(
    async (claimEntry: ClaimEntry) => {
      const rawUtxos = await getRawUtxos();
      const rawCollateralUtxo = await getRawCollateralUtxo();
      if (rawUtxos === undefined || rawCollateralUtxo === undefined) return;

      if (_connectedAddress === undefined) return;

      const rootHash: string = claimEntry.rootHash;
      const ownerAddress: string = claimEntry.ownerAddress;

      const { updatedRootHash, rawProof, rawClaimEntry } =
        await createClaimTreasuryDataMutation.mutateAsync({
          rootHash,
          ownerAddress,
        });

      const id: string = claimEntry.id;

      const { unsignedTxRaw, treasuryUtxoRaw } =
        await claimTreasuryMutation.mutateAsync({
          id,
          ownerAddress,
          updatedRootHash,
          rawProof,
          rawClaimEntry,
          rawCollateralUtxo,
          rawUtxos,
        });

      const signedTx = await signTx(unsignedTxRaw);

      if (signedTx === undefined) return;

      const { txHash } = await finalizeTransaction.mutateAsync({
        unsignedTxCbor: unsignedTxRaw,
        txWitnessCbor: signedTx,
      });

      const ownerPkh = claimEntry.ownerPkh;

      await submitClaimTreasuryTransaction.mutateAsync({
        id,
        ownerPkh,
        utxoRaw: treasuryUtxoRaw,
        txRaw: txHash,
      });
    },
    [
      getRawUtxos,
      getRawCollateralUtxo,
      _connectedAddress,
      createClaimTreasuryDataMutation,
    ],
  );

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "center", sm: "flex-end" },
          mb: 1,
          gap: 1,
        }}
      >
        <Typography variant="h5">Your Vesting Positions</Typography>
        <Box sx={{ minWidth: "250px", display: "block" }}>
          <WalletSelectDropdown onWalletDropDownUpdate={fetchClaimEntries} />
        </Box>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <DashboardCard
        sx={{
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
        }}
      >
        {claimEntries.length > 0 ? (
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  "& th": {
                    position: "sticky",
                    top: "71px",
                    zIndex: 2,
                    background: theme.palette.background.paper,
                    textAlign: "center",
                  },
                }}
              >
                <TableCell></TableCell>
                {Object.keys(claimEntries[0])
                  .filter(
                    (key) =>
                      key !== "id" &&
                      key !== "ownerPkh" &&
                      key !== "rootHash" &&
                      key !== "ownerAddress" &&
                      key !== "walletType",
                  )
                  .map((column) => (
                    <TableCell
                      key={String(column)}
                      sx={{
                        color:
                          theme.palette.mode === "dark" ? "#ffffff" : "black",
                      }}
                    >
                      {camelCaseToTitle(String(column))}
                    </TableCell>
                  ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {claimEntries
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      "&:nth-of-type(odd)": {
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? "rgba(205,205,235,0.05)"
                            : "rgba(0,0,0,0.05)",
                      },
                      "&:hover": {
                        background:
                          theme.palette.mode === "dark"
                            ? "rgba(205,205,235,0.15)"
                            : "rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <TableCell sx={{ borderBottom: "none", width: "30px" }}>
                      <Avatar
                        variant="square"
                        sx={{
                          width: "30px",
                          height: "30px",
                          marginLeft: "15px",
                          marginRight: "10px",
                        }}
                        src={
                          theme.palette.mode === "dark"
                            ? walletByName(item.walletType)?.iconDark
                            : walletByName(item.walletType)?.icon
                        }
                      />
                    </TableCell>
                    {Object.keys(item)
                      .filter(
                        (key) =>
                          key !== "id" &&
                          key !== "ownerPkh" &&
                          key !== "rootHash" &&
                          key !== "ownerAddress" &&
                          key !== "walletType",
                      )
                      .map((key, colIndex) => (
                        <TableCell
                          key={`${key}-${colIndex}`}
                          sx={{
                            borderBottom: "none",
                            color:
                              theme.palette.mode === "dark"
                                ? "#ffffff"
                                : "#424242",
                            textAlign: "center",
                          }}
                        >
                          {isLoading ? (
                            <Skeleton width={100} />
                          ) : (
                            formatData(item, key as keyof ClaimEntry)
                          )}
                        </TableCell>
                      ))}
                    <TableCell>
                      <Button
                        color="primary"
                        sx={{ px: "25px", py: "5px", color: "white" }}
                        variant="contained"
                        disabled={_connectedAddress === undefined}
                        onClick={() => handleOnRedeemClick(item)}
                      >
                        Redeem
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  component="td"
                  rowsPerPageOptions={rowsPerPageOptions}
                  colSpan={9}
                  count={claimEntries.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableRow>
            </TableFooter>
          </Table>
        ) : (
          <Box
            sx={{
              height: "100%",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box component={"p"}>No data available</Box>
          </Box>
        )}
      </DashboardCard>
    </>
  );
};

export default VestingPositionTable;
