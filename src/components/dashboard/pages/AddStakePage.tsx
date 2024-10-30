import DataSpread from "@components/DataSpread";
import DashboardCard from "@components/dashboard/DashboardCard";
import StakeInput from "@components/dashboard/staking/StakeInput";
import { formatNumber, formatTokenWithDecimals } from "@lib/utils/assets";
import { calculateFutureDateMonths } from "@lib/utils/general";
import { trpc } from "@lib/utils/trpc";
import {
  Box,
  Button,
  Link,
  Skeleton,
  Typography,
  useTheme,
} from "@mui/material";
import Grid from "@mui/system/Unstable_Grid/Grid";
import React, { FC, useEffect, useMemo, useState } from "react";
import DashboardHeader from "../../dashboard/DashboardHeader";
import StakeConfirm from "../../dashboard/staking/StakeConfirm";
import StakeDuration from "../../dashboard/staking/StakeDuration";

const options = [
  {
    duration: 1,
    interest: 0.005,
  },
  {
    duration: 3,
    interest: 0.025,
  },
  {
    duration: 6,
    interest: 0.075,
  },
  {
    duration: 12,
    interest: 0.2,
  },
];

const calculateAPY = (lockupMonths: number, interestRate: number): number => {
  const compoundFrequency = 12 / lockupMonths;
  const apy = Math.pow(1 + interestRate, compoundFrequency) - 1;
  return apy * 100;
};

