const mongoose = require('mongoose');
const { clearKey } = require('../services/cache');
const Todo = mongoose.model('Todo');

module.exports = app => {
  // List todos (cached)
  app.get('/api/todos', async (req, res) => {
    try {
      const todos = await Todo.find().cache({ time: 30 });
      res.send(todos);
    } catch (err) {
      res.status(500).send({ error: err.message });
    }
  });

  // Create todo and clear cache
  app.post('/api/todos', async (req, res) => {
    const { title, dueDate } = req.body;

    const todo = new Todo({ title, dueDate });
    try {
      await todo.save();
      clearKey(Todo.collection.collectionName);
      res.status(201).send(todo);
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  });

  // Update todo and clear cache
  app.put('/api/todo/:id', async (req, res) => {
    try {
      const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
      clearKey(Todo.collection.collectionName);
      res.send(todo);
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  });

  // Delete todo and clear cache
  app.delete('/api/todos/:id', async (req, res) => {
    try {
      await Todo.findByIdAndDelete(req.params.id);
      clearKey(Todo.collection.collectionName);
      res.status(204).send();
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  });
};
