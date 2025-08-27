import React, {useEffect, useState} from 'react';
import {Text} from 'ink';
import {JokeData} from '../../../lib/types/joke/joke.js';
import getJoke from '../../../lib/api/joke/get-joke.js';

export default function Joke() {
	const [theJoke, setTheJoke] = useState<JokeData | null>(null);

	useEffect(() => {
		const fetchJoke = async () => {
			const jokeData = await getJoke();
			setTheJoke(jokeData);
		};

		fetchJoke();
	}, []);

	return (
		<Text color="green" bold>
			😂 {theJoke?.joke}
		</Text>
	);
}
