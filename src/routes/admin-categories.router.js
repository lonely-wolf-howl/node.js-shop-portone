const express = require('express');
const router = express.Router();

const { checkAdmin } = require('../middleware/auth');

const Category = require('../models/categories.model');

router.get('/add-category', checkAdmin, (req, res) => {
  res.render('admin/add-category');
});

router.post(
  '/add-category',
  checkAdmin,
  async (req, res, next) => {
    try {
      const title = req.body.title;
      const slug = title.replace(/\s+/g, '-').toLowerCase();
      const category = await Category.findOne({ slug });
      if (category) {
        req.flash('error', 'category name already exists.');
        res.render('back');
      }

      const newCategory = new Category({
        title,
        slug,
      });
      await newCategory.save();

      req.flash('success', 'category added successfully.');
      res.redirect('/admin/categories');
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

router.get('/', checkAdmin, async (req, res, next) => {
  try {
    const categories = await Category.find({});
    res.render('admin/categories', {
      categories,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete('/:id', checkAdmin, async (req, res, next) => {
  try {
    await Category.findByIdAndRemove(req.params.id);
    req.flash('success', 'Categories removed successfully.');
    res.redirect('/admin/categories');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
