import { Typography, Box, Container, Grid, useTheme } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { useEffect, useState } from "react";
import axios from "axios";
import ProjectCard from "@components/projects/ProjectCard";
import SearchBar from "@components/SearchBar";
import { trpc } from '@lib/utils/trpc';

const Projects = () => {
  const theme = useTheme()
  // loading spinner for submit button
  const [projects, setProjects] = useState<IProjectDetails[]>([]);
  const [searchString, setSearchString] = useState('')
  const { data: projectList } = trpc.project.getProjectList.useQuery({});

  useEffect(() => {
    if (projectList) {
      setProjects(
        projectList.map((item) => {
          const details: IProjectDetails = {
            title: item.name,
            tagline: item.shortDescription,
            category: '',
            imageUrl: item.bannerImgUrl,
            status: item.isLaunched
              ? "Complete"
              : "Upcoming", // 'In Progress', 'Complete'
            blockchains: item.blockchains
          }
          return (details)
        }))
    }
  }, [projectList]);

  const filteredProjects = projects?.filter((project: IProjectDetails) =>
    project.title.toLowerCase().includes(searchString.toLowerCase())
  );
  const launchedProjects = filteredProjects?.filter(
    (project: IProjectDetails) => project.status === "Complete"
  );
  const upcomingProjects = filteredProjects?.filter(
    (project: IProjectDetails) => project.status === "Upcoming"
  );

  return (
    <>
      <Container maxWidth="md" sx={{ py: 3 }}>
        {/* <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 600, textAlign: 'center' }}>
          Projects on Coinecta
        </Typography> */}
        <Box sx={{ display: "flex", width: "100%", justifyContent: "center" }}>
          <SearchBar searchString={searchString} setSearchString={setSearchString} />
        </Box>
      </Container>
      <Container sx={{ mt: 1 }}>

        {upcomingProjects.length > 0 &&
          <>
            <Typography variant="h4" sx={{ fontWeight: "800", mb: 4 }}>
              Upcoming IDOs
            </Typography>
            <Grid container spacing={3} alignItems="center" sx={{ mb: 6 }}>
              {upcomingProjects.map((item: IProjectDetails) => {
                return (
                  <Grid item xs={12} md={6} lg={4} key={item.title}>
                    <ProjectCard {...item} link={`/projects/${item.title.toLowerCase().replace(/[\s-]/g, "")}`} />
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
                    <ProjectCard {...item} link={`/projects/${item.title.toLowerCase().replace(/[\s-]/g, "")}`} />
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
