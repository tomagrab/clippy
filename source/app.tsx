import React, {useEffect, useState} from 'react';

import {Box} from 'ink';
import Joke from './components/modules/joke/joke.js';
import Header from './components/layout/header/header.js';
import Fortune from './components/modules/fortune/fortune.js';
import Menu from './components/layout/menu/menu.js';
import ClippyWeb from './components/modules/clippy-web/clippy-web.js';

type Props = {
	name: string | undefined;
	joke: boolean | undefined;
	fortune: string | undefined;
};

export default function App({name}: Props) {
	const [selectedOption, setSelectedOption] = useState<string | null>(null);

	const onSelect = (option: string | undefined) => {
		switch (option) {
			case 'Joke':
				setSelectedOption('Joke');
				break;
			case 'Fortune':
				setSelectedOption('Fortune');
				break;
			case 'Clippy Web':
				setSelectedOption('Clippy Web');
				break;
			case 'Exit':
				process.exit(0);
			default:
				break;
		}
	};

	const onBack = () => {
		setSelectedOption(null);
	};

	useEffect(() => {
		if (name?.trim().length === 0) {
			name = 'Stranger';
		}
	}, [name]);

	return (
		<Box flexDirection={`column`} padding={1} gap={1}>
			<Header />

			{!selectedOption && <Menu onSelect={onSelect} />}

			{selectedOption === 'Joke' && <Joke onBack={onBack} />}
			{selectedOption === 'Fortune' && <Fortune onBack={onBack} />}
			{selectedOption === 'Clippy Web' && <ClippyWeb onBack={onBack} />}
		</Box>
	);
}
