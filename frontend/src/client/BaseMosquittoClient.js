const createError = (code, message) => ({
	code,
	message
});

module.exports = class BaseMosquittoClient {
	constructor({ name, logger, defaultListener } = {}) {
		this.name = name || 'Default base Mosquitto client';
		this._logger = logger || {
			log() {},
			info() {},
			warn() {},
			error() {}
		};
		this._eventHandler = (event) => this.logger.info(event);
		this._closeHandler = () => this.logger.info('Close Gateway Client');
		this._eventListeners = new Map();
		this._isConnected = false;
	}

	// eslint-disable-next-line consistent-return
	async connect({ socketEndpointURL } = {}) {
		if (this._isConnected || this._isConnecting) {
			return Promise.resolve({});
		}
		this._isConnecting = true;
		// TODO: handle default values
		this._socketEndpointURL = socketEndpointURL || this._socketEndpointURL;
		try {
			const ws = await this._connectSocketServer(`${this._socketEndpointURL}?authToken=${this._token}`);
			this._ws = ws;
			this._isConnected = true;
		} catch (error) {
			this._isConnected = false;
			this.logger.error(error);
		}
	}

	async reconnect() {
		const socketEndpointURL = this._socketEndpointURL;
		this.connect({ socketEndpointURL });
	}

	async disconnect() {
		if(this._ws) {
			this._ws.close();
		}
		return Promise.resolve();
	}

	async resetConnection() {
		await this.disconnect();
		return this.reconnect();
	}

	get logger() {
		return this._logger;
	}

	/**
	 * ******************************************************************************************
	 * Methods for security policy management
	 * ******************************************************************************************
	 */

	async addPolicy(policyName, policy, users, groups) {
		// TODO: implement
		return Promise.resolve({});
	}

	async deletePolicy(policyName) {
		// TODO: implement
		return Promise.resolve({});
	}

	async replacePolicy(policyName, policy, users, groups) {
		// TODO: implement
		return Promise.resolve({});
	}

	async getPolicy(policyName) {
		// TODO: implement
		return Promise.resolve({});
	}

	// TODO: should include user as parameter
	async setUserPolicy(policyName) {
		// TODO: implement
		return Promise.resolve({});
	}

	// TODO: should include user group as parameter
	async setGroupPolicy(policyName) {
		// TODO: implement
		return Promise.resolve({});
	}

	async listPolicies() {
		// TODO: implement
		return Promise.resolve({});
	}

	async setUserDefaultPolicy(policyName) {
		// TODO: implement
		return Promise.resolve({});
	}

	async setGroupDefaultPolicy(policyName) {
		// TODO: implement
		return Promise.resolve({});
	}

	async addPolicyFeature(policyName,featureName) {
		// TODO: implement
		return Promise.resolve({});
	}

	async removePolicyFeature(policyName,featureName) {
		// TODO: implement
		return Promise.resolve({});
	}

	async addTopicAccessControlPublishWrite(policyName, topicFilter, maxQoS = 2, allowRetain = true, maxPayloadSize = 1000, allow = false) {
		// TODO: implement
		return Promise.resolve({});
	}

	async addTopicAccessControlPublishRead(policyName, topicFilter) {
		// TODO: implement
		return Promise.resolve({});
	}

	async addTopicAccessControlSubscribe(policyName, topicFilter, maxQoS = 2, allow = true) {
		// TODO: implement
		return Promise.resolve({});
	}

	async addTopicAccessControlSubscribeFixed(policyName, topicFilter, maxQoS = 2, allow = true) {
		// TODO: implement
		return Promise.resolve({});
	}

	/**
	 * ******************************************************************************************
	 * Methods for user and user group management
	 * ******************************************************************************************
	 */

	async addUser(username, password, clientID, policyName) {
		// TODO: implement
		return Promise.resolve({});
	}

	async deleteUser(username) {
		// TODO: implement
		return Promise.resolve({});
	}

	async setUserPassword(username, password) {
		// TODO: implement
		return Promise.resolve({});
	}

	async addGroup(groupname, policyName) {
		// TODO: implement
		return Promise.resolve({});
	}

	async addUserToGroup(username, group) {
		// TODO: implement
		return Promise.resolve({});
	}

	async removeUserFromGroup(username, group) {
		// TODO: implement
		return Promise.resolve({});
	}

	async listUsers(verbose = false) {
		// TODO: implement
		return Promise.resolve({});
	}

	async listGroups(verbose = false) {
		// TODO: implement
		return Promise.resolve({});
	}

	async listGroupUsers(group) {
		// TODO: implement
		return Promise.resolve({});
	}

	async kickClient(username, clientID) {
		// TODO: implement
		return Promise.resolve({});
	}

	on(event, listener) {
		let listeners = this._eventListeners.get(event);
		if (!listeners) {
			listeners = [];
			this._eventListeners.set(event, listeners);
		}
		listeners.push(listener);
	}

	off(event, listener) {
		const listeners = this._eventListeners.get(event);
		if (listeners) {
			const index = listeners.indexOf(listener);
			if (index > -1) {
				listeners.splice(index, 1);
			}
		}
	}

	set eventHandler(eventHandler) {
		this._eventHandler = eventHandler;
	}

	get eventHandler() {
		return this._eventHandler;
	}

	set closeHandler(closeHandler) {
		this._closeHandler = closeHandler;
	}

	get closeHandler() {
		return this._closeHandler;
	}

	// abstract method to be overwritten in subclass
	_connectSocketServer() {
		return Promise.reject(
			new Error(
				'No implementation of abstract method _connectSocketServer() in subclass.'
			)
		);
	}

	_handleSocketMessage(message) {
		const parsedMessage = JSON.parse(message);
		if (parsedMessage.type === 'response') {
			if (this.socket) {
				this.socket._handleSocketMessage(parsedMessage);
			}
		} else if (parsedMessage.type === 'event') {
			this._handleEvent(parsedMessage.event);
		}
	}

	_handleEvent(event) {
		const listeners = this._eventListeners.get(event.type);
		if (listeners) {
			listeners.forEach((listener) => listener(event));
		}
	}

	_handleOpenedSocketConnection() {
		this.logger.info(`Client '${this.name}' connected`);
		return Promise.resolve(this);
	}

	_handleSocketClose(event) {
		this.logger.info('Websocket closed');
		this.closeHandler(event);
		this._handleEvent({
			type: 'disconnected'
		});
	}

	_handleSocketError(event) {
		this.logger.info('Websocket error', event);
	}
};
