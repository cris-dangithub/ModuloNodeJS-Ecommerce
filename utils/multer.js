const multer = require('multer');
const AppError = require('./appError');

{
  // Almacenar la información en un disco (en el servidor)
  /*
    Esta no es la mejor opción, pues todas las imágenes que yo suba se almacenará en la carpeta
    imágenes de nuestro proyecto (ser almacenarán en una carpeta de este proyecto).
    No es una buena opción pues ocupariamos espacio en nuestro proyecto. Esto puede llegar a ser
    más costoso, por lo que no deberíamos de guardar las imágenes acá.
    Algunos servicios en la nube funcionan de la siguiente manera: Al subir y subir imágenes
    Llega un cierto momento en el que las imágenes son eliminadas y solamente se deja el código
    fuente de la rama desplegada (la main) (Geroku trabaja de esta manera)
  */
  ////multer.diskStorage();
  // Almacenar la información en una memoria
  /*
    Utilizar servicios externos en la nube especializados en almacenamiento de imágenes. Por ejemplo
    Amazon con AWS (con servicios S3), Google con Firebase (mediante Firestore), etc. Estos brindan alojamiento
    de archivos en la nube. La guarda tempralmente en la memoria cache hasta que multer las procese y la suba a los
    servicios en la nube
  */
  ////multer.memoryStorage();
}

// Constante que me contendrá el storage de la aplicación
const storage = multer.memoryStorage();

// Constante upload que tendrá la configuración de multer
/*
  Dentro del objeto podremos colocar disitintas configuraciones que encontraremos en
  la documentación. Por ejemplo, fileFilter sirve para filtrar archivos permitidos (pdf, imagenes, etc)
*/

// Función para filtar los tipos de archivos aceptados
function fileFilter(req, file, cb) {
  console.log(req);
  const allowedFiles = ['jpg', 'png'];
  const fileExtension = file.originalname.split('.').slice(-1)[0];
  if (allowedFiles.includes(fileExtension)) return cb(null, true);
  const errMessage = 'Incorrect file extensión. Please, only use jpg or png';
  cb(new AppError(errMessage, 415));
}

const upload = multer({
  storage,
  fileFilter,
});

module.exports = { upload };
