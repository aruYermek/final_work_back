const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const nodemailer = require('nodemailer');
const readline = require('readline');

// Модели
const User = require('../models/User');
const Flowers = require('../models/Flowers');

// Страницы
router.get('/login', (req, res) => res.render('login'));
router.get('/register', (req, res) => res.render('register'));
router.get('/admin', (req, res) => res.render('admin'));

// Регистрация пользователя
router.post('/register', async (req, res) => {
    const { firstName, lastName, email, age, country, gender, password, password2 } = req.body;
    let errors = [];

    if (!firstName || !lastName || !email || !age || !country || !gender || !password || !password2) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            firstName,
            lastName,
            email,
            age,
            country,
            gender,
            password,
            password2
        });
    } else {
        try {
            const user = await User.findOne({ email: email });
            if (user) {
                errors.push({ msg: 'Email already exists' });
                res.render('register', {
                    errors,
                    firstName,
                    lastName,
                    email,
                    age,
                    country,
                    gender,
                    password,
                    password2
                });
            } else {
                const newUser = new User({
                    firstName,
                    lastName,
                    email,
                    age,
                    country,
                    gender,
                    password
                });
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(newUser.password, salt);
                newUser.password = hash;
                await newUser.save();
                req.flash(
                    'success_msg',
                    'You are successfully registered! Please log in'
                );
                const subject = 'You are successfully registered!';
                const text = 'You have successfully registered on our website. Thank you for registering!';
                sendEmail(newUser.email, subject, text);
                res.redirect('/users/login');
            }
        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }
    }
});

// Аутентификация пользователя
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Выход пользователя
router.get("/logout", (req, res, next) => {
    req.logout(req.user, err => {
        if (err) return next(err);
        req.flash('success_msg', 'You are logged out');
        res.redirect('/users/login');
    });
});

// Добавление нового букета
router.post('/admin/add', async (req, res) => {
    const { name, price } = req.body; // Получаем данные из формы

    // Проверяем наличие данных
    if (!name || !price) {
        return res.status(400).send('Please enter all fields');
    }

    // Создаем новый объект букета
    const newFlower = new Flowers({
        flowerName: name,
        flowerPrice: price
    });

    // Сохраняем объект букета в базе данных
    try {
        await newFlower.save();
        req.flash('success_msg', 'Bouquet added successfully');
        res.redirect('/dashboard'); // Перенаправляем пользователя на страницу дашборда после успешного добавления
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Конфигурация почты
const transporter = nodemailer.createTransport({
    service: 'mail.ru',
    auth: {
        user: 'mailsender.test@mail.ru',
        pass: 'A3jnKPFNegyTqwMspSAU'
    }
});

// Функция отправки электронной почты
function sendEmail(recipient, subject, text) {
    const mailOptions = {
        from: 'mailsender.test@mail.ru',
        to: recipient,
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log('Error occurred:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

module.exports = router;
