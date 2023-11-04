import { Tabs, Tab, useTheme, SxProps, Theme, useMediaQuery, TabsProps, TabProps } from "@mui/material";
import { FC, ReactNode } from "react";

interface StyledTabsProps extends TabsProps {
  sx?: SxProps<Theme>;
  color?: string;
}

export const ContainedTabs: FC<StyledTabsProps> = ({ sx, color, ...props }) => {
  const theme = useTheme();
  const upMd = useMediaQuery(theme.breakpoints.up('md'))

  const mergeSx = (defaultSx: SxProps<Theme>, newSx?: SxProps<Theme>) => {
    if (!newSx) return defaultSx;
    return (theme: Theme) => ({
      ...typeof defaultSx === 'function' ? defaultSx(theme) : defaultSx,
      ...typeof newSx === 'function' ? newSx(theme) : newSx,
    });
  };
  return (
    <Tabs
      scrollButtons="auto"
      allowScrollButtonsMobile
      variant="scrollable"
      TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
      sx={mergeSx({
        '& .MuiTabs-indicator': {
          display: 'flex',
          justifyContent: 'center',
          backgroundColor: 'transparent',
        },
        '& .MuiTabs-indicatorSpan': {
          maxWidth: 40,
          width: '100%',
          backgroundColor: color || theme.palette.secondary.main,
        },
        background: theme.palette.background.paper,
        borderRadius: '6px',
        border: `1px solid ${theme.palette.divider}`,
        '& .MuiTabs-flexContainer': {
          justifyContent: upMd ? 'center' : null
        },
      }, sx)}
      {...props}
    />
  );
};

interface StyledTabProps extends TabProps {
  sx?: SxProps<Theme>;
}

export const ContainedTab: FC<StyledTabProps> = ({ sx, ...props }) => {
  const theme = useTheme();

  const mergeSx = (defaultSx: SxProps<Theme>, newSx?: SxProps<Theme>) => {
    if (!newSx) return defaultSx;
    return (theme: Theme) => ({
      ...typeof defaultSx === 'function' ? defaultSx(theme) : defaultSx,
      ...typeof newSx === 'function' ? newSx(theme) : newSx,
    });
  };

  return (
    <Tab
      disableRipple
      sx={mergeSx({
        textTransform: 'none',
        fontWeight: 500,
        fontSize: theme.typography.pxToRem(15),
        marginRight: theme.spacing(1),
        color: theme.palette.text.secondary,
        '&.Mui-selected': {
          color: theme.palette.text.primary,
          fontWeight: 700
        },
        '&.Mui-focusVisible': {
          backgroundColor: 'rgba(100, 95, 228, 0.32)',
        },
      }, sx)}
      {...props}
    />
  );
};