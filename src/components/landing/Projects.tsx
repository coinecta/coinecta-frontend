import React, { FC, useRef, useState, useEffect } from 'react';
import {
  Container,
  Typography,
  useTheme,
  useMediaQuery,
  Grid as MuiGrid,
  Button,
  Box,
  IconButton
} from '@mui/material'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ProjectCard from '@components/projects/ProjectCard';
import { trpc } from '@lib/utils/trpc';
import { slugify } from '@lib/utils/general';
import Slider from "react-slick";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface IProjectsProps {

}

const Projects: FC<IProjectsProps> = ({ }) => {
  const theme = useTheme()
  const upMd = useMediaQuery(theme.breakpoints.up('md'))
  const [projects, setProjects] = useState<IProjectDetails[]>([]);
  const { data: projectList } = trpc.project.getProjectList.useQuery({});
  const sliderRef = useRef<Slider | null>(null);

  const next = () => {
    sliderRef.current?.slickNext();
  };
  const previous = () => {
    sliderRef.current?.slickPrev();
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    autoplaySpeed: 3000,
    slidesToShow: 2,
    slidesToScroll: 2,
    adaptiveHeight: false,
    arrows: false,
    responsive: [
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  useEffect(() => {
    if (projectList) {
      setProjects(
        projectList.filter(project => project.frontPage && !project.isDraft).map((item) => {
          const details: IProjectDetails = {
            title: item.name,
            slug: item.slug,
            tagline: item.shortDescription,
            category: '',
            imageUrl: item.bannerImgUrl,
            status: item.isLaunched
              ? "Complete"
              : "Upcoming", // 'In Progress', 'Complete'
            blockchains: item.blockchains
          }
          return (details)
        })
          .sort((a, b) => {
            if (a.status === b.status) {
              return 0; // Keep original order if the status is the same
            }
            if (a.status === "Upcoming") {
              return -1; // "upcoming" should come first
            }
            if (b.status === "Upcoming") {
              return 1; // "upcoming" in b should come before a
            }
            if (a.status === "Complete") {
              return -1; // "complete" should come after "upcoming" but before other statuses if any
            }
            if (b.status === "Complete") {
              return 1; // "complete" in b should come after "upcoming" in a
            }
            return 0; // Fallback in case there are more statuses and the comparison didn't match above
          }))
    }
  }, [projectList]);

  return (
    <>
      <Container sx={{ mb: 12, display: 'flex', flexDirection: 'row', alignItems: 'stretch' }}>
        <Box sx={{ width: upMd ? '97%' : '100%' }}>
          <MuiGrid container spacing={3} sx={{ mb: 3 }}>
            <MuiGrid item md={3}>
              <Typography
                variant="h2"
                fontWeight={600}
              // align="center"
              // gutterBottom
              >
                Projects
              </Typography>
              <Typography variant="subtitle1" sx={{ mb: 3 }}>Check out the upcoming and past IDOs</Typography>
              <Button variant="contained" color="secondary" href="/projects">
                All Projects
              </Button>
            </MuiGrid>
            <MuiGrid item md={9} sx={{ maxWidth: '100%', }}>
              <Box className="slider-container" sx={{
                '& .slick-dots li button:before': {
                  pt: 1,
                  color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)'
                },
                '& .slick-dots li.slick-active button:before': {
                  color: theme.palette.primary.main
                },
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}>
                <Slider {...sliderSettings} ref={sliderRef}>
                  {projects.map((item: IProjectDetails) => {
                    const slug = slugify(item.title)
                    return (
                      <div key={slug} style={{ display: 'flex', height: '100%' }}>
                        <ProjectCard {...item} link={`/projects/${item.slug}`} />
                      </div>
                    )
                  })}
                </Slider>
              </Box>
            </MuiGrid>
          </MuiGrid>
        </Box>
        <Box sx={{ display: upMd ? 'flex' : 'none', width: '3%', position: 'relative' }}>
          <IconButton onClick={next} sx={{ position: 'absolute', top: '45%', transform: 'translateY(-45%)' }}>
            <KeyboardArrowRightIcon />
          </IconButton>
        </Box>
      </Container >
    </>
  );
};

export default Projects;