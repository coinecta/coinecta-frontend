import React, { FC, useContext } from 'react';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AppBar from "@mui/material/AppBar";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { DarkTheme, LightTheme } from "@theme/theme";
import { Theme, Fade } from '@mui/material';
import Box from "@mui/material/Box";
import Link from '@components/Link'
import { ThemeContext } from "@contexts/ThemeContext";
import { useRouter } from 'next/router';
import Logo from '@components/svgs/Logo';
import NotificationsMenu from '@components/notifications/NotificationsMenu'
import UserMenu from '@components/user/UserMenu';

const pages = [
  {
    name: "Home",
    link: "/",
  },
  {
    name: "Collections",
    link: "/collections",
  },
  {
    name: "Marketplace",
    link: "/marketplace",
  },
];

interface INavItemProps {
  size: number;
  page: {
    name: string;
    link: string;
    disabled?: boolean;
  };
}

interface IHeaderProps {

}

const Header: FC<IHeaderProps> = ({ }) => {
  const { theme, setTheme } = useContext(ThemeContext);
  const [navbarOpen, setNavbarOpen] = React.useState(false);

  const router = useRouter();

  const toggleTheme = () => {
    setTheme((prevTheme: Theme) => (prevTheme === LightTheme ? DarkTheme : LightTheme));
    let temp = theme === LightTheme ? "dark" : "light";
    localStorage.setItem('darkToggle', temp);
    // console.log(temp)
  };

  const NavigationListItem: React.FC<INavItemProps> = ({ size, page }) => {
    return (
      <Grid item>
        <Box
          sx={{
            display: 'inline-block',
            "&::after": {
              content: '""',
              display: 'block',
              mt: '4px',
              height: '2px',
              background: router.pathname === page.link ? theme.palette.primary.main : '',
              width: '100%',
            },

          }}
        >
          {page.disabled ? (
            <Typography
              sx={{
                color: theme.palette.text.secondary,
                px: '8px',
              }}
            >
              {page.name}
            </Typography>
          ) : (
            <Box
              onClick={() => setNavbarOpen(false)}
            >
              <Link
                href={page.link}
                sx={{
                  color: router.pathname === page.link ? theme.palette.primary.main : theme.palette.text.primary,
                  fontWeight: '700',
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '14px',
                  textDecoration: "none",
                  px: '8px',
                  "&:hover": {
                    color: theme.palette.primary.main,
                  },
                }}
              >
                {page.name}
              </Link>
            </Box>
          )}
        </Box>
      </Grid>
    );
  };

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return (
    <>
      <AppBar
        position="fixed"
        // color="transparent"
        elevation={0}
        sx={{
          zIndex: "101",
          border: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`,
          backdropFilter: "blur(25px)",
          borderRadius: '0px',
          background: theme.palette.background.paper,
        }}
      >
        <Container sx={{ px: "24px" }}>
          <Grid
            container
            justifyContent="space-between"
            alignItems="center"
            sx={{
              height: trigger ? "59px" : "89px",
              transition: 'height 200ms linear'
            }}
          >
            <Grid
              item
              alignItems="center"
              sx={{
                // height: { xs: "32px", md: "40px" },
                // width: { xs: "32px", md: "40px" },
              }}
            >
              <Link
                href="/"
                sx={{
                  display: 'block',
                  '&:hover': {
                    '& span': {
                      color: theme.palette.primary.main
                    }
                  }
                }}
              >
                <Logo
                  sx={{
                    mt: '6px',
                    display: 'inline-block'
                  }}
                />
                <Typography
                  component="span"
                  sx={{
                    fontFamily: '"Koulen", sans-serif',
                    color: theme.palette.text.primary,
                    fontSize: '1.7rem',
                    display: 'inline-block',
                    verticalAlign: '25%',

                  }}
                >
                  BLOCK ART
                </Typography>
              </Link>
            </Grid>

            <Grid item>
              <Grid
                container
                justifyContent="flex-start"
                alignItems="center"
                spacing={{ xs: 1, md: 3 }}
              >
                <Grid item sx={{ display: { xs: "none", md: "flex" } }}>
                  <Grid
                    container
                    spacing={2}
                  >
                    {pages.map((page, i) => (
                      <NavigationListItem size={13} key={i} page={page} />
                    ))}
                  </Grid>
                </Grid>
                <Grid
                  item
                >
                  <IconButton onClick={toggleTheme} sx={{ color: theme.palette.text.primary }}>
                    {(theme === DarkTheme) ? <Brightness7Icon /> : <Brightness4Icon />}
                  </IconButton>
                  <NotificationsMenu />
                  <UserMenu />
                </Grid>
                <Grid item sx={{ display: { xs: "flex", md: "none" } }}>
                  <Box
                    sx={{
                      zIndex: "25",
                      position: "relative",
                      width: "26px",
                      height: "40px",
                      color: theme.palette.text.primary,
                      // focus: 'outline-none',
                    }}
                    onClick={() => setNavbarOpen(!navbarOpen)}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        width: "24px",
                        transform: "translate(-50%, -50%)",
                        left: "50%",
                        top: "50%",
                        mt: '-2px'
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          height: "4px",
                          width: "20px",
                          borderRadius: "4px",
                          background: theme.palette.text.primary,
                          transition: "transform 100ms ease-in-out",
                          transform: `${navbarOpen ? "rotate(45deg)" : "translateY(6px)"
                            }`,
                        }}
                      ></Box>
                      <Box
                        sx={{
                          position: "absolute",
                          height: "4px",
                          width: "20px",
                          borderRadius: "4px",
                          background: theme.palette.text.primary,
                          transition: "transform 100ms ease-in-out",
                          transform: `${navbarOpen ? "rotate(-45deg)" : "translateY(-6px)"
                            }`,
                        }}
                      ></Box>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </AppBar>
      <Fade in={navbarOpen} style={{ transitionDuration: "400ms" }}>
        <Box
          sx={{
            zIndex: "103",
            position: "fixed",
            width: "26px",
            height: "40px",
            top: trigger ? "11px" : "25px",
            right: "26px",
            color: theme.palette.text.primary,
          }}
          onClick={() => setNavbarOpen(!navbarOpen)}
        >
          <Box
            sx={{
              position: "absolute",
              width: "20px",
              transform: "translate(-50%, -50%)",
              left: "50%",
              top: "50%",
              mt: '-2px'
            }}
          >
            <Box
              sx={{
                position: "absolute",
                height: "3px",
                width: "20px",
                borderRadius: "2px",
                background: theme.palette.text.primary,
                transition: "transform 100ms ease-in-out",
                transform: `${navbarOpen ? "rotate(45deg)" : "translateY(6px)"
                  }`,
              }}
            ></Box>
            <Box
              sx={{
                position: "absolute",
                height: "3px",
                width: "20px",
                borderRadius: "2px",
                background: theme.palette.text.primary,
                transition: "transform 100ms ease-in-out",
                transform: `${navbarOpen ? "rotate(-45deg)" : "translateY(-6px)"
                  }`,
              }}
            ></Box>
          </Box>
        </Box>
      </Fade>
      <Fade in={navbarOpen} style={{ transitionDuration: "400ms" }}>
        <Box
          sx={{
            height: "100vh",
            width: "100vw",
            position: "fixed",
            bottom: "0px",
            zIndex: "102",
            background: theme.palette.background.default,
            backdropFilter: "blur(55px)",
            p: "24px",
            pb: "0",
          }}
        >
          <Grid
            container
            direction="column"
            justifyContent="flex-end"
            alignItems="flex-start"
            spacing={3}
            height="100%"
          >
            <Grid item>
              <Grid
                container
                spacing={3}
                direction="column"
                justifyContent="flex-end"
                alignItems="flex-start"
                sx={{

                }}
              >
                {pages.map((page, i) => (
                  <NavigationListItem size={20} key={i} page={page} />
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </>
  );
};

export default Header;