const AddStakePage: FC = () => {
  const STAKE_POOL_VALIDATOR_ADDRESS =
    process.env.STAKE_POOL_VALIDATOR_ADDRESS!;
  const STAKE_POOL_OWNER_KEY_HASH = process.env.STAKE_POOL_OWNER_KEY_HASH!;
  const STAKE_POOL_ASSET_POLICY = process.env.STAKE_POOL_ASSET_POLICY!;
  const STAKE_POOL_ASSET_NAME = process.env.STAKE_POOL_ASSET_NAME!;
  const DEFAULT_CNCT_DECIMALS = parseInt(process.env.DEFAULT_CNCT_DECIMALS!);

  const [cnctAmount, setCnctAmount] = useState("");
  const [stakeDuration, setStakeDuration] = useState<number>(1);
  const [durations, setDurations] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);

  const theme = useTheme();

  const getStakePoolQuery = trpc.sync.getStakePool.useQuery({
    address: STAKE_POOL_VALIDATOR_ADDRESS,
    ownerPkh: STAKE_POOL_OWNER_KEY_HASH,
    policyId: STAKE_POOL_ASSET_POLICY,
    assetName: STAKE_POOL_ASSET_NAME,
  });

  const metadataQuery = trpc.tokens.getMetadata.useQuery({
    unit: `${STAKE_POOL_ASSET_POLICY}${STAKE_POOL_ASSET_NAME}`,
  });

  const cnctDecimals = useMemo(() => {
    return metadataQuery.data?.decimals?.value ?? DEFAULT_CNCT_DECIMALS;
  }, [DEFAULT_CNCT_DECIMALS, metadataQuery.data?.decimals?.value]);

  useEffect(() => {
    setIsLoading(!getStakePoolQuery.isSuccess && !metadataQuery.isSuccess);
  }, [getStakePoolQuery.isSuccess, metadataQuery.isSuccess]);

  useEffect(() => {
    const newArray = options.map((option) => option.duration);
    setDurations(newArray);
  }, []);

  const totalRewards = useMemo(() => {
    return BigInt(
      getStakePoolQuery.data?.amount.multiAsset[STAKE_POOL_ASSET_POLICY][
        STAKE_POOL_ASSET_NAME
      ] ?? 0
    );
  }, [
    STAKE_POOL_ASSET_NAME,
    STAKE_POOL_ASSET_POLICY,
    getStakePoolQuery.data?.amount.multiAsset,
  ]);

  const rewardSettingIndex = useMemo(() => {
    return options.indexOf(
      options.find((option) => option.duration === stakeDuration) || options[0]
    );
  }, [stakeDuration]);

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    if (event.key === "Enter") {
      if (Number(cnctAmount) !== 0) {
        setOpenConfirmationDialog(true);
      }
      event.preventDefault();
    }
  };

  const total = (
    Number(cnctAmount)
      ? Number(cnctAmount) *
          (options.find((option) => option.duration === stakeDuration)
            ?.interest || 0) +
        Number(cnctAmount)
      : 0
  ).toLocaleString(undefined, { maximumFractionDigits: 1 });
  const rewards = Number(cnctAmount)
    ? Number(cnctAmount) *
      (options.find((option) => option.duration === stakeDuration)?.interest ||
        0)
    : 0;

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <DashboardHeader title="Add Stake" />
        <Grid container spacing={2}>
          <Grid xs={12} md={7}>
            <DashboardCard center>
              <Typography variant="h3" sx={{ mb: 2 }}>
                Stake Coinecta
              </Typography>
              <Box sx={{ width: "100%", mb: 3 }}>
                {isLoading ? (
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <Skeleton animation="wave" width={200} />
                  </div>
                ) : (
                  <StakeDuration
                    duration={stakeDuration}
                    setDuration={setStakeDuration}
                    durations={durations}
                  />
                )}
              </Box>
              <Box sx={{ width: "100%", mb: 3 }}>
                <StakeInput
                  inputValue={cnctAmount}
                  setInputValue={setCnctAmount}
                  onKeyDown={handleKeyDown}
                />
              </Box>
              <Box>
                <Typography sx={{ textAlign: "center", color: "red", mb: 2 }}>
                  Staking is closed for the time being in case the upcoming
                  hard-fork breaks unstaking. We will notify if anything
                  changes.
                </Typography>
              </Box>
              <Box>
                <Button
                  variant="contained"
                  color="secondary"
                  sx={{
                    textTransform: "none",
                    fontSize: "20px",
                    fontWeight: 600,
                    borderRadius: "6px",
                  }}
                  onClick={() => setOpenConfirmationDialog(true)}
                  // disabled={Number(cnctAmount) === 0 || Number(formatTokenWithDecimals(totalRewards, cnctDecimals)) < rewards + 2000}
                  disabled
                >
                  Stake now
                </Button>
              </Box>
              {/* {Number(formatTokenWithDecimals(totalRewards, cnctDecimals)) < rewards + 2000 && 
              <Typography sx={{ fontSize: '13px!important', mt: 2, textAlign: 'center', color: theme.palette.error.main }}>
                The stake pool needs to be reloaded, please follow the announcements in Telegram or Discord for updates.
              </Typography>
            } */}
            </DashboardCard>
          </Grid>
          <Grid
            xs={12}
            md={5}
            sx={{ display: "flex", gap: 2, flexDirection: "column" }}
          >
            <DashboardCard>
              <Box sx={{ width: "100%" }}>
                <Box sx={{ mb: 2, textAlign: "center" }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Total APY
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {isLoading ? (
                      <div
                        style={{ display: "flex", justifyContent: "center" }}
                      >
                        <Skeleton animation="wave" width={55} />
                      </div>
                    ) : (
                      `${calculateAPY(
                        stakeDuration,
                        options.find(
                          (option) => option.duration === stakeDuration
                        )?.interest || 1
                      ).toLocaleString(undefined, {
                        maximumFractionDigits: 1,
                      })}%`
                    )}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-around",
                    width: "100%",
                  }}
                >
                  <Box sx={{ textAlign: "center" }}>
                    <Typography sx={{ fontWeight: 700 }}>Base APY</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {isLoading ? (
                        <div
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <Skeleton animation="wave" width={55} />
                        </div>
                      ) : (
                        `${calculateAPY(
                          1,
                          options.find((option) => option.duration === 1)
                            ?.interest || 1
                        ).toLocaleString(undefined, {
                          maximumFractionDigits: 1,
                        })}%`
                      )}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography sx={{ fontWeight: 700 }}>APY Boost</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {isLoading ? (
                        <div
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <Skeleton animation="wave" width={55} />
                        </div>
                      ) : (
                        `${(
                          calculateAPY(
                            stakeDuration,
                            options.find(
                              (option) => option.duration === stakeDuration
                            )?.interest || 1
                          ) -
                          calculateAPY(
                            1,
                            options.find((option) => option.duration === 1)
                              ?.interest || 1
                          )
                        ).toLocaleString(undefined, {
                          maximumFractionDigits: 1,
                        })}%`
                      )}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </DashboardCard>
            <DashboardCard>
              <DataSpread
                title="Total Available Rewards"
                data={`${formatNumber(
                  parseFloat(
                    formatTokenWithDecimals(totalRewards, cnctDecimals)
                  ),
                  ""
                )} CNCT`}
                isLoading={isLoading}
              />
              <DataSpread
                title="Unlock Date"
                data={`${calculateFutureDateMonths(stakeDuration)}`}
                isLoading={isLoading}
              />
              <DataSpread
                title="Rewards"
                data={`${rewards.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })} CNCT`}
                isLoading={isLoading}
              />
              <DataSpread
                title="Total interest"
                data={`${(
                  (options.find((option) => option.duration === stakeDuration)
                    ?.interest || 0) * 100
                ).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`}
                isLoading={isLoading}
              />
            </DashboardCard>
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ mb: 4 }}>
        <DashboardHeader title="Stake tiers" isDropdownHidden />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 2,
            "@media (min-width: 768px)": {
              gridTemplateColumns: "repeat(3, 1fr)",
            },
            "@media (min-width: 1280px)": {
              gridTemplateColumns: "repeat(6, 1fr)",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              width: "100%",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                textAlign: "center",
                py: 1,
                px: 3,
                backgroundColor: theme.palette.primary.main,
                borderRadius: "6px",
              }}
            >
              <Typography variant="h6">TIER 1</Typography>
            </Box>
            <DashboardCard
              sx={{
                display: "grid",
                gridTemplateRows: "repeat(3, 1fr)",
                justifyContent: "center",
              }}
              center
              standard
            >
              <Typography sx={{ fontWeight: 900 }}>Initiate</Typography>
              <Typography sx={{ fontWeight: 700 }}>
                Amount Staked: 5,000
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>Weight: 80</Typography>
            </DashboardCard>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              width: "100%",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                textAlign: "center",
                py: 1,
                px: 3,
                backgroundColor: theme.palette.primary.main,
                borderRadius: "6px",
              }}
            >
              <Typography variant="h6">TIER 2</Typography>
            </Box>
            <DashboardCard
              sx={{
                display: "grid",
                gridTemplateRows: "repeat(3, 1fr)",
                justifyContent: "center",
              }}
              center
              standard
            >
              <Typography sx={{ fontWeight: 900 }}>Discoverer</Typography>
              <Typography sx={{ fontWeight: 700 }}>
                Amount Staked: 10,000
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>Weight: 200</Typography>
            </DashboardCard>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              width: "100%",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                textAlign: "center",
                py: 1,
                px: 3,
                backgroundColor: "#c98e88",
                borderRadius: "6px",
              }}
            >
              <Typography variant="h6">TIER 3</Typography>
            </Box>
            <DashboardCard
              sx={{
                display: "grid",
                gridTemplateRows: "repeat(3, 1fr)",
                justifyContent: "center",
              }}
              center
              standard
            >
              <Typography sx={{ fontWeight: 900 }}>Inovator</Typography>
              <Typography sx={{ fontWeight: 700 }}>
                Amount Staked: 20,000
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>Weight: 500</Typography>
            </DashboardCard>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              width: "100%",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                textAlign: "center",
                py: 1,
                px: 3,
                backgroundColor: "#c98e88",
                borderRadius: "6px",
              }}
            >
              <Typography variant="h6">TIER 4</Typography>
            </Box>
            <DashboardCard
              sx={{
                display: "grid",
                gridTemplateRows: "repeat(3, 1fr)",
                justifyContent: "center",
              }}
              center
              standard
            >
              <Typography sx={{ fontWeight: 900 }}>Expert</Typography>
              <Typography sx={{ fontWeight: 700 }}>
                Amount Staked: 40,000
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>Weight: 1,250</Typography>
            </DashboardCard>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              width: "100%",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                textAlign: "center",
                py: 1,
                px: 3,
                backgroundColor: theme.palette.secondary.main,
                borderRadius: "6px",
              }}
            >
              <Typography variant="h6">TIER 5</Typography>
            </Box>
            <DashboardCard
              sx={{
                display: "grid",
                gridTemplateRows: "repeat(3, 1fr)",
                justifyContent: "center",
              }}
              center
              standard
            >
              <Typography sx={{ fontWeight: 900 }}>Visionary</Typography>
              <Typography sx={{ fontWeight: 700 }}>
                Amount Staked: 80,000
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>Weight: 3,125</Typography>
            </DashboardCard>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              width: "100%",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                textAlign: "center",
                py: 1,
                px: 3,
                backgroundColor: theme.palette.secondary.main,
                borderRadius: "6px",
              }}
            >
              <Typography variant="h6">TIER 6</Typography>
            </Box>
            <DashboardCard
              sx={{
                display: "grid",
                gridTemplateRows: "repeat(3, 1fr)",
                justifyContent: "center",
              }}
              center
              standard
            >
              <Typography sx={{ fontWeight: 900 }}>Oracle</Typography>
              <Typography sx={{ fontWeight: 700 }}>
                Amount Staked: 160,000
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>Weight: 8,000</Typography>
            </DashboardCard>
          </Box>
        </Box>
      </Box>

      <Box mb={4}>
        <DashboardHeader title="Learn more" isDropdownHidden />
        <Grid container spacing={2}>
          <Grid xs={12} sm={6} md={3}>
            <Button
              href="https://docs.coinecta.fi/launchpad/how-it-works"
              color="secondary"
              variant="contained"
              size="large"
              target="_blank"
              sx={{
                width: "100%",
                fontWeight: 700,
              }}
            >
              How it works
            </Button>
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <Button
              href="https://docs.coinecta.fi/launchpad/staking"
              color="secondary"
              variant="contained"
              size="large"
              target="_blank"
              sx={{
                width: "100%",
                fontWeight: 700,
              }}
            >
              Staking overview
            </Button>
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <Button
              href="https://coinecta.medium.com/62ed3fb5dd21"
              color="secondary"
              variant="contained"
              size="large"
              target="_blank"
              sx={{
                width: "100%",
                fontWeight: 700,
              }}
            >
              How to stake
            </Button>
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <Button
              href="https://coinecta.medium.com/27ab254b4d33"
              color="secondary"
              variant="contained"
              size="large"
              target="_blank"
              sx={{
                width: "100%",
                fontWeight: 700,
              }}
            >
              How to redeem
            </Button>
          </Grid>
        </Grid>
      </Box>
      <StakeConfirm
        open={openConfirmationDialog}
        setOpen={setOpenConfirmationDialog}
        paymentAmount={cnctAmount}
        setPaymentAmount={setCnctAmount}
        paymentCurrency={"CNCT"}
        duration={stakeDuration}
        total={total}
        rewardIndex={rewardSettingIndex}
      />
    </>
  );
};

export default AddStakePage;
