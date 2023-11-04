import React, { FC } from 'react';
import { Box, Button, Grid, IconButton, TextField } from '@mui/material';
import FileUploadS3 from '@components/FileUploadS3';
import { slugify } from '@lib/utils/general';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

interface ITeamInputProps {
  data: TTeam[];
  setData: (updatedData: TTeam[]) => void;
  projectName: string;
}

const TeamInput: FC<ITeamInputProps> = ({ data, setData, projectName }) => {
  const handleChange = (e: any, index: number) => {
    console.log(e);
    const updatedData = data.map((member, i) => {
      if (index === i) {
        return {
          ...member,
          [e.target.name]: e.target.value,
        };
      } else {
        return member;
      }
    });
    setData(updatedData);
  };

  const handleImageUpload = (res: { status: string; image_url?: string; }, index: number) => {
    if (res.status === 'success') {
      handleChange(
        {
          target: {
            name: 'profileImgUrl',
            value: res.image_url,
          },
        },
        index
      );
    } else {
      handleChange(
        {
          target: {
            name: 'profileImgUrl',
            value: 'upload_error',
          },
        },
        index
      );
    }
  };
  return (
    <>
      {data.map((member, index) => (
        <Grid container key={index} sx={{ mb: 4 }} spacing={1}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <TextField
                name="name"
                label="Name"
                InputProps={{ disableUnderline: true }}
                sx={{ flexGrow: 1 }}
                variant="filled"
                value={member.name}
                onChange={(e) => handleChange(e, index)}
              />
              <Button
                sx={{ textTransform: 'none', ml: 1 }}
                variant="outlined"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  const updatedData = data.filter((member, i) => {
                    return index !== i;
                  });
                  setData(updatedData);
                }}
              >
                Remove
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="description"
              label="Role"
              InputProps={{ disableUnderline: true }}
              fullWidth
              variant="filled"
              value={member.description}
              onChange={(e) => handleChange(e, index)}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
              <TextField
                name="profileImgUrl"
                label="Profile Image"
                disabled
                // fullWidth
                variant="filled"
                value={member.profileImgUrl}
                onChange={(e) => handleChange(e, index)}
                sx={{ flexGrow: 1 }}
              />
              <FileUploadS3 onUpload={(res) => handleImageUpload(res, index)} fileName={`${slugify(projectName)}-team-avatar-${index}`} />
              <Button
                sx={{ textTransform: 'none' }}
                onClick={() =>
                  handleChange(
                    {
                      target: {
                        name: 'profileImgUrl',
                        value: '',
                      },
                    },
                    index
                  )
                }
              >
                Clear file
              </Button>
            </Box>
          </Grid>
          <Grid item md={6} xs={12}>
            <TextField
              name="twitter"
              label="Twitter Handle"
              InputProps={{ disableUnderline: true }}
              fullWidth
              variant="filled"
              value={member.twitter}
              onChange={(e) => handleChange(e, index)}
            />
          </Grid>
          <Grid item md={6} xs={12}>
            <TextField
              name="linkedin"
              label="LinkedIn Profile"
              InputProps={{ disableUnderline: true }}
              fullWidth
              variant="filled"
              value={member.linkedin}
              onChange={(e) => handleChange(e, index)}
            />
          </Grid>
        </Grid>
      ))}
      <Button
        sx={{ textTransform: 'none', mt: -1 }}
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() =>
          setData([
            ...data,
            {
              name: '',
              description: '',
              profileImgUrl: '',
              linkedin: '',
              twitter: ''
            },
          ])
        }
      >
        Add team member
      </Button>
    </>
  );
};

export default TeamInput;