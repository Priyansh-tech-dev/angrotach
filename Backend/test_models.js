const mongoose = require('mongoose');
try {
    console.log('Loading User...');
    require('./models/User');
    console.log('Loading Crop...');
    require('./models/Crop');
    console.log('Loading AiQuery...');
    require('./models/AiQuery');
    console.log('Loading DiseaseRecord...');
    require('./models/DiseaseRecord');
    console.log('Loading Favorite...');
    require('./models/Favorite');
    console.log('Loading Review...');
    require('./models/Review');
    console.log('Loading WeatherLog...');
    require('./models/WeatherLog');
    console.log('All models loaded successfully');
} catch (e) {
    console.error('Error loading models:', e);
}
