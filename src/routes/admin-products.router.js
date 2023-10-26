const express = require('express');
const router = express.Router();

const { checkAdmin } = require('../middleware/auth');

const Category = require('../models/categories.model');
const Product = require('../models/products.model');

const fs = require('fs-extra');
const ResizeImg = require('resize-img');

router.get('/add-product', checkAdmin, async (req, res, next) => {
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

router.post('/', checkAdmin, async (req, res) => {
  const imageFile = req.files.image.name;
  const { title, desc, price, category } = req.body;
  const slug = title.replace(/\s+/g, '-').toLowerCase();

  try {
    const newProduct = new Product({
      title,
      desc,
      price,
      slug,
      category,
      image: imageFile,
    });
    await newProduct.save();

    await fs.mkdirp('src/public/product-images/' + newProduct._id);
    await fs.mkdirp('src/public/product-images/' + newProduct._id + '/gallery');
    await fs.mkdirp(
      'src/public/product-images/' + newProduct._id + '/gallery/thumbs'
    );

    const productImage = req.files.image;
    const path =
      'src/public/product-images/' + newProduct._id + '/' + imageFile;
    await productImage.mv(path);

    req.flash('success', 'product added successfully.');
    res.redirect('/admin/products');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/', checkAdmin, async (req, res, next) => {
  try {
    const products = await Product.find({});
    res.render('admin/products', {
      products,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/:id/edit', checkAdmin, async (req, res, next) => {
  try {
    const categories = await Category.find({});
    const { _id, title, desc, category, price, image } = await Product.findById(
      req.params.id
    );
    const galleryDirectory = 'src/public/product-images/' + _id + '/gallery';
    const galleryImages = await fs.readdir(galleryDirectory);

    res.render('admin/edit-product', {
      id: _id,
      title,
      desc,
      categories,
      category: category.replace(/\s+/g, '-').toLowerCase(),
      price,
      image,
      galleryImages,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/product-gallery/:id', checkAdmin, async (req, res, next) => {
  try {
    const productImage = req.files.file;
    const id = req.params.id;

    const defaultPath = 'src/public/product-images/' + id;
    const path = defaultPath + '/gallery/' + req.files.file.name;
    const thumbsPath = defaultPath + '/gallery/thumbs/' + req.files.file.name;

    await productImage.mv(path);

    const resizedImage = await ResizeImg(fs.readFileSync(path), {
      width: 100,
      height: 100,
    });

    fs.writeFileSync(thumbsPath, resizedImage);

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete('/:id', checkAdmin, async (req, res, next) => {
  try {
    const id = req.params.id;
    const path = 'src/public/product-images/' + id;

    await fs.remove(path);
    await Product.findByIdAndRemove(id);

    req.flash('success', 'product removed successfully.');
    res.redirect('back');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete('/:id/image/:imageId', checkAdmin, async (req, res, next) => {
  try {
    const id = req.params.id;

    const defaultPath = 'src/public/product-images/' + id;
    const originalImage = defaultPath + '/gallery/' + req.params.imageId;
    const thumbImage = defaultPath + '/gallery/thumbs/' + req.params.imageId;

    await fs.remove(originalImage);
    await fs.remove(thumbImage);

    req.flash('success', 'product images removed successfully.');
    res.redirect('/admin/products' + id + '/edit');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
