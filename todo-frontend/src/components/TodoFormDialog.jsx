import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, FormControl, InputLabel, Select, MenuItem,
  FormControlLabel, Switch, Box, CircularProgress, Alert, Typography,
  IconButton,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'

const EMPTY_FORM = {
  title: '',
  details: '',
  priority: 'medium',
  dueDate: '',
  isPublic: false,
  isCompleted: false,
}

export default function TodoFormDialog({ open, onClose, onSubmit, editTodo }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      if (editTodo) {
        setForm({
          title: editTodo.title || '',
          details: editTodo.details || '',
          priority: editTodo.priority || 'medium',
          dueDate: editTodo.dueDate || '',
          isPublic: editTodo.isPublic ?? false,
          isCompleted: editTodo.isCompleted ?? false,
        })
      } else {
        setForm(EMPTY_FORM)
      }
      setError('')
    }
  }, [open, editTodo])

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Title is required.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onSubmit({
        title: form.title.trim(),
        details: form.details.trim() || null,
        priority: form.priority,
        dueDate: form.dueDate || null,
        isPublic: form.isPublic,
        isCompleted: form.isCompleted,
      })
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isEdit = !!editTodo

  return (
    <Dialog
      open={open}
      onClose={!loading ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: '16px' } }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
          fontFamily: '"Syne", sans-serif',
          fontWeight: 700,
        }}
      >
        {isEdit ? 'Edit Todo' : 'New Todo'}
        <IconButton
          size="small"
          onClick={onClose}
          disabled={loading}
          sx={{ color: '#64748B' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 1.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {error && <Alert severity="error" sx={{ mb: 0 }}>{error}</Alert>}

          <TextField
            label="Title"
            value={form.title}
            onChange={set('title')}
            required
            fullWidth
            autoFocus
            inputProps={{ maxLength: 100 }}
            helperText={`${form.title.length}/100`}
            FormHelperTextProps={{ sx: { textAlign: 'right', color: '#64748B' } }}
          />

          <TextField
            label="Details"
            value={form.details}
            onChange={set('details')}
            fullWidth
            multiline
            rows={3}
            inputProps={{ maxLength: 1000 }}
            helperText={`${form.details.length}/1000`}
            FormHelperTextProps={{ sx: { textAlign: 'right', color: '#64748B' } }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select value={form.priority} label="Priority" onChange={set('priority')}>
                <MenuItem value="low">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981' }} />
                    Low
                  </Box>
                </MenuItem>
                <MenuItem value="medium">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#F59E0B' }} />
                    Medium
                  </Box>
                </MenuItem>
                <MenuItem value="high">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#EF4444' }} />
                    High
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Due Date"
              type="date"
              value={form.dueDate}
              onChange={set('dueDate')}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.isPublic}
                  onChange={(e) => setForm((p) => ({ ...p, isPublic: e.target.checked }))}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#3B82F6' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#3B82F6',
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ fontSize: '0.875rem', color: '#94A3B8' }}>
                  Public
                </Typography>
              }
            />
            {isEdit && (
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isCompleted}
                    onChange={(e) => setForm((p) => ({ ...p, isCompleted: e.target.checked }))}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#10B981' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#10B981',
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: '0.875rem', color: '#94A3B8' }}>
                    Completed
                  </Typography>
                }
              />
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={onClose} disabled={loading} variant="outlined">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
              '&:hover': { background: 'linear-gradient(135deg, #2563EB, #0891B2)' },
              minWidth: 100,
            }}
          >
            {loading ? <CircularProgress size={18} color="inherit" /> : isEdit ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
