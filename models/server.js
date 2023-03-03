const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { rateLimit } = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');

const { authRouter } = require('../routes/auth.routes');
const { categoryRouter } = require('../routes/category.routes');
const { db } = require('../database/db');
const { productRouter } = require('../routes/product.routes');
const { userRouter } = require('../routes/user.routes');
const AppError = require('../utils/appError');
const globalErrorHandler = require('../controllers/error.controller');
const initModel = require('./init.model');
const { cartRouter } = require('../routes/cart.routes');

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 4000;
    this.limiter = rateLimit({
      // Numero de peticiones máximas a permitir a una misma IP
      max: 100,
      // Ventana de tiempo que haré las anteriores peticiones (milisegundos)
      windowMs: 60 * 60 * 1000, // Esto es 1hora
      // Mensaje cuando esto ocurra
      message: 'Too many request from this IP',
    });

    this.paths = {
      user: '/api/v1/user',
      products: '/api/v1/products',
      categories: '/api/v1/categories',
      auth: '/api/v1/auth',
      // Endpoint para cart
      cart: '/api/v1/cart',
    };

    this.database();
    this.middlewares();
    this.routes();
  }

  // MÉTODO DE CONEXIÓN CON LA BASE DE DATOS
  database() {
    // ---- Autenticación de la base de datos ---- //
    db.authenticate()
      .then(() => console.log('Database authenticated'))
      .catch(err => console.log(err));

    // ---- Establecer modelos ---- //
    initModel();

    // ---- Sincronizar la base de datos ---- //
    db.sync()
      .then(() => console.log('Database synced'))
      .catch(err => console.log(err));
  }

  // RUTAS
  routes() {
    this.app.use(this.paths.products, productRouter);
    this.app.use(this.paths.user, userRouter);
    this.app.use(this.paths.categories, categoryRouter);
    this.app.use(this.paths.auth, authRouter);
    // Endpoint nuevo para cart
    this.app.use(this.paths.cart, cartRouter);
    // Capturar para cualquier ruta este error (ya cuando no ha encontrado ninguna ruta)
    this.app.all('*', (req, res, next) => {
      return next(
        new AppError(`Can't find ${req.originalUrl} on this server`, 404)
      );
    });
    // Contendrá todos los errrores de mi aplicación
    this.app.use(globalErrorHandler);
  }

  // METODO PARA CONFIGURAR ALGUNOS MIDDLEWARES COMO CONFIGURACIÓN DE CORS Y EXPRESS EN JSON
  middlewares() {
    this.app.use(helmet());
    this.app.use(xss());
    this.app.use(
      hpp({
        whitelist: ['firstname', 'price'],
      })
    );
    if (process.env.NODE_ENV === 'development') {
      console.log('ESTOY EN MODO DESARROLLO');
      this.app.use(morgan('dev')); // Solamente usaremos morgan en modo desarrollo
    }
    if (process.env.NODE_ENV === 'production') {
      console.log('Estoy en modo produccion');
    }
    this.app.use('/api/v1', this.limiter);
    this.app.use(cors());
    this.app.use(express.json());
  }

  // METODO PARA ESCUCHAR SOLICITUDES POR EL PUERTO
  listen() {
    this.app.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`);
    });
  }
}

module.exports = Server;

// TODO HACER LOS CHECKEOS QUE FALTAN CON EXPRESSVALIDATOR A LAS RUTAS RESPECTIVAS
