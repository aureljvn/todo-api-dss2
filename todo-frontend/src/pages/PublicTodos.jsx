import { useState, useEffect } from 'react'
import {
  Box, Typography, Pagination, Alert, Chip, CircularProgress,
} from '@mui/material'
import { Public as PublicIcon } from '@mui/icons-material'
import { getPublicTodos } from '../api/todos'
import TodoCard, { TodoCardSkeleton } from '../components/TodoCard'
import FilterBar from '../components/FilterBar'

const DEFAULT_FILTERS = {
  page: 1,
  pageSize: 10,
  status: '',
  priority: '',
  search: '',
  sortBy: 'createdAt',
  sortDir: 'desc',
}

export default function PublicTodos() {
  const [todos, setTodos] = useState([])
  const [meta, setMeta] = useState({ totalItems: 0, totalPages: 1, page: 1 })
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTodos()
  }, [filters])

  const fetchTodos = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page: filters.page,
        pageSize: filters.pageSize,
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.search && { search: filters.search }),
        sortBy: filters.sortBy,
        sortDir: filters.sortDir,
      }
      const { data } = await getPublicTodos(params)
      setTodos(data.items || [])
      setMeta({ totalItems: data.totalItems, totalPages: data.totalPages, page: data.page })
    } catch {
      setError('Failed to load public todos.')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (updates) => {
    setFilters((prev) => ({ ...prev, ...updates }))
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Typography
            variant="h4"
            sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, letterSpacing: '-0.02em' }}
          >
            Public Todos
          </Typography>
          {!loading && (
            <Chip
              label={meta.totalItems}
              size="small"
              sx={{
                background: 'rgba(59,130,246,0.12)',
                color: '#3B82F6',
                border: '1px solid rgba(59,130,246,0.2)',
                fontWeight: 600,
              }}
            />
          )}
        </Box>
        <Typography variant="body2" color="text.secondary">
          Browse todos shared by the community — no account needed.
        </Typography>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <FilterBar filters={filters} onChange={handleFilterChange} />
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      {/* Todo list */}
      {loading && todos.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <TodoCardSkeleton key={i} />
          ))}
        </Box>
      ) : todos.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 10,
            border: '1px dashed #1E2D45',
            borderRadius: '12px',
          }}
        >
          <PublicIcon sx={{ fontSize: 48, color: '#1E2D45', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#64748B', fontFamily: '"Syne", sans-serif', mb: 1 }}>
            No public todos found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your filters or check back later.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {todos.map((todo) => (
            <TodoCard key={todo.id} todo={todo} readOnly />
          ))}
        </Box>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={meta.totalPages}
            page={filters.page}
            onChange={(_, p) => handleFilterChange({ page: p })}
            color="primary"
            shape="rounded"
            sx={{
              '& .MuiPaginationItem-root': {
                borderColor: '#1E2D45',
                color: '#94A3B8',
                '&.Mui-selected': {
                  background: 'rgba(59,130,246,0.2)',
                  color: '#3B82F6',
                  borderColor: 'rgba(59,130,246,0.4)',
                },
              },
            }}
          />
        </Box>
      )}
    </Box>
  )
}
