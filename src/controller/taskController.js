const Task = require('../model/Task');


// Get all tasks for the authenticated beekeeper
exports.getMyTasks = async (req, res) => {
  try {
    console.log('Fetching tasks for beekeeper:', req.beekeeper._id);
    const tasks = await Task.find({ beekeeper: req.beekeeper._id }).sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      results: tasks.length,
      data: {
        tasks
      }
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching tasks from database'
    });
  }
};

// Create a new task
exports.createTask = async (req, res) => {
  try {
    console.log('Creating task with data:', req.body);
    console.log('For beekeeper:', req.beekeeper._id);
    
    const { title, description, status, dueDate } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({
        status: 'error',
        message: 'Task title is required'
      });
    }

     // Make sure we're using the ObjectId, not a custom ID
    const beekeeperId = req.beekeeper._id;
    
    // Verify the beekeeper exists
    const Beekeeper = require('../model/beekeeper.model');
    const beekeeper = await Beekeeper.findById(beekeeperId);
    
    if (!beekeeper) {
      return res.status(404).json({
        status: 'error',
        message: 'Beekeeper not found'
      });
    }
    
    const task = await Task.create({
      title,
      description: description || '',
      status: status || 'todo',
      dueDate: dueDate || null,
      beekeeper: beekeeperId 
    });
    
    console.log('Task created successfully:', task);
    
    res.status(201).json({
      status: 'success',
      data: {
        task
      }
    });
  } catch (error) {
    console.error('Error creating task:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        status: 'error',
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Error creating task in database'
    });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    console.log('Updating task:', req.params.id);
    console.log('Update data:', req.body);
    
    const { title, description, status, dueDate } = req.body;
    
    // Check if the task exists and belongs to the user
    const task = await Task.findOne({ _id: req.params.id, beekeeper: req.beekeeper._id });
    
    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }
    
    // Update allowed fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate;
    
    await task.save();
    
    console.log('Task updated successfully:', task);
    
    res.status(200).json({
      status: 'success',
      data: {
        task
      }
    });
  } catch (error) {
    console.error('Error updating task:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        status: 'error',
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Error updating task in database'
    });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    console.log('Deleting task:', req.params.id);
    
    const task = await Task.findOneAndDelete({ 
      _id: req.params.id, 
      beekeeper: req.beekeeper._id 
    });
    
    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }
    
    console.log('Task deleted successfully:', task);
    
    res.status(200).json({
      status: 'success',
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting task from database'
    });
  }
};

// Get a single task
exports.getTask = async (req, res) => {
  try {
    console.log('Fetching task:', req.params.id);
    
    const task = await Task.findOne({ _id: req.params.id, beekeeper: req.beekeeper._id });
    
    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        task
      }
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching task from database'
    });
  }
};