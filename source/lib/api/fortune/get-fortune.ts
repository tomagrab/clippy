import {FortuneData} from '../../types/fortune/fortune.js';

export default async function getFortune() {
	const FORTUNE_API_URL = process.env['FORTUNE_API_URL'];

	if (!FORTUNE_API_URL) {
		throw new Error('FORTUNE_API_URL is not defined');
	}

	const fortuneResponse = await fetch(FORTUNE_API_URL, {
		headers: {
			Accept: 'application/json',
		},
	});

	const fortuneData: FortuneData = await fortuneResponse.json();

	return fortuneData;
}
