import React, { FC, useRef, useState, useEffect } from 'react';
import {
  Container,
  Typography,
  useTheme,
  useMediaQuery,
  Button,
  Box,
  IconButton,
  Stack
} from '@mui/material'
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from 'swiper';
import { Autoplay, Navigation, Pagination, Grid } from 'swiper/modules'
import "swiper/css";
import "swiper/css/grid";
import "swiper/css/pagination";
import "swiper/css/navigation";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import ProjectCard from '@components/projects/ProjectCard';
import { trpc } from '@lib/utils/trpc';
import { slugify } from '@lib/utils/general';

SwiperCore.use([Navigation]);

type ExtendedSwiperRef = typeof Swiper & {
  swiper: SwiperCore;
};

type HeroSlide = {
  title: string;
  subtitle: string;
  button1title: string;
  button1link: string;
  button2title?: string;
  button2link?: string;
}

interface IHeroSliderProps {

}

const slides: HeroSlide[] = [
  {
    title: 'Unlock the Cardano Community\'s Full Potential',
    subtitle: 'We believe the community is one of Cardano\'s greatest strengths. Working together, we can grow the ecosystem to provide inclusive financial services to the entire globe.',
    button1title: 'Support an IDO',
    button1link: '/projects',
    button2title: 'Read the Whitepaper',
    button2link: 'https://docs.coinecta.fi'
  },
  {
    title: 'Read about the Coinecta FISO',
    subtitle: 'This article covers all the FISO details including dates, instructions on how to participate, and FAQs. ',
    button1title: 'Read the article',
    button1link: '/projects',
  },
]

const HeroSlider: FC<IHeroSliderProps> = ({ }) => {
  const theme = useTheme()
  const upMd = useMediaQuery(theme.breakpoints.up('md'))
  const swiperRef = useRef<ExtendedSwiperRef | null>(null);
  const [projects, setProjects] = useState<IProjectDetails[]>([]);
  const { data: projectList } = trpc.project.getProjectList.useQuery({});

  useEffect(() => {
    if (projectList) {
      setProjects(
        projectList.filter(project => project.frontPage).map((item) => {
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
      <Box sx={{ display: upMd ? 'flex' : 'none', width: '3%', position: 'relative' }}>
        <IconButton onClick={handlePrev} sx={{ position: 'absolute', top: '45%', transform: 'translateY(-45%)' }}>
          <KeyboardArrowLeftIcon />
        </IconButton>
      </Box>
      <Box sx={{ width: upMd ? '94%' : '100%' }}>
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
              // 640: {
              //   slidesPerView: 1,
              //   slidesPerGroup: 1,
              //   spaceBetween: 20,
              // },
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
            {slides.map((item) => {
              const slug = slugify(item.title)
              return (
                <SwiperSlide key={slug}>
                  <Box maxWidth="md" sx={{ mx: 'auto' }}>
                    <Typography
                      variant="h2"
                      fontWeight={600}
                      align="center"
                      gutterBottom
                    >
                      {item.title}
                    </Typography>
                    <Typography variant="h6" align="center" sx={{ color: 'rgba(23,21,21,1)' }} paragraph>
                      {item.subtitle}
                    </Typography>
                    <Stack
                      sx={{ pt: 3 }}
                      direction="row"
                      spacing={2}
                      justifyContent="center"
                    >
                      <Button variant="contained" href={item.button1link}>{item.button1title}</Button>
                      <Button variant="outlined" href={item.button2link}>{item.button2title}</Button>
                    </Stack>
                  </Box>
                </SwiperSlide>
              )
            })}
          </Swiper>
        </Box>
      </Box>
      <Box sx={{ display: upMd ? 'flex' : 'none', width: '3%', position: 'relative' }}>
        <IconButton onClick={handleNext} sx={{ position: 'absolute', top: '45%', transform: 'translateY(-45%)' }}>
          <KeyboardArrowRightIcon />
        </IconButton>
      </Box>
    </>
  );
};

export default HeroSlider;