import { useTheme, SxProps, Theme, useMediaQuery, LinearProgress, linearProgressClasses, LinearProgressProps } from "@mui/material";
import { FC, ReactNode } from "react";

interface StyledLinearProgressProps extends LinearProgressProps {
  barColor?: string;
  barColorStart?: string;
  barColorEnd?: string;
  bgColor?: string;
  sx?: SxProps<Theme>;
}

export const LinearProgressStyled: FC<StyledLinearProgressProps> = ({ sx, barColor, barColorStart, barColorEnd, bgColor, ...props }) => {
  const theme = useTheme();

  const mergeSx = (defaultSx: SxProps<Theme>, newSx?: SxProps<Theme>) => {
    if (!newSx) return defaultSx;
    return (theme: Theme) => ({
      ...typeof defaultSx === 'function' ? defaultSx(theme) : defaultSx,
      ...typeof newSx === 'function' ? newSx(theme) : newSx,
    });
  };

  return (
    <LinearProgress
      sx={mergeSx({
        height: 10,
        borderRadius: 5,
        border: `1px solid ${theme.palette.divider}`,
        [`&.${linearProgressClasses.colorPrimary}`]: {
          backgroundColor: bgColor || theme.palette.background.paper,
        },
        [`& .${linearProgressClasses.bar}`]: {
          borderRadius: 5,
          background: (barColorStart && barColorEnd)
            ? `linear-gradient(to right, ${barColorStart}, ${barColorEnd})`
            : (barColor || theme.palette.secondary.main)
        },
      }, sx)}
      {...props}
    />
  );
};