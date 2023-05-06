//@ts-check
/**
 *@param {any[]} array - Arreglo a resolver
 *@param {(element:any)=>Promise} cb - Función promesa
 */
const mapAsync = async (array, cb) => {
  const arrPromises = array.map(cb);
  const arrResolved = await Promise.all(arrPromises);
  return arrResolved;
};

module.exports = { mapAsync };
