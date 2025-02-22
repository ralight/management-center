import React, { useContext } from 'react';

import BrokerSelect from './BrokerSelect';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Paper from '@material-ui/core/Paper';
import ReloadIcon from '@material-ui/icons/Replay';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress'
import { connect } from 'react-redux';
import ConnectionNewComponent from './ConnectionNewComponent';

// import MessagePage from './MessagePage';

const reloadPage = () => {
	window.location.reload();
}

// Quick fix: use data URL in cause the proxy server 
// is not available and does not host the image any more
const disconnectedImage = 
`data:image/png;base64,
iVBORw0KGgoAAAANSUhEUgAAAPoAAAD6CAYAAACI7Fo9AAAFYmlUWHRYTUw6Y29tLmFkb2JlLnhtc
AAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz
4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS4
1LjAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJk
Zi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6Z
GM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgeG1sbnM6ZXhpZj0iaHR0cD
ovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iCiAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmU
uY29tL3RpZmYvMS4wLyIKICAgIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9w
aG90b3Nob3AvMS4wLyIKICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL
yIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG
1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW5
0IyIKICAgZXhpZjpQaXhlbFhEaW1lbnNpb249IjI1MCIKICAgZXhpZjpQaXhlbFlEaW1lbnNpb249
IjI1MCIKICAgZXhpZjpDb2xvclNwYWNlPSIxIgogICB0aWZmOkltYWdlV2lkdGg9IjI1MCIKICAgd
GlmZjpJbWFnZUxlbmd0aD0iMjUwIgogICB0aWZmOlJlc29sdXRpb25Vbml0PSIyIgogICB0aWZmOl
hSZXNvbHV0aW9uPSIzMDAuMCIKICAgdGlmZjpZUmVzb2x1dGlvbj0iMzAwLjAiCiAgIHBob3Rvc2h
vcDpDb2xvck1vZGU9IjMiCiAgIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIu
MSIKICAgeG1wOk1vZGlmeURhdGU9IjIwMjAtMTEtMTNUMTU6MzY6MTkrMDE6MDAiCiAgIHhtcDpNZ
XRhZGF0YURhdGU9IjIwMjAtMTEtMTNUMTU6MzY6MTkrMDE6MDAiPgogICA8ZGM6dGl0bGU+CiAgIC
A8cmRmOkFsdD4KICAgICA8cmRmOmxpIHhtbDpsYW5nPSJ4LWRlZmF1bHQiPmRpc2Nvbm5lY3RlZDw
vcmRmOmxpPgogICAgPC9yZGY6QWx0PgogICA8L2RjOnRpdGxlPgogICA8eG1wTU06SGlzdG9yeT4K
ICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJwcm9kdWNlZCIKI
CAgICAgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWZmaW5pdHkgRGVzaWduZXIgKEp1bCAyOCAyMDIwKS
IKICAgICAgc3RFdnQ6d2hlbj0iMjAyMC0xMS0xM1QxNTozNjoxOSswMTowMCIvPgogICAgPC9yZGY
6U2VxPgogICA8L3htcE1NOkhpc3Rvcnk+CiAgPC9yZGY6RGVzY3JpcHRpb24+CiA8L3JkZjpSREY+
CjwveDp4bXBtZXRhPgo8P3hwYWNrZXQgZW5kPSJyIj8+4PsUYAAAAYNpQ0NQc1JHQiBJRUM2MTk2N
i0yLjEAACiRdZHPK0RRFMc/M0PkRyMsLCxeGlZoUBMWykwaStIY5ddm5pkfat7M672RZKtspyix8W
vBX8BWWStFpGRlYU1smJ7zzNRMMud27vnc773ndO+54AynVM2s8oKWzhqhoF+Zm19Qal6opwo3zQx
HVFMfnZ6epKJ93uOw422PXavyuX+tfjlmquCoFR5RdSMrPC48uZbVbd4RblWTkWXhM+FuQy4ofGfr
0QK/2pwo8LfNRjgUAGeTsJIo42gZq0lDE5aX49FSq2rxPvZLGmLp2RmJHeLtmIQI4kdhgjEC+OhjS
GYfPfTTKysq5Ht/86fISK4qs846BiskSJKlW9RVqR6TGBc9JiPFut3/v3014wP9heoNfqh+tqz3Tq
jZhnzOsr6OLCt/DK4nuEyX8jOHMPgheq6keQ7AvQnnVyUtugsXW9D2qEeMyK/kEnfG4/B2Co3z0HI
DdYuFnhX3OXmA8IZ81TXs7UOXnHcv/QBcSmfhh50xhQAAAAlwSFlzAAAuIwAALiMBeKU/dgAAIABJ
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`;

