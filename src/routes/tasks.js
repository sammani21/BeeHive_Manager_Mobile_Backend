const express = require('express');
const auth = require('../middlewares/auth');
const {
  getMyTasks,
  createTask,
  updateTask,
  deleteTask,
  getTask
} = require('../controller/taskController');

const router = express.Router();

// All routes are protected and require authentication
router.use(auth);

// Get all tasks for the authenticated beekeeper
router.get('/my-tasks', getMyTasks);

// Create a new task
router.post('/', createTask);

// Get a single task
router.get('/:id', getTask);

// Update a task
router.patch('/:id', updateTask);

// Delete a task
router.delete('/:id', deleteTask);

module.exports = router;