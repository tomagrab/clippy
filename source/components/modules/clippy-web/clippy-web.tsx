import React, {useState, useEffect} from 'react';
import {Box, Text, useInput} from 'ink';
import TextInput from 'ink-text-input';
import {
	CLIMessage,
	SSEListener,
} from '../../../lib/api/clippy-web/sse-listener.js';
import {createMessage} from '../../../lib/types/clippy-web/send-message.js';
import sendMessage from '../../../lib/api/clippy-web/clippy-web.js';

type ClippyWebProps = {
	onBack: () => void;
};

export default function ClippyWeb({onBack}: ClippyWebProps) {
	const [value, setValue] = useState('');
	const [isListening, setIsListening] = useState(false);
	const [incomingMessages, setIncomingMessages] = useState<CLIMessage[]>([]);
	const [sentMessages, setSentMessages] = useState<
		Array<{text: string; timestamp: number}>
	>([]);
	const [connectionStatus, setConnectionStatus] = useState<
		'disconnected' | 'connecting' | 'connected' | 'error'
	>('disconnected');
	const [isTypingIndicatorSent, setIsTypingIndicatorSent] = useState(false);
	const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
		null,
	);
	const [typingAnimationFrame, setTypingAnimationFrame] = useState(0);

	// Helper function to get animated typing dots pattern
	const getTypingDotsPattern = () => {
		const patterns = ['●○○', '○●○', '○○●'];
		return patterns[typingAnimationFrame];
	};

	// Helper function to display message content
	const getMessageContent = (msg: CLIMessage): string => {
		if ('type' in msg && msg.type === 'connection-established') {
			return 'Connected to web stream';
		}

		// For SendMessageProps type messages, they all have 'text' property
		if ('text' in msg && typeof msg.text === 'string') {
			return msg.text || `[${msg.type}]`;
		}

		// Fallback for any other message types
		return 'Message received';
	};

	// Get sender type for message bubble styling
	const getMessageSender = (msg: CLIMessage): 'web' | 'system' => {
		if (
			'type' in msg &&
			(msg.type === 'connection-established' || msg.type === 'error')
		) {
			return 'system';
		}
		return 'web';
	};

	// Format timestamp for display
	const formatTime = (timestamp?: number): string => {
		const date = new Date(timestamp || Date.now());
		return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
	};

	// Create unified message list combining incoming and sent messages
	const getAllMessages = () => {
		const incoming = incomingMessages
			.filter(msg => {
				// Filter out system connection messages since we have status indicator
				if ('type' in msg && msg.type === 'connection-established') {
					return false;
				}
				return true;
			})
			.map(msg => ({
				...msg,
				sender: getMessageSender(msg),
				timestamp: msg.timestamp || Date.now(),
			}));

		const sent = sentMessages.map(msg => ({
			...msg,
			type: 'message' as const,
			sender: 'cli' as const,
			timestamp: msg.timestamp,
		}));

		// Combine and sort by timestamp
		const allMessages = [...incoming, ...sent].sort(
			(a, b) => a.timestamp - b.timestamp,
		);
		return allMessages.slice(-15); // Keep last 15 messages for better performance
	};

	// SSE Listener for receiving messages from the web
	useEffect(() => {
		const listener = new SSEListener({
			url: 'http://localhost:3000/api/clippy/stream', // Assuming Next.js dev server
			onMessage: (message: CLIMessage) => {
				setIncomingMessages(prev => {
					// Handle clear messages
					if ('type' in message && message.type === 'clear') {
						if ('clearScope' in message) {
							switch (message.clearScope) {
								case 'all':
									return [];
								case 'typing':
									return prev.filter(
										msg => !('type' in msg) || msg.type !== 'typing',
									);
								default:
									return prev.filter(
										msg => !('type' in msg) || msg.type !== 'typing',
									);
							}
						}
						return prev.filter(
							msg => !('type' in msg) || msg.type !== 'typing',
						);
					}

					// Handle typing indicators - replace the last typing message if it exists
					if ('type' in message && message.type === 'typing') {
						// Remove any existing typing messages and add the new one
						const withoutTyping = prev.filter(
							msg => !('type' in msg) || msg.type !== 'typing',
						);
						return [...withoutTyping.slice(-19), message];
					}

					// For regular messages, remove any typing indicators and add the message
					if ('type' in message && message.type === 'message') {
						const withoutTyping = prev.filter(
							msg => !('type' in msg) || msg.type !== 'typing',
						);
						return [...withoutTyping.slice(-19), message];
					}

					// For other messages, just add them
					return [...prev.slice(-19), message];
				});
			},
			onConnect: () => {
				setConnectionStatus('connected');
				setIsListening(true);
			},
			onDisconnect: () => {
				setConnectionStatus('disconnected');
				setIsListening(false);
			},
			onError: error => {
				console.error('❌ SSE Error:', error);
				setConnectionStatus('error');
				setIsListening(false);

				// Add error message to display
				const errorMessage: CLIMessage = {
					type: 'error',
					text: `Connection error: ${error.message || 'Unknown error'}`,
					timestamp: Date.now(),
					retryable: true,
				};
				setIncomingMessages(prev => [...prev.slice(-19), errorMessage]);
			},
		});

		// Start listening automatically
		setConnectionStatus('connecting');
		listener.connect().catch(error => {
			console.error('❌ Failed to start SSE listener:', error);
			setConnectionStatus('error');
		});

		// Cleanup on unmount
		return () => {
			listener.disconnect();
			// Clear any pending typing timeout
			if (typingTimeout) {
				clearTimeout(typingTimeout);
			}
		};
	}, []);

	// Cleanup typing timeout when component unmounts
	useEffect(() => {
		return () => {
			if (typingTimeout) {
				clearTimeout(typingTimeout);
			}
		};
	}, [typingTimeout]);

	// Animate typing indicator dots
	useEffect(() => {
		const hasTypingMessage = getAllMessages().some(
			msg => msg.type === 'typing',
		);

		if (hasTypingMessage) {
			const interval = setInterval(() => {
				setTypingAnimationFrame(prev => (prev + 1) % 3);
			}, 600); // Change frame every 600ms for smooth animation

			return () => clearInterval(interval);
		}

		return () => {}; // Return empty cleanup function when no typing
	}, [getAllMessages().length]); // Re-run when messages change

	useInput((_input, key) => {
		// Only handle navigation keys when the input is empty or specific keys that shouldn't interfere
		// Avoid handling regular characters that should go to TextInput
		if (key.escape) {
			onBack();
		}
	});

	const handleChange = async (newValue: string) => {
		setValue(newValue);

		// Clear any existing typing timeout
		if (typingTimeout) {
			clearTimeout(typingTimeout);
		}

		// If input is now empty, clear typing indicator immediately
		if (!newValue.trim()) {
			if (isTypingIndicatorSent) {
				const clearMessage = createMessage('clear', '', {
					clearScope: 'typing',
				});
				await sendMessage(clearMessage);
				setIsTypingIndicatorSent(false);
			}
			setTypingTimeout(null);
			return;
		}

		// If user is typing and we haven't sent typing indicator yet, send it
		if (newValue.trim() && !isTypingIndicatorSent) {
			const typingMessage = createMessage('typing', '', {
				isIncremental: true,
			});
			await sendMessage(typingMessage);
			setIsTypingIndicatorSent(true);
		}

		// Set a timeout to clear the typing indicator if user stops typing
		const timeout = setTimeout(async () => {
			if (isTypingIndicatorSent) {
				const clearMessage = createMessage('clear', '', {
					clearScope: 'typing',
				});
				await sendMessage(clearMessage);
				setIsTypingIndicatorSent(false);
			}
		}, 2000); // Clear typing indicator after 2 seconds of inactivity

		setTypingTimeout(timeout);
	};

	const handleSubmit = async (text: string) => {
		if (text.trim()) {
			// Clear any pending typing timeout
			if (typingTimeout) {
				clearTimeout(typingTimeout);
				setTypingTimeout(null);
			}

			// Clear typing indicator if it was sent
			if (isTypingIndicatorSent) {
				const clearMessage = createMessage('clear', '', {
					clearScope: 'typing',
				});
				await sendMessage(clearMessage);
				setIsTypingIndicatorSent(false);
			}

			// Add to sent messages immediately for UI feedback
			const timestamp = Date.now();
			setSentMessages(prev => [...prev, {text: text.trim(), timestamp}]);

			// Send final message when Enter is pressed
			const finalMessage = createMessage('message', text, {
				priority: 'normal',
			});
			await sendMessage(finalMessage);
		}
		setValue(''); // Clear input when Enter is pressed
	};

	// Render individual message bubble
	const renderMessage = (msg: any, index: number) => {
		// Use the sender property we set in getAllMessages() to determine message origin
		const isCli = msg.sender === 'cli';
		const isError = msg.type === 'error';
		const isTyping = msg.type === 'typing';
		const content = isCli ? msg.text : getMessageContent(msg);
		const time = formatTime(msg.timestamp);

		return (
			<Box key={index} flexDirection="column" marginBottom={1}>
				{/* Message container - full width to enable proper alignment */}
				<Box
					flexDirection="column"
					alignItems={isCli ? 'flex-end' : 'flex-start'}
					width="100%"
				>
					{/* Message header with sender and time */}
					<Box flexDirection="row" gap={1} alignItems="center" marginBottom={0}>
						{isCli && (
							<>
								<Text color="gray" dimColor>
									{time}
								</Text>
								<Text color="green" bold>
									💻 CLI
								</Text>
							</>
						)}
						{!isCli && (
							<>
								<Text
									color={isError ? 'red' : isTyping ? 'yellow' : 'blue'}
									bold
								>
									{isError ? '❌ Error' : '🌐 Web'}
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
						borderColor={
							isError ? 'red' : isTyping ? 'yellow' : isCli ? 'green' : 'blue'
						}
						paddingX={1}
						paddingY={0}
						minWidth={10}
						width={Math.min(content.length + 4, 60)} // Dynamic width based on content, max 60 chars
					>
						{isTyping ? (
							<Box flexDirection="row" alignItems="center" gap={1}>
								<Text color="yellow" bold>
									{getTypingDotsPattern()}
								</Text>
							</Box>
						) : (
							<Text wrap="wrap">{content}</Text>
						)}
					</Box>
				</Box>
			</Box>
		);
	};

	return (
		<Box flexDirection="column" height="100%">
			{/* Chat Header with Connection Status */}
			<Box
				borderStyle="double"
				borderColor={
					connectionStatus === 'connected'
						? 'green'
						: connectionStatus === 'connecting'
						? 'yellow'
						: 'red'
				}
				paddingX={1}
				marginBottom={1}
			>
				<Box justifyContent="space-between" width="100%">
					<Text bold color="cyan">
						💬 Clippy Chat
					</Text>
					<Box>
						<Text
							color={
								connectionStatus === 'connected'
									? 'green'
									: connectionStatus === 'connecting'
									? 'yellow'
									: 'red'
							}
						>
							●{' '}
							{connectionStatus === 'connected'
								? 'Connected'
								: connectionStatus === 'connecting'
								? 'Connecting...'
								: connectionStatus === 'error'
								? 'Error'
								: 'Offline'}
						</Text>
					</Box>
				</Box>
			</Box>

			{/* Chat Messages Area */}
			<Box flexDirection="column" flexGrow={1} overflowY="hidden">
				{getAllMessages().length === 0 ? (
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
				) : (
					<Box flexDirection="column">
						{getAllMessages().map((msg, index) => renderMessage(msg, index))}
					</Box>
				)}
			</Box>

			{/* Chat Input Area */}
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
							placeholder="Type your message and press Enter..."
							value={value}
							onChange={handleChange}
							onSubmit={handleSubmit}
						/>
					</Box>
				</Box>
			</Box>

			{/* Status Footer */}
			<Box justifyContent="space-between" marginTop={1}>
				<Text color="gray" dimColor>
					ESC: Back to menu
				</Text>
				<Text color="gray" dimColor>
					{isListening ? '📡 Listening for messages' : '📡 Not listening'}
				</Text>
			</Box>
		</Box>
	);
}
