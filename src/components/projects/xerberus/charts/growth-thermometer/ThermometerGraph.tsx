import React, { FC, useEffect } from "react";
import * as d3 from "d3";
import { useTheme } from "@mui/material";

const getMercuryColor = (temp: number) => {
  if (temp >= 8) {
    return "#43A047";
  } else if (temp >= 5 && temp <= 7) {
    return "#E6C700";
  } else if (temp >= 2 && temp <= 4) {
    return "#FFA726";
  } else if (temp <= 1) {
    return "#E53935";
  }
};
function calculateGrowthScore(data: string) {
  switch (data) {
    case "Negative":
      return 1;
    case "Extremely Low":
      return 2;
    case "Low-":
      return 3;
    case "Low":
      return 4;
    case "Moderate-":
      return 5;
    case "Moderate":
      return 6;
    case "Moderate+":
      return 7;
    case "High":
      return 8;
    case "High+":
      return 9;
    case "Extremely High":
      return 10;
    default:
      return 0; // Return 0 or any other value for invalid data
  }
}

interface ThermometerGraphProps {
  data?: string;
}

const ThermometerGraph: FC<ThermometerGraphProps> = ({ data }) => {
  const theme = useTheme()
  useEffect(() => {
    const thermometerColor = theme.palette.mode === "dark" ? theme.palette.background.paper : "#FFFFFF"
    const max = 9,
      min = 1,
      width = 200,
      height = 280,
      growthScore = calculateGrowthScore(data ?? "Negative");
    // growthScore = Math.floor(Math.random() * 9) + 1;

    const bottomY = height - 5,
      topY = 5,
      bulbRadius = 20,
      tubeWidth = 21.5,
      tubeBorderWidth = 1,
      mercuryColor = getMercuryColor(growthScore),
      innerBulbColor = "rgb(230, 200, 200)",
      tubeBorderColor = "#999999";

    const bulb_cy = bottomY - bulbRadius,
      bulb_cx = width / 2,
      top_cy = topY + tubeWidth / 2;

    const svg = d3
      .select("#thermo")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    var defs = svg.append("defs");

    // Define the radial gradient for the bulb fill color
    var bulbGradient = defs
      .append("radialGradient")
      .attr("id", "bulbGradient")
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%")
      .attr("fx", "50%")
      .attr("fy", "50%");

    bulbGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", innerBulbColor);

    bulbGradient
      .append("stop")
      .attr("offset", "90%")
      .attr("stop-color", mercuryColor ?? '#E53935');

    // Circle element for rounded tube top
    svg
      .append("circle")
      .attr("r", tubeWidth / 2)
      .attr("cx", width / 2)
      .attr("cy", top_cy)
      .style("fill", thermometerColor)
      .style("stroke", tubeBorderColor)
      .style("stroke-width", tubeBorderWidth + "px");

    // Rect element for tube
    svg
      .append("rect")
      .attr("x", width / 2 - tubeWidth / 2)
      .attr("y", top_cy)
      .attr("height", bulb_cy - top_cy)
      .attr("width", tubeWidth)
      .style("shape-rendering", "crispEdges")
      .style("fill", thermometerColor)
      .style("stroke", tubeBorderColor)
      .style("stroke-width", tubeBorderWidth + "px");

    // White fill for rounded tube top circle element
    // to hide the border at the top of the tube rect element
    svg
      .append("circle")
      .attr("r", tubeWidth / 2 - tubeBorderWidth / 2)
      .attr("cx", width / 2)
      .attr("cy", top_cy)
      .style("fill", thermometerColor)
      .style("stroke", "none");

    // Main bulb of thermometer (empty), white fill
    svg
      .append("circle")
      .attr("r", bulbRadius)
      .attr("cx", bulb_cx)
      .attr("cy", bulb_cy)
      .style("fill", thermometerColor)
      .style("stroke", tubeBorderColor)
      .style("stroke-width", tubeBorderWidth + "px");

    // Rect element for tube fill color
    svg
      .append("rect")
      .attr("x", width / 2 - (tubeWidth - tubeBorderWidth) / 2)
      .attr("y", top_cy)
      .attr("height", bulb_cy - top_cy)
      .attr("width", tubeWidth - tubeBorderWidth)
      .style("shape-rendering", "crispEdges")
      .style("fill", thermometerColor)
      .style("stroke", "none");

    // Scale step size
    var step = 1;

    // Determine a suitable range of the temperature scale
    var domain = [step * Math.floor(min / step), step * Math.ceil(max / step)];

    if (min - domain[0] < 0.66 * step) domain[0] -= step;

    if (domain[1] - max < 0.66 * step) domain[1] += step;

    // Define your custom tick values and their corresponding labels
    var customTickValues = [
      { value: domain[0] + 1, label: "Negative", color: "#E53935" },
      // { value: domain[0] + 2, label: "C" },
      { value: domain[0] + 2, label: "Extremely Low", color: "#FFA726" },
      { value: domain[0] + 3, label: "Low -", color: "#FFA726" },
      { value: domain[0] + 4, label: "Low", color: "#FFA726" },
      // { value: domain[0] + 3, label: "CCC" },
      // { value: domain[0] + 5, label: "B" },
      { value: domain[0] + 5, label: "Moderate -", color: "#E6C700" },
      { value: domain[0] + 6, label: "Moderate", color: "#E6C700" },
      { value: domain[0] + 7, label: "Moderate +", color: "#E6C700" },
      // { value: domain[0] + 6, label: "BBB" },
      // { value: domain[0] + 8, label: "A" },
      { value: domain[0] + 8, label: "High", color: "#43A047" },
      { value: domain[0] + 9, label: "High +", color: "#43A047" },
      { value: domain[0] + 10, label: "Extremely High", color: "#43A047" },
      // { value: domain[0] + 9, label: "AAA" },
    ];

    // D3 scale object
    const scale = d3
      .scaleLinear()
      .range([bulb_cy - bulbRadius / 2 - 8.5, top_cy])
      .domain(domain);

    // Max and min temperature lines
    [min, max].forEach(function (t) {
      var isMax = t == max,
        label = isMax ? "max" : "min",
        textCol = isMax ? "#43A047" : "#FFA726",
        textOffset = isMax ? -4 : 4;
      var yPos = isMax ? scale(t + 1) : scale(t + 1); // Adjust the vertical position

      svg
        .append("line")
        .attr("id", label + "Line")
        .attr("x1", width / 2 - tubeWidth / 2)
        .attr("x2", width / 2 + tubeWidth / 2 + 22)
        .attr("y1", yPos)
        .attr("y2", yPos)
        .style("stroke", tubeBorderColor)
        .style("stroke-width", "1px")
        .style("shape-rendering", "crispEdges");

      svg
        .append("text")
        .attr("x", width / 2 + tubeWidth / 2 + 2)
        .attr("y", yPos + textOffset)
        .attr("dy", isMax ? null : "0.75em")
        .text(label)
        .style("fill", textCol)
        .style("font-size", "11px");
    });

    var tubeFill_bottom = bulb_cy,
      tubeFill_top = scale(growthScore);

    // Rect element for the red mercury column
    svg
      .append("rect")
      .attr("x", width / 2 - (tubeWidth - 10) / 2)
      .attr("y", tubeFill_top)
      .attr("width", tubeWidth - 10)
      .attr("height", tubeFill_bottom - tubeFill_top)
      .style("shape-rendering", "crispEdges")
      .style("fill", mercuryColor ?? '#E53935');

    // Main thermometer bulb fill
    svg
      .append("circle")
      .attr("r", bulbRadius - 6)
      .attr("cx", bulb_cx)
      .attr("cy", bulb_cy)
      .style("fill", "url(#bulbGradient)")
      .style("stroke", mercuryColor ?? '#E53935')
      .style("stroke-width", "2px");

    var axis = d3
      .axisLeft(scale)
      .tickSizeInner(7)
      .tickSizeOuter(0)
      .tickValues(customTickValues.map((d) => d.value))
      .tickFormat((value) => {
        const customTick = customTickValues.find((d) => d.value === value);
        return customTick ? customTick.label : "";
      });

    // Add the axis to the image
    var svgAxis = svg
      .append("g")
      .attr("id", "tempScale")
      .attr("transform", "translate(" + (width / 2 - tubeWidth / 2) + ",0)")
      .call(axis);

    // Format text labels
    svgAxis
      .selectAll(".tick text")
      .style("fill", (value) => {
        const customTick = customTickValues.find((d) => d.value === value);
        return customTick ? customTick.color : "#777777";
      })
      .style("font-size", "10px");

    // Set main axis line to no stroke or fill
    svgAxis.select("path").style("stroke", "none").style("fill", "none");

    // Set the style of the ticks
    svgAxis
      .selectAll(".tick line")
      .style("stroke", tubeBorderColor)
      .style("shape-rendering", "crispEdges")
      .style("stroke-width", "1px");

    return () => {
      svg.remove();
    };
  }, [data, theme]);

  return (
    <div style={{ marginLeft: "20px" }}>
      <div id="thermo"></div>
    </div>
  );
};

export default ThermometerGraph;