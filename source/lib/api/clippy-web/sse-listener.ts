import {SendMessageProps} from '../../types/clippy-web/send-message.js';

// Extended message type for CLI listening (includes connection events)
export type CLIMessage =
	| SendMessageProps
	| {
			type: 'connection-established';
			timestamp: number;
	  };

export interface SSEListenerOptions {
	url: string;
	onMessage?: (message: CLIMessage) => void;
	onConnect?: () => void;
	onDisconnect?: () => void;
	onError?: (error: Error) => void;
}

// Simple SSE parser for CLI use
class SimpleSSEParser {
	private buffer = '';

	parse(chunk: string): CLIMessage[] {
		this.buffer += chunk;
		const messages: CLIMessage[] = [];

		// Split by double newlines (SSE message boundaries)
		const parts = this.buffer.split('\n\n');

		// Keep the last part (might be incomplete)
		this.buffer = parts.pop() || '';

		for (const part of parts) {
			if (part.trim()) {
				const message = this.parseSSEMessage(part);
				if (message) {
					messages.push(message);
				}
			}
		}

		return messages;
	}

	private parseSSEMessage(rawMessage: string): CLIMessage | null {
		const lines = rawMessage.split('\n');
		let data = '';

		for (const line of lines) {
			if (line.startsWith('data: ')) {
				data += line.substring(6);
			}
		}

		if (data) {
			try {
				return JSON.parse(data) as CLIMessage;
			} catch (error) {
				console.error('❌ Failed to parse SSE data:', error);
				return null;
			}
		}

		return null;
	}

	reset(): void {
		this.buffer = '';
	}
}

export class SSEListener {
	private controller: AbortController | null = null;
	private isConnected = false;
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private reconnectDelay = 1000; // Start with 1 second
	private parser = new SimpleSSEParser();

	constructor(private options: SSEListenerOptions) {}

	async connect(): Promise<void> {
		if (this.isConnected) {
			return;
		}

		this.controller = new AbortController();

		try {
			const response = await fetch(this.options.url, {
				signal: this.controller.signal,
				headers: {
					Accept: 'text/event-stream',
					'Cache-Control': 'no-cache',
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			if (!response.body) {
				throw new Error('Response body is null');
			}

			this.isConnected = true;
			this.reconnectAttempts = 0;
			this.options.onConnect?.();

			// Read the stream
			const reader = response.body.getReader();
			const decoder = new TextDecoder();

			try {
				while (true) {
					const {done, value} = await reader.read();

					if (done) {
						break;
					}

					// Parse the chunk
					const chunk = decoder.decode(value, {stream: true});
					const messages = this.parser.parse(chunk);

					// Process each message
					for (const message of messages) {
						this.options.onMessage?.(message);
					}
				}
			} finally {
				reader.releaseLock();
			}
		} catch (error: any) {
			this.isConnected = false;

			// Handle abort signal
			if (error.name === 'AbortError') {
				return;
			}

			// Attempt to reconnect with exponential backoff
			if (this.reconnectAttempts < this.maxReconnectAttempts) {
				this.scheduleReconnect();
			} else {
				this.options.onError?.(error);
				throw error;
			}
		} finally {
			this.isConnected = false;
			this.options.onDisconnect?.();
		}
	}

	private scheduleReconnect(): void {
		this.reconnectAttempts++;
		const delay = Math.min(
			this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
			30000,
		); // Max 30 seconds

		setTimeout(() => {
			if (!this.isConnected) {
				this.connect().catch(error => {
					this.options.onError?.(error);
				});
			}
		}, delay);
	}

	disconnect(): void {
		if (this.controller) {
			this.controller.abort();
			this.controller = null;
		}
		this.isConnected = false;
		this.parser.reset();
	}

	getConnectionStatus(): boolean {
		return this.isConnected;
	}
}
