const platformToHandler = {
	'apple': require('./apple')
};

/**
 * @param platform Information about the user.
 * @param payload The name of the user.
 */
module.exports = (platform, payload) => {
	return platformToHandler[platform].verify(payload);
};