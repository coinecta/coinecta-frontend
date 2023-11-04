import { FC } from 'react';
import {
  Box,
  Typography,
  TextField,
  Snackbar,
  Alert,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  List,
  Divider,
  useTheme
} from '@mui/material';
import { ChangeEvent, SetStateAction, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { trpc } from '@lib/utils/trpc';
import AdminMenu from '@components/AdminMenu';
import Grid from '@mui/system/Unstable_Grid/Grid';
import FisoListItem from '@components/admin/fiso-management/FisoListItem';
import UnlabelledTextField from '@components/styled-components/UnlabelledTextField';
import { TStakepoolInfoReturn } from '@server/routers/stakepools'
import CSVDownloadButton from '@components/CSVDownloadButton';

const FisoManagementPage: FC = () => {
  const theme = useTheme()
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedFiso, setSelectedFiso] = useState<string | null>(null);
  const [selectedFisoData, setSelectedFisoData] = useState<TFiso | undefined>(undefined);
  const [isLoading, setLoading] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('An error occurred');
  const [successMessage, setSuccessMessage] = useState('Successfully submitted');

  const stakepoolInfo = trpc.stakepool.stakepoolInfo.useMutation()
  const { data: projectList } = trpc.project.getProjectList.useQuery({});
  const fisosQuery = trpc.fisos.getByProjectSlug.useQuery({ projectSlug: selectedProject || '', includeSpoSignups: true }, { enabled: !!selectedProject });
  const approvedStakepoolsQuery = trpc.fisos.getApprovedStakepools.useQuery({ fisoId: Number(selectedFiso) }, { enabled: !!selectedFiso });
  const approveStakepoolsMutation = trpc.fisos.approveStakepools.useMutation();
  const editStakepoolsMutation = trpc.fisos.editStakepoolFisoApproval.useMutation();

  const [stakepoolData, setStakepoolData] = useState<TStakePoolWithStats[]>([])
  const [approvedStakepoolData, setApprovedStakepoolData] = useState<TStakePoolWithStats[]>([])
  const [approvedStakepools, setApprovedStakepools] = useState<TFisoApprovedStakePool[]>([])
  const [checked, setChecked] = useState<string[]>([])
  const [approvedChecked, setApprovedChecked] = useState<string[]>([])
  const [epochs, setEpochs] = useState({
    startEpoch: 0,
    endEpoch: 0
  })
  const [epochsErrors, setEpochsErrors] = useState({
    startEpoch: false,
    endEpoch: false
  })
  const [approvedEpochs, setApprovedEpochs] = useState({
    startEpoch: 0,
    endEpoch: 0
  })
  const [approvedEpochsErrors, setApprovedEpochsErrors] = useState({
    startEpoch: false,
    endEpoch: false
  })
  const [shouldResetData, setShouldResetData] = useState(false);
  const [dataLoading, setDataLoading] = useState(false)


  // current epoch stuff
  const currentEpochQuery = trpc.stakepool.getCurrentEpoch.useQuery()
  const [currentEpoch, setCurrentEpoch] = useState<number>(450)
  useEffect(() => {
    if (currentEpochQuery.status === 'success') setCurrentEpoch(currentEpochQuery.data.epoch)
  }, [currentEpochQuery.status])
  ////

  const resetData = async () => {
    if (
      fisosQuery.status === 'success'
      && selectedProject
      && selectedFiso
    ) {
      setDataLoading(true)
      const fiso = fisosQuery.data.find(item => item.id === Number(selectedFiso))
      setSelectedFisoData(fiso)
      if (fiso) {
        const stakepoolIds = fiso.spoSignups.map(pool => pool.poolId)
        await getStakepoolData(stakepoolIds)
        setEpochs({
          startEpoch: fiso.startEpoch,
          endEpoch: fiso.endEpoch
        })
        setApprovedEpochs({
          startEpoch: fiso.startEpoch,
          endEpoch: fiso.endEpoch
        })
      }
      setDataLoading(false)
    }
  }

  useEffect(() => {
    if (shouldResetData) {
      resetData();
      setShouldResetData(false);
    }
  }, [shouldResetData, resetData]);

  useEffect(() => {
    setShouldResetData(true)
  }, [fisosQuery.status, approvedStakepoolsQuery.status, selectedFiso, selectedProject])

  const getStakepoolData = async (fisoPoolIds: string[]) => {
    try {
      const response = await stakepoolInfo.mutateAsync({ stakepoolIds: fisoPoolIds });
      const refetchApprovedStakepools = await approvedStakepoolsQuery.refetch()
      if (approvedStakepoolsQuery.status === 'success' && response.successfulStakePools.length > 0 && refetchApprovedStakepools) {
        const approvedResponse = approvedStakepoolsQuery.data
        setApprovedStakepools(approvedResponse)
        const approvedStakePools = approvedResponse.map(pool => pool.poolId);
        const [approvedPools, remainingPools] =
          response.successfulStakePools
            .reduce<[TStakePoolWithStats[], TStakePoolWithStats[]]>((acc, pool) => {
              if (approvedStakePools.includes(pool.pool_id)) {
                acc[0].push(pool);
              } else {
                acc[1].push(pool);
              }
              return acc;
            }, [[], []]);
        setApprovedStakepoolData(approvedPools)
        console.log(approvedPools)
        setStakepoolData(remainingPools);
      } else {
        setStakepoolData(response.successfulStakePools);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const handleProjectChange = (e: SelectChangeEvent) => {
    setSelectedProject(e.target.value as string);
  };

  const handleFisoChange = (e: SelectChangeEvent) => {
    setSelectedFiso(e.target.value as string);
  };

  const handleChangeEpoch = (e: ChangeEvent<HTMLInputElement>) => {
    if (fisosQuery.status === 'success'
      && selectedProject
      && selectedFiso
      && selectedFisoData
    ) {
      const startEp = selectedFisoData.startEpoch
      const endEp = selectedFisoData.endEpoch
      if (
        Number(e.target.value) >= startEp
        && Number(e.target.value) <= endEp
      ) {
        setEpochs(prev => ({
          ...prev,
          [e.target.name]: e.target.value
        }))
        setEpochsErrors(prev => ({
          ...prev,
          [e.target.name]: false
        }))
      }
      else {
        setEpochs(prev => ({
          ...prev,
          [e.target.name]: e.target.value
        }))
        setEpochsErrors(prev => ({
          ...prev,
          [e.target.name]: true
        }))
        setErrorMessage(`Epochs must be between ${startEp} & ${endEp}`);
        setOpenError(true);
      }
    }
  }
  const handleChangeApprovedEpoch = (e: ChangeEvent<HTMLInputElement>) => {
    if (fisosQuery.status === 'success'
      && selectedProject
      && selectedFiso
      && selectedFisoData
    ) {
      currentEpoch
      const startEp = selectedFisoData.startEpoch
      const endEp = selectedFisoData.endEpoch

      // start epoch error checks
      // greater than or equal to start of FISO
      // less than current end epoch
      // less than end of FISO
      if (
        e.target.name === 'startEpoch'
        && Number(e.target.value) >= startEp
        && Number(e.target.value) < approvedEpochs.endEpoch
        && Number(e.target.value) < endEp
      ) {
        setApprovedEpochs(prev => ({
          ...prev,
          [e.target.name]: e.target.value
        }))
        setApprovedEpochsErrors(prev => ({
          ...prev,
          [e.target.name]: false
        }))
      } else if (
        e.target.name === 'startEpoch'
      ) {
        setApprovedEpochs(prev => ({
          ...prev,
          [e.target.name]: e.target.value
        }))
        setApprovedEpochsErrors(prev => ({
          ...prev,
          [e.target.name]: true
        }))
        setErrorMessage(`Start epoch must be between ${startEp} & ${Math.min(endEp, approvedEpochs.endEpoch) - 1}`);
        setOpenError(true);
      }

      // end epoch error checks
      // greater than start of FISO plus one
      // greater than current start epoch plus one
      // greater than or equal to current epoch (this prevents us from back-dating after a user has already expected rewards)
      // less than fiso end epoch
      else if (
        e.target.name === 'endEpoch'
        && Number(e.target.value) > (startEp)
        && Number(e.target.value) > (Number(approvedEpochs.startEpoch))
        && Number(e.target.value) >= currentEpoch
        && Number(e.target.value) <= endEp
      ) {
        console.log(approvedEpochs.startEpoch)
        setApprovedEpochs(prev => ({
          ...prev,
          [e.target.name]: e.target.value
        }))
        setApprovedEpochsErrors(prev => ({
          ...prev,
          [e.target.name]: false
        }))
      } else if (
        e.target.name === 'endEpoch'
      ) {
        setApprovedEpochs(prev => ({
          ...prev,
          [e.target.name]: e.target.value
        }))
        setApprovedEpochsErrors(prev => ({
          ...prev,
          [e.target.name]: true
        }))
        console.log(approvedEpochs.startEpoch)
        setErrorMessage(`End epoch must be between ${Math.max((startEp + 1), (Number(approvedEpochs.startEpoch) + 1))} & ${endEp} and greater than current epoch ${currentEpoch}`);
        setOpenError(true);
      }
    }
  }

  const handleSubmitApprove = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProject || !selectedFiso) {
      setErrorMessage('Please select a project and a FISO');
      setOpenError(true);
      return;
    }

    if (checked.length < 1) {
      setErrorMessage('You must select at least one stakepool');
      setOpenError(true);
      return;
    }

    setLoading(true);
    setOpenError(false);
    setOpenSuccess(false);

    try {
      setDataLoading(true)
      const approve = await approveStakepoolsMutation.mutateAsync({
        fisoId: Number(selectedFiso),
        stakepoolIds: checked,
        startEpoch: Number(epochs.startEpoch),
        endEpoch: Number(epochs.endEpoch)
      });
      setSuccessMessage(approve.message)
      setOpenSuccess(true);
      setChecked([])
      setApprovedChecked([])
      if (approve.status === 'success') {
        await approvedStakepoolsQuery.refetch()
        setShouldResetData(true)
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
      setOpenError(true);
    } finally {
      setLoading(false);
      setDataLoading(false)
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProject || !selectedFiso) {
      setErrorMessage('Please select a project and a FISO');
      setOpenError(true);
      return;
    }

    if (approvedChecked.length < 1) {
      setErrorMessage('You must select at least one stakepool');
      setOpenError(true);
      return;
    }

    setLoading(true);
    setOpenError(false);
    setOpenSuccess(false);

    try {
      setDataLoading(true)
      const edit = await editStakepoolsMutation.mutateAsync({
        fisoId: Number(selectedFiso),
        stakepoolIds: approvedChecked,
        startEpoch: Number(approvedEpochs.startEpoch),
        endEpoch: Number(approvedEpochs.endEpoch)
      });
      setSuccessMessage(edit.message)
      setOpenSuccess(true);
      setApprovedChecked([])
      const newApprovedStakepools = await approvedStakepoolsQuery.refetch()
      if (newApprovedStakepools.status === 'success') {
        setApprovedStakepools(newApprovedStakepools.data)
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
      setOpenError(true);
    } finally {
      setLoading(false);
      setDataLoading(false)
    }
  };

  return (
    <AdminMenu>
      <Box maxWidth="md">
        <Box>
          <Typography variant="h2" sx={{ mt: 10, mb: 4, fontWeight: '700' }}>
            Fiso Management
          </Typography>
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
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="fiso-select-label">FISO</InputLabel>
            <Select
              labelId="fiso-select-label"
              id="fiso-select"
              value={selectedFiso?.toString() || ''}
              label="FISO"
              onChange={handleFisoChange}
            >
              {fisosQuery.data?.map((fiso, i) => (
                <MenuItem key={fiso.id} value={fiso.id}>
                  Id: {fiso.id}, start: {fiso.startEpoch}, end: {fiso.endEpoch}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ mb: 3 }}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignContent: 'center'
            }}>
              <Box>
                <Typography variant="h4" sx={{ mb: 2 }}>
                  Approved Stakepools
                </Typography>
              </Box>
              <Box>
                <CSVDownloadButton
                  data={approvedStakepoolData}
                  filename={`approved-stakepools-${selectedProject}-${selectedFiso}.csv`}
                  maxNestedLevel={1}
                  buttonProps={{
                    variant: "contained"
                  }}
                >
                  Download CSV
                </CSVDownloadButton>
              </Box>
            </Box>

            {approvedStakepoolsQuery.isLoading
              ? <Box sx={{ mb: 1 }}>
                Loading...
              </Box>
              : approvedStakepoolsQuery.isError
                ? <Box sx={{ mb: 1 }}>
                  Error fetching stakepool info
                </Box>
                : approvedStakepoolData.length > 0
                  ? <Box>

                    <Box
                      sx={{
                        mb: 2,
                        position: 'sticky',
                        top: '70px',
                        width: '100%',
                        background: theme.palette.background.default,
                        zIndex: 10,
                      }}
                      component="form"
                      onSubmit={handleSubmitEdit}
                    >
                      <Grid
                        container
                        alignItems="center"
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                      // justifyContent="space-between"
                      >
                        <Grid container alignItems="center" spacing={1} xs>
                          <Grid>
                            Start epoch:
                          </Grid>
                          <Grid xs>
                            <UnlabelledTextField
                              type="number"
                              name="startEpoch"
                              value={approvedEpochs.startEpoch}
                              onChange={handleChangeApprovedEpoch}
                              error={approvedEpochsErrors.startEpoch}
                            />
                          </Grid>
                        </Grid>
                        <Grid container alignItems="center" spacing={1} xs>
                          <Grid>
                            End epoch:
                          </Grid>
                          <Grid xs>
                            <UnlabelledTextField
                              type="number"
                              name="endEpoch"
                              value={approvedEpochs.endEpoch}
                              onChange={handleChangeApprovedEpoch}
                              error={approvedEpochsErrors.endEpoch}
                            />
                          </Grid>
                        </Grid>
                        <Grid>
                          <Button type="submit">
                            Edit {approvedChecked.length} Stakepools
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>


                    <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: '6px' }}>
                      {approvedStakepoolData.map((item: TStakePoolWithStats, i: number) => {
                        const labelId = `spo-signup-${item.pool_id}`;
                        const itemApprovedData = approvedStakepools.filter(pool => pool.poolId === item.pool_id)
                        return (
                          <>
                            <FisoListItem
                              approvedData={itemApprovedData[0]}
                              stakepoolData={item}
                              key={labelId}
                              keyString={item.pool_id}
                              checked={approvedChecked}
                              setChecked={setApprovedChecked}
                              loadingItem={dataLoading}
                            />
                            {i < stakepoolData.length - 1 && <Divider />}
                          </>
                        )
                      })}
                    </Box>
                  </Box>
                  : <Box sx={{ mb: 1 }}>
                    No stakepool info to display...
                  </Box>
            }</Box>


          <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignContent: 'center'
          }}>
            <Box>
              <Typography variant="h4" sx={{ mb: 2 }}>
                SPO Signups
              </Typography>
            </Box>
            <Box>
              <CSVDownloadButton
                data={stakepoolData}
                filename={`spo-signups-${selectedProject}-${selectedFiso}.csv`}
                maxNestedLevel={1}
                buttonProps={{
                  variant: "contained"
                }}
              >
                Download CSV
              </CSVDownloadButton>
            </Box>
          </Box>

          {stakepoolInfo.isLoading
            ? <Box sx={{ mb: 1 }}>
              Loading...
            </Box>
            : stakepoolInfo.isError
              ? <Box sx={{ mb: 1 }}>
                Error fetching stakepool info
              </Box>
              : stakepoolData.length > 0
                ? <Box>

                  <Box
                    sx={{
                      mb: 2,
                      position: 'sticky',
                      top: '70px',
                      width: '100%',
                      background: theme.palette.background.default,
                      zIndex: 10,
                    }}
                    component="form"
                    onSubmit={handleSubmitApprove}
                  >
                    <Grid
                      container
                      alignItems="center"
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={2}

                    // justifyContent="space-between"
                    >
                      <Grid container alignItems="center" spacing={1} xs>
                        <Grid>
                          Start epoch:
                        </Grid>
                        <Grid xs>
                          <UnlabelledTextField
                            type="number"
                            name="startEpoch"
                            value={epochs.startEpoch}
                            onChange={handleChangeEpoch}
                            error={epochsErrors.startEpoch}
                          />
                        </Grid>
                      </Grid>
                      <Grid container alignItems="center" spacing={1} xs>
                        <Grid>
                          End epoch:
                        </Grid>
                        <Grid xs>
                          <UnlabelledTextField
                            type="number"
                            name="endEpoch"
                            value={epochs.endEpoch}
                            onChange={handleChangeEpoch}
                            error={epochsErrors.endEpoch}
                          />
                        </Grid>
                      </Grid>
                      <Grid>
                        <Button type="submit">
                          Approve {checked.length} Stakepools
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>

                  <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: '6px' }}>
                    {stakepoolData.map((item: TStakePoolWithStats, i: number) => {
                      const labelId = `spo-signup-${item.pool_id}`;
                      return (
                        <>
                          <FisoListItem
                            stakepoolData={item}
                            key={labelId}
                            keyString={item.pool_id}
                            checked={checked}
                            setChecked={setChecked}
                            loadingItem={dataLoading}
                          />
                          {i < stakepoolData.length - 1 && <Divider />}
                        </>
                      )
                    })}
                  </Box>
                </Box>
                : <Box sx={{ mb: 1 }}>
                  No stakepool info to display...
                </Box>
          }
        </Box>
      </Box>
      <Snackbar open={openError} autoHideDuration={6000} onClose={() => setOpenError(false)}>
        <Alert severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
      <Snackbar open={openSuccess} autoHideDuration={6000} onClose={() => setOpenSuccess(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </AdminMenu>
  );
};

export default FisoManagementPage;
