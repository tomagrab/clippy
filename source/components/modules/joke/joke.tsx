import React, {useEffect, useState} from 'react';
import {Box, Text, useInput} from 'ink';
import {JokeData} from '../../../lib/types/joke/joke.js';
import getJoke from '../../../lib/api/joke/get-joke.js';

type JokeProps = {
	onBack: () => void;
};

export default function Joke({onBack}: JokeProps) {
	const [theJoke, setTheJoke] = useState<JokeData | null>(null);

	useInput((input, key) => {
		if (key.escape || input === 'q' || key.return) {
			onBack();
		}
	});

	useEffect(() => {
		const fetchJoke = async () => {
			const jokeData = await getJoke();
			setTheJoke(jokeData);
		};

		fetchJoke();
	}, []);

	return (
		<Box flexDirection="column">
			<Text color="green" bold>
				😂 {theJoke?.joke}
			</Text>
			<Text color="gray" dimColor>
				Press Enter, Q, or Escape to return to menu
			</Text>
		</Box>
	);
}
