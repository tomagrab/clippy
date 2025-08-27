import React, {useEffect} from 'react';

import {Box} from 'ink';
import Joke from './components/modules/joke/joke.js';
import Header from './components/layout/header/header.js';
import Fortune from './components/modules/fortune/fortune.js';

type Props = {
	name: string | undefined;
	joke: boolean | undefined;
	fortune: string | undefined;
};

export default function App({name, joke, fortune}: Props) {
	useEffect(() => {
		if (name?.trim().length === 0) {
			name = 'Stranger';
		}
	}, [name]);

	return (
		<Box flexDirection={`column`} padding={1} gap={1}>
			<Header />

			{joke ? <Joke /> : null}

			{fortune ? <Fortune fortune={fortune} /> : null}
		</Box>
	);
}
