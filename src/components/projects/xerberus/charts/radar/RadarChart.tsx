import React, { useRef, useEffect, FC, useState } from "react";
import * as d3 from "d3";
import { RadarChartDataScores } from "@server/services/xerberusApi";
import { Box, useTheme } from "@mui/material";
import { ensureHexColor } from "@lib/utils/general";

const convertData = (data: RadarChartDataScores) => {
  const dataArray = [data.priceScore, data.networkScore, data.liquidityScore]

  const conversionRule = {
    AAA: 10,
    AA: 9,
    A: 8,
    BBB: 7,
    BB: 6,
    B: 5,
    CCC: 4,
    CC: 3,
    C: 2,
    D: 1,
  };

  return dataArray.map((item) => conversionRule[item]);
};

interface RararChartProps {
  rawData: RadarChartDataScores;
  labels: string[];
  color: string;
}

const RadarChart: FC<RararChartProps> = ({ rawData, labels, color }) => {
  const theme = useTheme()
  const svgRef = useRef<SVGSVGElement>(null);
  const boxRef = useRef<HTMLDivElement>(null)
  const radarColor = color;
  const textColor = theme.palette.text.primary;
  const margin = { top: 60, right: 60, bottom: 0, left: 60 };
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(350);

  const data = convertData(rawData);

  useEffect(() => {
    // Clear the previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    // let width = 400 - margin.left - margin.right;
    // let height = 350 - margin.top - margin.bottom;

    const updateDimensions = () => {
      if (boxRef.current) {
        const maxWidth = 400;
        const newWidth = Math.min(boxRef.current.clientWidth, maxWidth) - margin.left - margin.right;
        setWidth(newWidth);
        setHeight(newWidth);
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions()

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const maxValue = 10;
    const levels = 10;
    const angleSlice = (Math.PI * 2) / data.length;

    const rScale = d3
      .scaleLinear()
      .range([0, width / 2])
      .domain([0, maxValue]);

    for (let j = 0; j < levels; j++) {
      const levelFactor = (maxValue * (j + 1)) / levels;
      const values = data.map((_d) => levelFactor);
      const levelPath = d3
        .line()
        .x((d, i) => rScale(d as unknown as number) * Math.cos(angleSlice * i - Math.PI / 2))
        .y((d, i) => rScale(d as unknown as number) * Math.sin(angleSlice * i - Math.PI / 2));

      const levelPathData = levelPath(values as any[]);

      svg
        .append("path")
        .datum(values)
        .attr("class", "radarArea")
        .attr("d", levelPathData)
        .attr("stroke", "#CDCDCD")
        .attr("fill", "none")
        .attr("transform", `translate(${width / 2},${height / 2})`);

      // Create the radar strokes that link the outer levels (C to A, B to C, etc.)
      data.forEach((_d: any, i: number) => {
        const x0 = rScale(levelFactor) * Math.cos(angleSlice * i - Math.PI / 2);
        const y0 = rScale(levelFactor) * Math.sin(angleSlice * i - Math.PI / 2);

        const x1 =
          rScale(levelFactor) * Math.cos(angleSlice * (i + 1) - Math.PI / 2);
        const y1 =
          rScale(levelFactor) * Math.sin(angleSlice * (i + 1) - Math.PI / 2);

        svg
          .append("line")
          .attr("x1", x0 + width / 2)
          .attr("y1", y0 + height / 2)
          .attr("x2", x1 + width / 2)
          .attr("y2", y1 + height / 2)
          .attr("class", "radarStroke")
          .attr("stroke", theme.palette.mode === "dark" ? "#333333" : "#cccccc");
      });
    }
    // Create the radar chart line (data shape)
    const radarLine = d3
      .line()
      .x((d, i) => rScale(d as unknown as number) * Math.cos(angleSlice * i - Math.PI / 2))
      .y((d, i) => rScale(d as unknown as number) * Math.sin(angleSlice * i - Math.PI / 2));

    const radarLineData = radarLine(data as any[]);

    svg
      .append("path")
      .datum(data)
      .attr("class", "radarChart")
      .attr("d", radarLineData)
      .attr("stroke-width", 2)
      .attr("stroke", color)
      .attr("fill", color)
      .attr("opacity", "0.3")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Draw a line from the last point (C) to the first point (A)
    svg
      .append("line")
      .attr(
        "x1",
        rScale(data[0]) * Math.cos(angleSlice * 0 - Math.PI / 2) + width / 2
      )
      .attr(
        "y1",
        rScale(data[0]) * Math.sin(angleSlice * 0 - Math.PI / 2) + height / 2
      )
      .attr(
        "x2",
        rScale(data[data.length - 1]) *
        Math.cos(angleSlice * (data.length - 1) - Math.PI / 2) +
        width / 2
      )
      .attr(
        "y2",
        rScale(data[data.length - 1]) *
        Math.sin(angleSlice * (data.length - 1) - Math.PI / 2) +
        height / 2
      )
      .attr("class", "radarStroke")
      .attr("stroke-width", 2)
      .attr("stroke", color);

    svg
      .append("line")
      .attr(
        "x1",
        rScale(data[1]) * Math.cos(angleSlice * 1 - Math.PI / 2) + width / 2
      )
      .attr(
        "y1",
        rScale(data[1]) * Math.sin(angleSlice * 1 - Math.PI / 2) + height / 2
      )
      .attr(
        "x2",
        rScale(data[data.length - 1]) *
        Math.cos(angleSlice * (data.length - 1) - Math.PI / 2) +
        width / 2
      )
      .attr(
        "y2",
        rScale(data[data.length - 1]) *
        Math.sin(angleSlice * (data.length - 1) - Math.PI / 2) +
        height / 2
      )
      .attr("class", "radarStroke")
      .attr("stroke-width", 2)
      .attr("stroke", color);

    // Create a line from point A to point B
    const xA =
      rScale(data[0]) * Math.cos(angleSlice * 0 - Math.PI / 2) + width / 2;
    const yA =
      rScale(data[0]) * Math.sin(angleSlice * 0 - Math.PI / 2) + height / 2;
    const xB =
      rScale(data[1]) * Math.cos(angleSlice * 1 - Math.PI / 2) + width / 2;
    const yB =
      rScale(data[1]) * Math.sin(angleSlice * 1 - Math.PI / 2) + height / 2;

    svg
      .append("line")
      .attr("x1", xA)
      .attr("y1", yA)
      .attr("x2", xB)
      .attr("y2", yB)
      .attr("class", "radarStroke")
      .attr("stroke-width", 2)
      .attr("stroke", color);

    // Create the radar chart axes (lines)
    data.forEach((_d: any, i: number) => {
      const labelPadding = 0; // Adjust the padding value as needed
      const x =
        rScale(maxValue * 1.1 + labelPadding) *
        Math.cos(angleSlice * i - Math.PI / 2);
      const y =
        rScale(maxValue * 1.1 + labelPadding) *
        Math.sin(angleSlice * i - Math.PI / 2);

      svg
        .append("line")
        .attr("x1", width / 2)
        .attr("y1", height / 2)
        .attr("x2", x + width / 2)
        .attr("y2", y + height / 2)
        .attr("class", "radarStroke")
        .attr("stroke", "gray")
        .attr("stroke-dasharray", "2,2");
    });

    // Translate labels to move them away from the axis
    data.forEach((_d: any, i: number) => {
      const labelPadding = 1.5; // Adjust the padding value as needed
      const x =
        rScale(maxValue * 1.1 + labelPadding) *
        Math.cos(angleSlice * i - Math.PI / 2);
      const y =
        rScale(maxValue * 1.1 + labelPadding) *
        Math.sin(angleSlice * i - Math.PI / 2);

      // Apply separate translations for each label
      let labelX = x + width / 2;
      let labelY = y + height / 1.85;

      if (labels[i] === "A") {
        // Adjust the Y and X position for label A independently
        labelY -= 50; // Adjust the Y position for label A
        labelX += 10; // Adjust the X position for label A
      } else if (labels[i] === "B") {
        // Adjust the Y and X position for label B independently
        labelY += 20; // Adjust the Y position for label B
        labelX += 20; // Adjust the X position for label B
      } else if (labels[i] === "C") {
        // Adjust the Y and X position for label C independently
        labelY += 30; // Adjust the Y position for label C
        labelX += 30; // Adjust the X position for label C
      }

      svg
        .append("text")
        .attr("x", labelX)
        .attr("y", labelY)
        .attr("text-anchor", "middle")
        .attr("fill", textColor)
        .text(labels[i]);

      //Calculate the position for labels

      // const Dy = -13;
      // const CCCy = -55;
      // const BBBy = -97;
      // const AAAy = -139.5;

      const baseHeight = 350 - margin.top - margin.bottom;
      const scaleFactor = height / baseHeight;

      const basePositions = {
        D: -13,
        CCC: -55,
        BBB: -100,
        AAA: -145
      };

      // Scale positions based on the current height
      const Dy = basePositions.D * scaleFactor;
      const CCCy = basePositions.CCC * scaleFactor;
      const BBBy = basePositions.BBB * scaleFactor;
      const AAAy = basePositions.AAA * scaleFactor;

      // Add label "D" to the center of the radar chart
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", Dy + height / 2)
        .attr("alignment-baseline", "middle")
        .attr("fill", "#E53935")
        .attr("font-size", 12) // Adjust the font size as needed
        .text("- - - - - - - - - - D");

      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", CCCy + height / 2)
        .attr("alignment-baseline", "middle")
        .attr("fill", "#FFA726")
        .attr("font-size", 12) // Adjust the font size as needed
        .text("- - - - - - - - - - CCC");

      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", BBBy + height / 2)
        .attr("alignment-baseline", "middle")
        .attr("fill", "#E6C700")
        .attr("font-size", 12) // Adjust the font size as needed
        .text("- - - - - - - - - - BBB");

      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", AAAy + height / 2)
        .attr("alignment-baseline", "middle")
        .attr("fill", "#43A047")
        .attr("font-size", 12) // Adjust the font size as needed
        .text("- - - - - - - - - - AAA");
    });

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [data, labels, color, radarColor, textColor, theme]);

  return <Box
    sx={{
      width: "100%",
      overflow: "hidden",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: '100%'
    }}
    ref={boxRef}
  >
    <svg ref={svgRef}></svg>
  </Box>;
};

export default RadarChart;