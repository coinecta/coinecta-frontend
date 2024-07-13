import {
  Grid,
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  CircularProgress,
  useTheme,
  Avatar,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { ChangeEvent, FC, useEffect, useState } from 'react';
import FileUploadS3 from '@components/FileUploadS3';
import RoadmapInput from '@components/admin/create-project/RoadmapInput';
import TeamInput from '@components/admin/create-project/TeamInput';
import TokenomicInput from '@components/admin/create-project/TokenomicInput';
import { slugify } from '@lib/utils/general';
import MarkdownTextArea from '@components/admin/create-project/MarkdownTextArea';
import ProjectCard from '@components/projects/ProjectCard';
import WhitelistInput from '@components/admin/create-project/WhitelistInput';
import { trpc } from '@lib/utils/trpc';
import FisoInput from '@components/admin/create-project/FisoInput';
import { useAlert } from '@contexts/AlertContext';

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

const initialFormErrors = {
  name: false,
  slug: false,
  shortDescription: false,
  fundsRaised: false,
  bannerImgUrl: false,
}

type ProjectFormProps = {
  project: TProject;
  edit?: boolean;
}

const ProjectForm: FC<ProjectFormProps> = ({ project, edit }) => {
  const theme = useTheme()
  const { addAlert } = useAlert()

  const submitProject = edit ? trpc.project.editProject.useMutation() : trpc.project.createProject.useMutation()

  // form data is all strings
  const [formData, updateFormData] = useState<TProject>(initialFormData);
  // form error object, all booleans
  const [formErrors, setFormErrors] = useState<{ [key: string]: boolean }>(initialFormErrors);
  // loading spinner for submit button
  const [isLoading, setLoading] = useState(false);
  // set true to disable submit button
  const [buttonDisabled, setbuttonDisabled] = useState(false);
  const [mobileToggle, setMobileToggle] = useState<'mobile' | 'desktop'>('mobile')

  useEffect(() => {
    if (project) {
      updateFormData(project)
      // console.log(project)
    }
  }, [project])

  // Retrieve the user's time zone
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    if (isLoading) {
      setbuttonDisabled(true);
    } else {
      setbuttonDisabled(false);
    }
  }, [isLoading]);

  const handleChangeName = (e: ChangeEvent<HTMLInputElement>) => {
    if (
      e.target.value == ''
    ) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: true,
      });
    } else if (Object.hasOwnProperty.call(formErrors, e.target.name)) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: false,
      });
    }

    if (e.target.name === 'name') {
      // if edit, don't change the slug. Slug should never change. 
      edit
        ? updateFormData({
          ...formData,
          name: e.target.value
        })
        : updateFormData({
          ...formData,
          name: e.target.value,
          slug: slugify(e.target.value)
        })

    }

  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (
      e.target.value == '' &&
      Object.hasOwnProperty.call(formErrors, e.target.name)
    ) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: true,
      });
    } else if (Object.hasOwnProperty.call(formErrors, e.target.name)) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: false,
      });
    }

    if (socials.includes(e.target.name)) {
      updateFormData({
        ...formData,
        socials: {
          ...formData.socials,
          [e.target.name]: e.target.value,
        },
      });
    } else if (
      ['tokenName', 'totalTokens', 'tokenTicker', 'tokenPolicyId'].includes(e.target.name)
    ) {
      updateFormData({
        ...formData,
        tokenomics: {
          ...formData.tokenomics,
          [e.target.name]: e.target.value,
        },
      });
    } else {
      updateFormData({
        ...formData,
        [e.target.name]:
          ['isLaunched', 'isDraft', 'frontPage'].includes(e.target.name) ? e.target.checked : e.target.value,
      });
    }
  };

  const handleImageUpload = (res: { status: string; image_url?: string; message?: string }) => {
    if (res.status === 'success') {
      updateFormData({ ...formData, bannerImgUrl: res.image_url! });
      setFormErrors({ ...formErrors, bannerImgUrl: false });
      addAlert(
        'success',
        res.message || 'Image uploaded'
      );
    } else {
      addAlert(
        'error',
        'Image upload failed'
      );
    }
  };
  // it was quicker to duplicate the function than refactor the S3 upload component
  const handleAvatarImageUpload = (res: { status: string; image_url?: string; message?: string }) => {
    if (res.status === 'success') {
      updateFormData({ ...formData, avatarImgUrl: res.image_url! });
      setFormErrors({ ...formErrors, avatarImgUrl: false });
      addAlert(
        'success',
        res.message || 'Image uploaded'
      );
    } else {
      addAlert(
        'error',
        'Image upload failed'
      );
    }
  };

  const convertStringsInObject = (project: TProject) => {
    let newProject = project;

    newProject.fundsRaised = Number(newProject.fundsRaised) || 0;

    // Convert totalTokens from string to BigInt
    newProject.tokenomics.totalTokens = BigInt(newProject.tokenomics.totalTokens) || BigInt(0);

    // Loop through all tokenomics and convert amounts from string to number
    newProject.tokenomics.tokenomics = newProject.tokenomics.tokenomics.map((tokenomic: TTokenomic) => ({
      ...tokenomic,
      amount: BigInt(tokenomic.amount) || BigInt(0),
    }));

    // Loop through all whitelists and convert maxPerSignup and hardCap from string to number
    newProject.whitelists = newProject.whitelists.map((whitelist: TWhitelist) => ({
      ...whitelist,
      maxPerSignup: Number(whitelist.maxPerSignup) || 0,
      hardCap: Number(whitelist.hardCap) || 0,
      // Convert date strings to Date objects only if they're strings
      startDateTime: typeof whitelist.startDateTime === 'string' ? new Date(whitelist.startDateTime) : whitelist.startDateTime,
      endDateTime: typeof whitelist.endDateTime === 'string' ? new Date(whitelist.endDateTime) : whitelist.endDateTime,
    }));

    // Convert date strings in roadmap to Date objects only if they're strings
    if (newProject.roadmap) {
      newProject.roadmap = newProject.roadmap.map((milestone: TRoadmap) => ({
        ...milestone,
        // date: typeof milestone.date === 'string' ? new Date(milestone.date) : milestone.date,
      }));
    }

    // Loop through fisos and convert to numbers where needed
    if (newProject.fisos) {
      newProject.fisos = newProject.fisos.map((fiso: TFiso) => ({
        ...fiso,
        tokenAmount: Number(fiso.tokenAmount) || 0,
        startEpoch: Number(fiso.startEpoch) || 0,
        endEpoch: Number(fiso.endEpoch) || 0
      }));
    }

    return newProject;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const errorCheck = Object.values(formErrors).every((v) => v === false);
    const emptyCheck = formData.bannerImgUrl !== '';
    if (
      errorCheck && emptyCheck
    ) {
      const data = { ...formData };
      // const serializedData = JSON.stringify(data);
      // localStorage.setItem('myFormData', serializedData);
      const sanitizedData = convertStringsInObject(data)
      try {
        const response = await submitProject.mutateAsync(sanitizedData);
        addAlert(
          'success',
          'Successfully submitted'
        );
      } catch (error: any) {
        addAlert(
          'error',
          error.message || 'Invalid credentials or form data'
        );
      }
    } else {
      let updateErrors = {};
      Object.entries(formData).forEach((entry) => {
        const [key, value] = entry;
        if (value === '' && Object.hasOwnProperty.call(formErrors, key)) {
          let newEntry = { [key]: true };
          updateErrors = { ...updateErrors, ...newEntry };
        }
      });
      setFormErrors({
        ...formErrors,
        ...updateErrors,
      });
      addAlert(
        'error',
        'Please eliminate form errors and try again'
      );
    }
    setLoading(false);
  };

  const handleChangeTextArea = (value: string) => {
    updateFormData({
      ...formData,
      description: value
    });
  }

  return (
    <Box component="form" onSubmit={handleSubmit} maxWidth="md">
      <Grid container spacing={2} />
      <Typography variant="h4" sx={{ mb: 1, fontWeight: '700' }}>
        Project Name and Description
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item md={6} xs={12}>
          <TextField
            InputProps={{ disableUnderline: true }}
            required
            fullWidth
            id="name"
            label="Project Name"
            name="name"
            variant="filled"
            value={formData.name}
            onChange={handleChangeName}
            error={formErrors.name}
            helperText={formErrors.name && 'Enter the project name'}
          />
        </Grid>
        <Grid item md={6} xs={12}>
          <TextField
            InputProps={{ disableUnderline: true }}
            required
            fullWidth
            disabled
            id="slug"
            label="URL friendly slug"
            name="slug"
            variant="filled"
            value={formData.slug}
            onChange={handleChangeName}
            error={formErrors.slug}
            helperText={formErrors.slug && 'Slug must be URL friendly & not be blank'}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            InputProps={{ disableUnderline: true }}
            required
            fullWidth
            id="shortDescription"
            label="Project Short Description"
            name="shortDescription"
            variant="filled"
            value={formData.shortDescription}
            onChange={handleChange}
            error={formErrors.shortDescription}
            helperText={
              formErrors.shortDescription && 'Enter the project summary'
            }
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            InputProps={{ disableUnderline: true }}
            required
            fullWidth
            id="whitepaperLink"
            label="Whitepaper URL"
            name="whitepaperLink"
            variant="filled"
            value={formData.whitepaperLink}
            onChange={handleChange}
            error={formErrors.whitepaperLink}
            helperText={
              formErrors.whitepaperLink && 'Enter the project summary'
            }
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            InputProps={{ disableUnderline: true }}
            required
            fullWidth
            id="fundsRaised"
            label="Funds Raised in USD"
            name="fundsRaised"
            variant="filled"
            value={formData.fundsRaised}
            onChange={handleChange}
            error={formErrors.fundsRaised}
            helperText={
              formErrors.fundsRaised && 'Funds should be a valid number'
            }
          />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
            <TextField
              InputProps={{ disableUnderline: true }}
              required
              disabled
              id="bannerImgUrl"
              label="Banner Image Url"
              name="bannerImgUrl"
              variant="filled"
              value={formData.bannerImgUrl}
              onChange={handleChange}
              error={formErrors.bannerImgUrl}
              helperText={formErrors.bannerImgUrl && 'Banner image is required'}
              sx={{ flexGrow: 1 }}
            />
            <FileUploadS3 onUpload={handleImageUpload} fileName={`${formData.name}-banner`} />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <Box sx={{ mb: 1 }}>
              Preview: <ToggleButtonGroup
                color="primary"
                value={mobileToggle}
                exclusive
                size="small"
                onChange={() => setMobileToggle(prev => prev === 'desktop' ? 'mobile' : 'desktop')}
                aria-label="Toggle view"
              >
                <ToggleButton value={'mobile'}>Mobile</ToggleButton>
                <ToggleButton value={'desktop'}>Desktop</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box sx={{ width: mobileToggle === 'mobile' ? '390px' : 'none' }}>
              <ProjectCard
                title={formData.name}
                tagline={formData.shortDescription}
                imageUrl={formData.bannerImgUrl}
                category={''}
                link={''}
                status={"Upcoming"}
                blockchains={formData.blockchains}
              />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
            <TextField
              InputProps={{ disableUnderline: true }}
              required
              disabled
              id="avatarImgUrl"
              label="Avatar Image Url"
              name="avatarImgUrl"
              variant="filled"
              value={formData.avatarImgUrl}
              onChange={handleChange}
              error={formErrors.avatarImgUrl}
              helperText={formErrors.avatarImgUrl && 'Avatar image is required'}
              sx={{ flexGrow: 1 }}
            />
            <FileUploadS3 onUpload={handleAvatarImageUpload} fileName={`${formData.name}-avatar`} />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Avatar
            src={formData.avatarImgUrl}
            alt={formData.name.replace(/cardano-(x-)?/, "")}
            sx={{ width: 200, height: 200 }}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Detailed description and project deliverables:
          </Typography>
          {/* <TextField
              InputProps={{ disableUnderline: true }}
              fullWidth
              multiline
              id="description"
              label="Project Description"
              name="description"
              variant="filled"
              value={formData.description}
              onChange={handleChange}
              rows={6}
            /> */}
          <MarkdownTextArea value={formData.description} handleChange={handleChangeTextArea} />
        </Grid>
      </Grid>

      <Typography variant="h4" sx={{ mb: 1, fontWeight: '700' }}>
        Socials
      </Typography>
      <Grid container item xs={12} sx={{ mb: 4 }}>
        <Grid item md={6} xs={12} sx={{ p: 0.5 }}>
          <TextField
            InputProps={{ disableUnderline: true }}
            fullWidth
            id="telegram"
            label="Team Telegram Handle"
            name="telegram"
            variant="filled"
            value={formData.socials.telegram}
            onChange={handleChange}
          />
        </Grid>
        <Grid item md={6} xs={12} sx={{ p: 0.5 }}>
          <TextField
            InputProps={{ disableUnderline: true }}
            fullWidth
            id="discord"
            label="Discord"
            name="discord"
            variant="filled"
            value={formData.socials.discord}
            onChange={handleChange}
          />
        </Grid>
        <Grid item md={6} xs={12} sx={{ p: 0.5 }}>
          <TextField
            InputProps={{ disableUnderline: true }}
            fullWidth
            id="github"
            label="Github"
            name="github"
            variant="filled"
            value={formData.socials.github}
            onChange={handleChange}
          />
        </Grid>
        <Grid item md={6} xs={12} sx={{ p: 0.5 }}>
          <TextField
            InputProps={{ disableUnderline: true }}
            fullWidth
            id="twitter"
            label="Project Twitter Page"
            name="twitter"
            variant="filled"
            value={formData.socials.twitter}
            onChange={handleChange}
          />
        </Grid>
        <Grid item md={6} xs={12} sx={{ p: 0.5 }}>
          <TextField
            InputProps={{ disableUnderline: true }}
            fullWidth
            id="website"
            label="Website Url"
            name="website"
            variant="filled"
            value={formData.socials.website}
            onChange={handleChange}
          />
        </Grid>
      </Grid>

      <Typography variant="h4" sx={{ mb: 1, fontWeight: '700' }}>
        Whitelist Events
      </Typography>

      <WhitelistInput
        data={formData.whitelists}
        setData={(updatedData) => {
          updateFormData({
            ...formData,
            whitelists: [...updatedData],
          });
        }}
        projectSlug={project.slug}
      />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: '700' }}>
          Roadmap
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 1 }}>
          Dates are in your local timezone: {userTimeZone}
        </Typography>
        <RoadmapInput
          data={formData.roadmap}
          setData={(updatedData) => {
            updateFormData({
              ...formData,
              roadmap: [...updatedData],
            });
          }}
        />
      </Box>

      <Typography variant="h4" sx={{ mb: 1, fontWeight: '700' }}>
        Team
      </Typography>

      <TeamInput
        data={formData.team}
        setData={(updatedData) => {
          updateFormData({
            ...formData,
            team: [...updatedData],
          });
        }}
        projectName={formData.name}
      />


      <Typography variant="h4" sx={{ mb: 2, fontWeight: '700' }}>
        Tokenomics
      </Typography>
      <Grid container item xs={12} sx={{ mb: 1 }}>
        <Grid item xs={12} sx={{ p: 0.5 }}>
          <TextField
            InputProps={{ disableUnderline: true }}
            fullWidth
            id="tokenName"
            label="Token Name"
            name="tokenName"
            variant="filled"
            value={formData.tokenomics.tokenName}
            onChange={handleChange}
          />
        </Grid>
        <Grid item md={6} xs={12} sx={{ p: 0.5 }}>
          <TextField
            InputProps={{ disableUnderline: true }}
            fullWidth
            id="totalTokens"
            label="Total Tokens"
            name="totalTokens"
            variant="filled"
            type="number"
            value={formData.tokenomics.totalTokens.toString()}
            onChange={handleChange}
          />
        </Grid>
        <Grid item md={6} xs={12} sx={{ p: 0.5 }}>
          <TextField
            InputProps={{ disableUnderline: true }}
            fullWidth
            id="tokenTicker"
            label="Ticker"
            name="tokenTicker"
            variant="filled"
            value={formData.tokenomics.tokenTicker}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sx={{ p: 0.5 }}>
          <TextField
            InputProps={{ disableUnderline: true }}
            fullWidth
            id="tokenPolicyId"
            label="Policy Id"
            name="tokenPolicyId"
            variant="filled"
            value={formData.tokenomics.tokenPolicyId}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
      <Grid item xs={12} sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Tokenomics Table Row
        </Typography>
        <TokenomicInput
          data={formData.tokenomics.tokenomics}
          setData={(updatedData: any) => {
            updateFormData({
              ...formData,
              tokenomics: {
                ...formData.tokenomics,
                tokenomics: [...updatedData],
              },
            });
          }}
        />
      </Grid>

      <Typography variant="h4" sx={{ mb: 2, fontWeight: '700' }}>
        FISO
      </Typography>
      <FisoInput
        data={formData.fisos}
        setData={(updatedData) => {
          updateFormData({
            ...formData,
            fisos: [...updatedData],
          });
        }}
      />

      <Typography variant="h4" sx={{ mb: 1, fontWeight: '700' }}>
        Additional Configuration
      </Typography>
      <FormControlLabel
        control={
          <Checkbox
            name="isLaunched"
            checked={formData.isLaunched}
            onChange={handleChange}
          />
        }
        label="Launched"
        sx={{ color: theme.palette.text.secondary, mb: 3, mr: 3 }}
      />
      <FormControlLabel
        control={
          <Checkbox
            name="isDraft"
            checked={formData.isDraft}
            onChange={handleChange}
          />
        }
        label="Draft"
        sx={{ color: theme.palette.text.secondary, mb: 3 }}
      />
      <FormControlLabel
        control={
          <Checkbox
            name="frontPage"
            checked={formData.frontPage}
            onChange={handleChange}
          />
        }
        label="Show on front page"
        sx={{ color: theme.palette.text.secondary, mb: 3 }}
      />
      <Box sx={{ position: 'relative' }}>
        <Button
          type="submit"
          disabled={buttonDisabled}
          variant="contained"
          sx={{ mt: 1, mb: 1 }}
        >
          Submit
        </Button>
        {isLoading && (
          <CircularProgress
            size={24}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-9px',
              marginLeft: '-12px',
            }}
          />
        )}
      </Box>
    </Box>

  );
};

export default ProjectForm;