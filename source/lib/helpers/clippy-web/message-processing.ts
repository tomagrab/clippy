import {CLIMessage} from '../../api/clippy-web/sse-listener.js';
import {
	UnifiedMessage,
	MessageSender,
	SentMessage,
	isConnectionMessage,
	isSystemMessage,
} from '../../types/clippy-web/chat-messages.js';

/**
 * Configuration for message processing
 */
const MESSAGE_PROCESSING_CONFIG = {
	maxDisplayMessages: 15,
	maxStoredMessages: 19,
} as const;

/**
 * Gets the message content for display
 * @param message CLI message to extract content from
 * @returns Display-ready string content
 */
export function getMessageDisplayContent(message: CLIMessage): string {
	if (isConnectionMessage(message)) {
		return 'Connected to web stream';
	}

	// For SendMessageProps type messages, they all have 'text' property
	if ('text' in message && typeof message.text === 'string') {
		return message.text || `[${message.type}]`;
	}

	// Fallback for any other message types
	return 'Message received';
}

/**
 * Determines the sender type for message styling
 * @param message CLI message to categorize
 * @returns Sender type for styling purposes
 */
export function getMessageSender(message: CLIMessage): MessageSender {
	if (isSystemMessage(message)) {
		return 'system';
	}
	return 'web';
}

/**
 * Filters out connection messages that shouldn't be displayed
 * @param messages Array of incoming messages
 * @returns Filtered messages for display
 */
export function filterDisplayableMessages(
	messages: CLIMessage[],
): CLIMessage[] {
	return messages.filter(msg => {
		// Filter out system connection messages since we have status indicator
		return !isConnectionMessage(msg);
	});
}

/**
 * Processes incoming messages and transforms them for unified display
 * @param incomingMessages Raw incoming messages from SSE
 * @returns Processed messages with sender and timestamp info
 */
export function processIncomingMessages(
	incomingMessages: CLIMessage[],
): UnifiedMessage[] {
	return filterDisplayableMessages(incomingMessages).map(msg => ({
		...msg,
		sender: getMessageSender(msg),
		timestamp: msg.timestamp || Date.now(),
	}));
}

/**
 * Processes sent messages for unified display
 * @param sentMessages Array of messages sent by CLI
 * @returns Processed messages with consistent format
 */
export function processSentMessages(
	sentMessages: SentMessage[],
): UnifiedMessage[] {
	return sentMessages.map(msg => ({
		...msg,
		type: 'message',
		sender: 'cli' as const,
		timestamp: msg.timestamp,
	}));
}

/**
 * Combines and sorts incoming and sent messages
 * @param incomingMessages Raw incoming messages
 * @param sentMessages Messages sent by the CLI
 * @returns Unified, sorted message list for display
 */
export function createUnifiedMessageList(
	incomingMessages: CLIMessage[],
	sentMessages: SentMessage[],
): UnifiedMessage[] {
	const processedIncoming = processIncomingMessages(incomingMessages);
	const processedSent = processSentMessages(sentMessages);

	// Combine and sort by timestamp
	const allMessages = [...processedIncoming, ...processedSent].sort(
		(a, b) => a.timestamp - b.timestamp,
	);

	// Keep last N messages for better performance
	return allMessages.slice(-MESSAGE_PROCESSING_CONFIG.maxDisplayMessages);
}

/**
 * Filters messages to remove typing indicators
 * @param messages Array of messages to filter
 * @returns Messages without typing indicators
 */
export function removeTypingMessages(messages: CLIMessage[]): CLIMessage[] {
	return messages.filter(msg => !('type' in msg) || msg.type !== 'typing');
}

/**
 * Manages incoming message state updates based on message type
 * @param currentMessages Current message state
 * @param newMessage New message to process
 * @returns Updated message array
 */
export function updateMessageState(
	currentMessages: CLIMessage[],
	newMessage: CLIMessage,
): CLIMessage[] {
	// Handle clear messages
	if ('type' in newMessage && newMessage.type === 'clear') {
		if ('clearScope' in newMessage) {
			switch (newMessage.clearScope) {
				case 'all':
					return [];
				case 'typing':
					return removeTypingMessages(currentMessages);
				default:
					return removeTypingMessages(currentMessages);
			}
		}
		return removeTypingMessages(currentMessages);
	}

	// Handle typing indicators - replace the last typing message if it exists
	if ('type' in newMessage && newMessage.type === 'typing') {
		const withoutTyping = removeTypingMessages(currentMessages);
		return [
			...withoutTyping.slice(-MESSAGE_PROCESSING_CONFIG.maxStoredMessages),
			newMessage,
		];
	}

	// For regular messages, remove any typing indicators and add the message
	if ('type' in newMessage && newMessage.type === 'message') {
		const withoutTyping = removeTypingMessages(currentMessages);
		return [
			...withoutTyping.slice(-MESSAGE_PROCESSING_CONFIG.maxStoredMessages),
			newMessage,
		];
	}

	// For other messages, just add them
	return [
		...currentMessages.slice(-MESSAGE_PROCESSING_CONFIG.maxStoredMessages),
		newMessage,
	];
}
