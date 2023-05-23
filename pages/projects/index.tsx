import { Typography, Box, Container, Grid, useTheme } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { useEffect, useState } from "react";
import axios from "axios";
import { useWhitelistProjects } from "../../hooks/useWhitelistProjects";
import { useContributionProjects } from "../../hooks/useContributionProjects";
import ProjectCard from "@components/projects/ProjectCard";
import { ActiveProjectCard } from "@components/projects/ActiveProjectCard";
import { IProject } from "./[project_id]";
import SearchBar from "@components/SearchBar";
import { v4 as uuidv4 } from 'uuid';

interface IProjectDetails {
  title: string;
  tagline: string;
  imageUrl: string;
  category: string;
  status: "Complete" | "Upcoming";
  blockchains: string[];
}

const Projects = () => {
  const theme = useTheme()
  // loading spinner for submit button
  const [isLoading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [searchString, setSearchString] = useState('')

  useEffect(() => {
    const getProjects = async () => {
      try {
        const res = await axios.get(`${process.env.API_URL}/projects/`);
        setProjects(
          res.data.filter((project: IProject) => project.name.toLowerCase().startsWith('cardano-'))
            .map((item: IProject) => {
              const projectName = item.name.replace(/cardano-(x-)?/, "")
              const category = item.fundsRaised === 9090
                ? "Launchpad"
                : "IDO"
              const details = {
                title: projectName,
                tagline: item.shortDescription,
                imageUrl: item.bannerImgUrl,
                category: category,
                status: item.isLaunched
                  ? "Complete"
                  : "Upcoming", // 'In Progress', 'Complete'
                blockchains: item.name.includes("cardano-x-")
                  ? ['Cardano', 'Ergo']
                  : ['Cardano']
              }
              return (details)
            })
        )
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };

    getProjects();
  }, []);

  const filteredProjects = projects?.filter((project: IProjectDetails) =>
    project.title.toLowerCase().includes(searchString.toLowerCase())
  );
  const launchedProjects = filteredProjects?.filter(
    (project: IProjectDetails) => project.status === "Complete"
  );
  const upcomingProjects = filteredProjects?.filter(
    (project: IProjectDetails) => project.status === "Upcoming"
  );
  const { whiteListProjectsActive, isLoading: whiteListProjectsIsLoading } =
    useWhitelistProjects();
  const {
    contributionProjectsActive,
    isLoading: contributionProjectsIsLoading,
  } = useContributionProjects();

  return (
    <>
      <Container maxWidth="md" sx={{ py: 12 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 600, textAlign: 'center' }}>
          Projects on Coinecta
        </Typography>
        <Box sx={{ display: "flex", width: "100%", justifyContent: "center" }}>
          <SearchBar searchString={searchString} setSearchString={setSearchString} />
        </Box>
      </Container>
      <Container sx={{ mt: 1 }}>
        {isLoading && (
          <CircularProgress
            size={24}
            sx={{
              position: "absolute",
              left: "50%",
              marginLeft: "-12px",
              marginTop: "72px",
            }}
          />
        )}
        {contributionProjectsActive?.length !== 0 ||
          whiteListProjectsActive?.length !== 0 ? (
          <>
            <Typography variant="h4" sx={{ fontWeight: "800", mb: 4 }}>
              Active Rounds
            </Typography>
            <Grid container spacing={3} alignItems="stretch" sx={{ mb: 6 }}>
              {contributionProjectsActive?.map((project: any) => (
                <ActiveProjectCard
                  key={project.id}
                  type="contribution"
                  project={project}
                />
              ))}
              {whiteListProjectsActive?.map((project: any) => (
                <ActiveProjectCard
                  key={project.id}
                  type="whitelist"
                  project={project}
                />
              ))}
            </Grid>
          </>
        ) : null}
        {upcomingProjects.length > 0 &&
          <>
            <Typography variant="h4" sx={{ fontWeight: "800", mb: 4 }}>
              Upcoming IDOs
            </Typography>
            <Grid container spacing={3} alignItems="center" sx={{ mb: 6 }}>
              {upcomingProjects.map((item: IProjectDetails) => {
                return (
                  <Grid item xs={12} md={6} lg={4} key={item.title}>
                    <ProjectCard {...item} link={`/projects/${item.title}`} />
                  </Grid>
                )
              })}
            </Grid>
          </>
        }
        {launchedProjects.length > 0 &&
          <>
            <Typography variant="h4" sx={{ fontWeight: "800", mb: 4 }}>
              Completed
            </Typography>
            <Grid container spacing={3} alignItems="center" sx={{ mb: 6 }}>
              {launchedProjects.map((item: IProjectDetails) => {
                return (
                  <Grid item xs={12} md={6} lg={4} key={item.title}>
                    <ProjectCard {...item} link={`/projects/${item.title}`} />
                  </Grid>
                )
              })}
            </Grid>
          </>
        }
      </Container>
    </>
  );
};

export default Projects;
