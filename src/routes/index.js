const express = require('express');
const router = express.Router();

const taskRoutes = require('./taskRoutes')
router.use('/tasks', taskRoutes);

const userRoutes = require('./userRoutes')
router.use('/users', userRoutes)


module.exports = router;