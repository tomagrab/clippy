import React, {useEffect, useState} from 'react';
import {Box, Text, useInput} from 'ink';
import {JokeData} from '../../../lib/types/joke/joke.js';
import getJoke from '../../../lib/api/joke/get-joke.js';

type JokeProps = {
	onBack: () => void;
};

export default function Joke({onBack}: JokeProps) {
	const [theJoke, setTheJoke] = useState<JokeData | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useInput((input, key) => {
		// Only handle input after the joke has loaded
		if (!isLoading && (key.escape || input === 'q' || key.return)) {
			onBack();
		}
	});

	useEffect(() => {
		const fetchJoke = async () => {
			setIsLoading(true);
			try {
				const jokeData = await getJoke();
				setTheJoke(jokeData);
			} catch (error) {
				console.error('Failed to fetch joke:', error);
				setTheJoke({
					id: 'error',
					joke: 'Failed to load joke. Please try again!',
					status: 500,
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchJoke();
	}, []);

	if (isLoading) {
		return (
			<Box flexDirection="column" gap={1}>
				<Text color="yellow" bold>
					Loading joke...
				</Text>
				<Text color="gray" dimColor>
					Please wait...
				</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" gap={1}>
			<Text color="green" bold>
				😂 {theJoke?.joke}
			</Text>
			<Text color="gray" dimColor>
				Press Enter, Q, or Escape to return to menu
			</Text>
		</Box>
	);
}
