module.exports = {
    purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
    darkMode: true, // or 'media' or 'class'
    theme: {
        extend: {
            colors: {
                'error-red': '#EF4547',
                'test-failed': '#ff8e83',
                'test-passed': '#12f387',
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
}