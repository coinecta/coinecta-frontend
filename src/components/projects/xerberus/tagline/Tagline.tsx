// Mandatory Component that has to be shown

import { Box } from "@mui/material";
import React, { FC } from "react";

interface TaglineProps {

}

const Tagline: FC<TaglineProps> = () => {
  const logoContainerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center", // Center the contents horizontally
    position: "absolute",
    bottom: "10px", // Position the container at the bottom
    left: "50%", // Center the container horizontally
    transform: "translateX(-50%)", // Adjust for perfect horizontal centering
    width: "100%", // Ensuring the container spans the entire width
    marginTop: "10px",
  };

  // Style for the separating line
  const lineStyle = {
    height: "1px",
    backgroundColor: "#ddd", // Line color, adjust as needed
    width: "90%", // Width of the line, adjust as per design
    margin: "0 auto 10px", // Margin to separate from content above
  };

  // Style for the logo
  const logoStyle = {
    width: "25px", // Adjust this as needed
    height: "auto",
    marginRight: "10px", // Space between logo and text
  };

  // Style for the tagline text
  const taglineStyle = {
    fontSize: "14px", // Match the size with logo
    color: "#333", // Adjust color as needed
  };

  return (
    <>
      <Box sx={logoContainerStyle}>
        <img
          src={"/xerberus/white_logo.png"}
          style={logoStyle}
          alt="Xerberus logo"
        />
        <span style={taglineStyle}>Risk Ratings By Xerberus.io</span>
      </Box>
    </>
  );
};

export default Tagline;
