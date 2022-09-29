const path = require('path');

const PLUGIN_DIR = process.env.CEDALO_MC_PLUGIN_DIR;

module.exports = class PluginManager {
	constructor() {
		this._plugins = [];
	}

	_loadOSPlugins(context) {
		// TODO: support multiple plugins
		if (process.env.CEDALO_MC_DISABLE_LOGIN !== 'true') {
			this._loadLoginPlugin(context);
			this._loadConnectDisconnectPlugin(context);
			this._loadUserProfilePlugin(context);
		}
	}

	_loadLoginPlugin(context) {
		const { Plugin } = require('./login');
		const plugin = new Plugin();
		this._loadPlugin(plugin, context);
	}

	_loadConnectDisconnectPlugin(context) {
		const { Plugin } = require('./connect-disconnect');
		const plugin = new Plugin();
		this._loadPlugin(plugin, context);
	}

	_loadUserProfilePlugin(context) {
		const { Plugin } = require('./user-profile');
		const plugin = new Plugin();
		this._loadPlugin(plugin, context);
	}

	_loadPlugin(plugin, context) {
		try {
			plugin.init(context);
			plugin.load(context);
			plugin.setLoaded();
			this._plugins.push(plugin);
			console.log(`Loaded plugin: "${plugin.meta.id}" (${plugin.meta.name})`);
		} catch (error) {
			console.error(`Failed loading plugin: "${plugin.meta.id}" (${plugin.meta.name})`);
			console.error(error);
			this._plugins.push(plugin);
		}
	}

	init(pluginConfigurations = [], context, swaggerDocument) {
		this._context = context;
		const { licenseContainer } = context;
		if (licenseContainer.license.isValid && PLUGIN_DIR) {
			const userManagementPluginIndex = pluginConfigurations.findIndex((el) => {
				return el.name === 'user-management';
			});
			if (userManagementPluginIndex !== -1) {
				const userManagementPlugin = pluginConfigurations[userManagementPluginIndex];
				pluginConfigurations.splice(userManagementPluginIndex, 1);
				pluginConfigurations.unshift(userManagementPlugin);
			}


			pluginConfigurations.forEach((pluginConfiguration) => {
				try {
					const enableAtNextStartup = (pluginConfiguration.enableAtNextStartup !== undefined) ? pluginConfiguration.enableAtNextStartup : true;

					const { Plugin } = require(path.join(PLUGIN_DIR, pluginConfiguration.name));
					console.log("PLUGIN_DIR");
					console.log(PLUGIN_DIR);
					console.log(pluginConfiguration.name);
					const plugin = new Plugin({enableAtNextStartup});
					if (
						licenseContainer.license.features &&
						licenseContainer.license.features.find(feature => plugin.meta.featureId === feature.name)
					) {
						if (!enableAtNextStartup) {
							console.log(`Plugin not loaded: Plugin set to be disabled at current startup: "${pluginConfiguration.name}"`)
							plugin.setErrored(`Plugin set to be disabled at current startup: "${pluginConfiguration.name}"`);
							this._plugins.push(plugin);
						} else {
							this._plugins.push(plugin);
						}
					} else {
						console.log(`Plugin not loaded: License does not allow this plugin: "${pluginConfiguration.name}"`)
						plugin.setErrored(`License does not allow this plugin: "${pluginConfiguration.name}"`);
						this._plugins.push(plugin);
					}
				} catch (error) {
					console.error(`Failed loading plugin: "${pluginConfiguration.name}"`);
					console.error(error);
					// plugin.setErrored();
				}
			});
		} else if (licenseContainer.license.isValid && !PLUGIN_DIR) {
			console.log('"CEDALO_MC_PLUGIN_DIR" is not set. Skipping loading of plugins');
		} else {
			console.error('Ignore loading plugins: no premium license provided or license not valid');
			console.log(`${process.env.CEDALO_MC_LICENSE_PATH}`);
		}

		this._plugins.forEach(plugin => {
			if (plugin.preInit) {
				plugin.preInit(context);
			}
		});

		this._loadOSPlugins(context);

		this._plugins.forEach(plugin => {
			try {
				plugin.init(context);
				if (plugin.swagger) {
					swaggerDocument.tags = Object.assign(swaggerDocument.tags || {}, plugin.swagger.tags);
					swaggerDocument.paths = Object.assign(swaggerDocument.paths || {}, plugin.swagger.paths);
					swaggerDocument.components.schemas = Object.assign(swaggerDocument.components.schemas || {}, plugin.swagger.components?.schemas);
					swaggerDocument.components.errors = Object.assign(swaggerDocument.components.errors || {}, plugin.swagger.components?.errors);
				}

				if (plugin._status.type !== 'error') {
					plugin.load(context);
					plugin.setLoaded();
					console.log(`Loaded plugin: "${plugin.meta.id}" (${plugin.meta.name})`);
				}

			} catch(error) {
				console.error(`Failed loading plugin: "${plugin.meta.id}" (${plugin.meta.name})`);
				console.error(error);
			}
		});
	}

	add(plugin) {
		this._plugins.push(plugin);
	}

	_getPluginById(pluginId) {
		return this._plugins.find((plugin) => plugin.meta.id === pluginId);
	}

	unloadPlugin(pluginId) {
		const plugin = this._getPluginById(pluginId);
		plugin.unload(this._context);
	}

	loadPlugin(pluginId) {
		const plugin = this._getPluginById(pluginId);
		plugin.load(this._context);
	}

	setPluginStatusAtNextStartup(pluginFeatureId, nextStatus) {
		this._plugins = this._plugins.map((plugin) => {
			if (plugin.meta.featureId === pluginFeatureId) {
				plugin.options.enableAtNextStartup = nextStatus;
			}
			return plugin;
	
		});
		

		this._context.configManager.updatePluginFromConfiguration(pluginFeatureId, {enableAtNextStartup: nextStatus});
	}

	get plugins() {
		return this._plugins;
	}
};
