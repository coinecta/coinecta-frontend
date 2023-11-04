import React, { createContext } from "react";
import { Theme } from "@mui/material";

export interface IThemeContext {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
}

export const ThemeContext = createContext({} as IThemeContext);
