import React, {useEffect, useState} from 'react';
import {Box, Text, useInput} from 'ink';

const options = ['Joke', 'Fortune', 'Clippy Web', 'Exit'];

type MenuProps = {
	onSelect: (option: string | undefined) => void;
};

export default function Menu({onSelect}: MenuProps) {
	const [selected, setSelected] = useState(0);

	useInput((input, key) => {
		if (key.upArrow || input === 'k') {
			setSelected(prev => (prev > 0 ? prev - 1 : options.length - 1));
		} else if (key.downArrow || input === 'j') {
			setSelected(prev => (prev < options.length - 1 ? prev + 1 : 0));
		} else if (key.return || input === ' ') {
			onSelect(options[selected]);
		} else if (input === 'q' || key.escape) {
			// Quit the application
			onSelect('Exit');
		} else if (input >= '1' && input <= String(options.length)) {
			// Direct number selection
			const index = parseInt(input, 10) - 1;
			setSelected(index);
			onSelect(options[index]);
		}
	});

	useEffect(() => {
		// Ensure selected index is always valid
		if (selected < 0) {
			setSelected(options.length - 1);
		} else if (selected >= options.length) {
			setSelected(0);
		}
	}, [selected]);

	return (
		<Box flexDirection="column" gap={0.5}>
			<Text color="cyan" bold>
				📋 Main Menu
			</Text>
			<Text color="gray" dimColor>
				Use ↑/↓ arrows, j/k, or numbers to navigate. Press Enter or Space to
				select.
			</Text>

			<Box flexDirection="column" marginTop={1}>
				{options.map((option, index) => (
					<Box key={option} paddingY={0}>
						<Text
							color={index === selected ? 'green' : 'white'}
							bold={index === selected}
						>
							{index === selected ? '👉 ' : '   '}
							{index + 1}. {option}
						</Text>
					</Box>
				))}
			</Box>

			<Box marginTop={1}>
				<Text color="gray" dimColor>
					Press Q or Escape to exit
				</Text>
			</Box>
		</Box>
	);
}
