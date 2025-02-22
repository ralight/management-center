import React, { useContext, useState } from 'react';
import { Redirect, Link as RouterLink } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { updateCluster, updateClusters } from '../actions/actions';
import { useSnackbar } from 'notistack';

import AddIcon from '@material-ui/icons/Add';
import RemoveNodeIcon from '@material-ui/icons/RemoveCircle';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import EditIcon from '@material-ui/icons/Edit';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import SaveIcon from '@material-ui/icons/Save';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { WebSocketContext } from '../../../websockets/WebSocket';
import { makeStyles } from '@material-ui/core/styles';
import { useConfirm } from 'material-ui-confirm';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import SelectNodeDialog from './SelectNodeDialog';
import LeaderIcon from '@material-ui/icons/Person';
import FollowerIcon from '@material-ui/icons/People';
import ErrorIcon from '@material-ui/icons/Error';
import { green, red } from '@material-ui/core/colors';
import WaitDialog from '../../../components/WaitDialog';

const clusterShape = PropTypes.shape({
	clustername: PropTypes.string,
});

const useStyles = makeStyles((theme) => ({
	root: {
		width: '100%'
	},
	paper: {
		padding: '15px'
	},
	form: {
		// display: 'flex',
		flexWrap: 'wrap'
	},
	textField: {
		// marginLeft: theme.spacing(1),
		// marginRight: theme.spacing(1),
		// width: 200,
	},
	buttons: {
		'& > *': {
			margin: theme.spacing(1)
		}
	},
	margin: {
		margin: theme.spacing(1)
	},
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink
}));

const getNodeIcon = (node) => {
	if (node?.error) {
		return <Tooltip title={node.error.message} aria-label="Leader">
			<ErrorIcon style={{ color: red[500] }} />
		</Tooltip> 
	} else {
		if (node?.leader) {
			return <Tooltip title="Leader" aria-label="Leader">
				<LeaderIcon style={{ color: green[500] }} />
			</Tooltip> 
		} else {
			return <Tooltip title="Follower" aria-label="Follower">
				<FollowerIcon />
			</Tooltip>
		}
	}
}

