import React, { FC, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import ratingColor from "@lib/utils/ratingColor";
import styles from "@styles/xerberus/chart.module.css"
import { Box, Typography, useTheme } from "@mui/material";
import { HistoryCardDetails, HistoryDataEntry } from "@server/services/xerberusApi";

interface HistoryGraphProps {
  data: HistoryDataEntry[];
  details?: HistoryCardDetails;
  ticks: number; // assuming ticks is a number
}

const customOrder = ["AAA", "AA", "A", "BBB", "BB", "B", "CCC", "CC", "C", "D"];

const HistoryGraph: FC<HistoryGraphProps> = ({ data, details, ticks }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef(null);
  const theme = useTheme()

  useEffect(() => {
    const color = theme.palette.text.primary;

    const svg = d3.select(svgRef.current);
    const margin = { top: 30, right: 30, bottom: 30, left: 60 };

    const drawChart = () => {
      const svgNode = svg.node()
      if (svgNode && data && data.length > 0) {
        const container = svgNode.parentNode as HTMLElement;
        const width = container.clientWidth;
        const height = 400 - margin.top;
        const word = details?.title.split(" ");
        // @ts-ignore
        const tooltipWord = word[0];

        // X scale
        const x = d3
          .scaleBand()
          .domain(data.map((d) => d.date))
          .range([margin.left, width - margin.right])
          .padding(0.1);

        // Y scale (reversed)
        const y = d3
          .scalePoint()
          .domain(customOrder)
          .range([margin.top, height - margin.bottom]); // Non-reversed range

        // Line generator for graph
        // @ts-ignore
        const line = d3
          .line()
          // @ts-ignore
          .x((d) => x(d.date) + x.bandwidth() / 2)
          // @ts-ignore
          .y((d) => y(d.line1))
          // .curve(d3.curveStepAfter); // Use stepAfter curve for step graph
          .curve(d3.curveMonotoneX); // Smoothing curve

        // @ts-ignore
        const secondaryLine = d3
          .line()
          // @ts-ignore
          .x((d) => x(d.date) + x.bandwidth() / 2)
          // @ts-ignore
          .y((d) => y(d.line2))
          .curve(d3.curveMonotoneX); // Smoothing curve

        // Remove existing chart elements
        svg.selectAll(".axis").remove();
        svg.selectAll(".line").remove();
        svg.selectAll(".dot").remove();
        svg.selectAll("*").remove();

        // Calculate the step size for the x-axis labels
        const stepSize = Math.max(1, Math.ceil(data.length / ticks));

        // Draw X and Y axes
        svg
          .append("g")
          .attr("class", "axis")
          .attr("transform", `translate(0,${height - margin.bottom})`)
          .call(
            d3
              .axisBottom(x)
              .tickValues(
                // @ts-ignore
                data
                  .map((d, i) => (i % stepSize === 0 ? d.date : null))
                  .filter((d) => d !== null)
              )
              .tickSizeOuter(0)
          ); // Custom tick format to show only 1 month every 6 months

        svg
          .append("g")
          .attr("class", "axis")
          .attr("transform", `translate(${margin.left},0)`)
          .call(d3.axisLeft(y));

        // Draw the step graph for "value" data
        svg
          .append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("class", "line") // Add class attribute for CSS styling
          .attr("stroke", color)
          .attr("stroke-width", 1)
          // @ts-ignore
          .attr("d", line);

        // Draw the line with smoothened curve for "ma" data
        svg
          .append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("class", "line") // Add class attribute for CSS styling
          .attr("stroke", "red")
          .attr("stroke-width", 1)
          // @ts-ignore
          .attr("d", secondaryLine);

        // Draw the dashed line initially hidden
        const dashedLine = svg
          .append("line")
          .attr("class", "dashed-line")
          .attr("stroke", "gray")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "3,3")
          .style("opacity", 0); // Initially hidden

        // Create a group for the dots and append it after the line's group
        const dotsGroup = svg.append("g");

        // Draw dots at data points with custom colors and create overlay rectangles
        const dots = dotsGroup
          .selectAll(".dot")
          .data(data)
          .enter()
          .append("circle")
          .attr("class", "dot")
          // @ts-ignore
          .attr("cx", (d) => x(d.date) + x.bandwidth() / 2)
          // @ts-ignore
          .attr("cy", (d) => y(d.line1))
          .attr("r", 6)
          .attr("fill", (d) => ratingColor(d.line1))
          .style("fill", (d) => ratingColor(d.line1))
          .style("stroke", (d) => color); // Apply custom colors directly

        if (tooltipRef.current) {
          // Update the overlay rectangle height and y position to cover the full vertical space
          dotsGroup.selectAll(".dot-overlay")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "dot-overlay")
            // @ts-ignore
            .attr("x", d => x(d.date))
            .attr("y", margin.top)
            .attr("width", x.bandwidth())
            .attr("height", height - margin.top - margin.bottom)
            .attr("opacity", 0)
            .on("mouseover", (event, d) => {
              d3.select(tooltipRef.current)
                .style("opacity", 0.9)
                .html(
                  `${tooltipWord} Score: ${d.line1}<br/><span class=${styles.matext}>Moving Avg: ${d.line2}</span><br/><br/>${d.date}`
                );

              // Get the actual width of the tooltip after rendering content
              // @ts-ignore
              const tooltipWidth = d3.select(tooltipRef.current).node().getBoundingClientRect().width;
              // @ts-ignore
              const svgWidth = d3.select(svgRef.current).node().getBoundingClientRect().width;
              // @ts-ignore
              const xPosition = x(d.date) + x.bandwidth() / 2; // x-coordinate of the dot
              const yPosition = y(d.line1); // y-coordinate of the dot
              const offset = 12; // Offset to prevent the tooltip from overlapping the dot

              // Calculate the position of the tooltip
              let tooltipX = xPosition + offset;
              if (xPosition + tooltipWidth + offset > svgWidth) {
                // If the tooltip overflows the SVG boundary, position it to the left of the dot
                tooltipX = xPosition - tooltipWidth - offset;
              }

              // Apply the calculated position
              d3.select(tooltipRef.current)
                .style("left", tooltipX + "px")
                // @ts-ignore
                .style("top", (yPosition + offset) + "px");

              // Other mouseover actions like showing the dashed line
              dashedLine
                // @ts-ignore
                .attr("x1", x(d.date) + x.bandwidth() / 2)
                // @ts-ignore
                .attr("y1", y(d.line1))
                // @ts-ignore
                .attr("x2", x(d.date) + x.bandwidth() / 2)
                .attr("y2", height - margin.bottom)
                .style("opacity", 1);
            })
            .on("mouseout", () => {
              // Hide the tooltip when mouseout
              d3.select(tooltipRef.current)
                .style("opacity", 0);

              // Other mouseout actions like hiding the dashed line
              dashedLine.style("opacity", 0);
            });
        }

        // Rotate the y-axis title
        svg
          .append("g")
          .append("text")
          .attr("transform", "rotate(-90)") // Rotate text 90 degrees counterclockwise
          .attr("x", -height / 2) // Adjust the position if needed
          .attr("y", margin.left - 40) // Adjust the position if needed
          .style("text-anchor", "middle")
          .style("font-size", "14px")
          .style("fill", color)
          // @ts-ignore
          .text(details.y_axis);

        svg
          .append("text")
          .attr("text-anchor", "middle")
          .style("font-size", "14px")
          .style("fill", color)
          .attr("x", width / 2)
          .attr("y", height + margin.top - 15)
          // @ts-ignore
          .text(details.x_axis); // Use details.x_axis for the title text

      }
    };

    drawChart();

    // Update chart on window resize
    const resizeListener = () => {
      drawChart();
    };
    window.addEventListener("resize", resizeListener);

    return () => {
      // tooltipRef.current.remove();
      window.removeEventListener("resize", resizeListener);
    };
  }, [data, details, theme]);

  return (
    <Box>
      <Typography variant="h6" sx={{ textAlign: 'center' }}>
        {details?.title}
      </Typography>
      <Box sx={{ display: 'block', position: 'relative', mb: 2 }}>
        <svg ref={svgRef} width="100%" height="400"></svg>
        <div ref={tooltipRef} className="tooltip" style={{
          opacity: 0,
          position: "absolute",
          pointerEvents: "none",
          backgroundColor: theme.palette.background.paper,
          padding: "10px",
          border: `1px solid ${theme.palette.divider}`,
          zIndex: 1000
        }}></div>
      </Box>
      <Box>
        {details?.description && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ mb: 1 }}>
              {details.title}
              <span className="badge" style={{ color: ratingColor(details.rating), marginLeft: '10px' }}>
                {details.rating}
              </span>
            </Typography>
            <Typography>{details.description}</Typography>
          </Box>
        )}
        {/* {details?.name1 && (
          <div className="legend-box">
            <div className="legend-item">
              <span className={styles.whiteLine}></span>
              <p>{details.name1}</p>
            </div>
            {details.name2 && (
              <div className="legend-item">
                <span className={styles.redLine}></span>
                <p>{details.name2}</p>
              </div>
            )}
          </div>
        )} */}
      </Box>
    </Box>
  );

};

export default HistoryGraph;