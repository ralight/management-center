import React, { useContext, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { updateCluster, updateClusters } from '../actions/actions';
import { useSnackbar } from 'notistack';

import { Alert, AlertTitle } from '@material-ui/lab';
import AccountCircle from '@material-ui/icons/AccountCircle';
import ClusterIcon from '@material-ui/icons/Storage';
import Box from '@material-ui/core/Box';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import ClientIDIcon from '@material-ui/icons/Fingerprint';
import ClientIcon from '@material-ui/icons/Person';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import PasswordIcon from '@material-ui/icons/VpnKey';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import SaveIcon from '@material-ui/icons/Save';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { WebSocketContext } from '../../../websockets/WebSocket';
import { makeStyles } from '@material-ui/core/styles';
import { useConfirm } from 'material-ui-confirm';
import { useHistory } from 'react-router-dom';
import AutoSuggest from '../../../components/AutoSuggest';
import SaveCancelButtons from '../../../components/SaveCancelButtons';
import SelectNodeComponent from './SelectNodeComponent';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';

const useStyles = makeStyles((theme) => ({
	root: {
		'& > *': {
			margin: theme.spacing(1)
		},
		'& .MuiTextField-root': {
			margin: theme.spacing(1),
		}
	},
	buttons: {
		'& > *': {
			margin: theme.spacing(1)
		}
	},
	form: {
		display: 'flex',
		flexWrap: 'wrap'
	},
	textField: {
		// marginLeft: theme.spacing(1),
		// marginRight: theme.spacing(1),
		// width: 200,
	},
	margin: {
		margin: theme.spacing(2)
	},
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

const ClusterNew = (props) => {
	const { clusters, clusterManagementFeature } = props;
	const classes = useStyles();

	const [clustername, setClustername] = useState('Example');
	const [clusterDescription, setClusterDescription] = useState('Example cluster');
	const [node1, setNode1] = useState({
		port: 7000
	});
	const [node2, setNode2] = useState({
		port: 7000
	});
	const [node3, setNode3] = useState({
		port: 7000
	});

	const clusternameExists = props?.clusters?.find((searchCluster) => {
		return searchCluster.clustername === clustername;
	});

	const nodes = [
		node1, node2, node3
	];

	const validate = () => {
		const valid = !clusternameExists && clustername !== '';
		return valid;
	};

	const { enqueueSnackbar } = useSnackbar();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const history = useHistory();
	const confirm = useConfirm();
	const { client } = context;

	const onSaveCluster = async () => {
		try {
			await client.createCluster({
				clustername, 
				description: clusterDescription,
				nodes
			});
			const clusters = await client.listClusters();
			dispatch(updateClusters(clusters));
			history.push(`/admin/clusters`);
			enqueueSnackbar(`Cluster "${clustername}" successfully created.`, {
				variant: 'success'
			});
		} catch (error) {
			enqueueSnackbar(`Error creating cluster "${clustername}". Reason: ${error.message || error}`, {
				variant: 'error'
			});
			throw error;
		}
	};

	const onCancel = async () => {
		await confirm({
			title: 'Cancel cluster creation',
			description: `Do you really want to cancel creating this cluster?`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained'
			}
		});
		history.goBack();
	};

	return (
		<div>
			<Breadcrumbs aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/home">
					Home
				</RouterLink>
				<RouterLink className={classes.breadcrumbLink} to="/security">
					Admin
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					Clusters
				</Typography>
			</Breadcrumbs>
			<br />
			{/* TODO: Quick hack to detect whether feature is supported */}
			{clusterManagementFeature?.error ? <><br /><Alert severity="warning">
				<AlertTitle>{clusterManagementFeature.error.title}</AlertTitle>
				{clusterManagementFeature.error.message}
			</Alert></> : null}
			{!clusterManagementFeature?.error && <div className={classes.root}>
				<Paper>
					<form className={classes.form} noValidate autoComplete="off">
						<div className={classes.margin}>
							<Grid container spacing={1} alignItems="flex-end">
								<Grid item xs={12} sm={4}>
									<TextField
										error={clusternameExists}
										helperText={clusternameExists && 'A cluster with this clustername already exists.'}
										required
										id="clustername"
										label="Cluster name"
										onChange={(event) => setClustername(event.target.value)}
										defaultValue="Example"
										variant="outlined"
										fullWidth
										className={classes.textField}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<ClusterIcon />
												</InputAdornment>
											)
										}}
									/>
								</Grid>
								<Grid item xs={12} sm={8}>
									<TextField
										required={false}
										id="description"
										label="Cluster description"
										onChange={(event) => setClusterDescription(event.target.value)}
										defaultValue="Example cluster"
										variant="outlined"
										fullWidth
										className={classes.textField}
									/>
								</Grid>
								<Grid item xs={12}>
									<Card variant="outlined">
										<CardHeader
											subheader="Node 1"
										/>
										<CardContent>
											<SelectNodeComponent
												defaultNode={node1}
											/>
										</CardContent>
									</Card>
									<br />
									<Card variant="outlined">
										<CardHeader
											subheader="Node 2"
										/>
										<CardContent>
											<SelectNodeComponent
												defaultNode={node2}
											/>
										</CardContent>
									</Card>
									<br />
									<Card variant="outlined">
										<CardHeader
											subheader="Node 3"
										/>
										<CardContent>
											<SelectNodeComponent
												defaultNode={node3}
											/>
										</CardContent>
									</Card>
								</Grid>
								<Grid container xs={12} alignItems="flex-start">
									<Grid item xs={12} className={classes.buttons}>
										<SaveCancelButtons
											onSave={onSaveCluster}
											saveDisabled={!validate()}
											onCancel={onCancel}
										/>
									</Grid>
								</Grid>
							</Grid>
						</div>
					</form>
				</Paper>
			</div>}
		</div>
	);
};

const mapStateToProps = (state) => {
	return {
		clusters: state.clusters?.clusters,
		clusterManagementFeature: state.systemStatus?.features?.clustermanagement,
	};
};

export default connect(mapStateToProps)(ClusterNew);
