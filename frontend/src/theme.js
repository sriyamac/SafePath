import { createTheme } from '@mui/material/styles';

// Define your custom colors
const colors = {
  primary: '#46566d',  // Light blue
  secondary: '#d2e8fa',  // Dark grey-blue
  accent: '#ffd460'      // Yellow accent
};

// Create the theme using the custom colors
const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
    },
    secondary: {
      main: colors.secondary,
    },
    accent: {
      main: colors.accent,
    },
  },

  shadows: ['none', '0px 4px 6px rgba(0,0,0,0.1)'], // Customize box shadows globally

  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    h1: {
      fontSize: '3rem',
      fontWeight: 700,  // Bold
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,  // Semi-bold
      color: '#46566d',
    },
    body1: {
      fontSize: '1rem',
      color: '#333',  // Darker body text color
    },
    button: {
      fontSize: '1.2rem',
      textTransform: 'none',  // Disable uppercase button text
    },
  },
});

export default theme;
