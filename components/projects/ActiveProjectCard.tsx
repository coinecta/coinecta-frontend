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
import { Grid, IconButton, Typography, Button } from "@mui/material";
import CopyToClipboard from "@components/CopyToClipboard";
import { useProjectInfo } from "../../hooks/useProjectInfo";

export const ActiveProjectCard = ( project: any, type: any ) => {
  const router = useRouter();
  const { projectInfo, isLoading } = useProjectInfo(project.projectName);

  if (isLoading) {
    return null;
  }

  const projectLink =
    type === "whitelist"
      ? `/whitelist/${project.projectName}/${project.roundName}`
      : `/contribute/${project.projectName}/${project.roundName}`;

  return (
    <Grid item xs={12} sm={6} md={4} key={projectInfo.id}>
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
            router.push(projectLink);
          }}
        >
          <CardContent>
            <Typography gutterBottom variant="h4" component="div">
              {project.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {project.subtitle}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions sx={{ justifyContent: "right" }}>
          <Link
            aria-label="share"
            href={'/projects/' + project.projectName}
          >
            <Button>
              Project Page
            </Button>
          </Link>
        </CardActions>
      </Card>
    </Grid>
  );
};
