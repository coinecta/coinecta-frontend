import { useEffect, useState, Fragment, useMemo, ReactElement } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Typography,
  Divider,
  Box,
  Avatar,
  useTheme,
  Grid,
  useMediaQuery,
  Tabs,
  Tab,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "@components/Link";
import CopyToClipboard from "@components/CopyToClipboard";
import MarkdownRender from "@components/MarkdownRender";
import Roadmap from "@components/projects/Roadmap";
import Team from "@components/projects/Team";
import Tokenomics from "@components/projects/Tokenomics";
import Distribution from "@components/projects/Distribution";
import axios from "axios";
import { useWhitelistProjects } from "../../hooks/useWhitelistProjects";
import { useContributionProjects } from "../../hooks/useContributionProjects";
import DiscordIcon from "@components/svgs/DiscordIcon";
import TwitterIcon from "@components/svgs/TwitterIcon";
import TelegramIcon from "@components/svgs/TelegramIcon";
import WebIcon from "@components/svgs/WebIcon";
import GithubIcon from "@components/svgs/GithubIcon";
import ActiveRounds from '@components/ActiveRounds';

export interface ITokenomic {
  name: string;
  amount: number;
  value: string;
  tge: string;
  freq: string;
  length: string;
  lockup: string;
}

export interface IProject {
  name: string;
  shortDescription: string;
  description: string;
  fundsRaised: number;
  bannerImgUrl: string;
  isLaunched: boolean;
  socials: {
    telegram: string;
    twitter: string;
    discord: string;
    github: string;
    website: string;
    linkedin: string;
  };
  roadmap: {
    roadmap: {
      name: string;
      description: string;
      date: string;
    }[];
  };
  team: {
    team: {
      name: string;
      description: string;
      profileImgUrl: string;
      socials: {
        twitter: string;
        linkedin: string;
      };
    }[];
  };
  tokenomics: {
    tokenName: string;
    totalTokens: number;
    tokenTicker: string;
    tokenomics: ITokenomic[];
  };
  isDraft: boolean;
  id: number;
}

const navBarLinks = [
  {
    name: "Description",
    icon: "info",
    link: "#",
  },
  {
    name: "Roadmap",
    icon: "signpost",
    link: "#roadmap",
  },
  {
    name: "Team",
    icon: "people",
    link: "#team",
  },
  {
    name: "Tokenomics",
    icon: "data_usage",
    link: "#tokenomics",
  },
  {
    name: "Distribution",
    icon: "toc",
    link: "#distribution",
  },
];

