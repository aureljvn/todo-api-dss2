import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#1D4ED8',
    },
    secondary: {
      main: '#06B6D4',
      light: '#22D3EE',
      dark: '#0891B2',
    },
    background: {
      default: '#080C14',
      paper: '#0F1623',
    },
    divider: '#1E2D45',
    text: {
      primary: '#F1F5F9',
      secondary: '#64748B',
    },
    success: { main: '#10B981', light: '#34D399' },
    warning: { main: '#F59E0B', light: '#FCD34D' },
    error: { main: '#EF4444', light: '#F87171' },
  },
  typography: {
    fontFamily: '"Lexend", sans-serif',
    h1: { fontFamily: '"Syne", sans-serif', fontWeight: 800 },
    h2: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
    h4: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Syne", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Syne", sans-serif', fontWeight: 600 },
    button: { fontFamily: '"Lexend", sans-serif', fontWeight: 500 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          letterSpacing: 0,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        outlined: {
          borderColor: '#1E2D45',
          '&:hover': { borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.06)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #1E2D45',
          backgroundColor: '#0F1623',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            borderColor: '#2D3F5C',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1E2D45' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#2D3F5C' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3B82F6' },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { color: '#64748B', '&.Mui-focused': { color: '#3B82F6' } },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontFamily: '"Lexend", sans-serif',
          fontWeight: 500,
          fontSize: '0.72rem',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: '#0F1623',
          border: '1px solid #1E2D45',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: '#1E2D45' },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: { color: '#64748B' },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: 'rgba(59,130,246,0.08)' },
          '&.Mui-selected': { backgroundColor: 'rgba(59,130,246,0.15)' },
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: { display: 'flex', justifyContent: 'center' },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1E2D45',
          color: '#F1F5F9',
          fontSize: '0.75rem',
          borderRadius: 6,
        },
      },
    },
  },
})

export default theme
