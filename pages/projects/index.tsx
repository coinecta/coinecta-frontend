import { Typography, Box, Container, Grid, useTheme } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { useEffect, useState } from "react";
import axios from "axios";
import { useWhitelistProjects } from "../../hooks/useWhitelistProjects";
import { useContributionProjects } from "../../hooks/useContributionProjects";
import { ProjectCard } from "@components/projects/ProjectCard";
import { ActiveProjectCard } from "@components/projects/ActiveProjectCard";
import { IProject } from "./[project_id]";

const Projects = () => {
  const theme = useTheme()
  // loading spinner for submit button
  const [isLoading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const getProjects = async () => {
      try {
        const res = await axios.get(`${process.env.API_URL}/projects/`);
        setProjects(res.data.filter((project: IProject) => project.name.toLowerCase().startsWith('cardano-')))
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };

    getProjects();
  }, []);

  // const filteredProjects = projects?.filter((project: any) =>
  //   project.name?.toLowerCase().includes(search.toLowerCase())
  // );
  const filteredProjects = projects
  const launchedProjects = filteredProjects?.filter(
    (project: any) => project.isLaunched
  );
  const upcomingProjects = filteredProjects?.filter(
    (project: any) => !project.isLaunched
  );
  const { whiteListProjectsActive, isLoading: whiteListProjectsIsLoading } =
    useWhitelistProjects();
  const {
    contributionProjectsActive,
    isLoading: contributionProjectsIsLoading,
  } = useContributionProjects();

  return (
    <>
      <Container sx={{ mb: "3rem" }}>
    Title Here
        <Box sx={{ display: "flex", width: "100%", justifyContent: "center" }}>
          Add Search Here
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
        </Box>
      </Container>
      <Container maxWidth="lg" sx={{ mt: 1 }}>
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
        <Typography variant="h4" sx={{ fontWeight: "800", mb: 4 }}>
          Upcoming IDOs
        </Typography>
        <Grid container spacing={3} alignItems="stretch" sx={{ mb: 6 }}>
          {upcomingProjects?.map((project: any) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </Grid>
        <Typography variant="h4" sx={{ fontWeight: "800", mb: 4 }}>
          Completed
        </Typography>
        <Grid container spacing={3} alignItems="stretch" sx={{ mb: 6 }}>
          {launchedProjects?.map((project: any) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </Grid>
      </Container>
    </>
  );
};

export default Projects;
