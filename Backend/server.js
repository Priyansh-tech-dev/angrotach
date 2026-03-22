require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = process.env.GEMINI
  ? new GoogleGenerativeAI(process.env.GEMINI)
  : null;

if (!genAI) {
  console.error('GEMINI_API_KEY not set. AI endpoints will not work.');
}


const User = require('./models/User');
const Crop = require('./models/Crop');
const AiQuery = require('./models/AiQuery');
const DiseaseRecord = require('./models/DiseaseRecord');
const WeatherLog = require('./models/WeatherLog');
const Favorite = require('./models/Favorite');
const Review = require('./models/Review');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists for crop images
const uploadsDir = path.join(__dirname, 'uploads', 'crops');
try {
  fs.mkdirSync(uploadsDir, { recursive: true });
} catch (e) {
  console.error('Error creating uploads directory', e);
}

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('FATAL: MONGO_URI is not defined in .env');
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not defined in .env');
  process.exit(1);
}

const PORT = process.env.PORT || 4000;

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅MongoDB connected'))
  .catch(err => console.error('Mongo error', err));

// Multer storage for crop images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads', 'crops'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage });

// Middleware to check auth
function authMiddleware(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ message: 'No token' });
  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Invalid token format' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
}

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, phone, password, role, district } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ message: 'Name, phone, password required' });
    }
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
    }
    const existing = await User.findOne({ phone });
    if (existing) return res.status(400).json({ message: 'Phone already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      phone,
      password: hashed,
      role: role || 'farmer',
      district
    });
    res.json({ message: 'Registered', user: { id: user._id, name: user.name, phone: user.phone, role: user.role, district: user.district } });
  } catch (err) {
    console.error('Register error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Seed default admin if not exists
async function ensureAdmin() {
  const userid = 'admin-agro';
  let admin = await User.findOne({ role: 'admin' });
  if (admin && !admin.userid) {
    admin.userid = userid;
    admin.password = await bcrypt.hash('Admin@2026', 10);
    await admin.save();
    console.log('Admin user migrated to secure userid');
  } else if (!admin) {
    const hashed = await bcrypt.hash('Admin@2026', 10);
    admin = await User.create({
      name: 'Admin',
      phone: '0000000000',
      userid: userid,
      password: hashed,
      role: 'admin',
      district: 'HQ'
    });
    console.log('Secure Admin user created');
  }
}

app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
    }
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Admin must securely log in via admin portal' });
    if (user.blocked) return res.status(403).json({ message: 'Account blocked by Admin' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, phone: user.phone },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({
      token,
      user: { id: user._id, name: user.name, phone: user.phone, role: user.role, district: user.district }
    });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Login
app.post('/api/auth/admin-login', async (req, res) => {
  try {
    const { userid, password } = req.body;
    if (!userid) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const user = await User.findOne({ userid, role: 'admin' });
    if (!user) return res.status(400).json({ message: 'Admin not found or invalid credentials' });
    if (user.blocked) return res.status(403).json({ message: 'Account blocked' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, userid: user.userid },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({
      token,
      user: { id: user._id, name: user.name, userid: user.userid, role: user.role, district: user.district }
    });
  } catch (err) {
    console.error('Admin Login error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot Password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
    }
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Admin passwords cannot be reset here' });
    }
    res.json({ message: 'Reset link sent' });
  } catch (err) {
    console.error('Forgot password error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { phone, newPassword } = req.body;
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
    }
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Admin passwords cannot be reset here' });
    }

    // Check if new password is too short
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password too short' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// Marketplace: public crop list with filters
app.get('/api/marketplace/crops', async (req, res) => {
  try {
    // Lazy Expiration: Revert expired reservations
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await Crop.updateMany(
      { status: 'reserved', reservedAt: { $lt: oneDayAgo } },
      { $set: { status: 'available', reservedBy: null, reservedAt: null } }
    );

    const { name, district, minPrice, maxPrice, quality } = req.query;
    const filter = { status: 'available' }; // Default only available

    if (name) filter.name = { $regex: name, $options: 'i' };
    if (district) filter.location = { $regex: district, $options: 'i' };
    if (quality) filter.quality = quality;

    if (minPrice || maxPrice) {
      filter.pricePerKg = {};
      if (minPrice) filter.pricePerKg.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerKg.$lte = Number(maxPrice);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const crops = await Crop.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Return total count for frontend pagination
    const total = await Crop.countDocuments(filter);

    res.json({
      data: crops,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Get crops error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Marketplace: Get single crop details
app.get('/api/marketplace/crops/:id', async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) return res.status(404).json({ message: 'Crop not found' });
    res.json(crop);
  } catch (err) {
    console.error('Get crop detail error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Marketplace: Book a deal
app.post('/api/marketplace/crops/:id/book', authMiddleware, async (req, res) => {
  try {
    // Atomic update to prevent race conditions
    const crop = await Crop.findOneAndUpdate(
      { _id: req.params.id, status: 'available' },
      {
        $set: {
          status: 'reserved',
          reservedBy: req.user.id,
          reservedAt: new Date()
        }
      },
      { new: true }
    );

    if (!crop) {
      // Check if crop exists but wasn't available
      const existing = await Crop.findById(req.params.id);
      if (!existing) return res.status(404).json({ message: 'Crop not found' });
      return res.status(400).json({ message: 'Crop is no longer available' });
    }

    res.json({ message: 'Deal requested. Waiting for farmer confirmation.', crop });
  } catch (err) {
    console.error('Book deal error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Favorites: Add
app.post('/api/favorites/:cropId', authMiddleware, async (req, res) => {
  try {
    // Check if exists to avoid error due to unique index (or let mongo handle)
    // Using findOneAndUpdate with upsert is safer or just try/catch unique error
    await Favorite.create({ userId: req.user.id, cropId: req.params.cropId });
    res.json({ message: 'Added to favorites' });
  } catch (err) {
    if (err.code === 11000) return res.json({ message: 'Already favorited' }); // Treat as success
    console.error('Add favorite error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Favorites: Remove
app.delete('/api/favorites/:cropId', authMiddleware, async (req, res) => {
  try {
    await Favorite.findOneAndDelete({ userId: req.user.id, cropId: req.params.cropId });
    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    console.error('Remove favorite error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Favorites: List
app.get('/api/favorites', authMiddleware, async (req, res) => {
  try {
    const favs = await Favorite.find({ userId: req.user.id }).populate('cropId');
    // Return just the crops
    const crops = favs.map(f => f.cropId).filter(c => c); // Filter nulls just in case crop deleted
    res.json(crops);
  } catch (err) {
    console.error('List favorites error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reviews: Create
app.post('/api/reviews', authMiddleware, async (req, res) => {
  try {
    const { targetId, rating, comment } = req.body;
    if (!targetId || !rating) return res.status(400).json({ message: 'Target and rating required' });

    // Create Review
    const review = await Review.create({
      reviewer: req.user.id,
      target: targetId,
      rating,
      comment
    });

    // Populate reviewer name for immediate display
    await review.populate('reviewer', 'name');
    res.json(review);
  } catch (err) {
    console.error('Add review error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reviews: Get for user (Farmer)
app.get('/api/reviews/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ target: req.params.userId })
      .populate('reviewer', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error('Get reviews error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Farmer: add crop with optional image
app.post('/api/farmer/crops', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ message: 'Only farmers can add crops' });
    }
    const { name, pricePerKg, quantity, location, description, status, quality } = req.body;
    if (!name || !pricePerKg || !quantity) {
      return res.status(400).json({ message: 'Name, pricePerKg and quantity are required' });
    }

    // Check duplicate
    const existing = await Crop.findOne({
      farmerId: req.user.id,
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      status: 'available' // Only check active crops
    });
    if (existing) {
      return res.status(400).json({ message: 'You already have an available crop with this name. Update it instead.' });
    }
    let imageUrl = null;
    if (req.file) {
      imageUrl = '/uploads/crops/' + req.file.filename;
    }
    const crop = await Crop.create({
      farmerId: req.user.id,
      farmerName: req.user.name,
      farmerPhone: req.user.phone,
      name,
      pricePerKg,
      quantity,
      location: location || '',
      description: description || '',
      imageUrl,
      status: status || 'available',
      quality: quality || 'A'
    });
    res.json(crop);
  } catch (err) {
    console.error('Add crop error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Farmer: list own crops
app.get('/api/farmer/crops', authMiddleware, async (req, res) => {
  try {
    const crops = await Crop.find({ farmerId: req.user.id }).sort({ createdAt: -1 });
    res.json(crops);
  } catch (err) {
    console.error('My crops error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Farmer: update crop status or details
app.patch('/api/farmer/crops/:id', authMiddleware, async (req, res) => {
  try {
    const crop = await Crop.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.user.id },
      req.body,
      { new: true }
    );
    if (!crop) return res.status(404).json({ message: 'Crop not found' });
    res.json(crop);
  } catch (err) {
    console.error('Update crop error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Farmer: delete crop
app.delete('/api/farmer/crops/:id', authMiddleware, async (req, res) => {
  try {
    const crop = await Crop.findOneAndDelete({ _id: req.params.id, farmerId: req.user.id });
    if (!crop) return res.status(404).json({ message: 'Crop not found or unauthorized' });
    res.json({ message: 'Crop deleted successfully' });
  } catch (err) {
    console.error('Delete crop error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Farmer: Confirm Deal
app.post('/api/farmer/crops/:id/confirm', authMiddleware, async (req, res) => {
  try {
    const crop = await Crop.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.user.id, status: 'reserved' },
      { $set: { status: 'sold' } },
      { new: true }
    );

    if (!crop) {
      return res.status(400).json({ message: 'Crop not found, not yours, or not suitable for confirmation' });
    }

    res.json({ message: 'Deal confirmed! Crop marked as sold.', crop });
  } catch (err) {
    console.error('Confirm deal error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Farmer: Reject Deal
app.post('/api/farmer/crops/:id/reject', authMiddleware, async (req, res) => {
  try {
    const crop = await Crop.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.user.id, status: 'reserved' },
      {
        $set: { status: 'available', reservedBy: null, reservedAt: null }
      },
      { new: true }
    );

    if (!crop) {
      return res.status(400).json({ message: 'Crop not found, not yours, or not suitable for rejection' });
    }

    res.json({ message: 'Deal rejected. Crop is available again.', crop });
  } catch (err) {
    console.error('Reject deal error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== AI via Google Gemini (no Python) =====

// AI Chat: directly call Gemini + log to aiqueries
app.post('/api/ai/chat', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { message, language } = req.body;
    // message is optional if there is an image, but usually we want some text
    if (!message && !req.file) return res.status(400).json({ message: 'Message or image required' });

    if (!genAI) {
      return res.status(500).json({ message: 'AI not configured. Set GEMINI_API_KEY.' });
    }

    // Use a model that supports vision (flash supports it)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    let promptLines = [];
    if (language === 'english') {
      promptLines = [
        'You are "Kisan Sahayak", an AI assistant for Indian farmers.',
        'Reply ONLY in English.',
        '- Give 3–6 bullet points with clear, practical steps.',
        '- Use **bold** for very important words or actions.',
        '- Keep answers short and focused on farming.',
      ];
    } else {
      promptLines = [
        'You are "Kisan Sahayak", an AI assistant for Indian farmers.',
        'Reply STRICTLY in Gujarati (ગુજરાતી).',
        '- Do NOT use Hindi words, script, or tone.',
        '- Use PURE Gujarati only.',
        '- Give 3-6 bullet points with clear steps.',
        '- Keep answers detailed but easy to understand for a farmer.',
      ];
    }

    if (req.file) {
      promptLines.push('User has uploaded an image. Analyze the image and answer the user question about it.');
    }

    promptLines.push('', 'User question:', message || (req.file ? 'Analyze this image.' : ''));

    const promptText = promptLines.join('\n');
    const parts = [promptText];

    if (req.file) {
      const mimeType = req.file.mimetype;
      const imagePath = req.file.path;
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');

      parts.push({
        inlineData: {
          data: base64Image,
          mimeType: mimeType
        }
      });

      // Cleanup uploaded file immediately after reading
      try { fs.unlinkSync(imagePath); } catch (e) { }
    }

    const result = await model.generateContent(parts);
    const aiText = result.response.text();

    const log = await AiQuery.create({
      userId: req.user.id,
      question: message || '[Image Uploaded]',
      reply: aiText
    });

    res.json({ reply: aiText, logId: log._id });
  } catch (err) {
    console.error('AI chat error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Disease text diagnosis: use Gemini directly and log
app.post('/api/ai/disease-text', authMiddleware, async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms) return res.status(400).json({ message: 'Symptoms required' });

    if (!genAI) {
      return res.status(500).json({ message: 'AI not configured. Set GEMINI_API_KEY.' });
    }

    let diagnosis = 'General stress or nutrient issue';
    let severity = 'Low';
    let recommendation = 'Monitor the crop and follow recommended package of practices.';

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const promptLines = [
      'You are an agriculture expert "Kisan Sahayak".',
      'A farmer describes crop symptoms. Analyse and respond in JSON only.',
      'Format:',
      '{',
      '  "diagnosis": "short diagnosis",',
      '  "severity": "Low | Medium | High",',
      '  "recommendation": "short, practical advice",',
      '  "localLanguageNote": "1–2 lines in Gujarati (preferred) or English. DO NOT use Hindi."',
      '}',
      '',
      'Symptoms:',
      symptoms
    ];
    const prompt = promptLines.join('\n');

    const result = await model.generateContent(prompt);
    let textOut = result.response.text().trim();

    // Try to extract JSON (remove markdown fences if present)
    textOut = textOut.replace(/```json/gi, '').replace(/```/g, '').trim();

    try {
      const parsed = JSON.parse(textOut);
      diagnosis = parsed.diagnosis || diagnosis;
      severity = parsed.severity || severity;
      recommendation = parsed.recommendation || recommendation;
    } catch (e) {
      console.warn('Failed to parse Gemini JSON for disease-text, using defaults.', e.message);
    }

    const record = await DiseaseRecord.create({
      userId: req.user.id,
      inputType: 'text',
      symptoms,
      diagnosis,
      severity,
      recommendation
    });

    res.json({ diagnosis, severity, recommendation, recordId: record._id });
  } catch (err) {
    console.error('Disease text error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Sell-Timing Advisor: Analyze time to sell
app.post('/api/ai/sell-timing', authMiddleware, async (req, res) => {
  try {
    const { crop, location, language } = req.body;
    if (!crop) return res.status(400).json({ message: 'Crop name is required' });

    if (!genAI) {
      return res.status(500).json({ message: 'AI not configured' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    let prompt = '';

    if (language === 'gujarati') {
      prompt = `
        You are an expert Agricultural Economist and Agronomist for India.
        A farmer in "${location || 'India'}" wants to know the best time to sell "${crop}".
        
        Analyze:
        1. General Seasonal Demand & Supply trends for this crop.
        2. Typical weather impact on prices during upcoming months.
        3. Festival or wedding season demand if applicable.
        
        Provide a structured response STRICTLY IN GUJARATI:
        - **Recommendation**: (MUST START WITH: "Sell Now" OR "Wait 7 Days" OR "Wait 15 Days" OR "Wait 30 Days")
        - **Best Time to Sell**: (Specific window)
        - **Reasoning**: (Brief explanation)
        - **Storage Advice**: (Hold or sell?)
        
        Keep it practical, concise, and easy for a farmer to understand. Use pure Gujarati.
        `;
    } else {
      prompt = `
        You are an expert Agricultural Economist and Agronomist for India.
        A farmer in "${location || 'India'}" wants to know the best time to sell "${crop}".
        
        Analyze:
        1. General Seasonal Demand & Supply trends for this crop.
        2. Typical weather impact on prices during upcoming months.
        3. Festival or wedding season demand if applicable.
        
        Provide a structured response in English:
        - **Recommendation**: (MUST START WITH: "Sell Now" OR "Wait 7 Days" OR "Wait 15 Days" OR "Wait 30 Days")
        - **Best Time to Sell**: (Specific window, e.g., "Late January to Mid-February")
        - **Reasoning**: (Brief explanation of demand/weather factors)
        - **Storage Advice**: (Should they hold or sell immediately?)
        
        Keep it practical, concise, and easy for a farmer to understand.
        `;
    }

    const result = await model.generateContent(prompt);
    const advice = result.response.text();

    res.json({ advice });
  } catch (err) {
    console.error('Sell timing advisor error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Weather mock + log to weatherlogs
// Weather mock + log to weatherlogs
// Real-time weather via Open-Meteo
// Real-time weather via Open-Meteo
app.get('/api/weather/realtime', authMiddleware, async (req, res) => {
  try {
    const { lat, lon } = req.query;

    let latitude = 23.0225; // Default Ahmedabad
    let longitude = 72.5714;
    let locationName = 'Ahmedabad, Gujarat (Default)';

    // Simplest location name fallback
    locationName = `Field Area (${parseFloat(latitude).toFixed(2)}, ${parseFloat(longitude).toFixed(2)})`;

    // Attempt Reverse Geocoding for "Perfect" Real Name
    try {
      const reverseUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`;
      const reverseRes = await axios.get(reverseUrl, { headers: { 'User-Agent': 'AgroApp/1.0' } });
      if (reverseRes.data && reverseRes.data.address) {
        const addr = reverseRes.data.address;
        const cityPart = addr.city || addr.town || addr.village || addr.county || '';
        const statePart = addr.state || '';
        if (cityPart) locationName = `${cityPart}, ${statePart}`;
        else locationName = reverseRes.data.display_name.split(',').slice(0, 2).join(',');
      }
    } catch (e) {
      // console.log('Reverse geocoding failed, keeping generic name');
    }

    // Fetch from Open-Meteo
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability,weather_code,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,uv_index_max,et0_fao_evapotranspiration&hourly=temperature_2m,precipitation_probability,weather_code&timezone=auto`;
    // console.log('Fetching weather from:', url);

    const response = await axios.get(url);
    if (!response.data || !response.data.current) {
      throw new Error('Invalid response from Open-Meteo');
    }
    const current = response.data.current;
    const daily = response.data.daily || {};
    const hourly = response.data.hourly || {};

    const temperature = current.temperature_2m;
    const humidity = current.relative_humidity_2m;
    const windSpeed = current.wind_speed_10m;
    const rainChance = current.precipitation_probability !== undefined ? current.precipitation_probability : 0;
    const uvIndex = current.uv_index;
    const weatherCode = current.weather_code;

    const forecast = [];
    if (daily.time) {
      for (let i = 0; i < daily.time.length; i++) {
        forecast.push({
          date: daily.time[i],
          code: daily.weather_code ? daily.weather_code[i] : 0,
          maxTemp: daily.temperature_2m_max ? daily.temperature_2m_max[i] : 0,
          minTemp: daily.temperature_2m_min ? daily.temperature_2m_min[i] : 0,
          rainSum: daily.precipitation_sum ? daily.precipitation_sum[i] : 0,
          windMax: daily.wind_speed_10m_max ? daily.wind_speed_10m_max[i] : 0,
          uvMax: daily.uv_index_max ? daily.uv_index_max[i] : 0,
          et0: daily.et0_fao_evapotranspiration ? daily.et0_fao_evapotranspiration[i] : 0
        });
      }
    }

    const hourlyData = [];
    if (hourly.time) {
      const now = new Date();
      for (let i = 0; i < hourly.time.length; i++) {
        const time = new Date(hourly.time[i]);
        if (time >= now && hourlyData.length < 24) {
          hourlyData.push({
            time: hourly.time[i],
            temp: hourly.temperature_2m ? hourly.temperature_2m[i] : 0,
            rainChance: hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0,
            code: hourly.weather_code ? hourly.weather_code[i] : 0
          });
        }
      }
    }

    // Alerts
    const alerts = [];
    for (let i = 0; i < 3 && i < forecast.length; i++) {
      const day = forecast[i];
      if (day.maxTemp > 40) {
        alerts.push({
          type: 'critical',
          title: 'Heatwave Alert',
          message: `Extreme heat (${day.maxTemp}°C) expected on ${day.date}. Protect crops from heat stress.`
        });
      }
      if (day.rainSum > 50) {
        alerts.push({
          type: 'critical',
          title: 'Heavy Rainfall Warning',
          message: `Heavy rain (${day.rainSum}mm) expected on ${day.date}. Ensure proper drainage.`
        });
      }
      if (day.windMax > 45) {
        alerts.push({
          type: 'warning',
          title: 'Storm Alert',
          message: `High winds (${day.windMax} km/h) expected on ${day.date}. Risk of lodging.`
        });
      }
    }

    let advice = 'Weather is favorable. Standard farming activities can continue.';
    if (alerts.length > 0) {
      advice = `${alerts.length} active weather alerts. Please check the warnings below.`;
    } else {
      if (rainChance > 60) advice = 'High chance of rain today. Postpone irrigation.';
      else if (temperature > 35) advice = 'Temperature is high today. Ensure irrigation.';
      else if (current.uv_index && current.uv_index > 8) advice = 'High UV Index. Avoid spraying chemicals during mid-day.';
    }

    const weatherData = {
      location: locationName,
      temperature,
      humidity,
      windSpeed,
      rainChance,
      uvIndex,
      weatherCode,
      advice,
      alerts,
      forecast,
      hourly: hourlyData
    };

    await WeatherLog.create({
      userId: req.user.id,
      location: weatherData.location,
      temperature,
      humidity,
      windSpeed,
      rainChance,
      advice,
      alerts
    });

    res.json(weatherData);

  } catch (err) {
    console.error('Weather error', err.message);
    res.status(500).json({ message: 'Server error fetching weather' });
  }
});

// Schemes & Insurance Advisor
app.post('/api/schemes/check', authMiddleware, async (req, res) => {
  try {
    const { crop, location } = req.body;
    if (!crop || !location) return res.status(400).json({ message: 'Crop and location required' });

    if (!genAI) {
      return res.status(500).json({ message: 'AI not configured' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are an expert in Indian Agriculture Government Schemes and Insurance Policies.
      A farmer in "${location}" is growing "${crop}".
      
      List 3-4 most relevant government schemes and insurance policies (like PM Fasal Bima Yojana, state subsidies, etc.) for this specific farmer.
      
      Provide a JSON response strictly in this format (no markdown):
      [
        {
          "name": "Scheme Name",
          "coverage": "What is covered (brief)",
          "benefits": "Key financial or support benefits",
          "applyLink": "Official website URL or 'Visit local office'"
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Clean up markdown if Gemini adds it
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const schemes = JSON.parse(jsonStr);

    res.json(schemes);
  } catch (err) {
    console.error('Schemes check error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== Admin APIs =====

// List users
app.get('/api/admin/users', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('Admin users error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// List all crops
app.get('/api/admin/crops', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const crops = await Crop.find().sort({ createdAt: -1 });
    res.json(crops);
  } catch (err) {
    console.error('Admin crops error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// AI queries logs
app.get('/api/admin/aiqueries', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const rows = await AiQuery.find().sort({ createdAt: -1 }).limit(200).populate('userId', 'name phone role');
    res.json(rows);
  } catch (err) {
    console.error('Admin aiqueries error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Weather logs
app.get('/api/admin/weatherlogs', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const rows = await WeatherLog.find().sort({ createdAt: -1 }).limit(200).populate('userId', 'name phone role');
    res.json(rows);
  } catch (err) {
    console.error('Admin weatherlogs error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Block/Unblock User
app.patch('/api/admin/users/:id/block', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const { blocked } = req.body; // true or false
    const user = await User.findByIdAndUpdate(req.params.id, { blocked: !!blocked }, { new: true });
    res.json(user);
  } catch (err) {
    console.error('Admin block user error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Delete Crop
app.delete('/api/admin/crops/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    await Crop.findByIdAndDelete(req.params.id);
    res.json({ message: 'Crop deleted' });
  } catch (err) {
    console.error('Admin delete crop error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/', (req, res) => {
  res.send('AgroTech backend running.');
});

app.listen(PORT, async () => {
  console.log('🚀 Backend server running on port', PORT);
  await ensureAdmin();
});
