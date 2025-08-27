#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import App from './app.js';

const cli = meow(
	`
	Usage
	  $ clippy

	Options
		--name  Your name

	Examples
	  $ clippy --name=Jane
	  Hello, Jane
`,
	{
		importMeta: import.meta,
		flags: {
			name: {
				type: 'string',
			},
			joke: {
				type: 'boolean',
				default: false,
			},
			fortune: {
				type: 'string',
				default: '',
			},
		},
	},
);

render(
	<App
		name={cli.flags.name}
		joke={cli.flags.joke}
		fortune={cli.flags.fortune}
	/>,
);
