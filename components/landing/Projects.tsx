import React, { FC, useRef } from 'react';
import type { NextPage } from 'next'
import {
  Container,
  Typography,
  useTheme,
  useMediaQuery,
  Grid as MuiGrid,
  Button,
  Card,
  CardActions,
  CardHeader,
  CardContent,
  CardMedia,
  Box,
  IconButton
} from '@mui/material'
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Autoplay, Navigation, Pagination, Grid } from 'swiper';
import "swiper/css";
import "swiper/css/grid";
import "swiper/css/pagination";
import "swiper/css/navigation";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { v4 as uuidv4 } from 'uuid';

const projectsList = [
  {
    title: 'Blockheads',
    tagline: 'Tagline about blockheads, they are so cool.',
    imageUrl: '/projects/blockheads.png',
    category: 'NFT',
    status: 'Upcoming', // 'In Progress', 'Complete'
    blockchains: ['Cardano', 'Ergo']
  },
  {
    title: 'Ergopad',
    tagline: 'A great launchpad on Ergo',
    imageUrl: '/projects/ergopad.jpg',
    category: 'Launchpad',
    status: 'In Progress', // 'In Progress', 'Complete'
    blockchains: ['Cardano']
  },
  {
    title: 'Paideia',
    tagline: 'DAO Management software suite',
    imageUrl: '/projects/paideia.png',
    category: 'DAO Software',
    status: 'Complete', // 'In Progress', 'Complete'
    blockchains: ['Cardano', 'Ergo']
  },
  {
    title: 'CyberVerse',
    tagline: 'Home of the cyberpixels',
    imageUrl: '/projects/cyberverse.png',
    category: 'Game',
    status: 'Complete', // 'In Progress', 'Complete'
    blockchains: ['Cardano', 'Ergo']
  },
]

interface IProjectCard {
  title: string;
  tagline: string;
  imageUrl: string;
  category: string;
  status: string;
  blockchains: string[];
}



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

  const handlePrev = () => {
    if (swiperRef.current) {
      swiperRef.current.swiper.slidePrev();
    }
  };

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
              <Button variant="contained" color="secondary">
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
                  {projectsList.map((item, i) => {
                    const uuid = uuidv4()
                    return (
                      <SwiperSlide key={uuid}>
                        <ProjectCard {...item} />
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

const ProjectCard: FC<IProjectCard> = ({
  title,
  tagline,
  imageUrl,
  category,
  status,
  blockchains
}) => {
  return (
    <Card>
      <CardMedia
        component="img"
        image={imageUrl}
        alt={`${title} Banner`}
        sx={{ height: '240px' }}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography
            component="h5"
            variant="h5"
          >
            {title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" component="div">
            {tagline}
          </Typography>
        </CardContent>
      </Box>
    </Card>
  )
}