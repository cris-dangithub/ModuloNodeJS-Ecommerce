const Product = require('../models/product.model');
const ProductImgs = require('../models/productImgs.model');
const { appSuccess } = require('../utils/appSuccess');
const { catchAsync } = require('../utils/catchAsync');
const { storage } = require('../utils/firebase');
const { mapAsync } = require('../utils/mapAsync');
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');

exports.findProducts = catchAsync(async (req, res, next) => {
  // 1. Obtener los productos, incluyendo sus imágenes
  const products = await Product.findAll({
    where: {
      status: true,
    },
    include: {
      model: ProductImgs,
      where: { status: true },
      required: false,
    },
  });

  // 2. mapAsync anidado, pues debemos recorrer un arreglo que está dentro de otro arreglo
  await mapAsync(products, async product => {
    await mapAsync(product.productImgs, async productImg => {
      const refImg = ref(storage, productImg.imgUrl);
      const url = await getDownloadURL(refImg);
      productImg.imgUrl = url;
    });
  });

  // 3. Respuesta al cliente
  appSuccess(res, 200, 'Products obtained successfully', { products });
});

exports.findProductById = catchAsync(async (req, res, next) => {
  const { product } = req;
  res.status(200).json({
    status: 'success',
    message: 'The product was find successfully',
    product,
  });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  // 1. Recibir los datos del body y los respectivos archivos
  const { title, description, quantity, price, categoryId, userId } = req.body;
  console.log(req.files);
  //console.table(req.body);
  // 2. Subir el nuevo producto a la base de datos
  const newProduct = await Product.create({
    title: title.toLowerCase(),
    description: description.toLowerCase(),
    quantity,
    price,
    categoryId,
    userId,
  });

  // 2. mapAsync para
  const productImgsResolved = await mapAsync(req.files, async file => {
    const imgRef = ref(storage, `products/${Date.now()}-${file.originalname}`);
    const imgUpload = await uploadBytes(imgRef, file.buffer);

    // Subir a la tabla de productImgs del modelo mi imagen
    return await ProductImgs.create({
      imgUrl: imgUpload.metadata.fullPath,
      productId: newProduct.id,
    });
  });
  appSuccess(res, 201, 'Product created successfully', {
    newProduct,
    imgs: productImgsResolved,
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const { product } = req;
  const { title, description, quantity, price } = req.body;
  const updatedProduct = await product.update({
    title,
    description,
    quantity,
    price,
  });
  res.status(200).json({
    status: 'success',
    message: 'The product was updated succesfully',
    updatedProduct,
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const { product } = req;
  await product.update({ status: false });
  res.status(200).json({
    status: 'success',
    message: 'Product has been deleted successfully',
  });
});
