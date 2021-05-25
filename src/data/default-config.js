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
  updated_at: 0,
  /**
   * Configuration for syncing to third-party services
   */
  sync: {
    google_drive: [
      {
        id: 0
      }
    ]
  },
  /**
   * User preferences outside of services
   */
  preferences: {
    default_service: 0
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
   * The following attributes will be automatically set:
   * - active: Whether to use the service. Can be set to false to disable unwanted default services
   *    - true by default
   * - from_default_config: Set to true for services in this specific file, to differentiate from user-added services
   * - updated_at: Last updated time for this specific service in this specific dataset.  Used for syncing.
   *    - 0 by default
   */
  service_template: {
    id: null,
    alias: '',
    name: '',
    action: {
      url: ''
    },
    active: true,
    from_default_config: false,
    updated_at: 0
  },
  services: [
    {
      id: '0',
      alias: 'ddg',
      name: 'DuckDuckGo / Bang!',
      action: {
        url: 'https://next.duckduckgo.com/?q=%s'
      },
      active: true
    },

    {
      id: '1',
      alias: 'g',
      name: 'Google',
      action: {
        url: 'https://google.com/search?q=%s'
      },
      active: true
    },

    {
      id: '2',
      alias: 'gc',
      name: 'Google Calendar Search',
      action: {
        url: 'https://calendar.google.com/calendar/r/search?q=%s'
      },
      active: true
    },

    {
      id: '3',
      alias: 'gd',
      name: 'Google Drive Search',
      action: {
        url: 'https://drive.google.com/drive/search?q=%s'
      },
      active: true
    },

    {
      id: '4',
      alias: 'gdns',
      name: 'Google DNS',
      action: {
        url: 'https://dns.google.com/query?name=%s'
      },
      active: true
    },

    {
      id: '5',
      alias: 'gi',
      name: 'Google Images',
      action: {
        url: 'https://www.google.com/search?tbm=isch&q=%s'
      },
      active: true
    },

    {
      id: '6',
      alias: 'gm',
      name: 'Google Mail (GMail) Search',
      action: {
        url: 'https://mail.google.com/mail/u/0/#search/%s'
      },
      active: true
    },

    {
      id: '7',
      alias: 'gmc',
      name: 'Google Mail (GMail) Compose',
      action: {
        url: 'https://mail.google.com/mail/u/0/?view=cm&fs=1&to=%s'
      },
      active: true
    },

    {
      id: '8',
      alias: 'gmap',
      name: 'Google Maps',
      action: {
        url: 'https://www.google.com/maps/search/%s?hl=en&source=opensearch'
      },
      active: true
    },

    {
      id: '9',
      alias: 'et',
      name: 'Eggtimer',
      action: {
        url:
          'https://e.ggtimer.com/%s?theme=gg_timer_digital&hideToolbar=true&hideNudge=true'
      },
      active: true
    },

    {
      id: '10',
      alias: 'ip',
      name: 'IP Address',
      action: {
        url: 'https://ip-api.com/#%s'
      },
      active: true
    },

    {
      id: '11',
      alias: 'nc',
      name: 'Namecheap Domain Search',
      action: {
        url: 'https://www.namecheap.com/domains/registration/results/?domain='
      },
      active: true
    },

    {
      id: '12',
      alias: 'dc',
      name: 'Domain Compare (supports the author)',
      action: {
        url: 'https://www.domcomp.com/?refcode=60a8fe0a77b1e604078ba0ed'
      },
      active: true
    },

    {
      id: '13',
      alias: 'dh',
      name: 'DevHints / Cheet Sheets',
      action: {
        url: 'https://devhints.io/%s'
      },
      active: true
    },

    {
      id: '14',
      alias: 'wttr',
      name: 'Weather Report / wttr.in',
      action: {
        url: 'https://wttr.in/%s'
      },
      active: true
    },

    {
      id: '15',
      alias: 'cht',
      name: 'Cheet Sheets / Command References',
      action: {
        url: 'https://cheat.sh/%s'
      },
      active: true
    },

    {
      id: '16',
      alias: 'bang',
      name: 'DuckDuckGo Search all *Bang*s',
      action: {
        url: 'https://next.duckduckgo.com/bang?q=%s'
      },
      active: true
    },

    {
      id: '17',
      alias: 'csm',
      name: 'Common Sense Media',
      action: {
        url: 'https://www.commonsensemedia.org/search/%s'
      },
      active: true
    }
  ]
};
