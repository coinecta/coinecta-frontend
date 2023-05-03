import { createTheme, responsiveFontSizes } from "@mui/material/styles";

const mainTheme = [{
  typography: {
    h1: {
      fontSize: "4.5rem",
      fontWeight: "800",
      lineHeight: 1.167,
      marginBottom: "12px",
      fontFamily: '"Playfair Display", serif',
      textShadow: "0px 2px 2px rgba(0, 0, 0, 0.6)",
      overflowWrap: "break-word",
      hyphens: "manual",
    },
    h2: {
      fontSize: "3rem",
      fontWeight: "800",
      lineHeight: 1.167,
      marginBottom: "1.25rem",
      fontFamily: '"Playfair Display", serif',
      // textShadow: "0px 2px 2px rgba(0, 0, 0, 0.6)",
      overflowWrap: "break-word",
      hyphens: "manual",
    },
    h3: {
      fontSize: "3rem",
      fontWeight: "800",
      lineHeight: 1.167,
      marginBottom: "1rem",
      fontFamily: '"Inter", sans-serif',
      textShadow: "0px 2px 2px rgba(0, 0, 0, 0.6)",
      overflowWrap: "break-word",
      hyphens: "manual",
    },
    h4: {
      fontSize: "2rem",
      fontWeight: "700",
      lineHeight: 1.235,
      marginBottom: "0.5rem",
      fontFamily: '"Inter", sans-serif',
      // textShadow: "0px 2px 2px rgba(0, 0, 0, 0.6)",
      overflowWrap: "break-word",
      hyphens: "manual",
    },
    h5: {
      fontSize: "1.5rem",
      fontWeight: "700",
      lineHeight: 1.6,
      letterSpacing: "0.0075em",
      marginBottom: "0.5rem",
      fontFamily: '"Inter", sans-serif',
      // textShadow: "0px 2px 2px rgba(0, 0, 0, 0.6)",
      overflowWrap: "break-word",
      hyphens: "manual",
    },
    h6: {
      fontSize: "1.2rem",
      fontWeight: "600",
      lineHeight: 1.3,
      letterSpacing: "0.0075em",
      marginBottom: "0",
      fontFamily: '"Inter", sans-serif',
      // textShadow: "0px 2px 2px rgba(0, 0, 0, 0.6)",
      overflowWrap: "break-word",
      hyphens: "manual",
    },
    overline: {
      textTransform: 'uppercase',
      fontSize: '0.75rem',
      display: 'inline-block',
      fontFamily: '"Inter", sans-serif',
      // textShadow: "0px 2px 2px rgba(0, 0, 0, 0.6)",
    },
    body2: {
      fontFamily: '"Inter", sans-serif',
      marginBottom: '24px',
      fontSize: '1rem',
      lineHeight: '1.75',
    },
  },
  components: {
    MuiContainer: {
      defaultProps: {
        maxWidth: 'xl'
      }
    },
    MuiList: {
      styleOverrides: {
        root: {
          paddingTop: 0,
          paddoingBottom: 0,
        }
      }
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          marginBottom: 0,
          paddingTop: 0,
          paddingBottom: 0
        },
        root: {
          margin: 0
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          fontWeight: '700',
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        variant: 'outlined'
      },
      styleOverrides: {
        root: {
          borderRadius: '6px',
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          borderStyle: 'solid',
          borderWidth: '1px',
          '&::before': {
            display: 'none',
          },
          '&::after': {
            display: 'none',
          }
        }
      }
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: {
          marginTop: '0 !important'
        }
      }
    },
    MuiTabPanel: {
      styleOverrides: {
        root: {
          paddingLeft: 0,
          paddingRight: 0,
          // paddingTop: '48px',
        }
      }
    },
    MuiLink: {
      styleOverrides: {
        root: {
          fontFamily: '"Inter", sans-serif',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'none',
          }
        }
      }
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          '&:-webkit-autofill': {
            boxShadow: '0 0 0 100px rgba(144,144,144,0.001) inset !important',
          },
          '&:-internal-autofill-selected': {
            backgroundColor: 'none !important',
          }
        }
      }
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 42,
          height: 26,
          padding: 0,
          '& .MuiSwitch-switchBase': {
            padding: 0,
            margin: 2,
            transitionDuration: '300ms',
            '&.Mui-checked': {
              transform: 'translateX(16px)',
              color: '#fff',
              '& + .MuiSwitch-track': {
                opacity: 1,
                border: 0,
              },
              '&.Mui-disabled + .MuiSwitch-track': {
                opacity: 0.5,
              },
            },
            '&.Mui-focusVisible .MuiSwitch-thumb': {
              color: '#33cf4d',
              border: '6px solid #fff',
            },
          },
          '& .MuiSwitch-thumb': {
            boxSizing: 'border-box',
            width: 22,
            height: 22,
          },
          '& .MuiSwitch-track': {
            borderRadius: 26 / 2,
            opacity: 1,
            transition: 'background-color 500ms',
          }
        }
      }
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          height: 8,
          '& .MuiSlider-track': {
            border: 'none',
          },
          '& .MuiSlider-thumb': {
            height: 24,
            width: 24,
            backgroundColor: '#fff',
            border: '2px solid currentColor',
            '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
              boxShadow: 'inherit',
            },
            '&:before': {
              display: 'none',
            },
          },
          '& .MuiSlider-valueLabel': {
            lineHeight: 1.2,
            fontSize: 12,
            background: 'unset',
            padding: 0,
            width: 32,
            height: 32,
            borderRadius: '50% 50% 50% 0',
            transformOrigin: 'bottom left',
            transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
            '&:before': { display: 'none' },
            '&.MuiSlider-valueLabelOpen': {
              transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
            },
            '& > *': {
              transform: 'rotate(45deg)',
            },
          },
        }
      }
    }
  }
}];

