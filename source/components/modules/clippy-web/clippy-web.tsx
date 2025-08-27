import React, {useState} from 'react';
import {Box, Text, useInput} from 'ink';
import TextInput from 'ink-text-input';
import sendMessage from '../../../lib/api/clippy-web/clippy-web.js';

type ClippyWebProps = {
	onBack: () => void;
};

export default function ClippyWeb({onBack}: ClippyWebProps) {
	const [value, setValue] = useState('');

	useInput((_input, key) => {
		// Only handle navigation keys when the input is empty or specific keys that shouldn't interfere
		// Avoid handling regular characters that should go to TextInput
		if (key.escape) {
			onBack();
		}
	});

	const handleChange = async (newValue: string) => {
		setValue(newValue);

		// Only send message if there's actual content
		if (newValue.trim()) {
			await sendMessage({text: newValue, type: 'typing'});
		}
		// Don't send anything when input is empty - let the web app handle cleanup
	};

	const handleSubmit = async (text: string) => {
		if (text.trim()) {
			// Send final message when Enter is pressed
			await sendMessage({text, type: 'final'});
		}
		setValue(''); // Clear input when Enter is pressed
	};

	return (
		<Box flexDirection="column" gap={0.5}>
			<TextInput
				placeholder="Type your message here..."
				value={value}
				onChange={handleChange}
				onSubmit={handleSubmit}
			/>
			<Text color="gray" dimColor>
				Press Escape to return to menu
			</Text>
		</Box>
	);
}
