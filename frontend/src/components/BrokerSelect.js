import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { useDispatch } from 'react-redux';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputBase from '@material-ui/core/InputBase';
import DisconnectedIcon from '@material-ui/icons/Cancel';
import ConnectedIcon from '@material-ui/icons/CheckCircle';
import {
	updateAnonymousGroup,
	updateGroups,
	updateGroupsAll,
	updateRoles,
	updateRolesAll,
	updateClients,
	updateClientsAll,
	updateBrokerConfigurations,
	updateBrokerConnected,
	updateBrokerConnections,
	updateDefaultACLAccess,
	updateSettings,
	updateStreams,
	updateSystemStatus,
	updateTopicTree,
	updateEditDefaultClient,
	updateFeatures,
	updateBrokerLicenseInformation
} from '../actions/actions';

import {
	updateInspectClients
} from '../admin/inspect/actions/actions';

// import {
// 	colors,
//   } from '@material-ui/core';

import { WebSocketContext } from '../websockets/WebSocket';

const CustomInput = withStyles((theme) => ({
	root: {
		'label + &': {
			marginTop: theme.spacing(1)
		}
	}
}))(InputBase);

const useStyles = makeStyles((theme) => ({
	root: {
		paddingLeft: '20px',
		backgroundColor: 'rgba(255,255,255,0.2)',
		border: 'thin solid rgba(255,255,255,0.5)',
		color: 'white',
		fontSize: '14px'
	},
	label: {
		fontSize: '12px',
		textTransform: 'uppercase',
		transform: 'translate(14px, 20px) scale(1)',
		color: 'white',
	},
	formControl: {
		// margin: theme.spacing(1),
		// height: "25px",
		margin: theme.spacing(1),
		minWidth: 120
	},
	select: {
		fontSize: '14px',
	}
}));

const BrokerSelect = ({ brokerConnections, connected, currentConnectionName, sendMessage, userProfile }) => {
	const classes = useStyles();
	const context = useContext(WebSocketContext);
	const dispatch = useDispatch();
	const [connection, setConnection] = React.useState('');

	const handleConnectionChange = async (event) => {
		dispatch(updateBrokerLicenseInformation(null));
		dispatch(updateInspectClients([]));
		dispatch(updateClients([]));
		dispatch(updateClientsAll([]));
		dispatch(updateGroups([]));
		dispatch(updateGroupsAll([]));
		dispatch(updateRoles([]));
		dispatch(updateRolesAll([]));
		dispatch(updateStreams([]));
		dispatch(updateSystemStatus({}));

		const connectionID = event.target.value;
		const { client } = context;
		await client.disconnectFromBroker(connection);
		dispatch(updateBrokerConnected(false, connectionID));
		if (connectionID && connectionID !== '') {
			try {
				await client.connectToBroker(connectionID);
				dispatch(updateBrokerConnected(true, connectionID));
			} catch (error) {
				dispatch(updateBrokerConnected(false, connectionID));
				return;
			}
			const settings = await client.getSettings();
			dispatch(updateSettings(settings));
			const brokerConnections = await client.getBrokerConnections();
			dispatch(updateBrokerConnections(brokerConnections));
			const brokerConfigurations = await client.getBrokerConfigurations();
			dispatch(updateBrokerConfigurations(brokerConfigurations));
			try {
				console.log('Loading dynamic security');
				const clients = await client.listClients(true, 10, 0);
				dispatch(updateClients(clients));
				const clientsAll = await client.listClients(false);
				dispatch(updateClientsAll(clientsAll));
				const groups = await client.listGroups(true, 10, 0);
				dispatch(updateGroups(groups));
				const groupsAll = await client.listGroups(false);
				dispatch(updateGroupsAll(groupsAll));
				const anonymousGroup = await client.getAnonymousGroup();
				dispatch(updateAnonymousGroup(anonymousGroup));
				const roles = await client.listRoles(true, 10, 0);
				dispatch(updateRoles(roles));
				const rolesAll = await client.listRoles(false);
				dispatch(updateRolesAll(rolesAll));

				const defaultACLAccess = await client.getDefaultACLAccess();
				dispatch(updateDefaultACLAccess(defaultACLAccess));
				dispatch(updateFeatures({
					feature: 'dynamicsecurity',
					status: 'ok'
				}));
			} catch (error) {
				console.error('Error loading dynamic security');
				console.error(error);
				dispatch(updateFeatures({
					feature: 'dynamicsecurity',
					status: error
				}));
			}
			try {
				const licenseInformation = await client.getLicenseInformation();
				dispatch(updateBrokerLicenseInformation(licenseInformation));
			} catch (error) {
				console.error('Error loading license information');
				console.error(error);
				dispatch(updateBrokerLicenseInformation({}));
			}
			try {
				console.log('Loading inspection');
				const inspectClients = await client.inspectListClients();
				dispatch(updateInspectClients(inspectClients));
				dispatch(updateFeatures({
					feature: 'inspect',
					status: 'ok'
				}));
			} catch (error) {
				console.error('Error loading inspection');
				console.error(error);
				dispatch(updateFeatures({
					feature: 'inspect',
					status: error
				}));
			}
			try {
				console.log('Loading streams');
				const streams = await client.listStreams();
				dispatch(updateStreams(streams));
				dispatch(updateFeatures({
					feature: 'streamprocessing',
					status: 'ok'
				}));
			} catch (error) {
				console.error('Error loading streams');
				console.error(error);
				dispatch(updateFeatures({
					feature: 'streamprocessing',
					status: error
				}));
			}
			// const plugins = await client.listPlugins();
			// dispatch(updatePlugins(plugins));
			setConnection(event.target.value);
		} else {
		}
	};

	return brokerConnections ? (
		<FormControl id="connection-select" variant="outlined" className={classes.formControl}>
			<InputLabel
				id="broker-select-outlined-label"
				classes={{
					root: classes.label
				}}
			>
				Connection
			</InputLabel>
			<Select
				// displayEmpty
				defaultValue={currentConnectionName}
				labelId="broker-select-outlined-label"
				id="connection"
				value={currentConnectionName || ''}
				onChange={handleConnectionChange}
				label="Connection"
				classes={{
					root: classes.root,
					icon: classes.icon
				}}
				input={<CustomInput />}
			>
				{brokerConnections && Array.isArray(brokerConnections)
					? brokerConnections
							.filter((brokerConnection) => brokerConnection.status ? brokerConnection.status.connected : false)
							.map((brokerConnection) => (
								<MenuItem
									key={brokerConnection.name}
									value={brokerConnection.name}
									classes={{
										root: classes.select
									}}
								>
									{brokerConnection.name}
								</MenuItem>
							))
					: null}
			</Select>
		</FormControl>
	) : null;
};

const mapStateToProps = (state) => {
	return {
		brokerConnections: state.brokerConnections.brokerConnections,
		connected: state.brokerConnections.connected,
		currentConnectionName: state.brokerConnections.currentConnectionName,
		userProfile: state.userProfile?.userProfile,
	};
};

export default connect(mapStateToProps)(BrokerSelect);
