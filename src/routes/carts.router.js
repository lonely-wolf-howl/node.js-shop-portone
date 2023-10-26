const express = require('express');
const router = express.Router();

const Product = require('../models/products.model');

router.post('/:product', async (req, res, next) => {
  try {
    const slug = req.params.product;
    const product = await Product.findOne({ slug });

    if (!req.session.cart) {
      req.session.cart = [];
      req.session.cart.push({
        title: slug,
        quantity: 1,
        price: product.price,
        image: '/product-images/' + product._id + '/' + product.image,
      });
    } else {
      let cart = req.session.cart;
      let newItem = true;

      // 장바구니에 이미 담은 상품일 경우
      for (let i = 0; i < cart.length; i++) {
        if (cart[i].title === slug) {
          cart[i].quantity++;
          newItem = false;
          break;
        }
      }

      // 장바구니에 처음 담은 상품일 경우
      if (newItem) {
        cart.push({
          title: slug,
          quantity: 1,
          price: product.price,
          image: '/product-images/' + product._id + '/' + product.image,
        });
      }
    }

    req.flash('success', 'product added to cart successfully.');
    res.redirect('back');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/checkout', async (req, res) => {
  res.render('checkout');
});

router.get('/update/:product', (req, res, next) => {
  try {
    const slug = req.params.product;
    const action = req.query.action;

    let cart = req.session.cart;

    for (let i = 0; i < cart.length; i++) {
      if (cart[i].title === slug) {
        switch (action) {
          case 'add':
            cart[i].quantity++;
            break;
          case 'sub':
            cart[i].quantity--;
            if (cart[i].quantity < 1) {
              cart.splice(i, 1);
            }
            break;
          case 'remove':
            cart.splice(i, 1);
            if (cart.length === 0) {
              delete req.session.cart;
            }
            break;
          default:
            console.log('check the action type again.');
        }
        break;
      }
    }

    req.flash('success', 'cart updated successfully.');
    res.redirect('back');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete('/', (req, res, next) => {
  try {
    delete req.session.cart;
    req.flash('success', 'all items removed successfully.');
    res.redirect('back');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
