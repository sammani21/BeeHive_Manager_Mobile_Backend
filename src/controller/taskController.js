// controllers/taskController.js
const Task = require('../model/Task');
const BeekeeperModel = require('../model/beekeeper.model');
const tryCatch = require("../utils/TryCatch");

//  Get all tasks for logged-in user
exports.getMyTasks = tryCatch(async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: false,
        statusCode: 401,
        msg: "Authentication required"
      });
    }

    const beekeeper = await BeekeeperModel.findOne({ username: req.user.username });
    if (!beekeeper) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        msg: "Beekeeper not found"
      });
    }

    const tasks = await Task.find({ beekeeper: beekeeper._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: true,
      statusCode: 200,
      msg: "Tasks retrieved successfully",
      data: tasks,
      count: tasks.length
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({
      status: false,
      statusCode: 500,
      msg: "Internal server error",
      error: error.message
    });
  }
});

//  Create a new task
exports.createTask = tryCatch(async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: false,
        statusCode: 401,
        msg: "Authentication required"
      });
    }

    const beekeeper = await BeekeeperModel.findOne({ username: req.user.username });
    if (!beekeeper) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        msg: "Beekeeper not found"
      });
    }

    const { title, description, status, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        msg: "Task title is required"
      });
    }

    const task = new Task({
      title,
      description: description || "",
      status: status || "todo",
      dueDate: dueDate || null,
      beekeeper: beekeeper._id
    });

    const savedTask = await task.save();

    res.status(201).json({
      status: true,
      statusCode: 201,
      msg: "Task created successfully",
      data: savedTask
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({
      status: false,
      statusCode: 500,
      msg: "Internal server error",
      error: error.message
    });
  }
});

//  Update task
exports.updateTask = tryCatch(async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: false, statusCode: 401, msg: "Authentication required" });
    }

    const beekeeper = await BeekeeperModel.findOne({ username: req.user.username });
    if (!beekeeper) return res.status(404).json({ status: false, statusCode: 404, msg: "Beekeeper not found" });

    const { title, description, status, dueDate } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, beekeeper: beekeeper._id },
      { title, description, status, dueDate, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ status: false, statusCode: 404, msg: "Task not found or access denied" });
    }

    res.status(200).json({ status: true, statusCode: 200, msg: "Task updated successfully", data: task });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ status: false, statusCode: 500, msg: "Internal server error", error: error.message });
  }
});

//  Delete task
exports.deleteTask = tryCatch(async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ status: false, statusCode: 401, msg: "Authentication required" });

    const beekeeper = await BeekeeperModel.findOne({ username: req.user.username });
    if (!beekeeper) return res.status(404).json({ status: false, statusCode: 404, msg: "Beekeeper not found" });

    const task = await Task.findOneAndDelete({ _id: req.params.id, beekeeper: beekeeper._id });
    if (!task) return res.status(404).json({ status: false, statusCode: 404, msg: "Task not found or access denied" });

    res.status(200).json({ status: true, statusCode: 200, msg: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ status: false, statusCode: 500, msg: "Internal server error", error: error.message });
  }
});

//  Get single task
exports.getTask = tryCatch(async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ status: false, statusCode: 401, msg: "Authentication required" });

    const beekeeper = await BeekeeperModel.findOne({ username: req.user.username });
    if (!beekeeper) return res.status(404).json({ status: false, statusCode: 404, msg: "Beekeeper not found" });

    const task = await Task.findOne({ _id: req.params.id, beekeeper: beekeeper._id });
    if (!task) return res.status(404).json({ status: false, statusCode: 404, msg: "Task not found or access denied" });

    res.status(200).json({ status: true, statusCode: 200, msg: "Task retrieved successfully", data: task });
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ status: false, statusCode: 500, msg: "Internal server error", error: error.message });
  }
});
