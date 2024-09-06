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
	Container,
	Alert,
	Divider
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';
import Snackbar from '@mui/material/Snackbar';
import { trpc } from '@lib/utils/trpc';
import { string } from 'zod';

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
	email: false
}

const emailRegex = /\S+@\S+\.\S+/;

const Apply = () => {
	const theme = useTheme()

	const [formData, updateFormData] = useState(initialFormData);
	const [formErrors, setFormErrors] = useState(initialFormErrors)
	const [isLoading, setLoading] = useState(false);
	const [buttonDisabled, setbuttonDisabled] = useState(false)
	// open error snackbar 
	const [openError, setOpenError] = useState(false);
	// open success modal
	const [openSuccess, setOpenSuccess] = useState(false);
	// change error message for error snackbar
	const [errorMessage, setErrorMessage] = useState('Please eliminate form errors and try again')

	const sendEmailMutation = trpc.email.sendEmail.useMutation();

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
			[e.target.name]: e.target.name === 'projectName' ? 'Coinecta ' + e.target.value.trim() : e.target.value.trim()
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

	const trySendMail = async ({ from, to, subject, text, html }: SendEmailParams): Promise<void> => {
		try {
			const result = await sendEmailMutation.mutateAsync({
				from,
				to,
				subject,
				text,
				html,
			});
			console.log('Email sent:', result);
			setLoading(false)
			setOpenSuccess(true)
		} catch (error) {
			setErrorMessage('There was an API error. Please contact the team on Telegram or Discord')
			setOpenError(true)
			setLoading(false)
			console.error('Failed to send email:', error);
		}
	}

	interface ProjectFormData {
		projectName: string;
		description: string;
		projectValue: string;
		competitors: string;
		pitchDeck: string;
		whitePaper: string;
		name: string;
		email: string;
		telegramHandle: string;
		telegramGroup: string;
		accelerator: boolean;
	}

	const createEmailContent = (formData: ProjectFormData) => {
		const nl2br = (str: string) => str.replace(/\n/g, '<br>');
		const htmlContent = `
			<h2>Coinecta Project Application</h2>
			<table>
				 <table style="border-collapse: collapse; width: 100%;">
        <tr><th style="text-align: left; padding: 8px;">Project Name:</th><td style="padding: 8px;">${formData.projectName}</td></tr>
        <tr><th style="text-align: left; padding: 8px;">Description:</th><td style="padding: 8px;">${nl2br(formData.description)}</td></tr>
        <tr><th style="text-align: left; padding: 8px;">Project Value:</th><td style="padding: 8px;">${formData.projectValue}</td></tr>
        <tr><th style="text-align: left; padding: 8px;">Competitors:</th><td style="padding: 8px;">${formData.competitors}</td></tr>
        <tr><th style="text-align: left; padding: 8px;">Pitch Deck:</th><td style="padding: 8px;">${formData.pitchDeck}</td></tr>
        <tr><th style="text-align: left; padding: 8px;">White Paper:</th><td style="padding: 8px;">${formData.whitePaper}</td></tr>
        <tr><th style="text-align: left; padding: 8px;">Applicant Name:</th><td style="padding: 8px;">${formData.name}</td></tr>
        <tr><th style="text-align: left; padding: 8px;">Email:</th><td style="padding: 8px;">${formData.email}</td></tr>
        <tr><th style="text-align: left; padding: 8px;">Telegram Handle:</th><td style="padding: 8px;">${formData.telegramHandle}</td></tr>
        <tr><th style="text-align: left; padding: 8px;">Telegram Group:</th><td style="padding: 8px;">${formData.telegramGroup}</td></tr>
      </table>
			</table>
		`;

		const textContent = Object.entries(formData)
			.map(([key, value]) => `${key}: ${value}`)
			.join('\n');

		return {
			to: process.env.FORM_EMAIL || '',
			subject: "Coinecta Project Application",
			text: textContent,
			html: htmlContent,
		};
	};

	const handleSubmit = (e: any) => {
		e.preventDefault();
		setLoading(true)
		console.log(formData)

		const errorCheck = Object.values(formErrors).every(v => v === false)

		// const defaultOptions = {
		// 	headers: {
		// 		'Content-Type': 'application/json',
		// 		// Authorization: auth?.accessToken ? `Bearer ${auth.accessToken}` : '',
		// 	},
		// };

		// const form = {
		// 	to: process.env.FORM_EMAIL,
		// 	subject: "Coinecta Project Application",
		// 	body: JSON.stringify(formData)
		// }

		// console.log(emptyCheck)

		if (errorCheck) {
			const details = createEmailContent(formData)
			trySendMail({
				...details,
				from: formData.email
			})

			// axios.post(`${process.env.API_URL}/util/email`, { ...defaultOptions, ...form })
			// 	.then(res => {
			// 		console.log(res);
			// 		console.log(res.data);
			// 		setLoading(false)

			// 		// modal for success message
			// 		setOpenSuccess(true)
			// 	})
			// 	.catch(err => {
			// 		console.log(err)
			// 		// snackbar for error message
			// 		setErrorMessage('There was an API error. Please contact the team on Telegram or Discord')
			// 		setOpenError(true)
			// 		setLoading(false)
			// 	});
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
		<Container maxWidth="md" sx={{ py: 12 }}>
			<Typography variant="h2" component="h1" sx={{ fontWeight: '600' }}>
				Information Request Form
			</Typography>
			<Typography variant="body1" sx={{ mb: 4 }}>
				Please fill out as much of the form as you can. Even if you don&apos;t have everything finished, feel free to apply and we can consult with you about your project.
			</Typography>
			<Box component="form" noValidate onSubmit={handleSubmit}>
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
							fullWidth
							id="telegramHandle"
							label="Telegram or Discord handle"
							name="telegramHandle"
							variant="filled"
							onChange={handleChange}
						/>
					</Grid>
					<Grid item xs={12} sm={6}>
						<TextField
							InputProps={{ disableUnderline: true }}
							fullWidth
							name="telegramGroup"
							label="Telegram or Discord Group"
							id="telegramGroup"
							variant="filled"
							onChange={handleChange}
						/>
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

		</Container>
	);
};

export default Apply;