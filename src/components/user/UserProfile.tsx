import React, { FC, useEffect, useState } from "react";
import {
  Grid,
  Container,
  Typography,
  Box,
  Avatar,
  useTheme,
  useMediaQuery,
  Paper,
  Divider,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Skeleton
} from "@mui/material";
import Link from "@components/Link";
import Image from "next/image";
import SocialIcons from "@components/svgs/SocialIcons";

interface IUserProfileProps {
  address?: string;
  username?: string;
  pfpUrl?: string;
  bannerUrl?: string;
  tagline?: string;
  website?: string;
  socialLinks?: {
    socialNetwork: string;
    url: string;
  }[];
  children?: React.ReactNode;
  loading?: boolean;
}

const UserProfile: FC<IUserProfileProps> = ({
  address,
  username,
  pfpUrl,
  bannerUrl,
  website,
  tagline,
  socialLinks,
  children,
  loading
}) => {
  const theme = useTheme();
  const upSm = useMediaQuery(theme.breakpoints.up("sm"));
  const lessLg = useMediaQuery(theme.breakpoints.down("lg"));

  const [websiteLink, setWebsiteLink] = useState({
    link: "",
    name: "",
  });
  useEffect(() => {
    let link = "";
    let url = "";
    if (website !== undefined) {
      link = website;
      if (!/(http[s]?:\/\/)/.test(link)) {
        link = "https://" + link;
      }
      url = website.replace(/(http[s]?:\/\/)/, "");
      url = url.replace(/(www\.)/, "");
    }
    setWebsiteLink({
      link: link,
      name: url,
    });
  }, [website]);

  return (
    <>
      <Box
        sx={{
          height: "260px",
          width: "100vw",
          overflow: "hidden",
          display: "block",
          position: "relative",
        }}
      >
        {loading ?
          <Skeleton
            variant="rectangular"
            height={260}
            width={3840}
          /> :
          <Image
            src={bannerUrl ? bannerUrl : "/images/placeholder/3.jpg"}
            layout="fill"
            objectFit="cover"
            alt="Banner Image"
            priority
          />
        }
      </Box>
      <Container sx={{ mb: "50px", mt: "24px" }}>
        <Grid container justifyContent="center">
          <Grid
            item
            lg={3}
            sx={{
              pr: lessLg ? "" : "24px",
              maxWidth: "560px",
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                // position: "relative",
                // display: "block",
                // height: "calc(100% + 100px)",
                mt: lessLg ? "-95px" : "-75px",
                textAlign: lessLg && upSm ? "center" : "left",
              }}
            >
              {/* <Box
                sx={{
                  // position: "sticky",
                  top: "100px",
                  // height: '100%',
                  width: "100%",
                }}
              > */}
              <Box
                sx={{
                  pb: "24px",
                  width: "100%",
                  zIndex: "100",
                  overflow: "hidden",
                }}
              >
                {loading ?
                  <Skeleton
                    variant="circular"
                    height={lessLg ? 180 : 120}
                    width={lessLg ? 180 : 120}
                    sx={{
                      mx: "auto",
                      mb: "24px",
                    }}
                  /> :
                  <Avatar
                    alt={username ? username : address}
                    src={pfpUrl ? pfpUrl : ""}
                    sx={{
                      width: lessLg ? 180 : 120,
                      height: lessLg ? 180 : 120,
                      mx: "auto",
                      mb: "24px",
                      bgcolor: theme.palette.primary.main,
                    }}
                  />
                }
                {!loading && username ? (
                  <Typography
                    sx={{
                      fontSize: "1.2rem",
                      fontWeight: "700",
                      mb: "3px",
                      textAlign: "center",
                    }}
                  >
                    {username.slice(0, 12) +
                      (username.length > 12 ? "..." : "")}
                  </Typography>
                ) : (
                  <Skeleton
                    variant="text"
                    sx={{ fontSize: '1.4rem' }}
                  />
                )}
                {loading ?
                  <Skeleton
                    variant="text"
                    sx={{ fontSize: '1.2rem' }}
                  /> :
                  <Box
                    sx={{
                      display: "inline-block",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      overflowWrap: "break-word",
                      wordBreak: "break-word",
                      maxWidth: "100%",
                      mb: "16px",
                    }}
                  >

                    <Link
                      sx={{
                        color: theme.palette.primary.main,
                        lineHeight: 1.5,
                        mb: "16px",
                        "&:hover": {
                          color: theme.palette.text.primary,
                        },
                      }}
                      href={
                        "https://explorer.ergoplatform.com/en/addresses/" +
                        address
                      }
                    >
                      {address}
                    </Link>

                  </Box>
                }
                {/* <Grid container sx={{ textAlign: 'center', width: '100%' }}>
                    <Grid item xs>
                      <Typography
                        sx={{
                          fontSize: "1.5rem",
                          fontWeight: "700",
                        }}
                      >
                        -
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.8rem",
                          color: theme.palette.text.secondary,
                        }}
                      >
                        NFTs Owned
                      </Typography>
                    </Grid>
                    <Grid item xs>
                      <Typography
                        sx={{
                          fontSize: "1.5rem",
                          fontWeight: "700",
                        }}
                      >
                        -
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.8rem",
                          color: theme.palette.text.secondary,
                        }}
                      >
                        NFTs Sold
                      </Typography>
                    </Grid>
                  </Grid> */}
                {tagline && (
                  <>
                    <Divider sx={{ mb: "24px" }} />
                    <Typography sx={{ mb: "24px" }}>{tagline}</Typography>
                  </>
                )}
                {(website || (socialLinks && socialLinks.length > 0)) && (
                  <Divider sx={{ mb: "24px" }} />
                )}
                {website && (
                  <Box sx={{ mb: "18px" }}>
                    <Typography variant="h6" sx={{ mb: "6px" }}>
                      Website
                    </Typography>
                    <Link href={websiteLink.link}>{websiteLink.name}</Link>
                  </Box>
                )}
                {socialLinks &&
                  socialLinks.length > 0 &&
                  socialLinks[0].url !== "" && (
                    <>
                      <Typography variant="h6" sx={{ mb: "0" }}>
                        Social Links
                      </Typography>
                      <MenuList dense>
                        {socialLinks.map((item, i) => {
                          let link = item.url;
                          if (!/(http[s]?:\/\/)/.test(link)) {
                            link = "https://" + link;
                          }
                          let url = item.url.replace(/(http[s]?:\/\/)/, "");
                          url = url.replace(/(www\.)/, "");
                          if (
                            item.socialNetwork !== "other" &&
                            item.socialNetwork !== ""
                          ) {
                            url = url.replace(/([^\/\s]+\/)/, "");
                          }
                          return (
                            <MenuItem
                              key={i}
                              onClick={() => window.open(link, "_blank")}
                              sx={{
                                pl: "6px",
                                mb: 0,
                                ml: "-6px",
                                borderRadius: "6px",
                              }}
                            >
                              {item.socialNetwork !== "other" &&
                                item.socialNetwork !== "" && (
                                  <ListItemIcon>
                                    <SocialIcons
                                      icon={item.socialNetwork.toLowerCase()}
                                    />
                                  </ListItemIcon>
                                )}
                              <ListItemText>
                                <Typography
                                  sx={{
                                    wordBreak: "break-all",
                                    overflowWrap: "break-word",
                                    whiteSpace: "normal",
                                  }}
                                >
                                  {url}
                                </Typography>
                              </ListItemText>
                            </MenuItem>
                          );
                        })}
                      </MenuList>
                    </>
                  )}
              </Box>
              {/* </Box> */}
            </Box>
          </Grid>
          <Grid item lg={9} xs={12}>
            {children}
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default UserProfile;
