import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure upload & database directories exist
const uploadDir = path.join(process.cwd(), 'uploads', 'branding');
const dataDir = path.join(process.cwd(), 'data');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Serve uploaded branding files statically
app.use('/uploads/branding', express.static(uploadDir));

// Database file path for company settings
const settingsFilePath = path.join(dataDir, 'company_settings.json');

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const type = req.body.type || 'branding';
    const uniqueName = `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only JPG, JPEG, PNG, and WebP are allowed.'));
    }
  },
});

// API Endpoints
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET Company Settings from Server Database
app.get('/api/company-settings', (_req, res) => {
  try {
    if (fs.existsSync(settingsFilePath)) {
      const rawData = fs.readFileSync(settingsFilePath, 'utf8');
      const settings = JSON.parse(rawData);
      return res.json({ success: true, settings });
    }
  } catch (err) {
    console.error('Error reading company settings from database:', err);
  }
  return res.json({ success: true, settings: null });
});

// POST Company Settings to Server Database
app.post('/api/company-settings', (req, res) => {
  try {
    const settings = req.body;
    fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2), 'utf8');
    return res.json({ success: true, settings });
  } catch (err) {
    console.error('Error saving company settings to database:', err);
    return res.status(500).json({ success: false, error: 'Failed to save settings' });
  }
});

// POST Upload Branding Image
app.post('/api/upload-branding', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    const relativeUrl = `/uploads/branding/${req.file.filename}`;
    return res.json({
      success: true,
      url: relativeUrl,
      filename: req.file.filename,
    });
  } catch (err: any) {
    console.error('Error uploading branding image:', err);
    return res.status(500).json({ success: false, error: err.message || 'Upload failed' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
