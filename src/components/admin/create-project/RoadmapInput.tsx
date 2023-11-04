import React, { FC } from 'react';
import { Box, Button, Grid, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { formatDateForInput } from '@lib/utils/daytime';

interface IRoadmapInputProps {
  data: TRoadmap[];
  setData: (updatedData: TRoadmap[]) => void;
}

const RoadmapInput: FC<IRoadmapInputProps> = ({ data, setData }) => {

  const handleChange = (e: any, index: number) => {
    const updatedData = data.map((elem, i) => {
      if (index === i) {
        return {
          ...elem,
          [e.target.name]: e.target.value,
        };
      } else {
        return elem;
      }
    });
    setData(updatedData);
  };

  const handleChangeDate = (e: any, index: number) => {
    const updatedData = data.map((elem, i) => {
      if (index === i) {
        return {
          ...elem,
          [e.target.name]: new Date(e.target.value),
        };
      } else {
        return elem;
      }
    });
    setData(updatedData);
  };

  return (
    <>
      {data.map((roadmap, index) => {
        return (
          <Grid container key={index} spacing={1} sx={{ mb: 3 }}>
            <Grid item md={6} xs={12}>
              <TextField
                name="name"
                label="Event Name"
                fullWidth
                variant="filled"
                value={roadmap.name}
                onChange={(e) => handleChange(e, index)}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                name="date"
                label="Date"
                fullWidth
                variant="filled"
                type="datetime-local"
                value={formatDateForInput(roadmap.date)}
                onChange={(e) => handleChangeDate(e, index)}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <TextField
                  name="description"
                  label="Description"
                  fullWidth
                  variant="filled"
                  value={roadmap.description}
                  onChange={(e) => handleChange(e, index)}
                />
                <Button
                  sx={{ textTransform: 'none', ml: 1 }}
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  onClick={() => {
                    const updatedData = data.filter((roadmap, i) => {
                      return index !== i;
                    });
                    setData(updatedData);
                  }}
                >
                  Remove
                </Button>
              </Box>
            </Grid>
          </Grid>
        )
      })}
      <Button
        sx={{ textTransform: 'none', mt: -1 }}
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() =>
          setData([
            ...data,
            { name: '', description: '', date: new Date() },
          ])
        }
      >
        Add roadmap item
      </Button>
    </>
  );
};

export default RoadmapInput;