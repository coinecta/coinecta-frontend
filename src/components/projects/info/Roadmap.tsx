import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import Typography from '@mui/material/Typography';
import Icon from '@mui/material/Icon';
import dayjs from 'dayjs';
import { Paper, useMediaQuery, useTheme } from '@mui/material';

const Roadmap = (data: any) => {
  const theme = useTheme()
  const desktop = useMediaQuery(theme.breakpoints.up('md'))
  const timelineItems = data
    ? data.data.map((roadmap: any) => {
      return { ...roadmap, date: Date.parse(roadmap.date) };
    })
    : [];
  return (
    <Timeline position={desktop ? "alternate" : "right"}
      sx={{
        // '& .MuiTimelineItem-root:last-child': {
        //   '& .MuiTimelineContent-root .MuiPaper-root': {
        //     mb: 0
        //   }
        // },
        ...(!desktop && {
          '& li': {
            '&::before': {
              display: 'none'
            },
            '& .MuiTimelineContent-root': {
              pr: 0
            }
          },
          pr: 0
        })
      }}
    >
      {timelineItems.map((item: any) => {
        const itemTime = dayjs(item.date).format('MMMM YYYY')
        return (
          <TimelineItem
            key={item.name}
          >
            <TimelineSeparator>
              <TimelineDot />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Paper variant="outlined" sx={{ p: 2, mt: -2, mb: 3 }}>
                <Typography variant="h5" sx={{ mb: 1 }}>
                  {item.name}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {itemTime}
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1rem', mb: 1 }}>
                  {item.description}
                </Typography>

              </Paper>
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
};

export default Roadmap;
