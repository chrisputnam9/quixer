export const util = {
  // Run an array method on an object - eg. map
  objectAsArray: (array_method, object, callback) =>
    Object.fromEntries(
      Object.entries(object)[array_method](([key, value], index) => [
        key,
        callback(value, key, index)
      ])
    ),
  // Map over an object
  objectMap: (object, callback) => util.objectAsArray('map', object, callback),
  // Filter an object's keys
  objectFilter: (object, callback) =>
    Object.fromEntries(
      Object.entries(object).filter(([key, value], index) => callback(value, key, index))
    ),
  // Clone an object
  objectClone: object => JSON.parse(JSON.stringify(object)),
  // Check if object is empty
  isEmptyObject: object =>
    object && Object.keys(object).length === 0 && object.constructor === Object
};
