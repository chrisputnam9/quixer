/**
 * Wrapper for localStorage
 * - spot to add extra checks in the future
 * - eg. nice warnings if localStorage disabled
 */
export const local_storage = {
	get: function (key) {
		return window.localStorage.getItem(key);
	},
	remove: function (key) {
		return window.localStorage.removeItem(key);
	},
	set: function (key, value) {
		return window.localStorage.setItem(key, value);
	}
};
