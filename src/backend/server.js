require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const axios = require('axios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Set this in .env for security

app.use(
  cors({
    origin: ['https://www.youtube.com', 'http://127.0.0.1:3000'],
    methods: ['POST', 'GET'],
    credentials: false
  })
);
app.use(bodyParser.json());

// Database setup
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    db.serialize(() => {
      // Users table
      db.run(
        `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        openrouter_api_key TEXT,
        selected_model TEXT
      )`,
        (err) => {
          if (err) console.error('Error creating users table:', err.message);
        }
      );

      // Videos table
      db.run(
        `CREATE TABLE IF NOT EXISTS videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        youtube_video_id TEXT,
        title TEXT DEFAULT '',
        description TEXT DEFAULT '',
        captions TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
        (err) => {
          if (err) console.error('Error creating videos table:', err.message);
        }
      );

      // Comments table
      db.run(
        `CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        video_id INTEGER,
        comment TEXT DEFAULT '',
        FOREIGN KEY(video_id) REFERENCES videos(id) ON DELETE CASCADE
      )`,
        (err) => {
          if (err) console.error('Error creating comments table:', err.message);
        }
      );

      // Chat history table
      db.run(
        `CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        video_id INTEGER,
        message TEXT,
        sender TEXT, -- 'user' or 'ai'
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(video_id) REFERENCES videos(id) ON DELETE CASCADE
      )`,
        (err) => {
          if (err)
            console.error('Error creating chat_history table:', err.message);
        }
      );
    });
  }
});

// Helper functions
const hashPassword = async (password) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

const verifyPassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// **Signup Endpoint**
app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: 'Username and password are required' });
  }

  try {
    const hashedPassword = await hashPassword(password);
    db.run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword],
      function (err) {
        if (err) {
          console.error('Error creating user:', err.message);
          return res.status(500).json({ error: 'Failed to create user' });
        }
        res.status(201).json({ success: true, userId: this.lastID });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// **Login Endpoint**
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: 'Username and password are required' });
  }

  db.get(
    'SELECT * FROM users WHERE username = ?',
    [username],
    async (err, user) => {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ error: 'Server error' });
      }
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const passwordMatch = await verifyPassword(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateToken(user.id);
      res.json({ success: true, token });
    }
  );
});

// **Set OpenRouter API Key Endpoint**
app.post('/api/set-api-key', authenticateToken, (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) {
    return res.status(400).json({ error: 'API key is required' });
  }

  db.run(
    'UPDATE users SET openrouter_api_key = ? WHERE id = ?',
    [apiKey, req.user.userId],
    function (err) {
      if (err) {
        console.error('Error updating API key:', err.message);
        return res.status(500).json({ error: 'Failed to update API key' });
      }
      res.json({ success: true });
    }
  );
});

// **Get Available OpenRouter Models Endpoint**
app.get('/api/models', authenticateToken, async (req, res) => {
  db.get(
    'SELECT openrouter_api_key FROM users WHERE id = ?',
    [req.user.userId],
    async (err, user) => {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ error: 'Server error' });
      }
      if (!user || !user.openrouter_api_key) {
        return res.status(400).json({ error: 'API key not set' });
      }

      try {
        const response = await axios.get(
          'https://openrouter.ai/api/v1/models',
          {
            headers: {
              Authorization: `Bearer ${user.openrouter_api_key}`
            }
          }
        );
        res.json(response.data);
      } catch (error) {
        console.error('Error fetching models:', error);
        res.status(500).json({ error: 'Failed to fetch models' });
      }
    }
  );
});

// **Set Selected Model Endpoint**
app.post('/api/set-model', authenticateToken, (req, res) => {
  const { model } = req.body;
  if (!model) {
    return res.status(400).json({ error: 'Model is required' });
  }

  db.run(
    'UPDATE users SET selected_model = ? WHERE id = ?',
    [model, req.user.userId],
    function (err) {
      if (err) {
        console.error('Error updating selected model:', err.message);
        return res
          .status(500)
          .json({ error: 'Failed to update selected model' });
      }
      res.json({ success: true });
    }
  );
});

app.post('/api/videos', authenticateToken, (req, res) => {
  const {
    title = '',
    description = '',
    captions = '',
    comments = [],
    youtubeVideoId = ''
  } = req.body;

  if (!Array.isArray(comments)) {
    return res.status(400).json({ error: 'Comments must be an array' });
  }

  const sqlVideo =
    'INSERT INTO videos (youtube_video_id, title, description, captions) VALUES (?, ?, ?, ?)';
  db.run(
    sqlVideo,
    [youtubeVideoId, title || '', description || '', captions || ''],
    function (err) {
      if (err) {
        console.error('Error inserting video:', err.message);
        return res.status(500).json({ error: 'Failed to save video data' });
      }

      const videoId = this.lastID;

      if (comments.length === 0) {
        return res.status(201).json({ success: true, videoId });
      }

      const sqlComment =
        'INSERT INTO comments (video_id, comment) VALUES (?, ?)';
      const commentPromises = comments.map((comment) => {
        return new Promise((resolve, reject) => {
          db.run(sqlComment, [videoId, comment || ''], function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
          });
        });
      });

      Promise.all(commentPromises)
        .then(() => res.status(201).json({ success: true, videoId }))
        .catch((error) =>
          res.status(500).json({ error: 'Failed to save comments' })
        );
    }
  );
});

// **Query LLM Endpoint**
app.post('/api/query', authenticateToken, async (req, res) => {
  const { videoId, question } = req.body;

  if (!videoId || !question) {
    return res.status(400).json({ error: 'Missing videoId or question' });
  }

  try {
    const user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT openrouter_api_key, selected_model FROM users WHERE id = ?',
        [req.user.userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user || !user.openrouter_api_key || !user.selected_model) {
      return res
        .status(400)
        .json({ error: 'API key or selected model not set' });
    }

    const videoData = await new Promise((resolve, reject) => {
      db.get(
        'SELECT title, description, captions FROM videos WHERE id = ?',
        [videoId],
        (err, row) => {
          if (err) reject(err);
          else if (!row) reject(new Error('Video not found'));
          else resolve(row);
        }
      );
    });

    const commentsData = await new Promise((resolve, reject) => {
      db.all(
        'SELECT comment FROM comments WHERE video_id = ?',
        [videoId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows.map((row) => row.comment));
        }
      );
    });

    const prompt = `Video Title: ${videoData.title || 'Not available.'}
Description: ${videoData.description || 'Not available.'}
Captions: ${videoData.captions || 'Not available.'}
Comments: ${
      commentsData.length > 0
        ? commentsData.join('\n')
        : 'No comments available.'
    }

Based on all the information above about the video, please answer the following question:
Question: ${question}`;

    const llmResponse = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: user.selected_model,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${user.openrouter_api_key}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (
      llmResponse.data &&
      llmResponse.data.choices &&
      llmResponse.data.choices.length > 0 &&
      llmResponse.data.choices[0].message
    ) {
      const answer = llmResponse.data.choices[0].message.content;
      // Save to chat history
      db.run(
        'INSERT INTO chat_history (user_id, video_id, message, sender) VALUES (?, ?, ?, ?)',
        [req.user.userId, videoId, question, 'user']
      );
      db.run(
        'INSERT INTO chat_history (user_id, video_id, message, sender) VALUES (?, ?, ?, ?)',
        [req.user.userId, videoId, answer, 'ai']
      );
      res.json({ answer });
    } else {
      res
        .status(500)
        .json({ error: 'Failed to get a valid response from LLM' });
    }
  } catch (error) {
    console.error('Error processing LLM request:', error);
    res.status(500).json({ error: 'Failed to process question' });
  }
});

// **Get Chat History Endpoint**
app.get('/api/chat-history/:videoId', authenticateToken, (req, res) => {
  const { videoId } = req.params;
  db.all(
    'SELECT message, sender, timestamp FROM chat_history WHERE user_id = ? AND video_id = ? ORDER BY timestamp ASC',
    [req.user.userId, videoId],
    (err, rows) => {
      if (err) {
        console.error('Error fetching chat history:', err.message);
        return res.status(500).json({ error: 'Failed to fetch chat history' });
      }
      res.json({ history: rows });
    }
  );
});

app.get('/api/user-chat-history', authenticateToken, (req, res) => {
  const { videoId } = req.query;

  let query = `
    SELECT ch.id, ch.video_id, ch.message, ch.sender, ch.timestamp, v.title AS video_title, v.youtube_video_id
    FROM chat_history ch
    JOIN videos v ON ch.video_id = v.id
    WHERE ch.user_id = ?
  `;
  const params = [req.user.userId];

  if (videoId) {
    query += ' AND ch.video_id = ?';
    params.push(videoId);
  }

  query += ' ORDER BY ch.timestamp ASC';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching user chat history:', err.message);
      return res
        .status(500)
        .json({ error: 'Failed to fetch user chat history' });
    }
    res.json({ history: rows });
  });
});

// **Get Recommended Questions Endpoint**
app.get(
  '/api/recommended-questions/:videoId',
  authenticateToken,
  async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
      return res.status(400).json({ error: 'Missing videoId' });
    }

    try {
      const user = await new Promise((resolve, reject) => {
        db.get(
          'SELECT openrouter_api_key, selected_model FROM users WHERE id = ?',
          [req.user.userId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!user || !user.openrouter_api_key || !user.selected_model) {
        return res
          .status(400)
          .json({ error: 'API key or selected model not set' });
      }

      const videoData = await new Promise((resolve, reject) => {
        db.get(
          'SELECT title, description, captions FROM videos WHERE id = ?',
          [videoId],
          (err, row) => {
            if (err) reject(err);
            else if (!row) reject(new Error('Video not found'));
            else resolve(row);
          }
        );
      });

      const commentsData = await new Promise((resolve, reject) => {
        db.all(
          'SELECT comment FROM comments WHERE video_id = ?',
          [videoId],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows.map((row) => row.comment));
          }
        );
      });

      const prompt = `Video Title: ${videoData.title || 'Not available.'}
      Description: ${videoData.description || 'Not available.'}
      Captions: ${videoData.captions || 'Not available.'}
      Comments: ${
        commentsData.length > 0
          ? commentsData.join('\n')
          : 'No comments available.'
      }

      Based on the video information above, generate a list of 3-5 concise, relevant questions that a user might want to ask about the video content. Return the questions as a JSON array of strings. For example:
      ["What is the main topic of the video?", "Who is the target audience?", "What are the key points discussed?"]`;

      const llmResponse = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: user.selected_model,
          messages: [{ role: 'user', content: prompt }]
          // response_format: { type: 'json_object' }
        },
        {
          headers: {
            Authorization: `Bearer ${user.openrouter_api_key}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (
        llmResponse.data &&
        llmResponse.data.choices &&
        llmResponse.data.choices.length > 0 &&
        llmResponse.data.choices[0].message
      ) {
        const questions = llmResponse.data.choices[0].message.content;
        try {
          const parsedQuestions = JSON.parse(questions);
          if (Array.isArray(parsedQuestions)) {
            res.json({ questions: parsedQuestions });
          } else {
            res.status(500).json({ error: 'Invalid response format from LLM' });
          }
        } catch (error) {
          res
            .status(500)
            .json({ error: 'Failed to parse LLM response: ' + error.message });
        }
      } else {
        res
          .status(500)
          .json({ error: 'Failed to get a valid response from LLM' });
      }
    } catch (error) {
      console.error('Error generating recommended questions:', error);
      res
        .status(500)
        .json({ error: 'Failed to generate recommended questions' });
    }
  }
);

// Start the server
app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});
