import React, { FC, useEffect, useState, useRef } from "react";
import { Button, Container, Box, Fab, Grid, IconButton } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

interface SliderProps {
  buttonTop?: boolean;
  noButton?: boolean;
  uniqueId: string;
  addMargin?: number;
  contained?: boolean;
  header?: JSX.Element;
  children: React.ReactNode;
}

const CardSlider: FC<SliderProps> = ({
  children,
  buttonTop,
  uniqueId,
  addMargin,
  contained,
  header,
  noButton
}) => {
  const [marginLeftCalc, setMarginLeftCalc] = useState({ px: "0px" });
  const [scrollPosition, setScrollPosition] = useState(0);
  const [leftDisabled, setLeftDisabled] = useState(false);
  const [rightDisabled, setRightDisabled] = useState(false);
  const [slideDistance, setSlideDistance] = useState(460);
  const [setArrow, setSetArrow] = useState("grab")
  const [temp, setTemp] = useState(true)

  useEffect(() => {
    temp ? setSetArrow("grab") : setSetArrow("arrow")
  },[temp])

  const handleScroll = () => {
    const scroll: HTMLElement | null = document.getElementById(
      uniqueId + "pnProductNav"
    );
    scroll && setScrollPosition(scroll.scrollLeft);
  };

  const determineOverflow = (content: any, container: any) => {
    const containerMetrics = container.getBoundingClientRect();

    const containerMetricsRight = Math.floor(containerMetrics.right);
    const containerMetricsLeft = Math.floor(containerMetrics.left);
    const contentMetrics = content.getBoundingClientRect();
    const contentMetricsRight = Math.floor(contentMetrics.right);
    const contentMetricsLeft = Math.floor(contentMetrics.left);

    if (
      containerMetricsLeft > contentMetricsLeft &&
      containerMetricsRight < contentMetricsRight
    ) {
      setLeftDisabled(false);
      setRightDisabled(false);
      setTemp(true)
    } else if (containerMetricsLeft > contentMetricsLeft) {
      setRightDisabled(true);
      setLeftDisabled(false);
      setTemp(true)
    } else if (containerMetricsRight < contentMetricsRight) {
      setLeftDisabled(true);
      setRightDisabled(false);
      setTemp(true)
    } else {
      setLeftDisabled(true);
      setRightDisabled(true);
      setTemp(false)
    }

    // console.log('containerMetricsLeft: ' + containerMetricsLeft)
    // console.log('contentMetricsLeft: ' + contentMetricsLeft)
    // console.log('containerMetricsRight: ' + containerMetricsRight)
    // console.log('contentMetricsRight: ' + contentMetricsRight)
    // console.log('leftDisabled: ' + leftDisabled)
    // console.log('rightDisabled: ' + rightDisabled)
  };

  const marginFunction = () => {
    const pnArrowContainer = document.getElementById(
      uniqueId + "pnArrowContainer"
    );
    let margin = 24;
    if (!contained && pnArrowContainer) {
      margin =
        pnArrowContainer.getBoundingClientRect().left +
        (addMargin ? addMargin : 0);
    }
    setMarginLeftCalc({ ...marginLeftCalc, px: margin.toString() + "px" });
    const containerWidth = document.getElementById("setWidth");
    containerWidth && setSlideDistance(containerWidth.offsetWidth - margin);
  };

  useEffect(() => {
    const pnProductNav = document.getElementById(uniqueId + "pnProductNav");
    if (pnProductNav) {
      pnProductNav.addEventListener("scroll", handleScroll);
      return () => {
        pnProductNav.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  const navPosition = () => {
    const pnProductNav = document.getElementById(uniqueId + "pnProductNav");
    const pnProductNavContents = document.getElementById(
      uniqueId + "pnProductNavContents"
    );
    determineOverflow(pnProductNavContents, pnProductNav);
  }

  useEffect(() => {
    navPosition()
  }, [scrollPosition]);

  useEffect(() => {
    window.addEventListener("resize", marginFunction);
    window.addEventListener("resize", navPosition);
    marginFunction();
    navPosition();
    return () => {
      window.removeEventListener("resize", marginFunction);
      window.removeEventListener("resize", navPosition);
    }
  }, []);

  interface IPos {
    left: number | undefined;
    x: number | undefined;
  }

  const [pos, setPos] = useState<IPos>({
    left: undefined,
    x: undefined,
  });

  const posRef = useRef<IPos>({
    left: undefined,
    x: undefined,
  });
  posRef.current = pos;

  const handleMouseDown = (e: any) => {
    const pnProductNav = document.getElementById(uniqueId + "pnProductNav");
    if (pnProductNav) {
      setSetArrow("grabbing")

      const mouseMoveHandler = (e: any) => {
        // @ts-ignore
        pnProductNav.scrollLeft = posRef.current.left - (e.clientX - posRef.current.x);
        setSetArrow("grabbing")
      };

      const mouseUpHandler = (e: any) => {
        setSetArrow("grab")
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
      };

      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);
    }
    setPos({
      // The current scroll
      left: scrollPosition,
      // Get the current mouse position
      x: e.clientX,
    });
  };

  const clickLeft = () => {
    const pnProductNav = document.getElementById(uniqueId + "pnProductNav");
    pnProductNav &&
      pnProductNav.scrollTo({
        left: scrollPosition - slideDistance,
        behavior: "smooth",
      });
  };

  const clickRight = () => {
    const pnProductNav = document.getElementById(uniqueId + "pnProductNav");
    pnProductNav &&
      pnProductNav.scrollTo({
        left: scrollPosition + slideDistance,
        behavior: "smooth",
      });
  };

  const ButtonBox: FC = () => {
    return (
      <Container
        id={uniqueId + "pnArrowContainer"}
        // maxWidth="lg"
        sx={{
          my: buttonTop ? "0" : "32px",
          p: 0,
          mb: '24px'
        }}
      >
        <Box
          sx={
            noButton ? { display: 'none' } :
              buttonTop
                ? {
                  // display: "block",
                  // alignItems: "center",
                  mt: ".75rem",
                  mb: ".25rem",
                  mx: { xs: "24px", sm: "0px" },
                }
                : {
                  mx: { xs: "24px", sm: "0px" },
                }
          }
        >
          <Grid container justifyContent="space-between" >
            <Grid item sm={9}>
              {header && header}
            </Grid>
            <Grid item sm={3} sx={{ textAlign: 'right' }}>
              <IconButton 
                onClick={clickLeft}
                disabled={leftDisabled}
                size="small"
                color="primary"
                sx={{
                  mr: ".5rem",
                  display: (leftDisabled && rightDisabled) ? 'none' : 'inline-block',
                }}
              >
                <ArrowBackIosIcon sx={{ ml: ".5rem" }} />
              </IconButton>
              <IconButton
                onClick={clickRight}
                disabled={rightDisabled}
                size="small"
                color="primary"
                sx={{
                  display: (leftDisabled && rightDisabled) ? 'none' : 'inline-block'
                }}
              >
                <ArrowForwardIosIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Box>
      </Container>
    );
  };

  return (
    <>
      <Container
        maxWidth="lg"
        id="setWidth"
        sx={{ zIndex: "1", width: "100vw" }}
      ></Container>
      {buttonTop ? <ButtonBox /> : (
        header && (
          <Box sx={{ mb: '24px' }}>
            {header}
          </Box>
        )
      )}
      <Box
        sx={{
          /* Make this scrollable when needed */
          overflowX: "auto",
          /* We don't want vertical scrolling */
          overflowY: "hidden",
          cursor: setArrow,
          userSelect: (setArrow == 'grab' || setArrow == 'grabbing') ? 'none' : 'auto',
          /* Make an auto-hiding scroller for the 3 people using a IE */
          msOverflowStyle: "-ms-autohiding-scrollbar",
          /* For WebKit implementations, provide inertia scrolling */
          WebkitOverflowScrolling: "touch",
          /* We don't want internal inline elements to wrap */
          whiteSpace: "nowrap",
          /* Remove the default scrollbar for WebKit implementations */
          "&::-webkit-scrollbar": {
            display: "none",
          },
          maxWidth: buttonTop ? "100%" : "100vw",
          ml: contained ? "-24px" : "0",
        }}
        id={uniqueId + "pnProductNav"}
        onMouseDown={(e) => !(leftDisabled && rightDisabled) && handleMouseDown(e)}
      >
        <Box
          id={uniqueId + "pnProductNavContents"}
          display="flex"
          sx={{
            width: "min-content",
            gap: "24px",
            ...marginLeftCalc,
          }}
        >
          {children}
        </Box>
      </Box>
      {!buttonTop && <ButtonBox />}
    </>
  );
};

export default CardSlider;
