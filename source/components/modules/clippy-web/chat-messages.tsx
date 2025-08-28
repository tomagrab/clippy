import React from 'react';
import {Box, Text} from 'ink';
import {UnifiedMessage} from '../../../lib/types/clippy-web/chat-messages.js';
import {MessageBubble} from './message-bubble.js';
import {TypingAnimationFrame} from '../../../lib/utilities/animation/typing-animation.js';

export interface ChatMessagesProps {
	messages: UnifiedMessage[];
	typingAnimationFrame: TypingAnimationFrame;
}

/**
 * Chat messages area component displaying the conversation
 */
export function ChatMessages({
	messages,
	typingAnimationFrame,
}: ChatMessagesProps) {
	if (messages.length === 0) {
		return (
			<Box flexDirection="column" flexGrow={1} overflowY="hidden">
				<Box
					justifyContent="center"
					alignItems="center"
					flexGrow={1}
					flexDirection="column"
				>
					<Text color="gray" dimColor>
						💭 No messages yet
					</Text>
					<Text color="gray" dimColor>
						Start chatting with the web interface...
					</Text>
				</Box>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" flexGrow={1} overflowY="hidden">
			<Box flexDirection="column">
				{messages.map((message, index) => (
					<MessageBubble
						key={index}
						message={message}
						index={index}
						typingAnimationFrame={typingAnimationFrame}
					/>
				))}
			</Box>
		</Box>
	);
}
