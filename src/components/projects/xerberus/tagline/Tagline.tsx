// Mandatory Component that has to be shown

import { Box, Button, Divider, Link, Typography, useTheme } from "@mui/material";
import React, { FC } from "react";

interface TagProps {
  link?: string;
}

const Tagline: FC<TagProps> = ({ link }) => {
  const logoStyle = {
    width: "25px",
    height: "auto",
    marginRight: "10px",
  };

  return (
    <Box>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: link ? 'space-between' : 'center'
      }}>

        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <img
            src={"/xerberus/white_logo.png"}
            style={logoStyle}
            alt="Xerberus logo"
          />
          <Typography component="span" sx={{ fontSize: '14px!important' }}>Risk Ratings By <Link href="https://xerberus.io" target="_blank">Xerberus.io</Link></Typography>
        </Box>
        <Box>
          {link && (
            <Button
              variant="outlined"
              color="primary"
              onClick={(event) => {
                event.stopPropagation();
                window.open(
                  link,
                  "_blank"
                );
              }}
            >
              More details
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Tagline;
