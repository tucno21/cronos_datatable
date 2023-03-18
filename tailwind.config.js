/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./public/**/*.{html,js}"],
	theme: {
		extend: {
			fontFamily: {
				sans: ["Montserrat", "Arial", "sans-serif"],
			},
		},
	},
	plugins: [],
	variants: {
		extend: {
			display: ["group-focus"],
			opacity: ["group-focus"],
			inset: ["group-focus"],
		},
	},
};
