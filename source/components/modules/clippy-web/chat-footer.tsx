import React from 'react';
import {Box, Text} from 'ink';

export interface ChatFooterProps {
	isListening: boolean;
}

/**
 * Chat footer component displaying status and controls
 */
export function ChatFooter({isListening}: ChatFooterProps) {
	return (
		<Box justifyContent="space-between" marginTop={1}>
			<Text color="gray" dimColor>
				ESC: Back to menu
			</Text>
			<Text color="gray" dimColor>
				{isListening ? '📡 Listening for messages' : '📡 Not listening'}
			</Text>
		</Box>
	);
}
