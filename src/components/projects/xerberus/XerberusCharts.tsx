import React, { FC } from "react";
import GrowthCard from "@components/projects/xerberus/charts/growth-thermometer/GrowthCard";
import HistoryCard from "@components/projects/xerberus/charts/history/HistoryCard";
import RadarCard from "@components/projects/xerberus/charts/radar/RadarCard";
import { trpc } from "@lib/utils/trpc";
import Grid from "@mui/system/Unstable_Grid/Grid";

const Charts: FC<{ token: string }> = ({ token }) => {
  const xerberusData = trpc.xerberus.getSpecificTokenInfo.useQuery({ token })
  console.log(xerberusData.data?.data)
  return (
    <Grid container spacing={2}>
      <Grid xs={12} md={6}>
        <GrowthCard
          token={token}
          growthScore={xerberusData.data?.data.growthThermometerData?.growthScore}
          loading={xerberusData.isLoading}
        />
      </Grid>
      <Grid xs={12} md={6}>
        <RadarCard
          token={token}
          scores={xerberusData.data?.data.radarChartData.scores}
          loading={xerberusData.isLoading} />
      </Grid>
      <Grid xs={12}>
        <HistoryCard
          token={token}
          data={xerberusData.data?.data.historyCardData?.data ?? []}
          details={xerberusData.data?.data.historyCardData?.details}
          loading={xerberusData.isLoading}
        />
      </Grid>
    </Grid>

  );
};

export default Charts;