import React, { useState, useMemo, useCallback, FC } from "react";
import {
  Avatar,
  Box,
  Button,
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
import { ClaimEntriesResponse } from "@server/services/vestingApi";
import WalletSelectDropdown from "@components/WalletSelectDropdown";
import { walletDataByName } from "@lib/walletsList";
import VestingConfirm from "./VestingConfirm";

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

const decimalConverter = (
  value: number | string | undefined,
  decimals: number | string | undefined,
) => {
  if (!value) return 0;
  if (!decimals) return 0;

  const actualValue = typeof value === "string" ? parseFloat(value) : value;
  const decimalValue =
    typeof decimals === "string" ? parseFloat(decimals) : decimals;

  if (isNaN(actualValue)) return 0;
  if (isNaN(decimalValue)) return 0;

  const divisor = Math.pow(10, decimalValue);
  const result = actualValue / divisor;

  return result.toFixed(2);
};

const mapClaimEntriesResponseToClaimEntries = (
  claimEntriesResponsesWithWalletType: ClaimEntriesResponseWithWalletType[],
): ClaimEntry[] => {
  return claimEntriesResponsesWithWalletType.map((entry) => {
    const total = entry.claimEntry.vestingValue
      ? Object.entries(entry.claimEntry.vestingValue)
          .filter(([policyId]) => policyId.length > 0)
          .reduce(
            (acc, [, assets]) =>
              acc + Object.values(assets).reduce((sum, num) => sum + num, 0),
            0,
          )
      : "N/A";

    const claimable = entry.claimEntry.directValue
      ? Object.entries(entry.claimEntry.directValue)
          .filter(([policyId]) => policyId.length > 0)
          .reduce(
            (acc, [, assets]) =>
              acc + Object.values(assets).reduce((sum, num) => sum + num, 0),
            0,
          )
      : "N/A";

    return {
      id: entry.claimEntry.id,
      rootHash: entry.claimEntry.rootHash,
      ownerPkh: entry.claimEntry.claimantPkh,
      token: "CNCT",
      total: decimalConverter(total, process.env.DEFAULT_CNCT_DECIMALS),
      claimable: decimalConverter(claimable, process.env.DEFAULT_CNCT_DECIMALS),
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
}: IVestingPositionTableProps) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [claimEntries, setClaimEntries] = useState<ClaimEntry[]>([]);
  const [claimEntry, setClaimEntry] = useState<ClaimEntry | null>(null);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);

  const _connectedAddress = useMemo(() => connectedAddress, [connectedAddress]);

  const fetchClaimEntriesByAddressMutation =
    trpc.vesting.fetchClaimEntriesByAddress.useMutation();

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
    },
    [fetchClaimEntriesByAddressMutation, getWalletTypeOfAddress],
  );

  const handleOnRedeemClick = (claimEntry: ClaimEntry) => {
    setClaimEntry(claimEntry);
    setOpenConfirmationDialog(true);
  };

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
      <VestingConfirm
        open={openConfirmationDialog}
        setOpen={setOpenConfirmationDialog}
        claimEntry={claimEntry}
      />
    </>
  );
};

export default VestingPositionTable;
