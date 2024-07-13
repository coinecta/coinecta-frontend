import { FC } from 'react';
import {
  Typography,
} from '@mui/material';
import AdminMenu from '@components/admin/AdminMenu';
import ProjectForm from '../create-project/ProjectForm';

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
  frontPage: true,
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
    totalTokens: BigInt(0),
    tokenTicker: '',
    tokenPolicyId: '',
    tokenomics: [],
  },
  contributionRounds: [],
  whitelists: [],
  fisos: []
}

const CreateProjectPage: FC = () => {
  return (
    <AdminMenu>
      <Typography variant="h2" sx={{ mt: 10, mb: 4, fontWeight: '700' }}>
        Create Project
      </Typography>
      <ProjectForm project={initialFormData} />
    </AdminMenu>
  );
};

export default CreateProjectPage;