import {
  Card, CardContent, Box, Typography, Chip, IconButton,
  Checkbox, Tooltip, Skeleton,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Lock as LockIcon,
  Public as PublicIcon,
} from '@mui/icons-material'

const PRIORITY_CONFIG = {
  high: { label: 'High', color: '#EF4444', bg: 'rgba(239,68,68,0.12)', border: '#EF4444' },
  medium: { label: 'Medium', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: '#F59E0B' },
  low: { label: 'Low', color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: '#10B981' },
}

export function TodoCardSkeleton() {
  return (
    <Card sx={{ borderRadius: '12px' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Skeleton variant="rectangular" width={20} height={20} sx={{ borderRadius: 1, mt: 0.3, flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={22} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="90%" height={18} />
            <Skeleton variant="text" width="40%" height={18} sx={{ mt: 1 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default function TodoCard({ todo, onEdit, onDelete, onToggleComplete, readOnly = false }) {
  const priority = PRIORITY_CONFIG[todo.priority] || PRIORITY_CONFIG.medium

  const formattedDate = todo.dueDate
    ? new Date(todo.dueDate + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : null

  const isOverdue =
    todo.dueDate && !todo.isCompleted && new Date(todo.dueDate) < new Date()

  return (
    <Card
      sx={{
        borderRadius: '12px',
        borderLeft: `3px solid ${todo.isCompleted ? '#1E2D45' : priority.border}`,
        opacity: todo.isCompleted ? 0.65 : 1,
        transition: 'opacity 0.2s ease',
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          {/* Completion checkbox (my todos only) */}
          {!readOnly && (
            <Checkbox
              checked={todo.isCompleted}
              onChange={(e) => onToggleComplete?.(todo.id, e.target.checked)}
              size="small"
              sx={{
                mt: -0.5,
                p: 0.5,
                flexShrink: 0,
                color: '#1E2D45',
                '&.Mui-checked': { color: '#10B981' },
              }}
            />
          )}

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 500,
                color: todo.isCompleted ? '#64748B' : '#F1F5F9',
                textDecoration: todo.isCompleted ? 'line-through' : 'none',
                lineHeight: 1.4,
                mb: todo.details ? 0.5 : 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {todo.title}
            </Typography>

            {todo.details && (
              <Typography
                variant="body2"
                sx={{
                  color: '#64748B',
                  fontSize: '0.8rem',
                  lineHeight: 1.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {todo.details}
              </Typography>
            )}

            {/* Tags row */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 0.75,
                mt: 1.5,
              }}
            >
              {/* Priority chip */}
              <Chip
                label={priority.label}
                size="small"
                sx={{
                  backgroundColor: priority.bg,
                  color: priority.color,
                  border: `1px solid ${priority.color}30`,
                  height: 22,
                }}
              />

              {/* Due date */}
              {formattedDate && (
                <Chip
                  icon={
                    <CalendarIcon
                      sx={{ fontSize: '0.75rem !important', color: isOverdue ? '#EF4444 !important' : '#64748B !important' }}
                    />
                  }
                  label={formattedDate}
                  size="small"
                  sx={{
                    backgroundColor: isOverdue ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)',
                    color: isOverdue ? '#EF4444' : '#64748B',
                    border: `1px solid ${isOverdue ? 'rgba(239,68,68,0.2)' : '#1E2D45'}`,
                    height: 22,
                  }}
                />
              )}

              {/* Public/private badge */}
              <Chip
                icon={
                  todo.isPublic
                    ? <PublicIcon sx={{ fontSize: '0.75rem !important', color: '#3B82F6 !important' }} />
                    : <LockIcon sx={{ fontSize: '0.75rem !important', color: '#64748B !important' }} />
                }
                label={todo.isPublic ? 'Public' : 'Private'}
                size="small"
                sx={{
                  backgroundColor: todo.isPublic ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.04)',
                  color: todo.isPublic ? '#3B82F6' : '#64748B',
                  border: `1px solid ${todo.isPublic ? 'rgba(59,130,246,0.2)' : '#1E2D45'}`,
                  height: 22,
                }}
              />

              {/* Completed badge (read-only mode) */}
              {readOnly && todo.isCompleted && (
                <Chip
                  label="Done"
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(16,185,129,0.1)',
                    color: '#10B981',
                    border: '1px solid rgba(16,185,129,0.2)',
                    height: 22,
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Action buttons (my todos only) */}
          {!readOnly && (
            <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={() => onEdit?.(todo)}
                  sx={{
                    color: '#64748B',
                    '&:hover': { color: '#3B82F6', bgcolor: 'rgba(59,130,246,0.08)' },
                    width: 30, height: 30,
                  }}
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={() => onDelete?.(todo.id)}
                  sx={{
                    color: '#64748B',
                    '&:hover': { color: '#EF4444', bgcolor: 'rgba(239,68,68,0.08)' },
                    width: 30, height: 30,
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
