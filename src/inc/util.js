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
    object && Object.keys(object).length === 0 && object.constructor === Object,

  isObject: thing => thing && typeof thing === 'object' && thing.constructor === Object,

  /**
   * Compare two objects recursively
   *  - return an object with only the differences
   *  - (where both objects have the key but the values differ)
   *  - recursively compare objects within values
   *  - compare arrays as json, all or nothing to preserve array index order
   */
  diffObjectRecursive: (object, otherObject) => {
    if (!util.isObject(object) || !util.isObject(otherObject)) {
      throw new Error('Must pass 2 objects to compare');
    }
    const changes = {};
    for (const key in object) {
      if (key in otherObject) {
        const value = object[key];
        const otherValue = otherObject[key];
        if (util.isObject(value) && util.isObject(otherValue)) {
          const _changes = util.diffObjectRecursive(value, otherValue);
          if (!util.isEmptyObject(_changes)) {
            changes[key] = _changes;
          }
        } else if (Array.isArray(value) && Array.isArray(otherValue)) {
          if (JSON.stringify(value) !== JSON.stringify(otherValue)) {
            changes[key] = value;
          }
        } else if (value !== otherValue) {
          changes[key] = value;
        }
      }
    }

    return changes;
  },

  /**
   * Get a timestamp
   */
  timestamp: () => new Date().getTime()
};
