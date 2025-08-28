import {createMessage} from '../../types/clippy-web/send-message.js';
import sendMessage from '../../api/clippy-web/clippy-web.js';
import {TYPING_ANIMATION_CONFIG} from '../../utilities/animation/typing-animation.js';

/**
 * Manages typing indicator state and sends appropriate messages
 */
export class TypingIndicatorManager {
	private isTypingIndicatorSent = false;
	private typingTimeout: NodeJS.Timeout | null = null;

	/**
	 * Handles input changes and manages typing indicator logic
	 * @param newValue Current input value
	 * @param onTypingStateChange Callback when typing indicator state changes
	 */
	async handleInputChange(
		newValue: string,
		onTypingStateChange?: (isSent: boolean) => void,
	): Promise<void> {
		// Clear any existing typing timeout
		this.clearTypingTimeout();

		// If input is now empty, clear typing indicator immediately
		if (!newValue.trim()) {
			await this.clearTypingIndicator();
			onTypingStateChange?.(false);
			return;
		}

		// If user is typing and we haven't sent typing indicator yet, send it
		if (newValue.trim() && !this.isTypingIndicatorSent) {
			const typingMessage = createMessage('typing', '', {
				isIncremental: true,
			});
			await sendMessage(typingMessage);
			this.isTypingIndicatorSent = true;
			onTypingStateChange?.(true);
		}

		// Set a timeout to clear the typing indicator if user stops typing
		this.typingTimeout = setTimeout(async () => {
			await this.clearTypingIndicator();
			onTypingStateChange?.(false);
		}, TYPING_ANIMATION_CONFIG.typingIndicatorTimeout);
	}

	/**
	 * Handles message submission and clears typing indicators
	 * @param text Message text to send
	 * @param onMessageSent Callback when message is sent with timestamp
	 */
	async handleMessageSubmit(
		text: string,
		onMessageSent?: (message: {text: string; timestamp: number}) => void,
	): Promise<void> {
		if (!text.trim()) {
			return;
		}

		// Clear any pending typing timeout
		this.clearTypingTimeout();

		// Clear typing indicator if it was sent
		await this.clearTypingIndicator();

		// Add to sent messages immediately for UI feedback
		const timestamp = Date.now();
		const messageData = {text: text.trim(), timestamp};
		onMessageSent?.(messageData);

		// Send final message when Enter is pressed
		const finalMessage = createMessage('message', text, {
			priority: 'normal',
		});
		await sendMessage(finalMessage);
	}

	/**
	 * Clears the typing indicator if it was sent
	 */
	private async clearTypingIndicator(): Promise<void> {
		if (this.isTypingIndicatorSent) {
			const clearMessage = createMessage('clear', '', {
				clearScope: 'typing',
			});
			await sendMessage(clearMessage);
			this.isTypingIndicatorSent = false;
		}
	}

	/**
	 * Clears the typing timeout
	 */
	private clearTypingTimeout(): void {
		if (this.typingTimeout) {
			clearTimeout(this.typingTimeout);
			this.typingTimeout = null;
		}
	}

	/**
	 * Cleanup method to be called when component unmounts
	 */
	cleanup(): void {
		this.clearTypingTimeout();
	}

	/**
	 * Gets the current typing indicator state
	 */
	getTypingState(): {isIndicatorSent: boolean; hasTimeout: boolean} {
		return {
			isIndicatorSent: this.isTypingIndicatorSent,
			hasTimeout: this.typingTimeout !== null,
		};
	}
}
