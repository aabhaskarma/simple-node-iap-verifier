

// https://developer.apple.com/documentation/appstorereceipts/verifyreceipt
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

const PROD_URL = 'https://buy.itunes.apple.com/verifyReceipt';
const SANDBOX_URL = 'https://sandbox.itunes.apple.com/verifyReceipt';

const _request = (url, payload) => {
	const { password, excludeOldTransactions, receipt } = payload;

	return axios.post(url, {
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

const _tryProd = (payload) => {
	return _request(PROD_URL, payload);
};

const _trySandBox = (payload) => {
	return _request(SANDBOX_URL, payload);
};

/**
 * @param {object} payload Apple request payload.
 * @param {string} payload.password Apple secret key.
 * @param {boolean} payload.excludeOldTransactions Exclude old tranactions.
 * @param {string} payload.receipt Apple receipt.
 */
const verify = async (payload) => {
	let response = await _tryProd(payload);

	if (response.status !== 21007) {
		throw new Error(ERROR_MAP[response.status] || 'Something went wrong.');
	}

	if (!response.status) return response;

	response = await _trySandBox(payload);

	if (response.status) {
		throw new Error(ERROR_MAP[response.status] || 'Something went wrong.');
	}

	return response;
};

module.exports = verify;