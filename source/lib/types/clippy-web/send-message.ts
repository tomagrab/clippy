// Base message interface with common properties
interface BaseMessage {
	text: string;
	timestamp?: number; // Optional, can be set by server if not provided
	sessionId?: string; // Optional session tracking
}

// Discriminated union for different message types
export type SendMessageProps =
	| (BaseMessage & {
			type: 'typing';
			isIncremental: boolean; // Whether this is replacing previous typing or appending
	  })
	| (BaseMessage & {
			type: 'message';
			priority?: 'low' | 'normal' | 'high'; // Optional priority level
	  })
	| (BaseMessage & {
			type: 'command';
			command: string; // The actual command being executed
			args?: string[]; // Optional command arguments
	  })
	| (BaseMessage & {
			type: 'clear';
			text: ''; // Clear messages have empty text
			clearScope: 'all' | 'typing' | 'session'; // What to clear
	  })
	| (BaseMessage & {
			type: 'error';
			errorCode?: string; // Optional error classification
			retryable: boolean; // Whether the action can be retried
	  });

// Type guards for better type safety
export function isTypingMessage(
	msg: SendMessageProps,
): msg is SendMessageProps & {type: 'typing'} {
	return msg.type === 'typing';
}

export function isRegularMessage(
	msg: SendMessageProps,
): msg is SendMessageProps & {type: 'message'} {
	return msg.type === 'message';
}

export function isCommandMessage(
	msg: SendMessageProps,
): msg is SendMessageProps & {type: 'command'} {
	return msg.type === 'command';
}

export function isClearMessage(
	msg: SendMessageProps,
): msg is SendMessageProps & {type: 'clear'} {
	return msg.type === 'clear';
}

export function isErrorMessage(
	msg: SendMessageProps,
): msg is SendMessageProps & {type: 'error'} {
	return msg.type === 'error';
}

// Helper function to create messages with defaults
export function createMessage(
	type: SendMessageProps['type'],
	text: string,
	additionalProps?: Partial<SendMessageProps>,
): SendMessageProps {
	const baseMessage: BaseMessage = {
		text,
		timestamp: Date.now(),
		...additionalProps,
	};

	switch (type) {
		case 'typing':
			return {...baseMessage, type: 'typing', isIncremental: true};
		case 'message':
			return {...baseMessage, type: 'message'};
		case 'command':
			return {...baseMessage, type: 'command', command: text};
		case 'clear':
			return {...baseMessage, type: 'clear', text: '', clearScope: 'typing'};
		case 'error':
			return {...baseMessage, type: 'error', retryable: true};
		default:
			// TypeScript will ensure this is never reached
			const _exhaustive: never = type;
			throw new Error(`Unknown message type: ${_exhaustive}`);
	}
}
