import React from 'react';
import {Box, Text} from 'ink';
import {ConnectionStatus} from '../../../lib/types/clippy-web/chat-messages.js';

export interface ChatHeaderProps {
	connectionStatus: ConnectionStatus;
}

/**
 * Chat header component displaying connection status
 */
export function ChatHeader({connectionStatus}: ChatHeaderProps) {
	const getConnectionColor = () => {
		switch (connectionStatus) {
			case 'connected':
				return 'green';
			case 'connecting':
				return 'yellow';
			default:
				return 'red';
		}
	};

	const getConnectionText = () => {
		switch (connectionStatus) {
			case 'connected':
				return 'Connected';
			case 'connecting':
				return 'Connecting...';
			case 'error':
				return 'Error';
			default:
				return 'Offline';
		}
	};

	return (
		<Box
			borderStyle="double"
			borderColor={getConnectionColor()}
			paddingX={1}
			marginBottom={1}
		>
			<Box justifyContent="space-between" width="100%">
				<Text bold color="cyan">
					💬 Clippy Chat
				</Text>
				<Box>
					<Text color={getConnectionColor()}>● {getConnectionText()}</Text>
				</Box>
			</Box>
		</Box>
	);
}
