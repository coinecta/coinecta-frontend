import React, { FC, useContext } from "react";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@components/Link"
import SocialGrid from "@components/layout/SocialGrid";
import Logo from "@components/svgs/Logo";
import { useMediaQuery, useTheme } from "@mui/material";

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
  title: 'Company',
  links: [
    {
      name: "Apply for IDO",
      link: "/",
    },
    {
      name: "Whitepaper",
      link: "/about",
    },
    {
      name: "Linktree",
      link: "/blog",
    },
  ],
};

const secondPages = {
  title: 'Support',
  links: [
    {
      name: "FAQ",
      link: "/",
    },
    {
      name: "Guides",
      link: "/about",
    }
  ],
};

const thirdPages = {
  title: 'Launchpad',
  links: [
    {
      name: "Stake",
      link: "/stake",
    },
    {
      name: "Whitelist",
      link: "/whitelist",
    },
    {
      name: "Contribute",
      link: "/contribute",
    },
    {
      name: "Redeem",
      link: "/redeem",
    },
  ],
};

const fourthPages = {
  title: 'Fourth',
  links: [
    {
      name: "Hello",
      link: "/",
    },
  ],
};

const linkList: FC<IPageLinkList> = ({ title, links }) => {
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

const Footer: FC = () => {
  const theme = useTheme()
  const upMd = useMediaQuery(theme.breakpoints.up('md'))
  return (
    <Container sx={{ display: 'block', position: 'relative', zIndex: 0 }}>
      <Grid
        container
        spacing={{ xs: 3, md: 1 }}
        sx={{
          py: { xs: 2, md: 8 },
        }}
      >
        <Grid item xs={12} md={5}>
          <Link href="/" sx={{
                  display: 'block',
                  '&:hover': {
                    '& span': {
                      color: theme.palette.primary.main
                    }
                  }
                }}>
            <Typography
              component="span"
              sx={{
                color: theme.palette.text.primary,
                fontSize: '1.7rem',
                display: 'inline-block',
              }}
            >
              Coinnecta Finance
            </Typography>
          </Link>
        </Grid>
        <Grid item xs={12} md={7}>
          <Grid container direction="row" justifyContent="flex-end" spacing={4} sx={{ flexWrap: 'wrap' }}>
            {firstPages.links.length != 0 && linkList(firstPages)}
            {secondPages.links.length != 0 && linkList(secondPages)}
            {thirdPages.links.length != 0 && linkList(thirdPages)}
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
                  telegram="/"
                  discord="/"
                  twitter="/"
                  youtube="/"
                  medium="/"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid container direction={upMd ? 'row' : 'column-reverse'} justifyContent="space-between" sx={{ py: 2 }} spacing={1}>
        <Grid item xs={12} md sx={{ textAlign: { xs: 'center', md: 'left' } }}>
          <Typography>
            &copy; 2022 Coinnecta Finance. All rights reserved.
          </Typography>
        </Grid>
        <Grid item xs={12} md sx={{ textAlign: { xs: 'center', md: 'right' } }}>
          <Link
            href="/"
            sx={{
              color: theme.palette.text.primary,
              textDecoration: 'none',
              "&:hover": {
                color: theme.palette.primary.main,
              },
            }}
          >
            Terms
          </Link>{" "}
          ·{" "}
          <Link
            href="/"
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
  );
}

export default Footer;