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

const HistoryCard: FC<HistoryCardProps> = ({ token, data, details, loading }) => {
  return (
    <Paper variant="outlined" sx={{
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
          <Box sx={{
            height: '100%',
            minHeight: '350px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            Loading chart...
          </Box>
        )
        : data.length > 0
          ? (
            <HistoryGraph data={data} details={details} ticks={4} />
          )
          : <Box sx={{
            height: '100%',
            minHeight: '300px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            Api Unavailable
          </Box>

      }
      <Tagline link={`https://app.xerberus.io/token/explorer?token=${token}`} />
    </Paper>
  );
};

export default HistoryCard;
