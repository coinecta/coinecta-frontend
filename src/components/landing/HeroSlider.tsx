import React, { FC, useRef, useState, useEffect } from 'react';
import {
  Container,
  Typography,
  useTheme,
  useMediaQuery,
  Button,
  Box,
  IconButton,
  Stack,
  Paper
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
import ButtonLink from '@components/ButtonLink';
import Image from 'next/image';

SwiperCore.use([Navigation]);

type ExtendedSwiperRef = typeof Swiper & {
  swiper: SwiperCore;
};

type HeroSlide = {
  title: string;
  subtitle: string;
  image?: string;
  buttonTitle: string;
  buttonLink: string;
}

interface IHeroSliderProps {

}

const slides: HeroSlide[] = [
  {
    title: 'Unlock the Cardano Community\'s Full Potential',
    subtitle: 'We believe the community is one of Cardano\'s greatest strengths. Working together, we can grow the ecosystem to provide inclusive financial services to the entire globe.',
    buttonTitle: 'Read the Whitepaper',
    buttonLink: 'https://docs.coinecta.fi'
  },
  {
    title: 'Coinecta FISO: Details & FAQ',
    subtitle: 'This article covers all the FISO details including dates, instructions on how to participate, and FAQs. ',
    image: '/testimage.jpg',
    buttonTitle: 'Read now',
    buttonLink: 'https://coinecta.medium.com/coinecta-fiso-details-faq-bd3b5a03991c',
  }
  // {
  //   title: 'Coinecta whitelist is open',
  //   subtitle: 'Coinecta whitelists are open until November 23rd. This article covers all the FISO details including dates, instructions on how to participate, and FAQs. ',
  //   image: '/sticker.png',
  //   buttonTitle: 'Sign up',
  //   buttonLink: '/projects/coinecta?tab=whitelist',
  // },
]

const HeroSlider: FC<IHeroSliderProps> = ({ }) => {
  const theme = useTheme()
  const upMd = useMediaQuery(theme.breakpoints.up('md'))
  const upSm = useMediaQuery(theme.breakpoints.up('sm'))
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
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <Box sx={{ display: upMd ? 'flex' : 'none' }}>
        <IconButton onClick={handlePrev}>
          <KeyboardArrowLeftIcon />
        </IconButton>
      </Box>
      <Box sx={{ width: upMd ? '94%' : '100%' }}>
        <Box
          sx={{
            position: 'relative',
            display: 'block',
            '& .swiper': {
              // height: '100%',
            },
            '& .swiper-wrapper': {
              // pt: '70px',
              alignItems: 'center', // Align slides vertically in the middle
              height: 'calc(100vh - 70px)', // Ensure wrapper is full height to center correctly
              maxHeight: '630px',
              minHeight: '450px'
            },
            '& .swiper-slide': {
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              pb: '60px',
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
              const Content: FC = () => {
                return (
                  <>
                    <Typography
                      variant="h2"
                      fontWeight={600}
                      gutterBottom
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'rgba(23,21,21,1)',
                        fontWeight: 500,
                        mb: 3
                      }}
                      paragraph
                    >
                      {item.subtitle}
                    </Typography>
                    <ButtonLink
                      variant="contained"
                      sx={{ fontSize: '18px' }}
                      href={item.buttonLink}
                    >
                      {item.buttonTitle}
                    </ButtonLink>
                  </>
                )
              }
              const ImageComponent: FC<{ maxHeight?: number }> = ({ maxHeight }) => {
                const imageStyle: React.CSSProperties = {
                  height: '100%', // Make height of the image fill the Box
                  maxWidth: '100%', // Make sure the image is not wider than the Box
                  width: 'auto', // Adjust width automatically
                  display: 'block', // Display block to avoid inline extra space
                  borderRadius: '8px', // Apply border radius if needed for the image itself
                  objectFit: 'contain', // Ensures the aspect ratio is maintained without cropping
                };

                if (item.image) return (
                  <Paper
                    sx={{
                      maxWidth: '80%',
                      display: 'inline-flex',
                      borderRadius: '8px',
                      // p: 1,
                      mx: 'auto',
                      overflow: 'hidden',
                      lineHeight: 0,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'inline-flex',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        maxHeight: maxHeight ? `${maxHeight}px` : 'none',
                        width: 'auto',
                        height: 'auto',
                      }}
                    >
                      <img
                        src={item.image}
                        alt={`${item.title} image`}
                        style={{
                          maxHeight: maxHeight ? `${maxHeight}px` : 'none',
                          maxWidth: '100%',
                          width: 'auto',
                          height: 'auto',
                        }}
                      />
                    </Box>
                  </Paper>
                )
                else return null
              }
              return (
                <SwiperSlide key={slug}>
                  {item.image
                    ? upMd
                      ? <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          p: 4
                        }}
                      >
                        <Box sx={{ textAlign: 'left', width: '50%' }}>
                          <Content />
                        </Box>
                        <Box
                          sx={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            display: 'flex',
                            width: '50%'
                          }}
                        >
                          <ImageComponent />
                        </Box>
                      </Box>
                      : <Box maxWidth="md" sx={{ mx: 'auto', textAlign: 'center' }}>
                        <Box sx={{ mb: 2 }}>
                          <ImageComponent maxHeight={220} />
                        </Box>
                        <Content />
                      </Box>
                    : <Box maxWidth="md" sx={{ mx: 'auto', textAlign: 'center' }}>
                      <Content />
                    </Box>
                  }
                </SwiperSlide>
              )
            })}
          </Swiper>
        </Box>
      </Box>
      <Box sx={{ display: upMd ? 'flex' : 'none' }}>
        <IconButton onClick={handleNext}>
          <KeyboardArrowRightIcon />
        </IconButton>
      </Box>
    </Box >
  );
};

export default HeroSlider;