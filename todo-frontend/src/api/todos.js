import api from './axios'

export const getPublicTodos = (params) =>
  api.get('/api/todos/public', { params })

export const getMyTodos = (params) =>
  api.get('/api/todos', { params })

export const getTodoById = (id) =>
  api.get(`/api/todos/${id}`)

export const createTodo = (data) =>
  api.post('/api/todos', data)

export const updateTodo = (id, data) =>
  api.put(`/api/todos/${id}`, data)

export const setCompletion = (id, isCompleted) =>
  api.patch(`/api/todos/${id}/completion`, { isCompleted })

export const deleteTodo = (id) =>
  api.delete(`/api/todos/${id}`)
