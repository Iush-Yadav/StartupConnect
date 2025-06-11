import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
import db from './db';

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth routes
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, fullName, username, userType, ...profile } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    db.prepare(`
      INSERT INTO users (
        id, email, password, full_name, username, user_type,
        bio, location, industry, founded_year, team_size, investment_range
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId, email, hashedPassword, fullName, username, userType,
      profile.bio, profile.location, profile.industry,
      profile.foundedYear, profile.teamSize, profile.investmentRange
    );

    const token = jwt.sign({ userId, email }, JWT_SECRET);
    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, email }, JWT_SECRET);
    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: 'Login failed' });
  }
});

// Posts routes
app.get('/api/posts', (req, res) => {
  const posts = db.prepare(`
    SELECT p.*, u.full_name, u.username, u.avatar_url,
           COUNT(l.id) as likes_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN likes l ON p.id = l.post_id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `).all();
  
  res.json(posts);
});

app.post('/api/posts', authenticate, (req, res) => {
  try {
    const { title, content, mediaUrls, tags, category } = req.body;
    const postId = uuidv4();

    db.prepare(`
      INSERT INTO posts (id, user_id, title, content, media_urls, tags, category)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      postId,
      req.user.userId,
      title,
      content,
      JSON.stringify(mediaUrls),
      JSON.stringify(tags),
      category
    );

    res.json({ id: postId });
  } catch (error) {
    res.status(400).json({ error: 'Failed to create post' });
  }
});

// Likes routes
app.post('/api/posts/:postId/like', authenticate, (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const existing = db.prepare(
      'SELECT * FROM likes WHERE post_id = ? AND user_id = ?'
    ).get(postId, userId);

    if (existing) {
      db.prepare('DELETE FROM likes WHERE post_id = ? AND user_id = ?')
        .run(postId, userId);
      res.json({ liked: false });
    } else {
      db.prepare('INSERT INTO likes (id, post_id, user_id) VALUES (?, ?, ?)')
        .run(uuidv4(), postId, userId);
      res.json({ liked: true });
    }
  } catch (error) {
    res.status(400).json({ error: 'Failed to toggle like' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});