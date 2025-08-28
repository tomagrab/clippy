/**
 * Animation utilities for the typing indicator
 */

export type TypingAnimationFrame = 0 | 1 | 2;

/**
 * Animation patterns for the typing indicator dots
 */
const TYPING_DOT_PATTERNS = ['●○○', '○●○', '○○●'] as const;

/**
 * Animation timing configuration
 */
export const TYPING_ANIMATION_CONFIG = {
	frameInterval: 600, // milliseconds between frame changes
	totalFrames: 3,
	typingIndicatorTimeout: 2000, // milliseconds before clearing typing indicator
} as const;

/**
 * Gets the animated typing dots pattern for the current frame
 * @param frame Current animation frame (0-2)
 * @returns String pattern showing animated dots
 */
export function getTypingDotsPattern(frame: TypingAnimationFrame): string {
	return TYPING_DOT_PATTERNS[frame];
}

/**
 * Calculates the next animation frame
 * @param currentFrame Current animation frame
 * @returns Next frame in the cycle
 */
export function getNextAnimationFrame(
	currentFrame: TypingAnimationFrame,
): TypingAnimationFrame {
	return ((currentFrame + 1) %
		TYPING_ANIMATION_CONFIG.totalFrames) as TypingAnimationFrame;
}
