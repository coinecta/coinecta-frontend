import React, { FC, useEffect, useState } from "react";
import ratingColor from "@lib/utils/ratingColor";
import Tagline from "@components/projects/xerberus/tagline/Tagline";
import RadarChart from "./RadarChart";
import { Box, Paper, Typography } from "@mui/material";
import { RadarChartDataScores } from "@server/services/xerberusApi";
import InfoButton from "@components/projects/xerberus/InfoButton";


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

  const riskStyle = {
    marginBottom: "5px",
    width: "100%",
  };

  const scoreTextStyle = {
    margin: "5px",
    fontSize: "1.2em",
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
      <Paper variant="outlined" sx={{
        position: "relative",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: '100%'
      }}>
        <InfoButton link="https://documentation.xerberus.io/xerberus-app/token-explorer/risk-rating-triangle" />
        <Box sx={{
          display: "flex",
          flexDirection: { xs: 'column', sm: "row" },
          alignItems: 'flex-start',
        }}>
          <Box sx={{ width: { xs: '100%', sm: '40%' } }}>
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
            <Box sx={{
              display: 'flex',
              width: '100%',
              flexDirection: { xs: 'row', sm: 'column' },
              justifyContent: 'space-around'
            }}>
              {Object.entries(radarScores).map(([key, value]) => (
                key !== 'overallRiskScore' &&
                <Box key={key}>
                  <Typography sx={{ ...riskLabelStyle }}>{formatLabel(key)}</Typography>
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
            : scores &&
            <RadarChart
              rawData={scores}
              labels={["Price", "Network", "Liquidity"]}
              color={ratingColor(radarScores.overallRiskScore)}
            />
          }
        </Box>
        <Tagline link={`https://app.xerberus.io/token/explorer?token=${token}`} />
      </Paper>
    </>
  );
};

export default RadarCard;
