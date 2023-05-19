import React from "react";
import { useRouter } from "next/router";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import TelegramIcon from "@mui/icons-material/Telegram";
import TwitterIcon from "@mui/icons-material/Twitter";
import GitHubIcon from "@mui/icons-material/GitHub";
import PublicIcon from "@mui/icons-material/Public";
import ShareIcon from "@mui/icons-material/Share";
import DiscordIcon from "@components/svgs/DiscordIcon";
import Link from "@components/Link";
import { Grid, IconButton, Typography } from "@mui/material";
import CopyToClipboard from "@components/CopyToClipboard";

export const ProjectCard = ( project: any ) => {
  const router = useRouter();

  return (
    <Grid item xs={12} sm={6} md={4} key={project.id}>
      <Card
        sx={{
          display: "flex",
          height: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          borderRadius: '8px',
        }}
      >
        <CardActionArea
          onClick={() => {
            router.push(
              "/projects/" +
                project.name
                  .toLowerCase()
                  .replaceAll(" ", "")
                  .replaceAll(/[^a-zA-Z0-9]/g, "")
            );
          }}
        >
          <CardMedia component="img" alt="" height="368" image={project.bannerImgUrl} />
          <CardContent>
            <Typography gutterBottom variant="h4" component="div">
              {project.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {project.shortDescription}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions sx={{ justifyContent: "right" }}>
          {/* socials go here */}
          {project?.socials?.discord ? (
            <Link
              sx={{ display: "flex", justifyContent: "center" }}
              href={project.socials.discord}
              aria-label="discord"
              
              
            >
              <IconButton aria-label="discord">
                <DiscordIcon />
              </IconButton>
            </Link>
          ) : null}
          {project?.socials?.github ? (
            <Link
              sx={{ display: "flex", justifyContent: "center" }}
              href={project.socials.github}
              aria-label="github"
              
            >
              <IconButton aria-label="github">
                <GitHubIcon />
              </IconButton>
            </Link>
          ) : null}
          {project?.socials?.telegram ? (
            <Link
              sx={{ display: "flex", justifyContent: "center" }}
              href={project.socials.telegram}
              aria-label="Telegram"
              
            >
              <IconButton aria-label="telegram">
                <TelegramIcon />
              </IconButton>
            </Link>
          ) : null}
          {project?.socials?.twitter ? (
            <Link
              sx={{ display: "flex", justifyContent: "center" }}
              href={project.socials.twitter}
              aria-label="twitter"
              
            >
              <IconButton aria-label="twitter">
                <TwitterIcon />
              </IconButton>
            </Link>
          ) : null}
          {project?.socials?.website ? (
            <Link
              sx={{ display: "flex", justifyContent: "center" }}
              href={project.socials.website}
              aria-label="website"
             
            >
              <IconButton aria-label="website">
                <PublicIcon />
              </IconButton>
            </Link>
          ) : null}
          
        </CardActions>
      </Card>
    </Grid>
  );
};
