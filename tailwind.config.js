/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      minHeight: {
        screen: "100dvh",
      },
      height: {
        screen: "100dvh",
      },
      minWidth: {
        screen: "100dvw",
      },
      width: {
        screen: "100dvw",
      },
    },
  },
  plugins: [],
};
