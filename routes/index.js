const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated, isAdmin } = require('../config/auth');
const Flowers = require('../models/Flowers');
const multer = require('multer');
const fs = require('fs');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
  try {
    const bouquets = await Flowers.find().lean();
    res.render('dashboard', { user: req.user, bouquets });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Admin Page
router.get('/admin', ensureAuthenticated, isAdmin, (req, res) => {
  res.render('admin', { user: req.user });
});

// Add Bouquet Page
router.get('/admin/add', ensureAuthenticated, isAdmin, (req, res) => {
  res.render('add');
});

// Настройка хранения загруженных файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/'); 
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); 
  }
});

// Инициализируем multer с настройками хранения
const upload = multer({ storage: storage });
// Handle bouquet addition form submission
router.post('/admin/add', ensureAuthenticated, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, price } = req.body;
    const image = req.file;
    if (!name || !price || !image) { 
      return res.status(400).send('Please provide name, price, and image');
    }
   console.log(name, price, image);
   const newFlower = new Flowers({
    flowerName: name,
    flowerPrice: price,
    flowerImage: `../${image.path}`  
  });
    await newFlower.save(); 
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.get('/admin/update/:id', ensureAuthenticated, isAdmin, async (req, res) => {
  try {
    const bouquet = await Flowers.findById(req.params.id).lean();
    if (!bouquet) {
      return res.status(404).send('Bouquet not found');
    }
    res.render('update', { bouquet });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.post('/admin/update/:id', ensureAuthenticated, isAdmin, async (req, res) => {
  try {
    const { name, price } = req.body;
    await Flowers.findByIdAndUpdate(req.params.id, { flowerName: name, flowerPrice: price });
    res.redirect('/dashboard'); // Перенаправляем пользователя на страницу панели администратора или другую страницу по вашему выбору
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.get('/admin/delete/:id', ensureAuthenticated, isAdmin, async (req, res) => {
  try {
    const bouquetId = req.params.id;

    const flower = await Flowers.findOneAndDelete({ _id: bouquetId });
    if (!flower) {
      console.log('Bouquet not found');
      return res.status(404).send('Bouquet not found');
    }
    
    console.log('Success:', flower);
    // Действия после успешного удаления
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});



// About Us Page
router.get('/about-us', (req, res) => {
  res.render('about-us');
});

// Welcome Page
router.get('/welcome', (req, res) => {
  res.render('welcome');
});

// Route to display all bouquets
router.get('/bouquets', async (req, res) => {
  try {
    const bouquets = await Flowers.find().lean();
    res.render('bouquets', { bouquets });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
