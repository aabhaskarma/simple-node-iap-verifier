const axios = require('axios');

const ERROR_MAP = {
	21000: 'The App Store could not read the JSON object you provided.',
	21002: 'The data in the receipt-data property was malformed.',
	21003: 'The receipt could not be authenticated.',
	21004: 'The shared secret you provided does not match the shared secret on file for your account.',
	21005: 'The receipt server is not currently available.',
	21006: 'This receipt is valid but the subscription has expired. When this status code is returned to your server, the receipt data is also decoded and returned as part of the response.',
	21007: 'This receipt is a sandbox receipt, but it was sent to the production service for verification.',
	21008: 'This receipt is a production receipt, but it was sent to the sandbox service for verification.',
	2: 'The receipt is valid, but purchased nothing.'
};

const URL = 'https://buy.itunes.apple.com/verifyReceipt';

const _request = (payload) => {
	const { password, excludeOldTransactions, receipt } = payload;

	return axios.post(URL, {
		'exclude-old-transactions': excludeOldTransactions,
		'password': password,
		'receipt-data': receipt
	})
		.then((res) => res.data)
		.catch(error => {
			if (error.response.data) {
				error.response.data.status = error.response.status;
				return error.response.data;
			}
		});
};

/**
 * @param {object} payload Apple request payload.
 * @param {string} payload.password Apple secret key.
 * @param {boolean} payload.excludeOldTransactions Exclude old tranactions.
 * @param {string} payload.receipt Apple receipt.
 */
const verify = async (payload) => {
	let response = await _request(payload);

	if (response.status) {
		throw new Error(ERROR_MAP[response.status] || 'Something went wrong.');
	}

	return response;
};

module.exports = verify;