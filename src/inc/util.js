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
	isEmptyObject: object => util.isObject(object) && Object.keys(object).length === 0,

	isObject: thing => thing && typeof thing === 'object' && thing.constructor === Object,

	/**
	 * Compare two objects recursively
	 *  - return an object with only the differences
	 *  - (where both objects have the key but the values differ)
	 *  - (or object has the key and other object does not)
	 *  - recursively compare objects within values
	 *  - compare arrays as json, all or nothing (simpler & preserves indexes)
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
			} else {
				// Doesn't exist in other object, counts as difference
				changes[key] = object[key];
			}
		}

		return changes;
	},

	/**
	 * Compare two objects by converting to JSON
	 */
	objectsSame: (object, otherObject) =>
		JSON.stringify(object) === JSON.stringify(otherObject),
	objectsDiffer: (object, otherObject) => !util.objectsSame(object, otherObject),

	/**
	 * Get a timestamp
	 */
	timestamp: () => new Date().getTime(),

	/**
	 * Get a UUID
	 *  - I haven't done the math on this yet, but there should be a very low chance of ever having a duplicate :D
	 */
	getUUID: () =>
		util.timestamp().toString() + '-' + Math.random().toString().substring(2),

	/**
	 * Promise factory - to wait for a window var to be defined
	 * - Eg. for waiting for third-party scripts to load and initialize
	 * - Takes varname to look for, and maxSecondsToWait (before throwing an error)
	 */
	newWindowVarPromise: function (varname, maxSecondsToWait = 300) {
		return new Promise(function (resolve, reject) {
			const maxMillisecondsToWait = maxSecondsToWait * 1000;
			const millisecondsPerInterval = 500;
			let millisecondsWaited = 0;

			const interval = window.setInterval(function () {
				millisecondsWaited += millisecondsPerInterval;
				if (varname in window) {
					window.clearInterval(interval);
					resolve(window[varname]);
				} else if (millisecondsWaited > maxMillisecondsToWait) {
					reject(
						`Waited ${maxSecondsToWait} second(s) and '${varname}' didn't show up on window object.`
					);
				}
			}, millisecondsPerInterval);
		});
	}
};
