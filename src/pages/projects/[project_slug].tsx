import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Typography,
  Box,
  Avatar,
  useTheme,
  Grid,
  useMediaQuery,
  Chip,
  Dialog,
  DialogContent,
} from "@mui/material";
import Link from "@components/Link";
import DiscordIcon from "@components/svgs/DiscordIcon";
import TwitterIcon from "@components/svgs/TwitterIcon";
import TelegramIcon from "@components/svgs/TelegramIcon";
import GithubIcon from "@components/svgs/GithubIcon";
import TokenomicsTab from "@components/projects/tokenomics/TokenomicsTab";
import WhitelistTab from "@components/projects/whitelist/WhitelistTab";
import ContributeTab from "@components/projects/contribute/ContributeTab";
import ProjectInfoTab from "@components/projects/info/ProjectInfoTab";
import { trpc } from '@lib/utils/trpc';
import FisoTab from "@components/projects/fiso/FisoTab";
import { mapFisoObject } from "@server/utils/mapProjectObject";
import { ContainedTabs, ContainedTab } from "@components/styled-components/ContainedTabs";
import LinkIcon from '@mui/icons-material/Link';
import FeedIcon from '@mui/icons-material/Feed';
import Swap from '@dexhunterio/swaps'
import '@dexhunterio/swaps/lib/assets/style.css'
import { ensureHexColor } from '@lib/utils/general';
import { toTokenId } from '@lib/utils/assets';
import DexhunterLogomark from "@components/svgs/DexhunterLogomark";
import XerberusTab from "@components/projects/xerberus/XerberusTab";
import DexhunterDialog from "@components/projects/DexhunterDialog";

type TTabs = 'summary' | 'tokenomics' | 'whitelist' | 'contribute' | 'fiso' | 'xerberus'