const getDialogContent = (handleClose, brokerConnections, connected, proxyConnected, editDefaultClient) => {

	if (editDefaultClient) {
		return <>
			<DialogTitle align="center" id="not-connected-dialog-title">
				{ !connected ? 'Applying changes' : 'Changes applied' }
			</DialogTitle>
			<DialogContent>
				<Grid container spacing={24} justifyContent="center" style={{ maxWidth: '100%' }}>
					<Grid item xs={12} align="center">
						<DialogContentText id="alert-dialog-description">
						{ 
							!connected 
							? 'Please wait while we are applying the changes to the broker.' 
							: 'Please reload this page to synchronize with the Management Center server.'
						}
						</DialogContentText>
						{ 
							!connected 
							? <CircularProgress color="secondary" />
							: <Button
								size="small" 
								variant="contained"
								color="primary"
								startIcon={<ReloadIcon />}
								onClick={() => reloadPage()}
							>
								Reload now
							</Button>
						}
						
					</Grid>
				</Grid>
			</DialogContent>
		</>
	} else if (!brokerConnections || brokerConnections.length === 0) {
		return <>
			<DialogTitle align="center" id="not-connected-dialog-title">
				You have not configured any broker.
			</DialogTitle>
			<DialogContent>
				<Grid container spacing={24} justifyContent="center" style={{ maxWidth: '100%' }}>
					<Grid item xs={12} align="center">
						<DialogContentText id="alert-dialog-description">
							Please create a connection first.
						</DialogContentText>
						<ConnectionNewComponent />
					</Grid>
				</Grid>
			</DialogContent>
		</>
	} else if (!connected) {
		return <>
			<DialogTitle align="center" id="not-connected-dialog-title">
				We could not connect to your broker
				{handleClose ? (
					<IconButton
					aria-label="close"
					onClick={handleClose}
					sx={{
						position: 'absolute',
						right: 8,
						top: 8,
						color: (theme) => theme.palette.grey[500],
					}}
					>
					<CloseIcon />
					</IconButton>
				) : null}
			</DialogTitle>
			<DialogContent>
				<Grid container spacing={24} justifyContent="center" style={{ maxWidth: '100%' }}>
					<Grid item xs={12} align="center">
						<img src={disconnectedImage} />
					</Grid>
					<Grid item xs={12} align="center">
						{
							brokerConnections.length === 1
							&& <>
								<DialogContentText id="alert-dialog-description">
									Please make sure that the connection information is correct.
								</DialogContentText>
							</>
						}
						{
							brokerConnections.length > 1
							&& <>
								<DialogContentText id="alert-dialog-description">
									Please make sure that the connection information is correct or select another connection
								</DialogContentText>
								<BrokerSelect />
							</>
						}
					</Grid>
				</Grid>
			</DialogContent>
		</>
	} else if (!proxyConnected) {
		return <>
			<DialogTitle align="center" id="not-connected-dialog-title">
				We could not connect to the proxy server
			</DialogTitle>
			<DialogContent>
				<Grid container spacing={24} justifyContent="center" style={{ maxWidth: '100%' }}>
					<Grid item xs={12} align="center">
						<img src={disconnectedImage} />
					</Grid>
					<Grid item xs={12} align="center">
						<DialogContentText id="alert-dialog-description">
							Please start the proxy server and reload this page
						</DialogContentText>
						<Button
							size="small" 
							variant="contained"
							color="primary"
							startIcon={<ReloadIcon />}
							onClick={() => reloadPage()}
						>
							Reload now
						</Button>
					</Grid>
				</Grid>
			</DialogContent>
		</>
	}
}
const DisconnectedDialog = ({ brokerConnections, connected, proxyConnected, editDefaultClient }) => {

	const [open, setOpen] = React.useState(true);

	const handleClose = () => {
		setOpen(false);
	};

	return (
		<Dialog
			open={open && (editDefaultClient || !connected || !proxyConnected)}
			aria-labelledby="not-connected-dialog-title"
			aria-describedby="not-connected-dialog-description"
		>
			{
				getDialogContent(handleClose, brokerConnections, connected, proxyConnected, editDefaultClient)
			}
		</Dialog>
	);
};

const mapStateToProps = (state) => {
	return {
		brokerConnections: state.brokerConnections?.brokerConnections,
		connected: state.brokerConnections?.connected,
		editDefaultClient: state.brokerConnections?.editDefaultClient,
		proxyConnected: state.proxyConnection?.connected
	};
};

export default connect(mapStateToProps)(DisconnectedDialog);
