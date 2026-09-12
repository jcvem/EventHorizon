import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#F7F4EB",
          subtle: "#F1ECE1",
          card: "#FCFAF5",
          muted: "#EAE4D5",
          inset: "#ECE6D8",
        },
        ink: {
          primary: "#1B2A28",
          secondary: "#3D5250",
          muted: "#697F7D",
          faint: "#9FB0AE",
        },
        ochre: {
          DEFAULT: "#C05C2B",
          hover: "#A84E22",
          light: "#F7ECE6",
          border: "#E5AB90",
        },
        rule: {
          DEFAULT: "#DDD6C6",
          dark: "#BCB3A0",
          subtle: "#EBE5D8",
        },
      },
      fontFamily: {
        serif: [
          '"Noto Serif TC"',
          '"Songti TC"',
          '"Source Han Serif TW"',
          "Baskerville",
          "Georgia",
          "serif",
        ],
        sans: [
          '"Noto Sans TC"',
          '"PingFang TC"',
          '"Lantinghei TC"',
          '"Microsoft JhengHei"',
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          '"SF Mono"',
          "Menlo",
          "monospace",
        ],
      },
      boxShadow: {
        editorial: "0 1px 3px rgba(27, 42, 40, 0.05), 0 1px 2px rgba(27, 42, 40, 0.03)",
        "editorial-hover": "0 4px 12px rgba(27, 42, 40, 0.08), 0 1px 3px rgba(27, 42, 40, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
