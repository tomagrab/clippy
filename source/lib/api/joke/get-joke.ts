import {JokeData} from '../../types/joke/joke.js';
import 'dotenv/config';

export default async function getJoke() {
	const JOKE_API_URL = process.env['JOKE_API_URL'];

	if (!JOKE_API_URL) {
		throw new Error('JOKE_API_URL is not defined');
	}

	const jokeResponse = await fetch(JOKE_API_URL, {
		headers: {
			Accept: 'application/json',
		},
	});

	const jokeData: JokeData = await jokeResponse.json();

	return jokeData;
}
