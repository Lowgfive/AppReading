/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {

      colors: {
        paper: "#F5E9D4",        // nền giấy cổ
        ink: "#2C2C2C",          // màu chữ
        accent: "#8B5E3C",       // màu nâu cổ
        borderClassic: "#D6C6A8"
      },

      fontFamily: {
        serifClassic: ["Georgia", "Times New Roman", "serif"],
        reading: ["Merriweather", "Georgia", "serif"]
      },

      fontSize: {
        reading: ["18px", { lineHeight: "1.8" }],
        chapterTitle: ["28px", { lineHeight: "1.3" }]
      },

      maxWidth: {
        reading: "700px"
      },

      spacing: {
        reading: "32px"
      }

    },
  },
  plugins: [],
};