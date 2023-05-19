import React, { FC, useRef, useEffect, useState, forwardRef, ForwardedRef } from 'react';
import {
	Typography,
	Grid,
	Box,
	TextField,
	Button,
	FormGroup,
	FormControlLabel,
	Checkbox,
	useTheme,
	Alert
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';
import Snackbar from '@mui/material/Snackbar';

const initialFormData = {
	projectName: '',
	description: '',
	projectValue: '',
	competitors: '',
	pitchDeck: '',
	whitePaper: '',
	name: '',
	email: '',
	telegramHandle: '',
	telegramGroup: '',
	accelerator: false
};

const initialFormErrors = {
	projectName: false,
	description: false,
	projectValue: false,
	name: false,
	email: false,
	telegramHandle: false,
	telegramGroup: false
}

const emailRegex = /\S+@\S+\.\S+/;

const Apply = () => {
  const theme = useTheme()

	// form data is all strings
	const [formData, updateFormData] = useState(initialFormData);

	// form error object, all booleans
	const [formErrors, setFormErrors] = useState(initialFormErrors)

	// loading spinner for submit button
	const [isLoading, setLoading] = useState(false);

	// set true to disable submit button
	const [buttonDisabled, setbuttonDisabled] = useState(false)

	// open error snackbar 
	const [openError, setOpenError] = useState(false);

	// open success modal
	const [openSuccess, setOpenSuccess] = useState(false);

	// change error message for error snackbar
	const [errorMessage, setErrorMessage] = useState('Please eliminate form errors and try again')

	useEffect(() => {
		if (isLoading) {
			setbuttonDisabled(true)
		}
		else {
			setbuttonDisabled(false)
		}
	}, [isLoading])

	const handleChange = (e: any) => {
		if (e.target.value == '' && Object.hasOwnProperty.call(formErrors, e.target.name)) {
			setFormErrors({
				...formErrors,
				[e.target.name]: true
			});
		}
		else if (Object.hasOwnProperty.call(formErrors, e.target.name)) {
			setFormErrors({
				...formErrors,
				[e.target.name]: false
			});
		}

		// console.log(formErrors)

		if (e.target.name == 'email') {
			if (emailRegex.test(e.target.value)) {
				setFormErrors({
					...formErrors,
					email: false
				});
			}
			else {
				setFormErrors({
					...formErrors,
					email: true
				});
			}
		}

		updateFormData({
			...formData,

			// Trimming any whitespace
			[e.target.name]: (e.target.name === 'accelerator') ? e.target.checked : e.target.value.trim()
		});
	};

	// snackbar for error reporting
	const handleCloseError = (reason: any) => {
		if (reason === 'clickaway') {
			return;
		}
		setOpenError(false);
	};

	// modal for success message
	const handleCloseSuccess = (reason: any) => {
		if (reason === 'clickaway') {
			return;
		}
		setOpenSuccess(false);
	};

	const handleSubmit = (e: any) => {
		e.preventDefault();
		setLoading(true)
		console.log(formData)

		const errorCheck = Object.values(formErrors).every(v => v === false)

		const defaultOptions = {
			headers: {
				'Content-Type': 'application/json',
				// Authorization: auth?.accessToken ? `Bearer ${auth.accessToken}` : '',
			},
		};

		const form = {
			to: process.env.FORM_EMAIL,
			subject: "ErgoPad Project Application",
			body: JSON.stringify(formData)
		}

		// console.log(emptyCheck)

		if (errorCheck) {
			axios.post(`${process.env.API_URL}/util/email`, { ...defaultOptions, ...form })
				.then(res => {
					console.log(res);
					console.log(res.data);
					setLoading(false)

					// modal for success message
					setOpenSuccess(true)
				})
				.catch(err => {
					console.log(err)
					// snackbar for error message
					setErrorMessage('There was an API error. Please contact the team on Telegram or Discord')
					setOpenError(true)
					setLoading(false)
				});
		}
		else {
			let updateErrors = {}
			Object.entries(formData).forEach(entry => {
				const [key, value] = entry;
				if (value == '' && Object.hasOwnProperty.call(formErrors, key)) {
					let newEntry = { [key]: true }
					updateErrors = { ...updateErrors, ...newEntry };
				}
			})

			setFormErrors({
				...formErrors,
				...updateErrors
			})

			// snackbar for error message
			setErrorMessage('Please eliminate form errors and try again')
			setOpenError(true)

			// turn off loading spinner for submit button
			setLoading(false)
		}
	};

	return (
		<>

			
			<Grid container maxWidth='lg' sx={{ mx: 'auto', flexDirection: 'row-reverse', px: { xs: 2, md: 3 } }}>

				<Grid item md={8}>
					<Box component="form" noValidate onSubmit={handleSubmit}>
						<Typography variant="h4" sx={{ mb: 4, fontWeight: '700' }}>
							IDO Application form:
						</Typography>
						<Grid container spacing={2}>
							<Grid item xs={12}>
								<TextField
									InputProps={{ disableUnderline: true }}
									name="projectName"
									required
									fullWidth
									id="projectName"
									label="Project Name"
									autoFocus
									variant="filled"
									onChange={handleChange}
									error={formErrors.projectName}
									helperText={formErrors.projectName && 'Enter the project name'}
								/>
							</Grid>
							<Grid item xs={12}>
								<Typography color="text.secondary" sx={{ mb: 1 }}>
									Please describe what your project hopes to accomplish, and how far along you are. Give us some details about your team composition including everyone&apos;s roles and specialties. Provide as much detail as you can about what you need from us and how much progress you&apos;ve made already.
								</Typography>
								<TextField
									InputProps={{ disableUnderline: true }}
									required
									fullWidth
									multiline
									id="description"
									label="Project Description"
									name="description"
									variant="filled"
									onChange={handleChange}
									error={formErrors.description}
									helperText={formErrors.description && 'Enter the project description'}
									rows={6}
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									InputProps={{ disableUnderline: true }}
									required
									fullWidth
									name="projectValue"
									label="Estimated USD needed to fund your project"
									id="project-value"
									variant="filled"
									onChange={handleChange}
									error={formErrors.projectValue}
									helperText={formErrors.projectValue && 'Please provide an estimation, even if it may change later'}
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									InputProps={{ disableUnderline: true }}
									fullWidth
									name="competitors"
									label="List your known competitors"
									id="competitors"
									variant="filled"
									onChange={handleChange}
								/>
							</Grid>
							<Grid item xs={12} sm={6}>
								<TextField
									InputProps={{ disableUnderline: true }}
									fullWidth
									name="pitchDeck"
									label="Link your pitch deck"
									id="pitch-deck"
									variant="filled"
									onChange={handleChange}
								/>
							</Grid>
							<Grid item xs={12} sm={6}>
								<TextField
									InputProps={{ disableUnderline: true }}
									fullWidth
									name="whitePaper"
									label="Link your whitepaper"
									id="white-paper"
									variant="filled"
									onChange={handleChange}
								/>
							</Grid>
							<Grid item xs={12} sm={6}>
								<TextField
									InputProps={{ disableUnderline: true }}
									required
									fullWidth
									id="name"
									label="Your Name"
									name="name"
									type="name"
									variant="filled"
									onChange={handleChange}
									error={formErrors.name}
									helperText={formErrors.name && 'Enter your name'}
								/>
							</Grid>
							<Grid item xs={12} sm={6}>
								<TextField
									InputProps={{ disableUnderline: true }}
									fullWidth
									required
									name="email"
									label="Your Email"
									type="email"
									id="email"
									variant="filled"
									onChange={handleChange}
									error={formErrors.email}
									helperText={formErrors.email && 'Enter a valid email address'}
								/>
							</Grid>
							<Grid item xs={12} sm={6}>
								<TextField
									InputProps={{ disableUnderline: true }}
									required
									fullWidth
									id="telegramHandle"
									label="Your Telegram handle"
									name="telegramHandle"
									variant="filled"
									onChange={handleChange}
									error={formErrors.telegramHandle}
									helperText={formErrors.telegramHandle && 'Enter your Telegram handle'}
								/>
							</Grid>
							<Grid item xs={12} sm={6}>
								<TextField
									InputProps={{ disableUnderline: true }}
									fullWidth
									required
									name="telegramGroup"
									label="Project's Telegram group link"
									id="telegramGroup"
									variant="filled"
									onChange={handleChange}
									error={formErrors.telegramGroup}
									helperText={formErrors.telegramGroup && 'Enter your project\'s Telegram group'}
								/>
							</Grid>
							<Grid item xs={12}>
								<FormGroup sx={{ color: theme.palette.text.secondary }}>
									<FormControlLabel
										control={<Checkbox onChange={handleChange} />}
										label="Apply for the Ergodex/Ergopad project accelerator program"
										name="accelerator"
										id="accelerator"
									/>
								</FormGroup>
							</Grid>
						</Grid>

						<Box sx={{ position: 'relative' }}>
							<Button
								type="submit"
								fullWidth
								disabled={buttonDisabled}
								variant="contained"
								sx={{ mt: 3, mb: 2 }}
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
				</Grid>

				<Grid item md={4} sx={{ flexGrow: 1 }}>
					<Box sx={{ mr: { md: 12, xs: 0 }, mt: { md: 0, xs: 4 } }}>
						<Typography variant="h4" sx={{ fontWeight: '700', lineHeight: '1.2' }}>
							What is the Ergodex/Ergopad Accelerator Program?
						</Typography>

						<Typography variant="body1" sx={{ fontSize: '1rem', mb: 3 }}>
							The accelerator program will submit your project to our partners at ErgoDEX and if accepted, will provide various additional channels for you to market your project. 
						</Typography>

						<Typography variant="body1" sx={{ fontSize: '1rem', mb: 3 }}>
							The ErgoPad and ErgoDEX teams will assist projects in creating relationships with investors, agencies and investment platforms relevant to their projects.
						</Typography>

						<Typography variant="body1" sx={{ fontSize: '1rem', mb: 3 }}>
							ErgoDEX will provide the liquidity farming platform to projects launching through ErgoPad, which will encourage users to provide liquidity to the DEX, increasing the TVL of the platform and extending a projects marketing campaign beyond their IDO.
						</Typography>

						<Typography variant="h4" sx={{ fontWeight: '700', lineHeight: '1.2' }}>
							Not ready to apply?
						</Typography>

						<Typography variant="body1" sx={{ fontSize: '1rem', mb: 3 }}>
							You can find the team on these social platforms:
						</Typography>

						<Box>
							<a href="https://t.me/ergopad_chat" target="_blank" rel="noreferrer">
								<Button
									variant="contained"
									sx={{
										color: '#fff',
										fontSize: '1rem',
										py: '0.6rem',
										px: '1.2rem',
										mr: '1.7rem',
										textTransform: 'none',
										backgroundColor: theme.palette.primary.main,
										'&:hover': {
											backgroundColor: theme.palette.primary.light,
											boxShadow: 'none',
										},
										'&:active': {
											backgroundColor: theme.palette.primary.dark,
										},
									}}
								>
									Telegram
								</Button>
							</a>

							<a href="https://discord.gg/E8cHp6ThuZ" target="_blank" rel="noreferrer">
								<Button
									variant="contained"
									sx={{
										color: '#fff',
										fontSize: '1rem',
										py: '0.6rem',
										px: '1.2rem',
										textTransform: 'none',
										backgroundColor: theme.palette.secondary.main,
										'&:hover': {
											backgroundColor: theme.palette.secondary.light,
											boxShadow: 'none',
										},
										'&:active': {
											backgroundColor: theme.palette.secondary.dark,
										},

									}}
								>
									Discord
								</Button>
							</a>
						</Box>
					</Box>
				</Grid>

				<Snackbar open={openError} autoHideDuration={6000} onClose={handleCloseError}>
					<Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
						{errorMessage}
					</Alert>
				</Snackbar>
				<Snackbar open={openSuccess} autoHideDuration={6000} onClose={handleCloseSuccess}>
					<Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
						Your form has been submmitted. We will get back to you shortly.
					</Alert>
				</Snackbar>



			</Grid>
		</>
	);
};

export default Apply;