import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, CircularProgress, InputAdornment, IconButton,
} from '@mui/material'
import {
  Visibility, VisibilityOff,
  ChecklistRtl as LogoIcon,
  CheckCircleOutline as SuccessIcon,
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', displayName: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated) {
    navigate('/todos', { replace: true })
    return null
  }

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await register(form.email, form.password, form.displayName)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Email may already be in use.')
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
          radial-gradient(ellipse at 80% 40%, rgba(59,130,246,0.09) 0%, transparent 55%),
          radial-gradient(ellipse at 20% 80%, rgba(6,182,212,0.07) 0%, transparent 50%),
          #080C14
        `,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 420,
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

          {success ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <SuccessIcon sx={{ fontSize: 52, color: '#10B981', mb: 2 }} />
              <Typography variant="h6" sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, mb: 1 }}>
                Account created!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Redirecting you to sign in…
              </Typography>
            </Box>
          ) : (
            <>
              <Typography
                variant="h6"
                sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, mb: 0.5 }}
              >
                Create your account
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start organising your todos today
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2.5, borderRadius: '8px' }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Display name"
                  value={form.displayName}
                  onChange={set('displayName')}
                  fullWidth
                  size="small"
                  autoFocus
                  inputProps={{ maxLength: 100 }}
                />

                <TextField
                  label="Email address"
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  required
                  fullWidth
                  size="small"
                  autoComplete="email"
                />

                <TextField
                  label="Password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  required
                  fullWidth
                  size="small"
                  autoComplete="new-password"
                  helperText="Minimum 6 characters"
                  FormHelperTextProps={{ sx: { color: '#64748B' } }}
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
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Create Account'}
                </Button>
              </Box>

              <Typography
                variant="body2"
                sx={{ mt: 3, textAlign: 'center', color: '#64748B' }}
              >
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{ color: '#3B82F6', textDecoration: 'none', fontWeight: 500 }}
                >
                  Sign in
                </Link>
              </Typography>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
