const express = require('express');
const auth = require('../middlewares/auth');
const {
  getMyTasks,
  createTask,
  updateTask,
  deleteTask,
  getTask,
} = require('../controller/taskController');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Fetch all tasks for authenticated beekeeper
router.get('/my-tasks', getMyTasks);

// Create task
router.post('/', createTask);

// Get single task by ID
router.get('/:id', getTask);

// Update task by ID
router.patch('/:id', updateTask);

// Delete task by ID
router.delete('/:id', deleteTask);

module.exports = router;
