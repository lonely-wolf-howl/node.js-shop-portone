const express = require('express');
const adminProductsRouter = express.Router();

const { checkAdmin } = require('../middleware/auth');

const Category = require('../models/categories.model');

adminProductsRouter.get('/add-product', checkAdmin, async (req, res, next) => {
  try {
    const categories = await Category.find({});
    res.render('admin/add-product', {
      categories,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = adminProductsRouter;
