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
		if (showFortune) {
			// When showing fortune, any key should go back
			if (key.escape || input === 'q' || key.return) {
				onBack();
			}
		} else {
			// When asking question, only handle specific keys that don't interfere with TextInput
			if (key.escape) {
				onBack();
			} else if (input === 'q' && question === '') {
				// Only handle 'q' when input is empty
				onBack();
			}
		}
	});

	useEffect(() => {
		// No automatic fetching - wait for user input
	}, []);

	if (!showFortune) {
		return (
			<Box flexDirection="column" gap={1}>
				<Text color="cyan" bold>
					🔮 Ask the fortune teller a question:
				</Text>
				<TextInput
					value={question}
					onChange={setQuestion}
					onSubmit={handleSubmit}
					placeholder="What would you like to know?"
					focus={true}
				/>
				<Text color="gray" dimColor>
					Type your question and press Enter. Press Q (when empty) or Escape to
					return.
				</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" gap={1}>
			<Text color="cyan" bold>
				🔮 Your question: "{userQuestion}"
			</Text>

			<Text color="magenta" bold>
				✨ {theFortune?.reading}
			</Text>

			<Text color="gray" dimColor>
				Press Enter, Q, or Escape to return to menu
			</Text>
		</Box>
	);
}
