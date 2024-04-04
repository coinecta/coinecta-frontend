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
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from 'swiper';
import { Autoplay, Navigation, Pagination, Grid } from 'swiper/modules'
import "swiper/css";
import "swiper/css/grid";
import "swiper/css/pagination";
import "swiper/css/navigation";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ProjectCard from '@components/projects/ProjectCard';
import { trpc } from '@lib/utils/trpc';
import { slugify } from '@lib/utils/general';

SwiperCore.use([Navigation]);

type ExtendedSwiperRef = typeof Swiper & {
  swiper: SwiperCore;
};

interface IProjectsProps {

}

const Projects: FC<IProjectsProps> = ({ }) => {
  const theme = useTheme()
  const upMd = useMediaQuery(theme.breakpoints.up('md'))
  const swiperRef = useRef<ExtendedSwiperRef | null>(null);
  const [projects, setProjects] = useState<IProjectDetails[]>([]);
  const { data: projectList } = trpc.project.getProjectList.useQuery({});

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

  // const handlePrev = () => {
  //   if (swiperRef.current) {
  //     swiperRef.current.swiper.slidePrev();
  //   }
  // };

  const handleNext = () => {
    if (swiperRef.current) {
      swiperRef.current.swiper.slideNext();
    }
  };
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
              <Box
                sx={{
                  position: 'relative',
                  display: 'block',
                  '& .swiper-slide': {
                    pb: 6
                  },
                  '& .swiper-button-next, .swiper-button-prev': {
                    color: theme.palette.divider,
                    '&:hover': {
                      color: theme.palette.primary.main,
                    }
                  },
                  '& .swiper-pagination-bullet': {
                    background: theme.palette.text.secondary,
                  },
                  '& .swiper-pagination-bullet-active': {
                    background: theme.palette.primary.main,
                  }
                }}
              >
                <Swiper
                  ref={swiperRef}
                  pagination={{
                    clickable: true,
                  }}
                  slidesPerView={1}
                  spaceBetween={10}
                  breakpoints={{
                    640: {
                      slidesPerView: 2,
                      slidesPerGroup: 2,
                      spaceBetween: 20,
                    },
                  }}
                  autoplay={{
                    delay: 4000,
                    disableOnInteraction: true,
                  }}
                  loop={true}
                  // navigation
                  modules={[Grid, Pagination, Navigation, Autoplay]}
                  className="mySwiper"
                >
                  {
                    projects // Create a shallow copy of the projects array to avoid mutating the original
                      .map((item: IProjectDetails) => {
                        const slug = slugify(item.title)
                        return (
                          <SwiperSlide key={slug} style={{ height: '100%' }}>
                            <ProjectCard {...item} link={`/projects/${item.slug}`} />
                          </SwiperSlide>
                        )
                      })}
                </Swiper>
              </Box>
            </MuiGrid>
          </MuiGrid>
        </Box>
        <Box sx={{ display: upMd ? 'flex' : 'none', width: '3%', position: 'relative' }}>
          <IconButton onClick={handleNext} sx={{ position: 'absolute', top: '45%', transform: 'translateY(-45%)' }}>
            <KeyboardArrowRightIcon />
          </IconButton>
        </Box>
      </Container >
    </>
  );
};

export default Projects;