import { useState } from 'react'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Avatar, IconButton, Divider, Tooltip, Button,
  useMediaQuery, useTheme,
} from '@mui/material'
import {
  Public as PublicIcon,
  ChecklistRtl as MyTodosIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'

const SIDEBAR_WIDTH = 240

function SidebarContent({ onClose }) {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { label: 'Public Todos', path: '/', icon: <PublicIcon fontSize="small" /> },
    ...(isAuthenticated
      ? [{ label: 'My Todos', path: '/todos', icon: <MyTodosIcon fontSize="small" /> }]
      : []),
  ]

  const handleNav = (path) => {
    navigate(path)
    onClose?.()
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    onClose?.()
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #0A1020 0%, #080C14 100%)',
        borderRight: '1px solid #1E2D45',
      }}
    >
      {/* Logo */}
      <Box sx={{ px: 3, py: 3.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 32, height: 32, borderRadius: '8px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <MyTodosIcon sx={{ fontSize: 18, color: '#fff' }} />
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontFamily: '"Syne", sans-serif',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #F1F5F9, #94A3B8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Taskr
        </Typography>
      </Box>

      <Divider sx={{ borderColor: '#1E2D45' }} />

      {/* Nav items */}
      <List sx={{ px: 1.5, pt: 2, flex: 1 }}>
        {navItems.map(({ label, path, icon }) => {
          const active = location.pathname === path
          return (
            <ListItemButton
              key={path}
              onClick={() => handleNav(path)}
              sx={{
                borderRadius: '8px',
                mb: 0.5,
                px: 2,
                py: 1.1,
                transition: 'all 0.15s ease',
                backgroundColor: active ? 'rgba(59,130,246,0.12)' : 'transparent',
                '&:hover': {
                  backgroundColor: active ? 'rgba(59,130,246,0.16)' : 'rgba(255,255,255,0.04)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 32,
                  color: active ? '#3B82F6' : '#64748B',
                }}
              >
                {icon}
              </ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: active ? 600 : 400,
                  color: active ? '#F1F5F9' : '#94A3B8',
                  fontFamily: '"Lexend", sans-serif',
                }}
              />
              {active && (
                <Box
                  sx={{
                    width: 3, height: 16, borderRadius: 2,
                    background: 'linear-gradient(180deg, #3B82F6, #06B6D4)',
                    ml: 1,
                  }}
                />
              )}
            </ListItemButton>
          )
        })}
      </List>

      <Divider sx={{ borderColor: '#1E2D45' }} />

      {/* Bottom: auth section */}
      <Box sx={{ p: 2 }}>
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 34, height: 34, fontSize: '0.8rem', fontWeight: 700,
                background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
                flexShrink: 0,
              }}
            >
              {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: '0.8rem', fontWeight: 500, color: '#F1F5F9',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}
              >
                {user?.displayName || 'User'}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.7rem', color: '#64748B',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}
              >
                {user?.email}
              </Typography>
            </Box>
            <Tooltip title="Sign out">
              <IconButton
                size="small"
                onClick={handleLogout}
                sx={{ color: '#64748B', '&:hover': { color: '#EF4444', bgcolor: 'rgba(239,68,68,0.08)' } }}
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              component={Link}
              to="/login"
              variant="contained"
              fullWidth
              startIcon={<LoginIcon />}
              onClick={onClose}
              sx={{
                background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
                '&:hover': { background: 'linear-gradient(135deg, #2563EB, #0891B2)' },
                py: 0.9,
              }}
            >
              Sign In
            </Button>
            <Button
              component={Link}
              to="/register"
              variant="outlined"
              fullWidth
              startIcon={<RegisterIcon />}
              onClick={onClose}
              sx={{ py: 0.9 }}
            >
              Register
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default function Layout() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Desktop sidebar */}
      {!isMobile && (
        <Box
          component="nav"
          sx={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            zIndex: 100,
          }}
        >
          <SidebarContent />
        </Box>
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          PaperProps={{ sx: { width: SIDEBAR_WIDTH, border: 'none' } }}
        >
          <SidebarContent onClose={() => setMobileOpen(false)} />
        </Drawer>
      )}

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          ml: isMobile ? 0 : `${SIDEBAR_WIDTH}px`,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Mobile topbar */}
        {isMobile && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 2,
              py: 1.5,
              borderBottom: '1px solid #1E2D45',
              background: '#0A1020',
            }}
          >
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ color: '#94A3B8', mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              sx={{
                fontFamily: '"Syne", sans-serif',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #F1F5F9, #94A3B8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Taskr
            </Typography>
          </Box>
        )}

        <Box sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
