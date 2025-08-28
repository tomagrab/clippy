import React from 'react';
import {Box, Text} from 'ink';
import TextInput from 'ink-text-input';

export interface ChatInputProps {
	value: string;
	onChange: (value: string) => void;
	onSubmit: (value: string) => void;
	placeholder?: string;
}

/**
 * Chat input component for user message entry
 */
export function ChatInput({
	value,
	onChange,
	onSubmit,
	placeholder = 'Type your message and press Enter...',
}: ChatInputProps) {
	return (
		<Box
			borderStyle="single"
			borderColor="cyan"
			paddingX={1}
			paddingY={0}
			marginTop={1}
		>
			<Box width="100%" alignItems="center">
				<Box marginRight={1}>
					<Text color="cyan">💻</Text>
				</Box>
				<Box flexGrow={1}>
					<TextInput
						placeholder={placeholder}
						value={value}
						onChange={onChange}
						onSubmit={onSubmit}
					/>
				</Box>
			</Box>
		</Box>
	);
}