const Project = () => {
  const theme = useTheme()
  const upMd = useMediaQuery(theme.breakpoints.up('md'))
  const upSm = useMediaQuery(theme.breakpoints.up('sm'))
  const router = useRouter();
  const { project_slug, tab } = router.query;
  const [projectData, setProjectData] = useState<TProject | undefined>(undefined)
  const [tabValue, setTabValue] = useState<TTabs>('summary');
  const [fisoData, setFisoData] = useState<TFiso[]>([])
  const [dexhunterModal, setDexhunterModal] = useState(false)

  const project = trpc.project.getProject.useQuery(
    { slug: project_slug?.toString() },
    { enabled: project_slug !== undefined, retry: 0 }
  )
  const fisos = trpc.project.getProjectFisos.useQuery(
    { slug: project_slug?.toString() },
    { enabled: project_slug !== undefined }
  )

  useEffect(() => {
    if (fisos.isError) {
      console.log('error getting project fisos')
    }

    if (fisos.status === 'success' && fisos.data) {
      const fisoObject = mapFisoObject(fisos.data)
      setFisoData(fisoObject)
    }
  }, [fisos.status])

  useEffect(() => {
    // Check if tab is one of the TTabs values and not an array
    if (tab && typeof tab === 'string' && isTTabs(tab)) {
      setTabValue(tab);
    }
  }, [tab]);

  const isTTabs = (value: string): value is TTabs => {
    return ['summary', 'tokenomics', 'whitelist', 'contribute', 'fiso', 'xerberus'].includes(value);
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: TTabs) => {
    event.preventDefault()
    setTabValue(newValue);
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        tab: newValue
      },
    },
      undefined,
      { scroll: false });
  };

  const socialButtonSx = {
    color: theme.palette.text.primary,
    '&:hover': {
      color: theme.palette.primary.main
    }
  }

  useEffect(() => {
    if (project.status === 'success') {
      setProjectData(project.data)
    }
  }, [project.status])

  return (
    <>
      {project.status === 'loading' || !projectData && project.status !== 'error'
        ? <Box sx={{ mb: 3, position: 'relative', height: '100vh', width: '100vw' }}>
          <Box sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)"
          }}>Loading project...</Box>
        </Box>
        : projectData ?
          <Container maxWidth="lg" sx={{ pt: 6 }}>
            <Grid container spacing={2} direction={upMd ? 'row' : 'column'} alignItems="center" sx={{ mb: 4 }}>
              <Grid item md='auto' sx={{ textAlign: 'center' }}>
                <Avatar
                  src={projectData.avatarImgUrl}
                  alt={projectData.name.replace(/cardano-(x-)?/, "")}
                  sx={{ width: 200, height: 200, display: "flex" }}
                />
              </Grid>
              <Grid item md>
                <Typography variant="h2" fontWeight={600}>{projectData.name.replace(/cardano-(x-)?/, "")}</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>{projectData.shortDescription}</Typography>
                <Grid container direction="row" spacing={2}>
                  {projectData.socials?.website &&
                    <Grid item>
                      <Chip
                        label="Website"
                        icon={<LinkIcon sx={{ transform: 'rotate(-45deg)', width: '16px', height: '16px' }} />}
                        component="a"
                        clickable
                        sx={{ borderRadius: '6px', border: `1px solid ${theme.palette.divider}` }}
                        href={projectData.socials.website}
                        target="_blank"
                        aria-label={`${projectData.name} website`}
                      />
                    </Grid>
                  }
                  {projectData.whitepaperLink &&
                    <Grid item>
                      <Chip
                        label="Whitepaper"
                        icon={<FeedIcon sx={{ width: '16px', height: '16px' }} />}
                        component="a"
                        clickable
                        sx={{ borderRadius: '6px', border: `1px solid ${theme.palette.divider}` }}
                        href={projectData.whitepaperLink}
                        target="_blank"
                        aria-label={`${projectData.name} whitepaper`}
                      />
                    </Grid>
                  }
                  {projectData.socials?.github &&
                    <Grid item>
                      <Chip
                        label="Github"
                        icon={<GithubIcon sx={{ width: '16px', height: '16px', mr: -1, ml: 1 }} />}
                        component="a"
                        clickable
                        sx={{ borderRadius: '6px', border: `1px solid ${theme.palette.divider}` }}
                        href={projectData.socials.github}
                        target="_blank"
                        aria-label={`${projectData.name} Github link`}
                      />
                    </Grid>
                  }
                  {projectData.socials?.discord &&
                    <Grid item>
                      <Chip
                        label="Discord"
                        icon={<DiscordIcon sx={{ width: '16px', height: '16px', mr: -1, ml: 1 }} />}
                        component="a"
                        clickable
                        sx={{ borderRadius: '6px', border: `1px solid ${theme.palette.divider}` }}
                        href={projectData.socials.discord}
                        target="_blank"
                        aria-label={`${projectData.name} Discord link`}
                      />
                    </Grid>
                  }
                  {projectData.socials?.telegram &&
                    <Grid item>
                      <Chip
                        label="Telegram"
                        icon={<TelegramIcon sx={{ width: '16px', height: '16px', mr: -1, ml: 1 }} />}
                        component="a"
                        clickable
                        sx={{ borderRadius: '6px', border: `1px solid ${theme.palette.divider}` }}
                        href={projectData.socials.telegram}
                        target="_blank"
                        aria-label={`${projectData.name} Telegram link`}
                      />
                    </Grid>
                  }
                  {projectData.socials?.twitter &&
                    <Grid item>
                      <Chip
                        label="Twitter"
                        icon={<TwitterIcon sx={{ width: '16px', height: '16px', mr: -1, ml: 1 }} />}
                        component="a"
                        clickable
                        sx={{ borderRadius: '6px', border: `1px solid ${theme.palette.divider}` }}
                        href={projectData.socials.twitter}
                        target="_blank"
                        aria-label={`${projectData.name} Twitter link`}
                      />
                    </Grid>
                  }
                  {projectData.tokenomics.tokenPolicyId.length > 0 &&
                    <Grid item>
                      <Chip
                        label="Buy CNCT"
                        icon={<DexhunterLogomark sx={{ width: '16px', height: '16px', mr: -1, ml: 1 }} />}
                        // component="button"
                        clickable
                        color="secondary"
                        sx={{ borderRadius: '6px', border: `1px solid ${theme.palette.divider}` }}
                        onClick={() => setDexhunterModal(true)}
                        aria-label={`${projectData.name} DexHunter Swap`}
                      />
                    </Grid>
                  }
                </Grid>
              </Grid>
            </Grid>

            <ContainedTabs
              value={tabValue}
              onChange={handleTabChange}
              scrollButtons="auto"
              allowScrollButtonsMobile
              variant="scrollable"
              color={theme.palette.primary.main}
            >
              <ContainedTab label="Summary" value={'summary'} />
              <ContainedTab label="Tokenomics" value={'tokenomics'} />
              <ContainedTab label="Whitelist" value={'whitelist'} />
              <ContainedTab label="Contribute" value={'contribute'} />
              {fisoData.length > 0 && <ContainedTab label="FISO" value={'fiso'} />}
              <ContainedTab label="Xerberus" value={'xerberus'} />
            </ContainedTabs>
            <Box sx={{ mb: 12, mt: 2 }}>
              {tabValue === 'summary' && <ProjectInfoTab project={projectData} />}
              {tabValue === 'tokenomics' && <TokenomicsTab tokenomics={projectData.tokenomics} />}
              {tabValue === 'whitelist' && <WhitelistTab whitelists={projectData.whitelists} projectSlug={projectData.slug} />}
              {tabValue === 'contribute' && <ContributeTab projectSlug={projectData.slug} projectName={projectData.name} projectIcon={projectData.avatarImgUrl} />}
              {tabValue === 'fiso' && <FisoTab projectSlug={projectData.slug} fisos={fisoData} />}
              {tabValue === 'xerberus' && <XerberusTab project={projectData} />}
            </Box>
          </Container >
          : project.status === 'error' && <Container sx={{ textAlign: 'center', py: '20vh' }}>
            <Typography variant="h1">
              404
            </Typography>
            <Typography variant="body1" sx={{ mb: '24px' }}>
              This Project Could Not Be Found
            </Typography>
            <Typography variant="body1">
              The project you are looking for does not exist, has been removed, name changed, or is temporarily unavailable.
            </Typography>
            <Link href="/projects">
              Back to projects page
            </Link>
          </Container>}
      {projectData?.tokenomics && projectData.tokenomics.tokenPolicyId.length > 0 &&
        <DexhunterDialog
          open={dexhunterModal}
          setOpen={setDexhunterModal}
          projectData={projectData}
        />
      }
    </>
  );
};

export default Project;