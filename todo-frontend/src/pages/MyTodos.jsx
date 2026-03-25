import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Button, Pagination, Alert, Chip, Snackbar,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
} from '@mui/material'
import {
  Add as AddIcon,
  ChecklistRtl as EmptyIcon,
  CheckCircle as DoneIcon,
  RadioButtonUnchecked as ActiveIcon,
} from '@mui/icons-material'
import { getMyTodos, createTodo, updateTodo, deleteTodo, setCompletion } from '../api/todos'
import TodoCard, { TodoCardSkeleton } from '../components/TodoCard'
import FilterBar from '../components/FilterBar'
import TodoFormDialog from '../components/TodoFormDialog'

const DEFAULT_FILTERS = {
  page: 1,
  pageSize: 10,
  status: '',
  priority: '',
  search: '',
  sortBy: 'createdAt',
  sortDir: 'desc',
}

export default function MyTodos() {
  const [todos, setTodos] = useState([])
  const [meta, setMeta] = useState({ totalItems: 0, totalPages: 1 })
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Form dialog
  const [formOpen, setFormOpen] = useState(false)
  const [editTodo, setEditTodo] = useState(null)

  // Delete confirm dialog
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Snackbar
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' })

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
      const { data } = await getMyTodos(params)
      setTodos(data.items || [])
      setMeta({ totalItems: data.totalItems, totalPages: data.totalPages })
    } catch {
      setError('Failed to load your todos.')
    } finally {
      setLoading(false)
    }
  }

  const notify = (message, severity = 'success') => {
    setSnack({ open: true, message, severity })
  }

  const handleFilterChange = (updates) => {
    setFilters((prev) => ({ ...prev, ...updates }))
  }

  const handleOpenCreate = () => {
    setEditTodo(null)
    setFormOpen(true)
  }

  const handleOpenEdit = (todo) => {
    setEditTodo(todo)
    setFormOpen(true)
  }

  const handleSubmit = async (formData) => {
    if (editTodo) {
      await updateTodo(editTodo.id, formData)
      notify('Todo updated successfully')
    } else {
      await createTodo(formData)
      notify('Todo created successfully')
    }
    fetchTodos()
  }

  const handleToggleComplete = async (id, isCompleted) => {
    try {
      await setCompletion(id, isCompleted)
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isCompleted } : t))
      )
    } catch {
      notify('Failed to update completion status', 'error')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteTodo(deleteId)
      setDeleteId(null)
      notify('Todo deleted')
      fetchTodos()
    } catch {
      notify('Failed to delete todo', 'error')
    } finally {
      setDeleting(false)
    }
  }

  // Compute quick stats from current page (approximate)
  const completedCount = todos.filter((t) => t.isCompleted).length
  const activeCount = todos.filter((t) => !t.isCompleted).length

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Typography
              variant="h4"
              sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, letterSpacing: '-0.02em' }}
            >
              My Todos
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

          {/* Quick stats */}
          {!loading && todos.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ActiveIcon sx={{ fontSize: 14, color: '#3B82F6' }} />
                <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
                  {activeCount} active
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <DoneIcon sx={{ fontSize: 14, color: '#10B981' }} />
                <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
                  {completedCount} done
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{
            background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
            '&:hover': { background: 'linear-gradient(135deg, #2563EB, #0891B2)' },
            px: 2.5,
            py: 1,
            flexShrink: 0,
          }}
        >
          New Todo
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <FilterBar filters={filters} onChange={handleFilterChange} />
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      {/* Todo list — skeletons uniquement au chargement initial (liste vide) */}
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
          <EmptyIcon sx={{ fontSize: 52, color: '#1E2D45', mb: 2 }} />
          <Typography
            variant="h6"
            sx={{ color: '#64748B', fontFamily: '"Syne", sans-serif', mb: 1 }}
          >
            {filters.search || filters.status || filters.priority
              ? 'No todos match your filters'
              : 'No todos yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {filters.search || filters.status || filters.priority
              ? 'Try clearing some filters.'
              : 'Create your first todo to get started.'}
          </Typography>
          {!filters.search && !filters.status && !filters.priority && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
              sx={{
                background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
                '&:hover': { background: 'linear-gradient(135deg, #2563EB, #0891B2)' },
              }}
            >
              Create Todo
            </Button>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            opacity: loading ? 0.6 : 1,
            transition: 'opacity 0.15s ease',
          }}
        >
          {todos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onEdit={handleOpenEdit}
              onDelete={setDeleteId}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </Box>
      )}

      {/* Pagination — toujours visible dès que totalPages > 1,
          indépendant du loading pour éviter que Cypress ne rate le <nav> */}
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

      {/* Create / Edit dialog */}
      <TodoFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        editTodo={editTodo}
      />

      {/* Delete confirm dialog */}
      <Dialog
        open={!!deleteId}
        onClose={() => !deleting && setDeleteId(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700 }}>
          Delete Todo
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone. Are you sure you want to delete this todo?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDeleteId(null)} disabled={deleting} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={deleting}
            variant="contained"
            color="error"
            sx={{ minWidth: 90 }}
          >
            {deleting ? <CircularProgress size={18} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((p) => ({ ...p, open: false }))}
          sx={{ borderRadius: '10px', border: '1px solid', borderColor: snack.severity === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
