import {useState, useEffect} from 'react';
import {
	SSEListener,
	CLIMessage,
} from '../../../lib/api/clippy-web/sse-listener.js';
import {ConnectionStatus} from '../../../lib/types/clippy-web/chat-messages.js';
import {updateMessageState} from '../../../lib/helpers/clippy-web/message-processing.js';

/**
 * Custom hook for managing SSE connection and incoming messages
 */
export function useSSEConnection() {
	const [connectionStatus, setConnectionStatus] =
		useState<ConnectionStatus>('disconnected');
	const [isListening, setIsListening] = useState(false);
	const [incomingMessages, setIncomingMessages] = useState<CLIMessage[]>([]);

	useEffect(() => {
		const listener = new SSEListener({
			url: 'http://localhost:3000/api/clippy/stream',
			onMessage: (message: CLIMessage) => {
				setIncomingMessages(prev => updateMessageState(prev, message));
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
				setIncomingMessages(prev => updateMessageState(prev, errorMessage));
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
		};
	}, []);

	return {
		connectionStatus,
		isListening,
		incomingMessages,
	};
}
