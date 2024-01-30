import React, { FC, useEffect } from "react";
import ratingColor from "@lib/utils/ratingColor";
import ThermometerGraph from "./ThermometerGraph";
import Tagline from "@components/projects/xerberus/tagline/Tagline";
import { Box, IconButton, Paper, Typography } from "@mui/material";
import InfoButton from "@components/projects/xerberus/InfoButton";

interface GrowthCardProps {
  token: string;
  growthScore?: string;
  loading: boolean;
}

const GrowthCard: FC<GrowthCardProps> = ({ token, growthScore, loading }) => {
  // Flexbox layout for the main content
  const flexStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row", // Keep as row for a side-by-side layout
  };

  // Box sx for textual content
  const boxStyle = {
    width: "50%",
    paddingTop: "6px",
  };

  // Link sx adjustments
  const linkStyle = {
    fontWeight: "medium",
    textDecoration: "none",
    color: "inherit",
  };

  // Hover effect for links
  const hoverStyle = {

  };

  return (
    <Paper variant="outlined" sx={{
      position: "relative",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      height: '100%'
    }}>
      <InfoButton link="https://documentation.xerberus.io/xerberus-app/token-explorer/growth-thermometer" />
      <Box sx={flexStyle}>
        <Box sx={boxStyle}>
          <Box>
            <Box sx={{ marginBottom: "20px" }}>
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexDirection: "column",
                    width: "100%",
                    mb: 2
                  }}
                >
                  <Typography variant="h6">Growth Score</Typography>
                  <Typography
                    style={{
                      fontSize: "1.2em",
                      color: ratingColor(growthScore ?? "#43A047"),
                    }}
                  >
                    {growthScore}
                  </Typography>
                </Box>
              </Box>
            </Box>
            {/* Additional content goes here */}
          </Box>
        </Box>

        {loading
          ? (
            <Box sx={{
              height: '100%',
              minHeight: '300px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              Loading chart...
            </Box>
          )
          : (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",

              }}
            >

              {/* ThermometerGraph component */}
              <ThermometerGraph data={growthScore} />
            </Box>
          )}
      </Box>
      <Tagline link={`https://app.xerberus.io/token/growth?token=${token}`} />
    </Paper>
  );
};

export default GrowthCard;