const Project = () => {
  const theme = useTheme()
  const upMd = useMediaQuery(theme.breakpoints.up('md'))
  const router = useRouter();
  const { project_id } = router.query;
  const [isLoading, setLoading] = useState(true);
  const [project, setProject] = useState<IProject | undefined>(undefined);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const { whiteListProjectsActive, isLoading: whiteListProjectsIsLoading } = useWhitelistProjects();
  const { contributionProjectsActive, isLoading: contributionProjectsIsLoading } = useContributionProjects();

  const activeRound = useMemo(() => {
    const whiteListActive = whiteListProjectsActive?.find((project: any) => project.projectName === project_id);
    if (whiteListActive) {
      return {
        title: `${whiteListActive.roundName[0].toUpperCase()}${whiteListActive.roundName.slice(1).toLowerCase()} round`,
        link: `/whitelist/${whiteListActive.projectName}/${whiteListActive.roundName}`,
      };
    }

    const contributionActive = contributionProjectsActive?.find((project: any) => project.projectName === project_id);
    if (contributionActive) {
      return {
        title: `${contributionActive.roundName[0].toUpperCase()}${contributionActive.roundName
          .slice(1)
          .toLowerCase()} round`,
        link: `/contribute/${contributionActive.projectName}/${contributionActive.roundName}`,
      };
    }

    return null;
  }, [whiteListProjectsActive, contributionProjectsActive]);

  useEffect(() => {
    const getProject = async () => {
      try {
        const res1 = await axios.get(`${process.env.API_URL}/projects/cardano${project_id}`);
        if (res1.data) {
          setProject(res1.data);
          setLoading(false);
          return;
        }

        const res2 = await axios.get(`${process.env.API_URL}/projects/cardanox${project_id}`);
        if (res2.data) {
          setProject(res2.data);
          setLoading(false);
          return;
        }

        // If neither API call returns data, handle the case accordingly
        setProject(undefined);
        setLoading(false);
      } catch (error) {
        // Handle any errors that occur during the API calls
        console.error('Error fetching project:', error);
        setProject(undefined);
        setLoading(false);
      }
    };

    if (project_id) getProject();
  }, [project_id]);

  const socialButtonSx = {
    mr: 1,
    color: theme.palette.text.primary,
    '&:hover': {
      color: theme.palette.primary.main
    }
  }

  return (
    <>
      {isLoading
        ? <Container sx={{ mb: "3rem" }}>
          <CircularProgress color="inherit" sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)"
          }} />
        </Container>
        : project !== undefined
          ? <Container maxWidth="lg" sx={{ pt: 6 }}>
            <Grid container spacing={2} direction={upMd ? 'row' : 'column'} alignItems="center" sx={{ mb: 2 }}>
              <Grid item md='auto' sx={{ textAlign: 'center' }}>
                <Avatar
                  src={project.socials.linkedin}
                  alt={project.name.replace(/cardano-(x-)?/, "")}
                  sx={{ width: 200, height: 200, display: "flex" }}
                />
              </Grid>
              <Grid item md>
                <Typography variant="h2" fontWeight={600}>{project.name.replace(/cardano-(x-)?/, "")}</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>{project.shortDescription}</Typography>
                <Box sx={{ display: "flex", justifyContent: "left", mb: 2 }}>
                  {project.socials.website &&
                    <Link
                      sx={socialButtonSx}
                      href={project.socials.website}
                      aria-label={`${project.name.replace(/cardano-(x-)?/, "")} website`}
                    >
                      <WebIcon />
                    </Link>
                  }
                  {project.socials.discord &&
                    <Link
                      sx={socialButtonSx}
                      href={project.socials.discord}
                      aria-label="discord"
                    >
                      <DiscordIcon />
                    </Link>
                  }
                  {project.socials.github &&
                    <Link
                      sx={socialButtonSx}
                      href={project.socials.github}
                      aria-label="github"
                    >
                      <GithubIcon />
                    </Link>
                  }
                  {project.socials.telegram &&
                    <Link
                      sx={socialButtonSx}
                      href={project.socials.telegram}
                      aria-label="Telegram"
                    >
                      <TelegramIcon />
                    </Link>
                  }
                  {project.socials.twitter &&
                    <Link
                      sx={socialButtonSx}
                      href={project.socials.twitter}
                      aria-label="twitter"
                    >
                      <TwitterIcon />
                    </Link>
                  }
                </Box>
              </Grid>
            </Grid>

            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              scrollButtons="auto"
              variant="scrollable"
              sx={{
                '& .MuiTabs-flexContainer': {
                  justifyContent: upMd ? 'center' : null
                },
              }}
            >
              <Tab label="Summary" value={0}></Tab>
              <Tab label="IDO Schedule" value={1}></Tab>
              <Tab label="Tokenomics" value={2}></Tab>
            </Tabs>
            <Box sx={{ mb: 12, mt: "2rem" }}>
              {(tabValue === 0) &&
                <>
                  <Box sx={{ mb: "2rem" }}>
                    <Typography variant="h4" fontWeight="700">
                      Description
                    </Typography>
                    <MarkdownRender description={project.description} />
                  </Box>
                  {project.team.team.length > 0 &&
                    <Box sx={{ mb: "2rem" }}>
                      <Typography variant="h4">
                        Team
                      </Typography>
                      <Team data={project.team.team} />
                    </Box>
                  }
                </>
              }

              {tabValue === 1 &&
                <>
                  <Box sx={{ mb: "2rem" }}>
                    <Typography variant="h4" fontWeight="700">
                      IDO Schedule
                    </Typography>
                    {project.roadmap.roadmap.length > 0 ? (
                      <Roadmap data={project?.roadmap?.roadmap} />
                    ) : <Typography>Schedule coming soon</Typography>}
                    {/* <ActiveRounds project={project} isLoading={isLoading} /> */}
                  </Box>

                </>}

              {tabValue === 2 && <>
                <Typography variant="h4" fontWeight="700">
                  Tokenomics
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography color="text.secondary">
                    Token Name:
                    <Typography
                      component="span"
                      color="text.primary"
                      sx={{ fontWeight: '700' }}
                    >
                      {' '}
                      {project.tokenomics.tokenName}
                    </Typography>
                  </Typography>
                  <Typography color="text.secondary">
                    Token Ticker:
                    <Typography
                      component="span"
                      color="text.primary"
                      sx={{ fontWeight: '700' }}
                    >
                      {' '}
                      {project.tokenomics.tokenTicker}
                    </Typography>
                  </Typography>
                  <Typography color="text.secondary">
                    Max Supply:
                    <Typography
                      component="span"
                      color="text.primary"
                      sx={{ fontWeight: '700' }}
                    >
                      {' '}
                      {project.tokenomics.totalTokens.toLocaleString(navigator.language, {
                        maximumFractionDigits: 0,
                      })}
                    </Typography>
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h5">
                    Visual Breakdown
                  </Typography>
                  {project.tokenomics.tokenomics.length > 0 ? (
                    <Tokenomics data={project?.tokenomics?.tokenomics} />
                  ) : <Typography>Coming soon</Typography>}
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h5">
                    Vesting Schedule
                  </Typography>
                  {project.tokenomics.tokenomics.length > 0 ? (
                    <Distribution
                      data={project.tokenomics.tokenomics}
                    />
                  ) : <Typography>Coming soon</Typography>}
                </Box>
              </>}
            </Box>
          </Container >
          : <Container sx={{ textAlign: 'center', py: '20vh' }}>
            <Typography variant="h1">
              404
            </Typography>
            <Typography variant="body1" sx={{ mb: '24px' }}>
              This Project Could Not Be Found
            </Typography>
            <Typography variant="body1">
              The project you are looking for does not exist, has been removed, name changed, or is temporarily unavailable.
            </Typography>
            <Link href="/projects">
              Back to projects page
            </Link>
          </Container>
      }
    </>
  );
};

export default Project;
