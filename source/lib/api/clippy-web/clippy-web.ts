type SendMessageProps = {
	text: string;
	type?: string;
};

export default async function sendMessage({text, type}: SendMessageProps) {
	const CLIPPY_WEB_API_URL = process.env['CLIPPY_WEB_API_URL'];

	if (!CLIPPY_WEB_API_URL) {
		throw new Error('CLIPPY_WEB_API_URL is not defined');
	}

	try {
		const clippyWebResponse = await fetch(CLIPPY_WEB_API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({text, type}),
		});

		if (!clippyWebResponse.ok) {
			const error = await clippyWebResponse.text();
			console.error('❌ Error:', error);
			return false;
		}

		const clippyWebResult = await clippyWebResponse.json();

		if (!clippyWebResult.success) {
			console.error('❌ Error:', clippyWebResult.error);
			return false;
		}

		return true;
	} catch (error) {
		console.error('❌ Error:', error);
		return false;
	}
}
