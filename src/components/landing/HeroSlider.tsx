import React, { FC, useRef, useState, useEffect } from "react";
import {
  Container,
  Typography,
  useTheme,
  useMediaQuery,
  Button,
  Box,
  IconButton,
  Stack,
  Paper,
} from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Autoplay, Navigation, Pagination, Grid } from "swiper/modules";
import "swiper/css";
import "swiper/css/grid";
import "swiper/css/pagination";
import "swiper/css/navigation";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
// import ProjectCard from '@components/projects/ProjectCard';
import { trpc } from "@lib/utils/trpc";
import { slugify } from "@lib/utils/general";
import ButtonLink from "@components/ButtonLink";
// import Image from 'next/image';

SwiperCore.use([Navigation]);

type ExtendedSwiperRef = typeof Swiper & {
  swiper: SwiperCore;
};

const slides: THeroCarouselWithIds[] = [
  {
    id: 0,
    title: "Unstake now",
    subtitle:
      "Coinecta is no longer operating. We thank you for your support, but unfortunately the business was unable to gain enough traction. ",
    buttonTitle: "Unstake now",
    buttonLink: "staking/manage-stake",
    image: null,
    order: 0,
  },
];

const HeroSlider: FC = () => {
  const theme = useTheme();
  const upMd = useMediaQuery(theme.breakpoints.up("md"));
  const upSm = useMediaQuery(theme.breakpoints.up("sm"));
  const swiperRef = useRef<ExtendedSwiperRef | null>(null);
  const [projects, setProjects] = useState<IProjectDetails[]>([]);
  const { data: projectList } = trpc.project.getProjectList.useQuery({});
  const { data: carouselItems } = trpc.hero.getHeroItems.useQuery();

  useEffect(() => {
    if (projectList) {
      setProjects(
        projectList
          .filter((project) => project.frontPage)
          .map((item) => {
            const details: IProjectDetails = {
              title: item.name,
              slug: item.slug,
              tagline: item.shortDescription,
              category: "",
              imageUrl: item.bannerImgUrl,
              status: item.isLaunched ? "Complete" : "Upcoming", // 'In Progress', 'Complete'
              blockchains: item.blockchains,
            };
            return details;
          })
      );
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
    <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
      {(carouselItems || slides).length > 1 && (
        <Box sx={{ display: upMd ? "flex" : "none" }}>
          <IconButton onClick={handlePrev}>
            <KeyboardArrowLeftIcon />
          </IconButton>
        </Box>
      )}
      <Box sx={{ width: upMd ? "94%" : "100%" }}>
        <Box
          sx={{
            position: "relative",
            display: "block",
            "& .swiper": {
              // height: '100%',
            },
            "& .swiper-wrapper": {
              // pt: '70px',
              alignItems: "center", // Align slides vertically in the middle
              height: "calc(100vh - 70px)", // Ensure wrapper is full height to center correctly
              maxHeight: "630px",
              minHeight: "450px",
            },
            "& .swiper-slide": {
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              pb: "60px",
            },
            "& .swiper-button-next, .swiper-button-prev": {
              color: theme.palette.divider,
              "&:hover": {
                color: theme.palette.primary.main,
              },
            },
            "& .swiper-pagination-bullet": {
              background: theme.palette.text.secondary,
            },
            "& .swiper-pagination-bullet-active": {
              background: theme.palette.primary.main,
            },
          }}
        >
          <Swiper
            ref={swiperRef}
            pagination={{
              clickable: true,
            }}
            slidesPerView={1}
            spaceBetween={10}
            breakpoints={
              {
                // 640: {
                //   slidesPerView: 1,
                //   slidesPerGroup: 1,
                //   spaceBetween: 20,
                // },
              }
            }
            autoplay={{
              delay: 4000,
              disableOnInteraction: true,
            }}
            loop={true}
            // navigation
            modules={[Grid, Pagination, Navigation, Autoplay]}
            className="mySwiper"
          >
            {slides
              .sort((a, b) => a.order - b.order)
              .map((item) => {
                const slug = slugify(item.title);
                const Content: FC = () => {
                  return (
                    <>
                      <Typography variant="h2" fontWeight={600} gutterBottom>
                        {item.title}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          color: "rgba(23,21,21,1)",
                          fontWeight: 500,
                          mb: 3,
                        }}
                        paragraph
                      >
                        {item.subtitle}
                      </Typography>
                      <ButtonLink
                        variant="contained"
                        sx={{ fontSize: "18px" }}
                        href={item.buttonLink}
                      >
                        {item.buttonTitle}
                      </ButtonLink>
                    </>
                  );
                };
                const ImageComponent: FC<{ maxHeight?: number }> = ({
                  maxHeight,
                }) => {
                  if (item.image)
                    return (
                      <Paper
                        sx={{
                          maxWidth: "80%",
                          display: "inline-flex",
                          borderRadius: "8px",
                          // p: 1,
                          mx: "auto",
                          overflow: "hidden",
                          lineHeight: 0,
                        }}
                      >
                        <Box
                          sx={{
                            display: "inline-flex",
                            borderRadius: "8px",
                            overflow: "hidden",
                            maxHeight: maxHeight ? `${maxHeight}px` : "none",
                            width: "auto",
                            height: "auto",
                          }}
                        >
                          <img
                            src={item.image}
                            alt={`${item.title} image`}
                            style={{
                              maxHeight: maxHeight ? `${maxHeight}px` : "none",
                              maxWidth: "100%",
                              width: "auto",
                              height: "auto",
                            }}
                          />
                        </Box>
                      </Paper>
                    );
                  else return null;
                };
                return (
                  <SwiperSlide key={slug}>
                    {item.image ? (
                      upMd ? (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            p: 4,
                          }}
                        >
                          <Box sx={{ textAlign: "left", width: "50%" }}>
                            <Content />
                          </Box>
                          <Box
                            sx={{
                              justifyContent: "center",
                              alignItems: "center",
                              display: "flex",
                              width: "50%",
                            }}
                          >
                            <ImageComponent />
                          </Box>
                        </Box>
                      ) : (
                        <Box
                          maxWidth="md"
                          sx={{ mx: "auto", textAlign: "center" }}
                        >
                          <Box sx={{ mb: 2 }}>
                            <ImageComponent maxHeight={220} />
                          </Box>
                          <Content />
                        </Box>
                      )
                    ) : (
                      <Box
                        maxWidth="md"
                        sx={{ mx: "auto", textAlign: "center" }}
                      >
                        <Content />
                      </Box>
                    )}
                  </SwiperSlide>
                );
              })}
          </Swiper>
        </Box>
      </Box>
      {slides.length > 1 && (
        <Box sx={{ display: upMd ? "flex" : "none" }}>
          <IconButton onClick={handleNext}>
            <KeyboardArrowRightIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default HeroSlider;
