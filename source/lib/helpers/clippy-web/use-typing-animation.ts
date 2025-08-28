import {useState, useEffect} from 'react';
import {UnifiedMessage} from '../../../lib/types/clippy-web/chat-messages.js';
import {
	TypingAnimationFrame,
	getNextAnimationFrame,
	TYPING_ANIMATION_CONFIG,
} from '../../../lib/utilities/animation/typing-animation.js';

/**
 * Custom hook for managing typing animation state
 */
export function useTypingAnimation(messages: UnifiedMessage[]) {
	const [typingAnimationFrame, setTypingAnimationFrame] =
		useState<TypingAnimationFrame>(0);

	useEffect(() => {
		const hasTypingMessage = messages.some(msg => msg.type === 'typing');

		if (hasTypingMessage) {
			const interval = setInterval(() => {
				setTypingAnimationFrame(prev => getNextAnimationFrame(prev));
			}, TYPING_ANIMATION_CONFIG.frameInterval);

			return () => clearInterval(interval);
		}

		return () => {}; // Return empty cleanup function when no typing
	}, [messages.length]); // Re-run when messages change

	return typingAnimationFrame;
}
