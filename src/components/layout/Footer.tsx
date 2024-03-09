import React, { FC } from "react";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@components/Link"
import SocialGrid from "@components/layout/SocialGrid";
import Logo from "@components/svgs/Logo";
import { useMediaQuery, useTheme } from "@mui/material";
import { useWalletContext } from '@contexts/WalletContext';

const titleFont = {
  fontFamily: ['"Space Grotesk"', "sans-serif"].join(","),
  fontWeight: "Bold",
  textTransform: "uppercase",
  fontSize: "1rem",
  lineHeight: "1.5rem",
  pb: "9px",
};

interface IPage {
  name: string;
  link: string;
}

interface IPageLinkList {
  title: string;
  links: IPage[];
}

const firstPages = {
  title: '',
  links: [

  ],
};

const secondPages = {
  title: 'Support',
  links: [
    {
      name: "Apply for IDO",
      link: "/apply",
    },
    {
      name: "Documentation",
      link: "https://docs.coinecta.fi",
    },
    {
      name: "Contact us",
      link: "/contact",
    }
  ],
};

const thirdPages = {
  title: 'Dashboard',
  links: [
    {
      name: "Overview",
      link: "/dashboard",
    },
    {
      name: "Add Stake",
      link: "/dashboard/add-stake",
    },
    {
      name: "Manage Stake",
      link: "/dashboard/manage-stake",
    },
    {
      name: "Unlock Vested",
      link: "/dashboard/unlock-vested",
    },
    {
      name: "Claim Tokens",
      link: "/dashboard/claim-tokens",
    },
  ],
};

const fourthPages = {
  title: 'User',
  links: [
    {
      name: "Connected Wallets",
      link: "/user/connected-wallets",
    }
  ],
};

const Footer: FC = () => {
  const { sessionStatus } = useWalletContext()
  const theme = useTheme()
  const upMd = useMediaQuery(theme.breakpoints.up('md'))

  const year = new Date().getFullYear()

  return (
    <Box sx={{ borderTop: `1px solid ${theme.palette.divider}` }}>
      <Container sx={{ display: 'block', position: 'relative', zIndex: 100 }}>
        <Grid
          container
          spacing={{ xs: 3, md: 1 }}
          sx={{
            pt: 3,
            pb: 1
          }}
        >
          <Grid item xs={12} md={5}>
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
                  fontSize: '30px',
                  color: theme.palette.text.primary,
                }}
              />
              <Typography
                component="span"
                sx={{
                  color: theme.palette.text.primary,
                  fontSize: '1.7rem!important',
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
          <Grid item xs={12} md={7}>
            <Grid container direction="row" justifyContent="flex-end" spacing={4} sx={{ flexWrap: 'wrap' }}>
              {firstPages.links.length !== 0 && <LinkList {...firstPages} />}
              {secondPages.links.length !== 0 && <LinkList {...secondPages} />}
              {thirdPages.links.length !== 0 && <LinkList {...thirdPages} />}
              {sessionStatus === 'authenticated'
                && fourthPages.links.length !== 0
                && <LinkList {...fourthPages} />}
              <Grid item xs={6} md={3} sx={{}} zeroMinWidth>
                <Typography sx={titleFont}>Socials</Typography>
                <Grid
                  container
                  spacing={1}
                  justifyContent={'left'}
                  sx={{
                    fontSize: "25px",
                  }}
                >
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
          </Grid>
        </Grid>
        <Grid container direction={upMd ? 'row' : 'column-reverse'} justifyContent="space-between" sx={{ py: 2 }} spacing={1}>
          <Grid item xs={12} md sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography>
              &copy; {year} Coinecta Finance. All rights reserved.
            </Typography>
          </Grid>
          <Grid item xs={12} md sx={{ textAlign: { xs: 'center', md: 'right' } }}>
            <Link
              href="/terms"
              sx={{
                color: theme.palette.text.primary,
                textDecoration: 'none',
                "&:hover": {
                  color: theme.palette.primary.main,
                },
              }}
            >
              Terms of Service
            </Link>{" "}
            ·{" "}
            <Link
              href="/privacy"
              sx={{
                color: theme.palette.text.primary,
                textDecoration: 'none',
                "&:hover": {
                  color: theme.palette.primary.main,
                },
              }}
            >
              Privacy Policy
            </Link>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Footer;



const LinkList: FC<IPageLinkList> = ({ title, links }) => {
  const theme = useTheme()
  return (
    <Grid item xs={6} md={3} sx={{}} zeroMinWidth>
      <Typography sx={titleFont}>{title}</Typography>
      {links.map((page, i) => (
        <Typography key={i}><Link
          href={page.link}
          sx={{
            color: theme.palette.text.primary,
            textDecoration: "none",
            "&:hover": {
              // textDecoration: "underline",
              color: theme.palette.primary.main,
            },
            // fontSize: "16px",
            lineHeight: '1.625',
          }}
        >
          {page.name}
        </Link></Typography>
      ))}
    </Grid>
  )
}