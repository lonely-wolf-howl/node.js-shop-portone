const express = require('express');
const app = express();

const Connect = require('./database/connect');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const fileUpload = require('express-fileupload');

// import routers
const mainRouter = require('./routes/main.router');
const usersRouter = require('./routes/users.router');
const adminCategoriesRouter = require('./routes/admin-categories.router');
const adminProductsRouter = require('./routes/admin-products.router');
const cartsRouter = require('./routes/carts.router');
const productsRouter = require('./routes/products.router');

const config = require('config');

class Application {
  constructor() {
    this.app = app;

    this.init();
    this.database();
    this.middlewares();
    this.routes();
    this.errorHandler();
    this.startServer();
  }

  init() {
    // view engine setup (ejs)
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

    // static
    app.use(express.static(path.join(__dirname, 'public')));

    // .env
    require('dotenv').config();
  }

  database() {
    Connect.mongoDB();
  }

  middlewares() {
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // express-session
    app.use(
      session({
        secret: process.env.SESSION_SECRET_KEY,
        cookie: {
          httpOnly: true,
          secure: false,
        },
        name: 'node.js-shop-cookie',
        resave: false,
        saveUninitialized: false,
      })
    );

    // passport
    app.use(passport.initialize());
    app.use(passport.session());
    require('./config/passport');

    // connect-flash
    app.use(flash());

    // method-override
    app.use(methodOverride('_method'));

    // express-fileupload
    app.use(fileUpload());

    app.use((req, res, next) => {
      res.locals.error = req.flash('error');
      res.locals.success = req.flash('success');
      res.locals.currentUser = req.user;
      res.locals.cart = req.session.cart;
      next();
    });
  }

  routes() {
    app.use('/', mainRouter);
    app.use('/auth', usersRouter);
    app.use('/admin/categories', adminCategoriesRouter);
    app.use('/admin/products', adminProductsRouter);
    app.use('/carts', cartsRouter);
    app.use('/products', productsRouter);
  }

  errorHandler() {
    app.use((error, req, res, next) => {
      res.status(error.status || 500);
      res.send(error.message);
    });
  }

  startServer() {
    const port = config.get('server.port');
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  }
}

new Application();
