/**
 * Default config data to kick things off
 *
 * NEW SERVICES will be considered based on:
 *  - Usefulness as a service in this app specifically (vs. a simple bookmark for example)
 *  - Ethical content & purpose
 *  - Reasonably appropriate content for all ages
 *  - Popularity as a service
 *  - Author's whim
 **/
export const default_config = {
  /**
   * Last updated time for this specific dataset.  Used for syncing.
   */
  'updated_at': 0,
  /**
   * Configuration for syncing to third-party services
   */
  'sync': {
    'google_drive': [{
      'id': 0,
    }]
  },
  /**
   * User preferences outside of services
   */
  'preferences': {
    'default_service': 0
  },
  /**
   * Services
   * Each service has:
   * 
   * - id: A unique identifier.  Defaults will have "d" prepended to keep them unique & separate from custom additions.
   * - alias: Shortcut alias for use in the app
   * - name: Descriptive name
   * - action: Action that the service uses, one of:
   *    - url: Open a URL, replacing "%s" with the search term entered (if any)
   * 
   * TODO
   * The following attributes will be automatically set:
   * - active: Whether to use the service. Can be set to false to disable unwanted default services
   *    - true by default
   * - from_default_config: Set to true for services in this specific file, to differentiate from user-added services
   * - updated_at: Last updated time for this specific service in this specific dataset.  Used for syncing.
   *    - 0 by default
   */
  'services': [
    {
      id: '0',
      alias: 'ddg:',
      name: 'DuckDuckGo / Bang!',
      action: {
        url: 'https://next.duckduckgo.com/?q=%s'
      }
    },
    {
      id: '1',
      alias: 'gm:',
      name: 'Gmail / Google Mail',
      action: {
        url: 'https://mail.google.com/mail/u/0/#search/%s'
      }
    },
    {
      id: '2',
      alias: 'g:',
      name: 'Google',
      action: {
        url: 'https://www.google.com/search?hl=en&q=%s'
      }
    },
    {
      id: '3',
      alias: 'ip:',
      name: 'IP Address',
      action: {
        url: 'https://ip-api.com/#%s'
      }
    }
  ]
}
