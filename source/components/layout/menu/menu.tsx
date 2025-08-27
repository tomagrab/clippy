import React, {useEffect, useState} from 'react';
import {Box, Text, useInput} from 'ink';

const options = ['Joke', 'Fortune', 'Exit'];

type MenuProps = {
	onSelect: (option: string | undefined) => void;
};

export default function Menu({onSelect}: MenuProps) {
	const [selected, setSelected] = useState(0);

	useInput((_input, key) => {
		if (key.upArrow) {
			setSelected(prev => (prev > 0 ? prev - 1 : options.length - 1));
		} else if (key.downArrow) {
			setSelected(prev => (prev < options.length - 1 ? prev + 1 : 0));
		} else if (key.return) {
			onSelect(options[selected]);
		}
	});

	useEffect(() => {
		if (selected < 0) {
			setSelected(options.length - 1);
		} else if (selected >= options.length) {
			setSelected(0);
		}
	}, [selected]);

	return (
		<Box flexDirection="column">
			{options.map((option, index) => (
				<Box paddingY={0.5}>
					<Text key={index} color={index === selected ? 'green' : 'white'}>
						{index === selected ? '👉 ' : '   '}
						{option}
					</Text>
				</Box>
			))}
		</Box>
	);
}
