const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

// MongoDB Connection
mongoose.connect('mongodb+srv://your-connection-string', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Form Schema
const FormSchema = new mongoose.Schema({
  title: String,
  headerImage: String,
  questions: [{
    type: {
      type: String,
      enum: ['categorize', 'cloze', 'comprehension']
    },
    content: String,
    options: []
  }],
  responses: [{}]
});

const Form = mongoose.model('Form', FormSchema);

// Routes
app.post('/api/forms', upload.single('headerImage'), async (req, res) => {
  try {
    const { title, questions } = req.body;
    const headerImage = req.file ? req.file.path : null;

    const newForm = new Form({
      title,
      headerImage,
      questions: JSON.parse(questions)
    });

    await newForm.save();
    res.status(201).json(newForm);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/forms/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    res.json(form);
  } catch (error) {
    res.status(404).json({ error: 'Form not found' });
  }
});

app.post('/api/forms/:id/submit', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    form.responses.push(req.body.responses);
    await form.save();
    res.status(200).json({ message: 'Response saved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});