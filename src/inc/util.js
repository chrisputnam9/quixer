export const util = {
  objectAsArray: (array_method, object, callback) =>
    Object.fromEntries(
      Object.entries(object)[array_method](([key, value], index) => [
        key,
        callback(value, key, index)
      ])
    ),
  objectMap: (object, callback) => util.objectAsArray('map', object, callback),
  objectFilter: (object, callback) =>
    Object.fromEntries(
      Object.entries(object).filter(([key, value], index) => callback(value, key, index))
    )
};
