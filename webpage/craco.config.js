module.exports = {
    style: {
        postcss: {
            plugins: [require("tailwindcss"), require("autoprefixer")],
        },
    },
    babel: {
        plugins: [
            [
                "prismjs", 
                {
                    "languages": ["python"],
                    "theme": "coy",
                    "css": true
                }
            ]
        ],
    },
};
