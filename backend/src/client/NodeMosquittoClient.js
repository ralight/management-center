const mqtt = require('mqtt');
const BaseMosquittoClient = require('./BaseMosquittoClient');

module.exports = class NodeMosquittoClient extends BaseMosquittoClient {
	constructor({ name = 'Node Mosquitto Client', logger } = {}) {
		super({ name, logger: logger });
	}

	_connectBroker(url, options) {
		return new Promise((resolve, reject) => {
			const brokerClient = mqtt.connect(url, options);

			brokerClient.on('error', (error) => {
				this.logger.error(error);
				reject(error);
			});
			this._client = brokerClient;
			brokerClient.on('connect', () => {
				this.logger.log(`Connected to ${url}`);
				brokerClient.subscribe('$CONTROL/#', (error) => {
					this.logger.log(`Subscribed to control topics `);
					if (error) {
						this.logger.error(error);
						reject(error);
					}
					resolve(brokerClient);
				});
				brokerClient.subscribe('$CONTROL/inspect/v1/#', (error) => {});
				brokerClient.subscribe('$CONTROL/cedalo/license/v1/#', (error) => {});
				brokerClient.on('message', (topic, message) => this._handleBrokerMessage(topic, message.toString()));
			});
			brokerClient.on('disconnect', () => {
				this.logger.log(`Disonnected from ${url}`);
			});
			brokerClient.on('close', () => {
				this.logger.log(`Closed connection to ${url}`);
			});
		});
	}

	async _disconnectBroker() {
		this._client?.end();
	}

	on(event, callback) {
		this._client.on(event, callback);
	}

	subscribe(topic) {
		this._client.subscribe(topic);
	}
};
