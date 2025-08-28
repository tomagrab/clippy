import {CLIMessage} from '../../api/clippy-web/sse-listener.js';

/**
 * Message type definitions for the unified chat system
 */
export type MessageSender = 'cli' | 'web' | 'system';

export type ConnectionStatus =
	| 'disconnected'
	| 'connecting'
	| 'connected'
	| 'error';

export interface SentMessage {
	text: string;
	timestamp: number;
}

export interface UnifiedMessage {
	text?: string;
	type?: string;
	sender: MessageSender;
	timestamp: number;
	// Allow for additional properties from CLIMessage
	[key: string]: any;
}

/**
 * Type guards for message types
 */
export function isTypingMessage(msg: UnifiedMessage): boolean {
	return msg.type === 'typing';
}

export function isErrorMessage(msg: UnifiedMessage): boolean {
	return msg.type === 'error';
}

export function isConnectionMessage(msg: CLIMessage): boolean {
	return 'type' in msg && msg.type === 'connection-established';
}

export function isSystemMessage(msg: CLIMessage): boolean {
	return (
		'type' in msg &&
		(msg.type === 'connection-established' || msg.type === 'error')
	);
}
