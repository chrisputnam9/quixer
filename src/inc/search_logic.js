/**
 * Search logic
 *  - Used by search UX
 *  - Used by pre-app-load query string parse & search
 */

/* global ENV_IS_LIVE */

export const search_logic = {
  /**
   * Open a URL in browser
   */
  openUrl: function (url) {
    const is_live = parseInt(ENV_IS_LIVE);
    if (is_live) {
      window.location.href = url;
    } else {
      const newWindow = window.open(url, '_blank');
      if (!newWindow) {
        alert('Something went wrong, maybe popup blocked?');
      }
    }
  },
  filterResults: function (services, search_category) {
    return services.filter(service => {
      const regex = new RegExp(search_category, 'i');
      return regex.test(service.alias[0]) || regex.test(service.name);
    });
  }
};
