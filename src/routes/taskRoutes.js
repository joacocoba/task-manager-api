const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const auth = require("../middleware/auth");

// Query GET /tasks?sortBy=createdAt:desc
// GET TASKS
router.get("/", auth, async (req, res) => {
  try {
    const match = {};
    const sort = {};
    if (req.query.completed) {
      match.completed = req.query.completed === "true";
    }

    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(":");
      sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }

    await req.user.populate({
      path: "tasks",
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort,
      },
    });
    res.status(200).send(req.user.tasks);
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

// GET TASK BY ID
router.get("/:id", auth, async (req, res) => {
  let _id = req.params.id;
  try {
    const task = await Task.findOne({
      _id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).send({
        message: "No task found",
      });
    }
    res.status(200).send(task);
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

// CREATE TASK
router.post("/", auth, async (req, res) => {
  try {
    let { title, description, completed } = req.body;
    let task = new Task({
      title,
      description,
      completed,
      owner: req.user._id,
    });
    await task.save();
    res.status(201).send({
      message: "Task created",
      task,
    });
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
});

// UPDATE TASK
router.patch("/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation)
    return res.status(400).send({ error: "Invalid updates" });

  try {
    let _id = req.params.id;
    const task = await Task.findOne({
      _id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).send({
        message: "No task found",
      });
    }
    updates.forEach((update) => (task[update] = req.body[update]));
    const updatedTask = await task.save();
    res.status(200).send(updatedTask);
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

// DELETE TASK
router.delete("/:id", auth, async (req, res) => {
  try {
    let _id = req.params.id;

    let deletedTask = await Task.findOneAndDelete({ _id, owner: req.user._id });
    if (!deletedTask) {
      return res.status(404).send({
        message: "Task not found",
      });
    }

    res.status(200).send({
      message: "Task deleted",
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

module.exports = router;
