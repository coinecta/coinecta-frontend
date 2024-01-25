import React, { FC, useEffect, useState } from "react";
import ratingColor from "@lib/utils/ratingColor";
import Tagline from "@components/projects/xerberus/tagline/Tagline";
import RadarChart from "./RadarChart";
import { Box } from "@mui/material";
import { RadarChartDataScores } from "@server/services/xerberusApi";

interface RadarCardProps {
  token: string;
  scores?: RadarChartDataScores;
  loading: boolean;
}

const RadarCard: FC<RadarCardProps> = ({ token, scores, loading }) => {
  const defaultScores: RadarChartDataScores = {
    overallRiskScore: "AAA",
    priceScore: "AAA",
    liquidityScore: "AAA",
    networkScore: "AAA",
  };

  const [radarScores, setRadarScores] = useState(defaultScores)

  useEffect(() => {
    if (scores) setRadarScores(scores)
  }, [scores])

  const cardStyle = {
    backgroundColor: "white",
    border: "1px solid black",
    borderRadius: "10px",
    color: "black",
    width: "100%",
    margin: "auto",
    position: "relative",
    padding: "20px",
  };

  const contentStyle = {
    display: "flex",
    flexDirection: "row",
    alignItems: "start",
    justifyContent: "space-between",
  };

  const riskStyle = {
    marginBottom: "5px",
    width: "100%",
  };

  const scoreStyle = {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    width: "100%",
  };

  const scoreTextStyle = {
    margin: "5px",
    fontSize: "1.2em",
  };

  const radarStyle = {
    width: "100%",
    display: "flex",
    justifyContent: "start",
    alignItems: "center",
  };

  const scoreSectionStyle = {
    marginBottom: "10px", // Space between each risk section
  };

  const riskLabelStyle = {
    fontWeight: "bold", // Makes the label stand out
    fontSize: "1em", // Adjust the font size as needed
  };

  const riskScoreStyle = {
    fontSize: "1.2em", // Slightly larger font size for the score
    color: "inherit", // Inherits color from parent, can be overridden
  };

  const formatLabel = (key: string) => {
    switch (key) {
      case 'priceScore':
        return 'Price';
      case 'liquidityScore':
        return 'Liquidity';
      case 'networkScore':
        return 'Network';
      default:
        return '';
    }
  };

  return (
    <>
      {/* The API provides a link for this purpose. Insert the relevant variable from the API at this location */}
      <Box sx={cardStyle}>
        <Box sx={contentStyle}>
          <Box style={{ width: "40%" }}>
            <Box style={riskStyle}>
              <h3>
                Risk Rating:{" "}
                <span
                  style={{
                    ...scoreTextStyle,
                    color: ratingColor(radarScores.overallRiskScore),
                  }}
                >
                  {!loading ? radarScores.overallRiskScore : 'Loading...'}
                </span>
              </h3>
            </Box>

            {Object.entries(radarScores).map(([key, value]) => (
              key !== 'overallRiskScore' &&
              <Box style={scoreSectionStyle} key={key}>
                <Box style={{ ...riskLabelStyle }}>{formatLabel(key)}</Box>
                <span
                  style={{
                    ...riskScoreStyle,
                    color: ratingColor(value),
                  }}
                >
                  {!loading ? value : 'Loading...'}
                </span>
              </Box>
            ))}
          </Box>
          {loading
            ? (
              <>
                Loading...
              </>
            )
            : (
              <Box style={radarStyle}>
                {scores &&
                  <RadarChart
                    rawData={scores}
                    labels={["Price", "Network", "Liquidity"]}
                    color={ratingColor(radarScores.overallRiskScore)}
                  />}
              </Box>
            )}
        </Box>
        <hr />
        <br />
        <Tagline />
      </Box>
    </>
  );
};

export default RadarCard;
