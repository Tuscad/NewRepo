const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const SFGameCrawler = require('./crawler');
const AutoAttacker = require('./autoAttack');
const { parseHarFile } = require('./harParser');

const app = express();
const port = process.env.PORT || 3000;
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store active sessions
const sessions = new Map();

// Routes
app.post('/api/login', async (req, res) => {
  try {
    const { username, password, server } = req.body;
    
    const crawler = new SFGameCrawler({ server });
    const success = await crawler.login(username, password);
    
    if (success) {
      const sessionId = generateSessionId();
      sessions.set(sessionId, {
        crawler,
        autoAttacker: new AutoAttacker(crawler),
        username,
        server,
        lastActivity: Date.now()
      });
      
      res.json({ success: true, sessionId });
    } else {
      res.status(401).json({ success: false, error: 'Login failed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/import-har', upload.single('harFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    const data = await parseHarFile(req.file.path);
    const crawler = new SFGameCrawler();
    await crawler.importFromHar(data);
    
    const sessionId = generateSessionId();
    sessions.set(sessionId, {
      crawler,
      autoAttacker: new AutoAttacker(crawler),
      username: 'HAR Import',
      server: data.server || 'Unknown',
      lastActivity: Date.now()
    });
    
    res.json({ success: true, sessionId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/crawl', async (req, res) => {
  try {
    const { sessionId, maxPages } = req.body;
    const session = sessions.get(sessionId);
    
    if (!session) {
      return res.status(401).json({ success: false, error: 'Invalid session' });
    }
    
    // Start crawling in background
    res.json({ success: true, message: 'Crawling started' });
    
    // Perform crawling
    const players = await session.crawler.crawlHallOfFame(maxPages);
    
    // Crawl individual player profiles
    for (const player of players) {
      await session.crawler.crawlPlayerProfile(player.id);
    }
    
    // Get scrapbook info
    const scrapbook = await session.crawler.getScrapbookInfo();
    
    // Find best targets
    const targets = await session.crawler.findBestTargets(scrapbook.collected);
    
    // Store results
    session.crawlResults = {
      players: players.length,
      scrapbook,
      targets,
      completedAt: new Date()
    };
    
    session.lastActivity = Date.now();
  } catch (error) {
    console.error('Crawling error:', error);
  }
});

app.get('/api/crawl-status', (req, res) => {
  const { sessionId } = req.query;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(401).json({ success: false, error: 'Invalid session' });
  }
  
  if (session.crawlResults) {
    res.json({
      success: true,
      status: 'completed',
      results: session.crawlResults
    });
  } else {
    res.json({
      success: true,
      status: 'in_progress'
    });
  }
});
app.post('/api/auto-attack', (req, res) => {
  try {
    const { sessionId, mode } = req.body;
    const session = sessions.get(sessionId);

    if (!session) {
      return res.status(401).json({ success: false });
    }

    // You may want to implement the auto-attack logic here
    // For now, just send a success response
    res.json({ success: true, message: 'Auto-attack started', mode });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Scrapbook Helper server running on port ${port}`);
});
module.exports = app;