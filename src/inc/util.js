export const util = {
  objectMap: (object, callback) =>
    Object.fromEntries(
      Object.entries(object).map(([key, value], index) => [
        key,
        callback(value, key, index)
      ])
    )
};
