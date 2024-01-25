import React, { FC, useEffect } from "react";
import ratingColor from "@lib/utils/ratingColor";
import ThermometerGraph from "./ThermometerGraph";
import Tagline from "@components/projects/xerberus/tagline/Tagline";
import { Box } from "@mui/material";

interface GrowthCardProps {
  token: string;
  growthScore?: string;
  loading: boolean;
}

const GrowthCard: FC<GrowthCardProps> = ({ token, growthScore, loading }) => {
  // Card sx with responsive width and padding adjustments
  const cardStyle = {
    backgroundColor: "white",
    border: "1px solid black",
    borderRadius: "10px",
    color: "black",
    width: "100%",
    height: "100%",
    margin: "auto",
    position: "relative",
    padding: "20px",
  };

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
    ":hover": {
      color: "blue.300",
      transform: "scale(1.05)",
      transition: "transform 0.2s",
    },
  };
  console.log(`Growth score: ${growthScore}`)

  return (
    <>
      <Box sx={cardStyle}>
        <Box sx={flexStyle}>
          <Box sx={boxStyle}>


            <Box>
              <Box sx={{ marginBottom: "20px" }}>
                <Box sx={{ ...linkStyle, ...hoverStyle }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      flexDirection: "column",
                      width: "100%",
                    }}
                  >
                    <h4>Growth Score</h4>
                    {/* Replace with an appropriate arrow icon */}
                    <span
                      style={{
                        fontSize: "0.8em",
                        color: ratingColor(growthScore ?? "#43A047"),
                      }}
                    >
                      {growthScore}
                    </span>
                  </Box>
                </Box>
              </Box>

              {/* Additional content goes here */}
            </Box>
          </Box>

          {loading
            ? (
              <>
                Loading...</>
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
                <Box
                  sx={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    cursor: "pointer",
                    color: "blue.500",
                    ...hoverStyle,
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    window.open(
                      "https://documentation.xerberus.io/xerberus-app/token-explorer/growth-thermometer",
                      "_blank"
                    );
                  }}
                >
                  {/* Replace with an appropriate info icon */}
                </Box>
                {/* ThermometerGraph component */}
                <ThermometerGraph data={growthScore} />
              </Box>
            )}
        </Box>
        <Tagline />
      </Box >
    </>
  );
};

export default GrowthCard;