let lightTheme = createTheme({
  palette: {
    background: {
      default: "rgba(250,250,255,1)",
      paper: 'rgba(240,240,244,1)',
    },
    text: {
      primary: 'rgba(23,21,21,1)',
      secondary: 'rgba(51,51,51,1)',
    },
    primary: {
      main: "rgba(252,70,96,1)",
    },
    secondary: {
      main: "#00868F",
    },
  },
  typography: {
    body2: {
      color: 'rgba(51,51,51,1)',
    }
  },
  components: {
    MuiLink: {
      styleOverrides: {
        root: {
          '&:hover': {
            color: '#000',
          }
        }
      }
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-switchBase': {
            '&.Mui-checked': {
              '& + .MuiSwitch-track': {
                backgroundColor: '#00868F',
              },
            },
            '&.Mui-disabled .MuiSwitch-thumb': {
              color: "#ddd"
            },
            '&.Mui-disabled + .MuiSwitch-track': {
              opacity: 0.7,
            },
          },
          '& .MuiSwitch-track': {
            backgroundColor: '#E9E9EA',
          }
        }
      }
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(0, 0, 0, 0.12)'
        }
      }
    },
  }
}, ...mainTheme);

let darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: 'rgba(22,28,36,1)',
      paper: 'rgba(38,42,52,1)'
      // color for text area #242932
    },
    text: {
      primary: 'rgba(244,244,244,1)',
      secondary: 'rgba(228,228,228,1)',
    },
    primary: {
      main: "#9FD2DB",
    },
    secondary: {
      main: "rgba(252,70,96,1)",
    },
  },
  typography: {
    body2: {
      color: 'rgba(228,228,228,1)',
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(20,24,28,1)',
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          '&:hover': {
            color: 'rgba(244,244,244,1)',
          }
        }
      }
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-switchBase': {
            '&.Mui-checked': {
              '& + .MuiSwitch-track': {
                backgroundColor: '#9FD2DB',
              },
            },
            '&.Mui-disabled .MuiSwitch-thumb': {
              color: "#666"
            },
            '&.Mui-disabled + .MuiSwitch-track': {
              opacity: 0.3,
            },
          },
          '& .MuiSwitch-track': {
            backgroundColor: 'rgba(255, 255, 255, 0.09)',
          }
        }
      }
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255, 255, 255, 0.12)'
        }
      }
    },
  }
}, ...mainTheme);

export const LightTheme = responsiveFontSizes(lightTheme);

export const DarkTheme = responsiveFontSizes(darkTheme);