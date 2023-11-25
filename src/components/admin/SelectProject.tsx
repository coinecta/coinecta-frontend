import { trpc } from '@lib/utils/trpc';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import React, { FC } from 'react';

interface ISelectProjectProps {
  projectList: TProjectBase[] | undefined;
  selectedProject: string | null;
  setSelectedProject: React.Dispatch<React.SetStateAction<string | null>>;
}

const SelectProject: FC<ISelectProjectProps> = ({ selectedProject, setSelectedProject, projectList }) => {

  const handleProjectChange = (e: SelectChangeEvent) => {
    setSelectedProject(e.target.value as string);
  };

  return (
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel id="project-select-label">Project</InputLabel>
      <Select
        labelId="project-select-label"
        id="project-select"
        value={selectedProject || ''}
        label="Project"
        onChange={handleProjectChange}
      >
        {projectList?.map((project) => (
          <MenuItem key={project.slug} value={project.slug}>
            {project.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SelectProject;