const ClusterDetail = (props) => {
	const classes = useStyles();
	const [value, setValue] = React.useState(0);
	const [editMode, setEditMode] = React.useState(false);
	const [selectNodeDialogOpen, setSelectNodeDialogOpen] = React.useState(false);
	const [progressDialogOpen, setProgressDialogOpen] = React.useState(false);
	const { enqueueSnackbar } = useSnackbar();

	const { cluster } = props;
	const [updatedCluster, setUpdatedCluster] = React.useState({
		...cluster,
	});

	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const confirm = useConfirm();
	const { client: brokerClient } = context;

	const validate = () => {
		if (editMode) {
			return updatedCluster.clustername !== '';
		}
	};

	const addNodeToCluster = async (node) => {
		setSelectNodeDialogOpen(false);
		setProgressDialogOpen(true);
		try {
			await brokerClient.joinCluster(cluster.clustername, node);
			enqueueSnackbar('Node successfully added to cluster', {
				variant: 'success'
			});
			const clusterObject = await brokerClient.getCluster(cluster.clustername);
			dispatch(updateCluster(clusterObject));
			setUpdatedCluster({
				...clusterObject
			});
			const clusters = await brokerClient.listClusters();
			dispatch(updateClusters(clusters));
		} catch (error) {
			enqueueSnackbar(`Error adding node "${node.nodeId}" to cluster. Reason: ${error.message || error}`, {
				variant: 'error'
			});
		}
		setProgressDialogOpen(false);
	}

	const removeNodeFromCluster = async (nodeId) => {
		await confirm({
			title: 'Confirm node removal',
			description: `Do you really want to remove the node "${nodeId}" from this cluster?`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained'
			}
		});

		setProgressDialogOpen(true);
		try {
			await brokerClient.leaveCluster(cluster.clustername, nodeId);
			enqueueSnackbar('Node successfully removed from cluster', {
				variant: 'success'
			});
			const clusterObject = await brokerClient.getCluster(cluster.clustername);
			dispatch(updateCluster(clusterObject));
			setUpdatedCluster({
				...clusterObject
			});
			const clusters = await brokerClient.listClusters();
			dispatch(updateClusters(clusters));
		} catch (error) {
			enqueueSnackbar(`Error removing node "${nodeId}" from cluster. Reason: ${error.message || error}`, {
				variant: 'error'
			});
		}
		setProgressDialogOpen(false);
	}

	const onUpdateClusterDetail = async () => {
		await brokerClient.modifyCluster(updatedCluster);
		enqueueSnackbar('Cluster successfully updated', {
			variant: 'success'
		});
		const clusterObject = await brokerClient.getCluster(updatedCluster.clustername);
		dispatch(updateCluster(clusterObject));
		const clusters = await brokerClient.listClusters();
		dispatch(updateClusters(clusters));
		setEditMode(false);
	};

	const onEnableLTS = async (cluster, node) => {
		// TODO
	};

	const onDisableLTS = async (cluster, node) => {
		// TODO
	};

	const onCancelEdit = async () => {
		await confirm({
			title: 'Cancel cluster editing',
			description: `Do you really want to cancel editing this cluster?`,
			cancellationButtonProps: {
				variant: 'contained'
			},
			confirmationButtonProps: {
				color: 'primary',
				variant: 'contained'
			}
		});
		setUpdatedCluster({
			...cluster
		});
		setEditMode(false);
	};

	return cluster ? (<div>
		<Breadcrumbs aria-label="breadcrumb">
			<RouterLink className={classes.breadcrumbLink} to="/home">
				Home
			</RouterLink>
			<RouterLink className={classes.breadcrumbLink} color="inherit" to="/admin">
				Admin
			</RouterLink>
			<RouterLink className={classes.breadcrumbLink} to="/admin/clusters">
				Clusters
			</RouterLink>
			<Typography className={classes.breadcrumbItem} color="textPrimary">
				{cluster.clustername}
			</Typography>
		</Breadcrumbs>
		<br />
		<Paper className={classes.paper}>
			<form className={classes.form} noValidate autoComplete="off">
				<div className={classes.margin}>
					<Grid container spacing={1} alignItems="flex-end">
						<Grid item xs={12} sm={4}>
							<TextField
								required={editMode}
								disabled={true}
								id="clustername"
								label="Clustername"
								value={updatedCluster?.clustername}
								defaultValue=""
								variant="outlined"
								fullWidth
								className={classes.textField}
							/>
						</Grid>
						<Grid item xs={12} sm={8}>
							<TextField
								disabled={!editMode}
								id="description"
								label="Description"
								value={updatedCluster?.description}
								onChange={(event) => {
									if (editMode) {
										setUpdatedCluster({
											...updatedCluster,
											description: event.target.value
										});
									}
								}}
								defaultValue=""
								variant="outlined"
								fullWidth
								className={classes.textField}
							/>
						</Grid>
						<br />
					</Grid>
					<br />
					<Grid container spacing={1} alignItems="flex-end">
						{cluster?.nodes?.map((node, index) =>
							<Grid item xs={12} md={4}>
								<Card variant="outlined">
									<CardHeader
										avatar={getNodeIcon(node)}
										subheader={node.broker}
									/>
									<CardContent>
										<Grid container spacing={1} alignItems="flex-end">
											<Grid item xs={12}>
												<TextField
													disabled={true}
													id={node?.nodeId}
													label="Node ID"
													value={node?.nodeId}
													defaultValue=""
													variant="outlined"
													fullWidth
													className={classes.textField}
												/>
											</Grid>
											<Grid item xs={12}>
												<TextField
													disabled={true}
													id={node?.address}
													label="Address"
													value={node?.address}
													defaultValue=""
													variant="outlined"
													fullWidth
													className={classes.textField}
												/>
											</Grid>
											<Grid item xs={12}>
												<TextField
													disabled={true}
													label="Port"
													value={node?.port}
													defaultValue=""
													variant="outlined"
													fullWidth
													className={classes.textField}
												/>
											</Grid>
											{/* <Grid item xs={12}>
													<TextField
														disabled={true}
														id={`${node.id}-redis-hostname`}
														label="Redis Host"
														value={node.ha?.backendhosts[0]?.hostname}
														defaultValue=""
														variant="outlined"
														fullWidth
														className={classes.textField}
													/>
												</Grid>
												<Grid item xs={12}>
													<TextField
														disabled={true}
														id={`${node.id}-redis-port`}
														label="Redis Port"
														value={node.ha?.backendhosts[0]?.port}
														defaultValue=""
														variant="outlined"
														fullWidth
														className={classes.textField}
													/>
												</Grid> */}
											{/* <Grid item xs={12}>
													<Tooltip title="Use LTS">
														<FormControlLabel
															disabled={!editMode}
															control={
																<Switch
																	disabled={!editMode}
																	checked={
																		node.ha?.uselts
																	}
																	onClick={(event) => {
																		event.stopPropagation();
																		if (event.target.checked) {
																			onEnableLTS(cluster, node);
																		} else {
																			onDisableLTS(cluster, node);
																		}
																	}}
																/>
															}
															label="Use LTS" 
														/>
													</Tooltip>
												</Grid> */}
										</Grid>
									</CardContent>
									<CardActions>
										<Button
											disabled={!editMode || cluster?.nodes?.length <= 3}
											size="small"
											onClick={() => removeNodeFromCluster(node.broker)}
											startIcon={<RemoveNodeIcon />}
										>
											Remove
										</Button>
									</CardActions>
								</Card>
							</Grid>
						)}
					</Grid>
				</div>
			</form>
			{!editMode && (
				<Grid item xs={12} className={classes.buttons}>
					<Button
						variant="contained"
						color="primary"
						className={classes.button}
						startIcon={<EditIcon />}
						onClick={() => setEditMode(true)}
					>
						Edit
					</Button>
				</Grid>
			)}
			{editMode && (
				<>
					<Grid item xs={12} className={classes.buttons}>
						<Button
							variant="contained"
							color="primary"
							className={classes.button}
							startIcon={<AddIcon />}
							onClick={() => setSelectNodeDialogOpen(true)}
						>
							Add node
						</Button>
					</Grid>
					<Grid item xs={12} className={classes.buttons}>
						<Button
							variant="contained"
							disabled={!validate()}
							color="primary"
							className={classes.button}
							startIcon={<SaveIcon />}
							onClick={(event) => {
								event.stopPropagation();
								onUpdateClusterDetail();
							}}
						>
							Save
						</Button>
						<Button
							variant="contained"
							onClick={(event) => {
								event.stopPropagation();
								onCancelEdit();
							}}
						>
							Cancel
						</Button>
					</Grid>
				</>
			)}
			<SelectNodeDialog
				open={selectNodeDialogOpen}
				handleClose={() => setSelectNodeDialogOpen(false)}
				handleAddNode={(node) => addNodeToCluster(node)}
				cluster={cluster}
			/>
			<WaitDialog
				title='Update process of your cluster is in process'
				open={progressDialogOpen}
				handleClose={() => setProgressDialogOpen(false)}
			/>
		</Paper>
	</div>) : (
		<Redirect to="/admin/clusters" push />
	);
};

ClusterDetail.propTypes = {
	cluster: clusterShape.isRequired
};

const mapStateToProps = (state) => {
	return {
		cluster: state.clusters?.cluster,
	};
};

export default connect(mapStateToProps)(ClusterDetail);
