import React, {useEffect, useState} from 'react';
import {Box, Text, useInput} from 'ink';
import TextInput from 'ink-text-input';
import {FortuneData} from '../../../lib/types/fortune/fortune.js';
import getFortune from '../../../lib/api/fortune/get-fortune.js';

type FortuneProps = {
	onBack: () => void;
};

export default function Fortune({onBack}: FortuneProps) {
	const [question, setQuestion] = useState('');
	const [userQuestion, setUserQuestion] = useState('');
	const [theFortune, setTheFortune] = useState<FortuneData | null>(null);
	const [showFortune, setShowFortune] = useState(false);

	const handleSubmit = async () => {
		if (question.trim()) {
			setUserQuestion(question);
			setShowFortune(true);
			const fortuneData = await getFortune();
			setTheFortune(fortuneData);
		}
	};

	useInput((input, key) => {
		if (showFortune && (key.escape || input === 'q' || key.return)) {
			onBack();
		}
	});

	useEffect(() => {
		// No automatic fetching - wait for user input
	}, []);

	if (!showFortune) {
		return (
			<Box flexDirection="column">
				<Text color="cyan" bold>
					🔮 Ask the fortune teller a question:
				</Text>
				<Text></Text>
				<TextInput
					value={question}
					onChange={setQuestion}
					onSubmit={handleSubmit}
					placeholder="What would you like to know?"
				/>
				<Text></Text>
				<Text color="gray" dimColor>
					Type your question and press Enter
				</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column">
			<Text color="cyan" bold>
				🔮 Your question: "{userQuestion}"
			</Text>

			<Text></Text>

			<Text color="magenta" bold>
				✨ {theFortune?.reading}
			</Text>

			<Text></Text>

			<Text color="gray" dimColor>
				Press Enter, Q, or Escape to return to menu
			</Text>
		</Box>
	);
}
