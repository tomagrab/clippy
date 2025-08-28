import React from 'react';
import {Box, Text} from 'ink';
import {
	UnifiedMessage,
	isTypingMessage,
	isErrorMessage,
} from '../../../lib/types/clippy-web/chat-messages.js';
import {formatMessageTime} from '../../../lib/utilities/formatting/time-formatting.js';
import {
	getTypingDotsPattern,
	TypingAnimationFrame,
} from '../../../lib/utilities/animation/typing-animation.js';

export interface MessageBubbleProps {
	message: UnifiedMessage;
	index: number;
	typingAnimationFrame: TypingAnimationFrame;
}

/**
 * Individual message bubble component
 */
export function MessageBubble({
	message,
	index,
	typingAnimationFrame,
}: MessageBubbleProps) {
	const isFromCli = message.sender === 'cli';
	const isError = isErrorMessage(message);
	const isTyping = isTypingMessage(message);
	const content = isFromCli ? message.text : message.text || 'Message received';
	const time = formatMessageTime(message.timestamp);

	const getBorderColor = () => {
		if (isError) return 'red';
		if (isTyping) return 'yellow';
		if (isFromCli) return 'green';
		return 'blue';
	};

	const getSenderLabel = () => {
		if (isFromCli) return '💻 CLI';
		if (isError) return '❌ Error';
		return '🌐 Web';
	};

	const getSenderColor = () => {
		if (isFromCli) return 'green';
		if (isError) return 'red';
		if (isTyping) return 'yellow';
		return 'blue';
	};

	return (
		<Box key={index} flexDirection="column" marginBottom={1}>
			{/* Message container - full width to enable proper alignment */}
			<Box
				flexDirection="column"
				alignItems={isFromCli ? 'flex-end' : 'flex-start'}
				width="100%"
			>
				{/* Message header with sender and time */}
				<Box flexDirection="row" gap={1} alignItems="center" marginBottom={0}>
					{isFromCli && (
						<>
							<Text color="gray" dimColor>
								{time}
							</Text>
							<Text color={getSenderColor()} bold>
								{getSenderLabel()}
							</Text>
						</>
					)}
					{!isFromCli && (
						<>
							<Text color={getSenderColor()} bold>
								{getSenderLabel()}
							</Text>
							<Text color="gray" dimColor>
								{time}
							</Text>
						</>
					)}
				</Box>

				{/* Message bubble */}
				<Box
					borderStyle="round"
					borderColor={getBorderColor()}
					paddingX={1}
					paddingY={0}
					minWidth={10}
					width={Math.min((content?.length || 0) + 4, 60)} // Dynamic width based on content, max 60 chars
				>
					{isTyping ? (
						<Box flexDirection="row" alignItems="center" gap={1}>
							<Text color="yellow" bold>
								{getTypingDotsPattern(typingAnimationFrame)}
							</Text>
						</Box>
					) : (
						<Text wrap="wrap">{content}</Text>
					)}
				</Box>
			</Box>
		</Box>
	);
}
