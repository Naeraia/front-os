import plugin from 'tailwindcss/plugin'

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {}
	},
	plugins: [
		require('daisyui')
	],
	daisyui: {
		themes: [
			{
				"front-os-light": {
					"primary": "#641ae6",
					"secondary": "#DF19E6",
					"accent": "#11d3f3",
					"neutral": "#4612A1",
					"base-100": "#D1BAF7",
					"info": "#3abff8",
					"success": "#36d399",
					"warning": "#fbbd23",
					"error": "#f87272",
				},
				"front-os-dark": {
					"primary": "#641ae6",
					"secondary": "#DF19E6",
					"accent": "#11d3f3",
					"neutral": "#4612A1",
					"base-100": "#1E0845",
					"info": "#3abff8",
					"success": "#36d399",
					"warning": "#fbbd23",
					"error": "#f87272",
				}
			},
			"light",
			"dark",
			"cupcake",
			"bumblebee",
			"emerald",
			"corporate",
			"synthwave",
			"retro",
			"cyberpunk",
			"valentine",
			"halloween",
			"garden",
			"forest",
			"aqua",
			"lofi",
			"pastel",
			"fantasy",
			"wireframe",
			"black",
			"luxury",
			"dracula",
			"cmyk",
			"autumn",
			"business",
			"acid",
			"lemonade",
			"night",
			"coffee",
			"winter",
		],
	}
};
