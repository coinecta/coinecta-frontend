import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import localFont from 'next/font/local'

declare module '@mui/material/styles' {
  interface TypeBackground {
    transparent?: string;
  }
}

export const anek = localFont({ src: './fonts/AnekKannada.woff2', declarations: [{ prop: 'ascent-override', value: '110%' }] })

const mainTheme = [{
  typography: {
    fontFamily: anek.style.fontFamily,
    h1: {
      fontWeight: "600",
    },
    // h2: {
    //   fontWeight: "600",
    // },
    // h3: {
    //   fontSize: "3rem",
    //   fontWeight: "800",
    //   lineHeight: 1.167,
    //   marginBottom: "1rem",
    //   overflowWrap: "break-word",
    //   hyphens: "manual",
    // },
    // h4: {
    //   fontSize: "2rem",
    //   fontWeight: "700",
    //   lineHeight: 1.235,
    //   marginBottom: "0.5rem",
    //   overflowWrap: "break-word",
    //   hyphens: "manual",
    // },
    // h5: {
    //   fontSize: "1.5rem",
    //   fontWeight: "700",
    //   lineHeight: 1.6,
    //   letterSpacing: "0.0075em",
    //   marginBottom: "0.5rem",
    //   overflowWrap: "break-word",
    //   hyphens: "manual",
    // },
    // h6: {
    //   fontSize: "1.2rem",
    //   fontWeight: "600",
    //   lineHeight: 1.3,
    //   letterSpacing: "0.0075em",
    //   marginBottom: "0",
    //   overflowWrap: "break-word",
    //   hyphens: "manual",
    // },
    // overline: {
    //   textTransform: 'uppercase',
    //   fontSize: '0.75rem',
    //   display: 'inline-block',
    // },
    body1: {

    },
    body2: {
      fontSize: '1.1667rem',
      lineHeight: '1.5',
      marginBottom: '24px',
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
          verticalAlign: 'top'
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0, 
      },
      styleOverrides: {
        root: {
          borderRadius: '6px',
        }
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
      default: "rgba(255,255,255,1)",
      paper: 'rgba(237,239,238)',
      transparent: 'rgba(210,210,210,0.5)',
    },
    text: {
      primary: 'rgba(23,21,21,1)',
      secondary: 'rgba(51,51,51,1)',
    },
    primary: {
      // main: "#FF2147",
      main: 'rgb(255, 120, 68)',
    },
    secondary: {
      main: "#3D8AB9",
    },
  },
  typography: {
    fontFamily: anek.style.fontFamily,
    fontSize: 16,
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
      default: 'rgb(8,8,16)',
      paper: 'rgba(16,19,30)',
      transparent: 'rgba(12,15,27,0.5)'
    },
    text: {
      primary: 'rgba(244,244,244,1)',
      secondary: 'rgba(228,228,228,1)',
    },
    primary: {
      // main: "#FF2147",
      main: 'rgb(255, 120, 68)',
    },
    secondary: {
      main: "#29b6f6",
    },
    contrastThreshold: 4.5,
  },
  typography: {
    fontFamily: anek.style.fontFamily,
    fontSize: 16,
    body2: {
      color: 'rgba(228,228,228,1)',
    },
    button: {
      
    }
  },
  components: {
    // MuiPaper: {
    //   styleOverrides: {
    //     root: {
    //       border: 'none'
    //     },
    //   },
    // },
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