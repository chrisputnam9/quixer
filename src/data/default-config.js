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
   * - id: A unique identifier.  Defaults should have "d" prepended to keep them unique & separate from custom additions.
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
  services: {
    d1: {
      id: 'd1',
      alias: 'ali',
      name: 'AliExpress',
      action: {
        url: ''
      },
      active: true
    },
    d2: {
      id: 'd2',
      alias: 'au',
      name: 'Ask Ubuntu (Stack Exchange)',
      action: {
        url: 'https://askubuntu.com/search?q=%s'
      },
      active: true
    },
    d3: {
      id: 'd3',
      alias: 'az',
      name: 'Amazon (affiliate?)',
      action: {
        url: ''
      },
      active: true
    },
    d4: {
      id: 'd4',
      alias: 'baidu',
      name: 'Baidu',
      action: {
        url: ''
      },
      active: true
    },
    d5: {
      id: 'd5',
      alias: 'bang',
      name: 'DuckDuckGo Search all *Bang*s',
      action: {
        url: 'https://next.duckduckgo.com/bang?q=%s'
      },
      active: true
    },
    d6: {
      id: 'd6',
      alias: 'bili',
      name: 'Bilibili',
      action: {
        url: ''
      },
      active: true
    },
    d7: {
      id: 'd7',
      alias: 'bing',
      name: 'Bing',
      action: {
        url: ''
      },
      active: true
    },
    d8: {
      id: 'd8',
      alias: 'censys',
      name: 'Censys - Domain / Hosting information including origins',
      action: {
        url: 'https://search.censys.io/search?resource=hosts&q=%s'
      },
      active: true
    },
    d9: {
      id: 'd9',
      alias: 'cht',
      name: 'Cheet Sheets / Command References',
      action: {
        url: 'https://cheat.sh/%s'
      },
      active: true
    },
    d10: {
      id: 'd10',
      alias: 'csm',
      name: 'Common Sense Media',
      action: {
        url: 'https://www.commonsensemedia.org/search/%s'
      },
      active: true
    },
    d11: {
      id: 'd11',
      alias: 'dc',
      name: 'Domain Compare (supports the author)',
      action: {
        url: 'https://www.domcomp.com/?refcode=60a8fe0a77b1e604078ba0ed'
      },
      active: true
    },
    d12: {
      id: 'd12',
      alias: 'ddg',
      name: 'DuckDuckGo / Bang!',
      action: {
        url: 'https://next.duckduckgo.com/?q=%s'
      },
      active: true
    },
    d13: {
      id: 'd13',
      alias: 'dh',
      name: 'DevHints / Cheet Sheets',
      action: {
        url: 'https://devhints.io/%s'
      },
      active: true
    },
    d14: {
      id: 'd14',
      alias: 'ebay',
      name: 'Ebay (affiliate?)',
      action: {
        url: ''
      },
      active: true
    },
    d15: {
      id: 'd15',
      alias: 'et',
      name: 'Eggtimer',
      action: {
        url:
          'https://e.ggtimer.com/%s?theme=gg_timer_digital&hideToolbar=true&hideNudge=true'
      },
      active: true
    },
    d16: {
      id: 'd16',
      alias: 'etsy',
      name: 'Etsy (affiliate?)',
      action: {
        url: ''
      },
      active: true
    },
    d17: {
      id: 'd17',
      alias: 'fb',
      name: 'Facebook',
      action: {
        url: 'https://www.facebook.com/search/str/test/keywords_search?f=%s'
      },
      active: true
    },
    d18: {
      id: 'd18',
      alias: 'g',
      name: 'Google',
      action: {
        url: 'https://google.com/search?q=%s'
      },
      active: true
    },
    d19: {
      id: 'd19',
      alias: 'gc',
      name: 'Google Calendar Search',
      action: {
        url: 'https://calendar.google.com/calendar/r/search?q=%s'
      },
      active: true
    },
    d20: {
      id: 'd20',
      alias: 'gd',
      name: 'Google Drive Search',
      action: {
        url: 'https://drive.google.com/drive/search?q=%s'
      },
      active: true
    },
    d21: {
      id: 'd21',
      alias: 'gdD',
      name: 'Google Drive - New Doc',
      action: {
        url: 'https://docs.google.com/document/create'
      },
      active: true
    },
    d22: {
      id: 'd22',
      alias: 'gdF',
      name: 'Google Drive - New Form',
      action: {
        url: 'https://docs.google.com/forms/create'
      },
      active: true
    },
    d23: {
      id: 'd23',
      alias: 'gdns',
      name: 'Google DNS',
      action: {
        url: 'https://dns.google.com/query?name=%s'
      },
      active: true
    },
    d24: {
      id: 'd24',
      alias: 'gdP',
      name: 'Google Drive - New Presentation (Slides)',
      action: {
        url: 'https://docs.google.com/presentation/create'
      },
      active: true
    },
    d25: {
      id: 'd25',
      alias: 'gdS',
      name: 'Google Drive - New Sheet',
      action: {
        url: 'https://docs.google.com/spreadsheets/create'
      },
      active: true
    },
    d26: {
      id: 'd26',
      alias: 'gh',
      name: 'Github',
      action: {
        url: 'https://github.com/search?q=%s'
      },
      active: true
    },
    d27: {
      id: 'd27',
      alias: 'gi',
      name: 'Google Images',
      action: {
        url: 'https://www.google.com/search?tbm=isch&q=%s'
      },
      active: true
    },
    d28: {
      id: 'd28',
      alias: 'globo',
      name: 'Globo',
      action: {
        url: ''
      },
      active: true
    },
    d29: {
      id: 'd29',
      alias: 'gm',
      name: 'Google Mail (GMail) Search',
      action: {
        url: 'https://mail.google.com/mail/u/0/#search/%s'
      },
      active: true
    },
    d30: {
      id: 'd30',
      alias: 'gmap',
      name: 'Google Maps',
      action: {
        url: 'https://www.google.com/maps/search/%s?hl=en&source=opensearch'
      },
      active: true
    },
    d31: {
      id: 'd31',
      alias: 'gmc',
      name: 'Google Mail (GMail) Compose',
      action: {
        url: 'https://mail.google.com/mail/u/0/?view=cm&fs=1&to=%s'
      },
      active: true
    },
    d32: {
      id: 'd32',
      alias: 'ip',
      name: 'IP Address',
      action: {
        url: 'https://ip-api.com/#%s'
      },
      active: true
    },
    d33: {
      id: 'd33',
      alias: 'jw',
      name: 'Just Watch',
      action: {
        url: ''
      },
      active: true
    },
    d34: {
      id: 'd34',
      alias: 'li',
      name: 'LinkedIn',
      action: {
        url: ''
      },
      active: true
    },
    d35: {
      id: 'd35',
      alias: 'mdn',
      name: 'Mozilla Developer Network',
      action: {
        url: 'https://developer.mozilla.org/en-US/search?q='
      },
      active: true
    },
    d36: {
      id: 'd36',
      alias: 'mru',
      name: '',
      action: {
        url: 'Mail.ru ?'
      },
      active: true
    },
    d37: {
      id: 'd37',
      alias: 'naver',
      name: 'Naver',
      action: {
        url: ''
      },
      active: true
    },
    d38: {
      id: 'd38',
      alias: 'nc',
      name: 'Namecheap Domain Search (affiliate?)',
      action: {
        url: 'https://www.namecheap.com/domains/registration/results/?domain=%s'
      },
      active: true
    },
    d39: {
      id: 'd39',
      alias: 'nf',
      name: 'Netflix (referral?)',
      action: {
        url: ''
      },
      active: true
    },
    d40: {
      id: 'd40',
      alias: 'okru',
      name: '',
      action: {
        url: 'OK.ru'
      },
      active: true
    },
    d41: {
      id: 'd41',
      alias: 'pen',
      name: 'Codepen (referral?)',
      action: {
        url: 'https://codepen.io/search/pens?q=%s'
      },
      active: true
    },
    d42: {
      id: 'd42',
      alias: 'penN',
      name: 'New Codepen',
      action: {
        url: 'https://codepen.io/pen/'
      },
      active: true
    },
    d43: {
      id: 'd43',
      alias: 'pi',
      name: 'Pinterest',
      action: {
        url: ''
      },
      active: true
    },
    d44: {
      id: 'd44',
      alias: 'qq',
      name: 'QQ',
      action: {
        url: ''
      },
      active: true
    },
    d45: {
      id: 'd45',
      alias: 'rakuten',
      name: 'Rakuten',
      action: {
        url: ''
      },
      active: true
    },
    d46: {
      id: 'd46',
      alias: 'rd',
      name: 'Reddit',
      action: {
        url: ''
      },
      active: true
    },
    d47: {
      id: 'd47',
      alias: 'replit',
      name: 'Replit (referral?)',
      action: {
        url: ''
      },
      active: true
    },
    d48: {
      id: 'd48',
      alias: 'replitN',
      name: 'New Replit',
      action: {
        url: ''
      },
      active: true
    },
    d49: {
      id: 'd49',
      alias: 'sf',
      name: 'Server Fault (Stack Exchange)',
      action: {
        url: 'https://serverfault.com/search?q=%s'
      },
      active: true
    },
    d50: {
      id: 'd50',
      alias: 'so',
      name: 'Stack Overflow (Stack Exchange)',
      action: {
        url: 'https://stackoverflow.com/search?q=%s'
      },
      active: true
    },
    d51: {
      id: 'd51',
      alias: 'su',
      name: 'Super User (Stack Exchange)',
      action: {
        url: 'https://superuser.com/search?q=%s'
      },
      active: true
    },
    d52: {
      id: 'd52',
      alias: 'tt',
      name: 'TikTok',
      action: {
        url: ''
      },
      active: true
    },
    d53: {
      id: 'd53',
      alias: 'tw',
      name: 'Twitter',
      action: {
        url: 'https://twitter.com/search?q=%s'
      },
      active: true
    },
    d54: {
      id: 'd54',
      alias: 'twitch',
      name: 'Twitch',
      action: {
        url: ''
      },
      active: true
    },
    d55: {
      id: 'd55',
      alias: 'unix',
      name: 'Unix (Stack Exchange)',
      action: {
        url: 'https://unix.stackexchange.com/search?q=%s'
      },
      active: true
    },
    d56: {
      id: 'd56',
      alias: 'vk',
      name: '',
      action: {
        url: 'VK.com'
      },
      active: true
    },
    d57: {
      id: 'd57',
      alias: 'whois',
      name: 'Whois Lookup - domain ownership / information',
      action: {
        url: 'https://www.whois.com/whois/%s'
      },
      active: true
    },
    d58: {
      id: 'd58',
      alias: 'wiki',
      name: 'Wikipedia - online encyclopedia',
      action: {
        url: 'https://en.wikipedia.org/w/index.php?search=%s'
      },
      active: true
    },
    d59: {
      id: 'd59',
      alias: 'wttr',
      name: 'Weather Report / wttr.in',
      action: {
        url: 'https://wttr.in/%s'
      },
      active: true
    },
    d60: {
      id: 'd60',
      alias: 'yahoo',
      name: 'Yahoo',
      action: {
        url: ''
      },
      active: true
    },
    d61: {
      id: 'd61',
      alias: 'yandex',
      name: 'Yandex',
      action: {
        url: ''
      },
      active: true
    },
    d62: {
      id: 'd62',
      alias: 'yt',
      name: 'YouTube',
      action: {
        url: 'https://www.youtube.com/results?search_query=%s'
      },
      active: true
    },
    d63: {
      id: 'd63',
      alias: '',
      name: 'Walmart (affiliate?)',
      action: {
        url: ''
      },
      active: true
    },
    d64: {
      id: 'd64',
      alias: '',
      name: 'Target (affiliate?)',
      action: {
        url: ''
      },
      active: true
    }
  }
};
