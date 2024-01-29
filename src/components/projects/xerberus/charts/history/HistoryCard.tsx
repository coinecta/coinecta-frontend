import React, { FC, } from "react";
import HistoryGraph from "./HistoryGraph";
import { Box, Paper, IconButton } from "@mui/material";
import { HistoryDataEntry, HistoryCardDetails } from "@server/services/xerberusApi";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Tagline from "@components/projects/xerberus/tagline/Tagline";
import InfoButton from "@components/projects/xerberus/InfoButton";

interface HistoryCardProps {
  token: string;
  data: HistoryDataEntry[];
  details?: HistoryCardDetails;
  loading: boolean;
}

const hoverStyle = {
  transition: "transform 0.2s",
  ":hover": {
    transform: "scale(1.2)",
  }
};

const HistoryCard: FC<HistoryCardProps> = ({ token, data, details, loading }) => {
  return (
    <Paper sx={{
      position: "relative",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      height: '100%'
    }}>
      <InfoButton link="https://documentation.xerberus.io/xerberus-app/token-explorer/risk-rating-history" />
      {loading
        ? (
          <>
            Loading...</>
        )
        : (
          <HistoryGraph data={data} details={details} ticks={4} />
        )}
      <Tagline link={`https://app.xerberus.io/token/explorer?token=${token}`} />
    </Paper>
  );
};

export default HistoryCard;
