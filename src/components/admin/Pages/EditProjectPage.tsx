import { useState, FC, useEffect } from 'react';
import {
  useTheme,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  CircularProgress,
} from '@mui/material';
import { trpc } from '@lib/utils/trpc';
import FisoInput from '@components/admin/create-project/FisoInput';
import AdminMenu from '@components/admin/AdminMenu';
import ProjectForm from '../create-project/ProjectForm';

const socials = ['telegram', 'discord', 'github', 'twitter', 'website', 'linkedin'];

const initialFormData: TProject = {
  name: '',
  slug: '',
  shortDescription: '',
  whitepaperLink: '',
  description: '',
  fundsRaised: 0,
  bannerImgUrl: '',
  avatarImgUrl: '',
  blockchains: ['Cardano'],
  isLaunched: false,
  isDraft: false,
  frontPage: false,
  socials: {
    telegram: '',
    discord: '',
    github: '',
    twitter: '',
    website: ''
  },
  roadmap: [],
  team: [],
  tokenomics: {
    tokenName: '',
    totalTokens: 0,
    tokenTicker: '',
    tokenPolicyId: '',
    tokenomics: [],
  },
  contributionRounds: [],
  whitelists: [],
  fisos: []
}

const EditProjectPage: FC = () => {
  const theme = useTheme()
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<TProject>(initialFormData)

  const { data: projectList } = trpc.project.getProjectList.useQuery({});
  const projectQuery = trpc.project.getProject.useQuery({ slug: selectedProject }, { enabled: false });
  const projectFisoQuery = trpc.project.getProjectFisos.useQuery({ slug: selectedProject }, { enabled: false });

  useEffect(() => {
    if (selectedProject) {
      const fetchData = async () => {
        const project = await projectQuery.refetch();
        const projectFisos = await projectFisoQuery.refetch()
        if (project.status === 'success' && project.data) {
          setProjectData({ ...project.data, fisos: projectFisos.data || [] });
        }
      };

      fetchData();
    }
  }, [selectedProject]);

  const handleProjectChange = (e: SelectChangeEvent) => {
    setSelectedProject(e.target.value as string);
  };

  return (
    <AdminMenu>
      <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
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

      {projectData.slug !== ''
        ? <ProjectForm project={projectData} edit />
        : !selectedProject
          ? 'Please select a project...'
          : <CircularProgress />
      }
    </AdminMenu>
  );
};

export default EditProjectPage;