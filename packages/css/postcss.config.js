module.exports = {
    map: process.env.NODE_ENV === "production" ? false : true,
    plugins: [
        require("tailwindcss"),
        require("autoprefixer"),
        ...(process.env.NODE_ENV === "production"
            ? [
                  require("cssnano")({
                      preset: "default", // Explicitly set cssnano to use the default minification preset
                  }),
              ]
            : []),
    ],
};
