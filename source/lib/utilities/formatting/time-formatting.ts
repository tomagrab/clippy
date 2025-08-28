/**
 * Utility functions for formatting time and dates
 */

/**
 * Formats a timestamp for display in chat messages
 * @param timestamp Optional timestamp in milliseconds. Defaults to current time
 * @returns Formatted time string in HH:MM format
 */
export function formatMessageTime(timestamp?: number): string {
	const date = new Date(timestamp || Date.now());
	return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
}

/**
 * Formats a timestamp for display in chat headers or detailed views
 * @param timestamp Optional timestamp in milliseconds. Defaults to current time
 * @returns Formatted date and time string
 */
export function formatDetailedTime(timestamp?: number): string {
	const date = new Date(timestamp || Date.now());
	return date.toLocaleString();
}
