const mongoose = require('mongoose');
const { Schema } = mongoose;

const todoSchema = new Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  dueDate: { type: Date }
});

mongoose.model('Todo', todoSchema);
