module.exports = {
    purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
    darkMode: true, // or 'media' or 'class'
    theme: {
        extend: {
            colors: {
                'error-red': '#EF4547',
                'test-failed': '#ff8e83',
                'test-passed': '#12f387',
                'white-pink': '#f8e6f7',
                'red-pink': '#fc7d88',
                'bright-blue': '#2e92f0',
                'bright-purple': '#a475f0',
                'basically-black': '#171c2b',


            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}