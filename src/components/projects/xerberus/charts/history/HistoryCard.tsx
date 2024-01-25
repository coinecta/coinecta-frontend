import React, { FC, } from "react";
import HistoryGraph from "./HistoryGraph";
import { Box } from "@mui/material";
import { HistoryDataEntry, HistoryCardDetails } from "@server/services/xerberusApi";

interface HistoryCardProps {
  token: string;
  data: HistoryDataEntry[];
  details?: HistoryCardDetails;
  loading: boolean;
}

const HistoryCard: FC<HistoryCardProps> = ({ token, data, details, loading }) => {
  const cardStyle = {
    backgroundColor: "white",
    borderRadius: "10px",
    color: "black", // replace 'foregroundColor' with the actual color value
    border: "1px solid black", // replace 'border' with the actual border value
    marginTop: "2", // Adjust based on 'md' and 'base' values
    marginBottom: "1", // Adjust based on 'md' and 'base' values
    position: "relative",
    padding: "20px", // Adjust as needed
  };

  return (
    <>
      {/* The API provides a link for this purpose. Insert the relevant variable from the API at this location. Do pass */}
      <Box sx={cardStyle}>
        {loading
          ? (
            <>
              Loading...</>
          )
          : (
            <HistoryGraph data={data} details={details} ticks={8} />
          )}
      </Box>
    </>
  );
};

export default HistoryCard;
