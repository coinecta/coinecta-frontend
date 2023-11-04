import React, { FC } from "react";
import SvgIcon from "@mui/material/SvgIcon";
import { SxProps } from "@mui/material";

const DiamondIcon: FC<{ sx?: SxProps }> = ({ sx }) => {
  return (
    <SvgIcon sx={sx} viewBox="0 0 25 22">
        <path d="M12.9601 0H12.5609L9.28027 6.54886H16.2408L12.9601 0Z" />
        <path d="M18.3239 6.54886H24.7604L21.4923 0H15.0557L18.3239 6.54886Z" />
        <path d="M24.4604 8.41992H13.6953V21.3305L24.4604 8.41992Z" />
        <path d="M11.8246 21.3305V8.41992H1.05957L11.8246 21.3305Z" />
        <path d="M7.19636 6.54886L10.4645 0H4.02796L0.759766 6.54886H7.19636Z" />
    </SvgIcon>
  );
};

export default DiamondIcon;
