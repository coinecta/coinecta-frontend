import React, { useState, useEffect } from 'react'
import type { NextPage } from 'next'
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Collapse
} from '@mui/material'
import { useWalletContext } from '@contexts/WalletContext'
import ErrorPage from '@components/ErrorPage'
import { trpc } from '@lib/utils/trpc'
import { nanoid } from 'nanoid'
import SelectContributionRound from '@components/admin/contribution/SelectContributionRound'

const ReferralCodePage: NextPage = () => {
  const { sessionStatus } = useWalletContext()
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [selectedRound, setSelectedRound] = useState<number | null>(null)
  const [referralUrl, setReferralUrl] = useState('')

  const { data: referralCode, isLoading: isReferralCodeLoading } = trpc.user.getOrGenerateReferralCode.useQuery()

  const { data: projectList, isLoading: projectsLoading } = trpc.project.getProjectList.useQuery({})
  const roundQuery = trpc.contributions.getContributionRoundsByProjectSlug.useQuery(
    { projectSlug: selectedProject },
    { enabled: !!selectedProject }
  )

  const handleProjectChange = (event: SelectChangeEvent) => {
    setSelectedProject(event.target.value as string)
    setSelectedRound(null)
  }

  const generateReferralUrl = () => {
    if (selectedProject && selectedRound) {
      setReferralUrl(`https://coinecta.fi/projects/${selectedProject}?tab=contribute&roundId=${selectedRound}&ref=${referralCode}`)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => alert('Copied to clipboard!'))
      .catch(err => console.error('Failed to copy: ', err))
  }

  if (sessionStatus === 'loading') {
    return (
      <Container sx={{ textAlign: 'center', py: '20vh' }}>
        Loading...
      </Container>
    )
  }

  if (sessionStatus !== 'authenticated') {
    return (
      <ErrorPage
        title="401"
        subtitle="Not signed in. "
        message="Please sign in to continue. Otherwise, return to the home page. "
      />
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 12 }}>
      <Typography variant="h2" component="h1" sx={{ fontWeight: '600', mb: 4 }}>
        Referral Code
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Your Referral Code</Typography>
        <TextField
          fullWidth
          value={referralCode}
          InputProps={{
            readOnly: true,
          }}
        />
        <Button
          variant="contained"
          onClick={() => copyToClipboard(referralCode!!)}
          sx={{ mt: 1 }}
          disabled={!referralCode}
        >
          Copy Code
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Generate Referral URL</Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Project</InputLabel>
          <Select
            value={selectedProject}
            label="Project"
            onChange={handleProjectChange}
          >
            {projectsLoading ? (
              <MenuItem disabled>Loading projects...</MenuItem>
            ) : (
              projectList?.filter(project => !project.isLaunched).map((project) => (
                <MenuItem key={project.slug} value={project.slug}>
                  {project.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        <Collapse in={!!selectedProject}>
          <Box sx={{ mb: 1, maxWidth: '350px' }}>
            <SelectContributionRound
              roundData={roundQuery.data}
              selectedRound={selectedRound}
              setSelectedRound={setSelectedRound}
            />
          </Box>
        </Collapse>

        <Button
          variant="contained"
          onClick={generateReferralUrl}
          disabled={!selectedProject || !selectedRound}
        >
          Generate URL
        </Button>

        {referralUrl && (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              value={referralUrl}
              InputProps={{
                readOnly: true,
              }}
            />
            <Button
              variant="contained"
              onClick={() => copyToClipboard(referralUrl)}
              sx={{ mt: 1 }}
            >
              Copy URL
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  )
}

export default ReferralCodePage