import React, {useState, useEffect} from 'react';
import {Box, useInput} from 'ink';
import {SentMessage} from '../../../lib/types/clippy-web/chat-messages.js';
import {createUnifiedMessageList} from '../../../lib/helpers/clippy-web/message-processing.js';
import {TypingIndicatorManager} from '../../../lib/helpers/clippy-web/typing-indicator-manager.js';
import {useSSEConnection} from '../../../lib/helpers/clippy-web/use-sse-connection.js';
import {useTypingAnimation} from '../../../lib/helpers/clippy-web/use-typing-animation.js';
import {ChatHeader} from './chat-header.js';
import {ChatMessages} from './chat-messages.js';
import {ChatInput} from './chat-input.js';
import {ChatFooter} from './chat-footer.js';

type ClippyWebProps = {
	onBack: () => void;
};

export default function ClippyWeb({onBack}: ClippyWebProps) {
	// Input state
	const [inputValue, setInputValue] = useState('');

	// Message state
	const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);

	// SSE connection state
	const {connectionStatus, isListening, incomingMessages} = useSSEConnection();

	// Create unified message list for display
	const unifiedMessages = createUnifiedMessageList(
		incomingMessages,
		sentMessages,
	);

	// Typing animation state
	const typingAnimationFrame = useTypingAnimation(unifiedMessages);

	// Typing indicator manager
	const [typingManager] = useState(() => new TypingIndicatorManager());

	// Handle navigation input
	useInput((_input, key) => {
		if (key.escape) {
			onBack();
		}
	});

	// Handle input changes
	const handleInputChange = async (newValue: string) => {
		setInputValue(newValue);
		await typingManager.handleInputChange(newValue);
	};

	// Handle message submission
	const handleMessageSubmit = async (text: string) => {
		await typingManager.handleMessageSubmit(text, messageData => {
			setSentMessages(prev => [...prev, messageData]);
		});
		setInputValue('');
	};

	// Cleanup typing manager on unmount
	useEffect(() => {
		return () => {
			typingManager.cleanup();
		};
	}, [typingManager]);

	return (
		<Box flexDirection="column" height="100%">
			<ChatHeader connectionStatus={connectionStatus} />

			<ChatMessages
				messages={unifiedMessages}
				typingAnimationFrame={typingAnimationFrame}
			/>

			<ChatInput
				value={inputValue}
				onChange={handleInputChange}
				onSubmit={handleMessageSubmit}
			/>

			<ChatFooter isListening={isListening} />
		</Box>
	);
}
