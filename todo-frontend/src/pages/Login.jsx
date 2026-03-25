import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, CircularProgress, InputAdornment, IconButton,
} from '@mui/material'
import {
  Visibility, VisibilityOff,
  ChecklistRtl as LogoIcon,
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated) {
    navigate('/todos', { replace: true })
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/todos')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        background: `
          radial-gradient(ellipse at 15% 50%, rgba(59,130,246,0.09) 0%, transparent 55%),
          radial-gradient(ellipse at 85% 20%, rgba(6,182,212,0.07) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 90%, rgba(59,130,246,0.05) 0%, transparent 50%),
          #080C14
        `,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 400,
          background: 'rgba(15,22,35,0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid #1E2D45',
          borderRadius: '16px',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
            <Box
              sx={{
                width: 38, height: 38, borderRadius: '10px',
                background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <LogoIcon sx={{ fontSize: 20, color: '#fff' }} />
            </Box>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: '"Syne", sans-serif',
                  fontWeight: 800,
                  lineHeight: 1.1,
                  background: 'linear-gradient(135deg, #F1F5F9, #94A3B8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Taskr
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748B', letterSpacing: '0.08em' }}>
                PRODUCTIVITY
              </Typography>
            </Box>
          </Box>

          <Typography
            variant="h6"
            sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, mb: 0.5 }}
          >
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to your account to continue
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: '8px' }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              size="small"
              autoComplete="email"
              autoFocus
            />

            <TextField
              label="Password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              size="small"
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowPass((p) => !p)}
                      sx={{ color: '#64748B' }}
                    >
                      {showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                mt: 0.5,
                py: 1.3,
                background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
                '&:hover': { background: 'linear-gradient(135deg, #2563EB, #0891B2)' },
                fontSize: '0.9rem',
              }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>

          <Typography
            variant="body2"
            sx={{ mt: 3, textAlign: 'center', color: '#64748B' }}
          >
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{ color: '#3B82F6', textDecoration: 'none', fontWeight: 500 }}
            >
              Create one
            </Link>
          </Typography>

          <Typography
            variant="body2"
            sx={{ mt: 1.5, textAlign: 'center', color: '#64748B' }}
          >
            Just browsing?{' '}
            <Link
              to="/"
              style={{ color: '#06B6D4', textDecoration: 'none', fontWeight: 500 }}
            >
              View public todos
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
