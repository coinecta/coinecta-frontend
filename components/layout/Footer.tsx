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

// interface IPageLinkList {
//   title: string;
//   links: IPage[];
// }

// const firstPages = {
//   title: 'First',
//   links: [
//     {
//       name: "Home",
//       link: "/",
//     },
//     {
//       name: "About",
//       link: "/about",
//     },
//     {
//       name: "Blog",
//       link: "/blog",
//     },
//   ],
// };

// const secondPages = {
//   title: 'Second',
//   links: [
//     {
//       name: "Home",
//       link: "/",
//     },
//     {
//       name: "About",
//       link: "/about",
//     },
//     {
//       name: "Blog",
//       link: "/blog",
//     },
//   ],
// };

// const thirdPages = {
//   title: 'Third',
//   links: [
//     {
//       name: "Home is super long waytoo long",
//       link: "/",
//     },
//     {
//       name: "About",
//       link: "/about",
//     },
//     {
//       name: "Blog",
//       link: "/blog",
//     },
//   ],
// };

// const fourthPages = {
//   title: 'Fourth',
//   links: [
//     {
//       name: "Hello",
//       link: "/",
//     },
//   ],
// };

// const linkList: FC<IPageLinkList> = ({ title, links }) => {
//   const theme = useTheme()
//   return (
//     <Grid item xs={6} md={3} sx={{}} zeroMinWidth>
//       <Typography sx={titleFont}>{title}</Typography>
//       {links.map((page, i) => (
//         <Typography key={i}><Link
//           href={page.link}
//           sx={{
//             color: theme.palette.text.primary,
//             textDecoration: "none",
//             "&:hover": {
//               // textDecoration: "underline",
//               color: theme.palette.primary.main,
//             },
//             // fontSize: "16px",
//             lineHeight: '1.625',
//           }}
//         >
//           {page.name}
//         </Link></Typography>
//       ))}
//     </Grid>
//   )
// }

const Footer: FC = () => {
  const theme = useTheme()
  const upMd = useMediaQuery(theme.breakpoints.up('md'))
  return (
    <Container sx={{ display: 'block', position: 'relative', zIndex: 0 }}>
      {/* <Grid
        container
        spacing={{ xs: 3, md: 1 }}
        sx={{
          py: { xs: 2, md: 8 },
        }}
      >
        <Grid item xs={12} md={3}>
          <Link href="/">
            <Logo sx={{
              fontSize: { xs: "24px", md: "48px" },
              color: theme.palette.text.primary,
              "&:hover": {
                color: theme.palette.primary.main,
              },
            }}
            />
          </Link>
        </Grid>
        <Grid item xs={12} md={9}>
          <Grid container direction="row" justifyContent="flex-end" spacing={3} sx={{ flexWrap: 'wrap' }}>
            {firstPages.links.length != 0 && linkList(firstPages)}
            {secondPages.links.length != 0 && linkList(secondPages)}
            {thirdPages.links.length != 0 && linkList(thirdPages)}
            {fourthPages.links.length != 0 && linkList(fourthPages)}
          </Grid>
        </Grid>
      </Grid> */}
      <Grid container direction={upMd ? 'row' : 'column-reverse'} justifyContent="space-between" sx={{ py: 2 }} spacing={1}>
        <Grid item xs={12} md sx={{ textAlign: { xs: 'center', md: 'left' } }}>
          <Typography>
            &copy; 2022 Template. All rights reserved.
          </Typography>
        </Grid>
        <Grid item xs={12} md="auto" sx={{ textAlign: { xs: 'center', md: 'center' } }}>
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
        <Grid item xs={12} md>
          <Grid
            container
            spacing={{ xs: 3, md: 2 }}
            justifyContent={{ xs: 'center', md: 'right' }}
            sx={{
              fontSize: "20px",
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
    </Container>
  );
}

export default Footer;