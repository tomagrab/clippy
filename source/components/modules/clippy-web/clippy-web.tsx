import React, {useState} from 'react';
import {Box, Text, useInput} from 'ink';
import TextInput from 'ink-text-input';
import sendMessage from '../../../lib/api/clippy-web/clippy-web.js';
import {createMessage} from '../../../lib/types/clippy-web/send-message.js';

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
			const typingMessage = createMessage('typing', newValue, {
				isIncremental: true, // This replaces any previous typing message
			});
			await sendMessage(typingMessage);
		} else {
			// Send clear message when input becomes empty
			const clearMessage = createMessage('clear', '', {
				clearScope: 'typing',
			});
			await sendMessage(clearMessage);
		}
	};

	const handleSubmit = async (text: string) => {
		if (text.trim()) {
			// Send final message when Enter is pressed
			const finalMessage = createMessage('message', text, {
				priority: 'normal',
			});
			await sendMessage(finalMessage);
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
