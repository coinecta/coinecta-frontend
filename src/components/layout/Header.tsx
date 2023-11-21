import React, { FC, useContext } from 'react';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AppBar from "@mui/material/AppBar";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { DarkTheme, LightTheme } from "@styles/theme";
import { Theme, Fade, Divider, Avatar, Button } from '@mui/material';
import Box from "@mui/material/Box";
import Link from '@components/Link'
import { ThemeContext } from "@contexts/ThemeContext";
import { useRouter } from 'next/router';
import Logo from '@components/svgs/Logo';
import NotificationsMenu from '@components/notifications/NotificationsMenu'
import UserMenu from '@components/user/UserMenu';
import SocialGrid from './SocialGrid';

const pages = [
  {
    name: "Home",
    link: "/",
  },
  {
    name: "Projects",
    link: "/projects"
  }
];

interface INavItemProps {
  size?: number;
  fontWeight?: number;
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

  const NavigationListItem: React.FC<INavItemProps> = ({ size, fontWeight, page }) => {
    return (
      <Grid item>
        <Box
          sx={{
            display: 'inline-block',
            position: 'relative',
            "&::after": {
              content: '""',
              position: 'absolute',
              bottom: '-4px',
              display: 'block',
              mt: '0',
              borderRadius: '10px',
              height: (fontWeight && fontWeight > 500) || (size && size > 20) ? '3px' : '2px',
              background: router.pathname === page.link ? theme.palette.primary.main : '',
              width: '100%',
            },
          }}
        >
          {page.disabled ? (
            <Typography
              sx={{
                color: theme.palette.text.secondary,
                fontSize: size ? size.toString() + 'px' : '16px',
                textDecoration: "none",
                fontWeight: fontWeight ? fontWeight : '500',
                px: '8px',
                mb: 0
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
                  "&:hover": {
                    color: theme.palette.primary.main,
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: size ? size.toString() + 'px' : '16px',
                    textDecoration: "none",
                    fontWeight: fontWeight ? fontWeight : '500',
                    px: '8px',
                  }}
                >
                  {page.name}
                </Typography>
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
        elevation={0}
        sx={{
          zIndex: 101,
          border: 'none',
          borderBottom: trigger ? `1px solid ${theme.palette.divider}` : 'none',
          // backdropFilter: "blur(25px)",
          borderRadius: '0px',
          background: theme.palette.background.default,
        }}
      >
        <Container>
          <Grid
            container
            justifyContent="space-between"
            alignItems="center"
            sx={{
              height: "70px",
              transition: 'height 200ms linear'
            }}
          >
            <Grid
              item
              alignItems="center"
            >
              <Link
                href="/"
                sx={{
                  display: 'block',
                  '&:hover': {
                    '& span': {
                      color: theme.palette.primary.main
                    },
                    '& .MuiSvgIcon-root': {
                      color: theme.palette.primary.main
                    }
                  }
                }}
              >
                <Logo
                  sx={{
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    mr: '3px',
                    fontSize: '34px',
                    color: theme.palette.text.primary,
                  }}
                />
                <Typography
                  component="span"
                  sx={{
                    color: theme.palette.text.primary,
                    fontSize: '2rem!important',
                    fontWeight: '700',
                    lineHeight: 1,
                    display: 'inline-block',
                    verticalAlign: 'bottom'
                  }}
                >
                  Coinecta
                </Typography>
              </Link>
            </Grid>

            <Grid item>
              <Grid
                container
                justifyContent="flex-start"
                alignItems="center"
                spacing={{ xs: 1, md: 2 }}
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
                <Grid item>
                  <IconButton onClick={toggleTheme} sx={{ color: theme.palette.text.primary }}>
                    {(theme === DarkTheme) ? <Brightness7Icon /> : <Brightness4Icon />}
                  </IconButton>
                </Grid>
                <Grid
                  item
                >
                  {/* <NotificationsMenu />*/}
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
            top: "15px",
            right: "17px",
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
                {pages.map((page) => (
                  <NavigationListItem size={32} key={page.name} page={page} />
                ))}
              </Grid>

            </Grid>
            <Grid item width={'100%'}>
              <Divider />
            </Grid>
            <Grid item>

              <Typography variant="h5" gutterBottom>
                Follow our socials
              </Typography>
              <Grid container direction="row" spacing={3} sx={{ fontSize: '26px' }}>
                <SocialGrid
                  telegram="https://t.me/coinecta"
                  discord="https://discord.gg/EuFdWye8yw"
                  github="https://github.com/coinecta"
                  twitter="https://twitter.com/CoinectaFinance"
                  medium="https://coinecta.medium.com/"
                />
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </>
  );
};

export default Header;