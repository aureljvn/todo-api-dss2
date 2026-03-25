import { useState, useEffect, useCallback } from 'react'
import {
  Box, TextField, Select, MenuItem, FormControl, InputLabel,
  InputAdornment, ToggleButton, ToggleButtonGroup, IconButton, Tooltip,
} from '@mui/material'
import {
  Search as SearchIcon,
  ArrowUpward as AscIcon,
  ArrowDownward as DescIcon,
  FilterAlt as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material'

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

const priorityOptions = [
  { value: '', label: 'All Priority' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const sortByOptions = [
  { value: 'createdAt', label: 'Created' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title' },
]

export default function FilterBar({ filters, onChange }) {
  const [searchInput, setSearchInput] = useState(filters.search || '')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onChange({ search: searchInput, page: 1 })
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Keep searchInput in sync when filters reset externally
  useEffect(() => {
    if (filters.search === '' && searchInput !== '') {
      setSearchInput('')
    }
  }, [filters.search])

  const handleChange = (field, value) => {
    onChange({ [field]: value, page: 1 })
  }

  const selectSx = {
    minWidth: { xs: '100%', sm: 130 },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1E2D45' },
    borderRadius: '8px',
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1.5,
        alignItems: 'center',
        p: 2,
        background: '#0F1623',
        border: '1px solid #1E2D45',
        borderRadius: '12px',
      }}
    >
      {/* Search */}
      <TextField
        placeholder="Search todos…"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        size="small"
        sx={{
          flex: { xs: '1 1 100%', sm: '1 1 200px' },
          minWidth: { xs: '100%', sm: 180 },
          '& .MuiOutlinedInput-root': { borderRadius: '8px' },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 18, color: '#64748B' }} />
            </InputAdornment>
          ),
          endAdornment: searchInput ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => { setSearchInput(''); onChange({ search: '', page: 1 }) }}
                sx={{ color: '#64748B' }}
              >
                <ClearIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
      />

      {/* Status */}
      <FormControl size="small" sx={selectSx}>
        <InputLabel>Status</InputLabel>
        <Select
          value={filters.status || ''}
          label="Status"
          onChange={(e) => handleChange('status', e.target.value)}
        >
          {statusOptions.map((o) => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Priority */}
      <FormControl size="small" sx={selectSx}>
        <InputLabel>Priority</InputLabel>
        <Select
          value={filters.priority || ''}
          label="Priority"
          onChange={(e) => handleChange('priority', e.target.value)}
        >
          {priorityOptions.map((o) => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Sort by */}
      <FormControl size="small" sx={selectSx}>
        <InputLabel>Sort by</InputLabel>
        <Select
          value={filters.sortBy || 'createdAt'}
          label="Sort by"
          onChange={(e) => handleChange('sortBy', e.target.value)}
        >
          {sortByOptions.map((o) => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Sort direction */}
      <ToggleButtonGroup
        value={filters.sortDir || 'desc'}
        exclusive
        onChange={(_, v) => v && handleChange('sortDir', v)}
        size="small"
        sx={{
          '& .MuiToggleButton-root': {
            border: '1px solid #1E2D45',
            color: '#64748B',
            px: 1.2,
            '&.Mui-selected': {
              backgroundColor: 'rgba(59,130,246,0.12)',
              color: '#3B82F6',
              borderColor: 'rgba(59,130,246,0.3)',
            },
          },
        }}
      >
        <Tooltip title="Ascending">
          <ToggleButton value="asc">
            <AscIcon sx={{ fontSize: 18 }} />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="Descending">
          <ToggleButton value="desc">
            <DescIcon sx={{ fontSize: 18 }} />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
    </Box>
  )
}
