import React, {useEffect, useState} from 'react';
import {Box, Text} from 'ink';
import {FortuneData} from '../../../lib/types/fortune/fortune.js';
import getFortune from '../../../lib/api/fortune/get-fortune.js';

type FortuneProps = {
	fortune: string | undefined;
};

export default function Fortune({fortune}: FortuneProps) {
	if (!fortune) {
		return null;
	}

	const [theFortune, setTheFortune] = useState<FortuneData | null>(null);

	useEffect(() => {
		const fetchFortune = async () => {
			const fortuneData = await getFortune();
			setTheFortune(fortuneData);
		};

		fetchFortune();
	}, []);

	return (
		<Box flexDirection="column">
			<Text color="cyan" bold>
				🔮 {fortune}
			</Text>

			<Text></Text>

			<Text color="magenta" bold>
				✨ {theFortune?.reading}
			</Text>
		</Box>
	);
}
