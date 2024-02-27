import { IconButton } from "@mui/material";
import React, { FC } from "react";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface InfoButtonProps {
  link: string;
}

const InfoButton: FC<InfoButtonProps> = ({ link }) => {
  return (
    <IconButton
      sx={{
        position: "absolute",
        top: '10px',
        right: '10px',
        zIndex: 2,
        transition: "transform 0.2s",
        ":hover": {
          transform: "scale(1.2)"
        }
      }}
      onClick={(event) => {
        event.stopPropagation();
        window.open(
          link,
          "_blank"
        );
      }}
    >
      <InfoOutlinedIcon />
    </IconButton>
  );
};

export default InfoButton;
