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
    google_drive: {
      file_id: 0,
      synced_at: 0
    }
  },
  /**
   * User preferences outside of services
   */
  preferences: {
    default_service_alias: 'g'
  },
  /**
   * Services
   * Each service has:
   *
   * - id: A unique identifier.  Defaults should have "d" prepended to keep them unique & separate from custom additions.
   * - alias: Array of shortcut aliases for use in the app
   *   - App currently only uses the first one, but the array is in place to support multiple aliases in the future, while hopefully keeping data structure consistent
   *   - (https://github.com/chrisputnam9/quixer/issues/94)
   * - name: Descriptive name
   * - action: Action that the service uses, one of:
   *    - url: Open a URL, replacing "%s" with the search term entered (if any)
   *    - url_no_search: Optional alternate URL to use if search term is not entered
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
    alias: [],
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
      alias: ['ali'],
      name: 'AliExpress',
      action: {
        url: 'https://www.aliexpress.com/wholesale?SearchText=%s',
        url_no_search: 'https://www.aliexpress.com'
      },
      active: false
    },
    d2: {
      id: 'd2',
      alias: ['au'],
      name: 'Ask Ubuntu (Stack Exchange)',
      action: {
        url: 'https://askubuntu.com/search?q=%s',
        url_no_search: 'https://askubuntu.com'
      },
      active: true
    },
    d3: {
      id: 'd3',
      alias: ['az'],
      name: 'Amazon (Smile URL - for charity)',
      action: {
        url: 'https://smile.amazon.com/s?k=%s',
        url_no_search: 'https://smile.amazon.com'
      },
      active: true
    },
    d4: {
      id: 'd4',
      alias: ['baidu'],
      name: 'Baidu',
      action: {
        url: 'https://www.baidu.com/s?wd=%s',
        url_no_search: 'https://www.baidu.com'
      },
      active: false
    },
    d5: {
      id: 'd5',
      alias: ['bang'],
      name: 'DuckDuckGo Search all *Bang*s',
      action: {
        url: 'https://next.duckduckgo.com/bang?q=%s',
        url_no_search: 'https://next.duckduckgo.com/bang'
      },
      active: true
    },
    d6: {
      id: 'd6',
      alias: ['bili'],
      name: 'Bilibili',
      action: {
        url: 'https://search.bilibili.com/all?keyword=%s',
        url_no_search: 'https://www.bilibili.com/'
      },
      active: false
    },
    d7: {
      id: 'd7',
      alias: ['bing'],
      name: 'Bing',
      action: {
        url: 'https://www.bing.com/search?q=%s',
        url_no_search: 'https://www.bing.com'
      },
      active: false
    },
    d8: {
      id: 'd8',
      alias: ['cal'],
      name: 'Google Calendar',
      action: {
        url: 'https://calendar.google.com/calendar/r/search?q=%s',
        url_no_search: 'https://calendar.google.com'
      },
      active: true
    },
    d9: {
      id: 'd9',
      alias: ['censys'],
      name: 'Censys - Domain / Hosting information including origins',
      action: {
        url: 'https://search.censys.io/search?resource=hosts&q=%s',
        url_no_search: 'https://search.censys.io'
      },
      active: true
    },
    d10: {
      id: 'd10',
      alias: ['cht'],
      name: 'Cheat Sheets / Command References',
      action: {
        url: 'https://cheat.sh/%s'
      },
      active: true
    },
    d11: {
      id: 'd11',
      alias: ['contacts'],
      name: 'Google Contacts',
      action: {
        url: 'https://contacts.google.com/search/%s',
        url_no_search: 'https://contacts.google.com'
      },
      active: true
    },
    d12: {
      id: 'd12',
      alias: ['csm'],
      name: 'Common Sense Media',
      action: {
        url: 'https://www.commonsensemedia.org/search/%s',
        url_no_search: 'https://www.commonsensemedia.org'
      },
      active: true
    },
    d13: {
      id: 'd13',
      alias: ['dc'],
      name: 'Domain Compare (supports the author, no direct search yet)',
      action: {
        url: 'https://www.domcomp.com/?refcode=60a8fe0a77b1e604078ba0ed'
      },
      active: true
    },
    d14: {
      id: 'd14',
      alias: ['ddg'],
      name: 'DuckDuckGo / With Bang (!) Shortcuts',
      action: {
        url: 'https://next.duckduckgo.com/?q=%s',
        url_no_search: 'https://next.duckduckgo.com'
      },
      active: true
    },
    d15: {
      id: 'd15',
      alias: ['dh'],
      name: 'DevHints / Cheat Sheets',
      action: {
        url: 'https://devhints.io/%s'
      },
      active: true
    },
    d16: {
      id: 'd16',
      alias: ['ebay'],
      name: 'Ebay',
      action: {
        url: 'https://www.ebay.com/sch/items/?_nkw=%s',
        url_no_search: 'https://www.ebay.com/'
      },
      active: true
    },
    d17: {
      id: 'd17',
      alias: ['et'],
      name: 'Eggtimer',
      action: {
        url:
          'https://e.ggtimer.com/%s?theme=gg_timer_digital&hideToolbar=true&hideNudge=true',
        url_no_search: 'https://e.ggtimer.com'
      },
      active: true
    },
    d18: {
      id: 'd18',
      alias: ['etsy'],
      name: 'Etsy',
      action: {
        url: 'https://www.etsy.com/search?q=%s',
        url_no_search: 'https://www.etsy.com/'
      },
      active: true
    },
    d19: {
      id: 'd19',
      alias: ['fb'],
      name: 'Facebook',
      action: {
        url: 'https://www.facebook.com/search/str/test/keywords_search?f=%s',
        url_no_search: 'https://www.facebook.com'
      },
      active: true
    },
    d20: {
      id: 'd20',
      alias: ['g'],
      name: 'Google',
      action: {
        url: 'https://google.com/search?q=%s',
        url_no_search: 'https://google.com'
      },
      active: true
    },
    d21: {
      id: 'd21',
      alias: ['gd'],
      name: 'Google Drive Search',
      action: {
        url: 'https://drive.google.com/drive/search?q=%s',
        url_no_search: 'https://drive.google.com'
      },
      active: true
    },
    d22: {
      id: 'd22',
      alias: ['gdD'],
      name: 'Google Drive - New Doc',
      action: {
        url: 'https://docs.google.com/document/u/0/create'
      },
      active: true
    },
    d23: {
      id: 'd23',
      alias: ['gdF'],
      name: 'Google Drive - New Form',
      action: {
        url: 'https://docs.google.com/forms/u/0/create'
      },
      active: true
    },
    d24: {
      id: 'd24',
      alias: ['gdns'],
      name: 'Google DNS',
      action: {
        url: 'https://dns.google.com/query?name=%s',
        url_no_search: 'https://dns.google.com'
      },
      active: true
    },
    d25: {
      id: 'd25',
      alias: ['gdP'],
      name: 'Google Drive - New Presentation / Slides',
      action: {
        url: 'https://docs.google.com/presentation/u/0/create'
      },
      active: true
    },
    d26: {
      id: 'd26',
      alias: ['gdS'],
      name: 'Google Drive - New Sheet',
      action: {
        url: 'https://docs.google.com/spreadsheets/u/0/create'
      },
      active: true
    },
    d27: {
      id: 'd27',
      alias: ['gh'],
      name: 'Github',
      action: {
        url: 'https://github.com/search?q=%s',
        url_no_search: 'https://github.com'
      },
      active: true
    },
    d28: {
      id: 'd28',
      alias: ['gi'],
      name: 'Google Images',
      action: {
        url: 'https://www.google.com/search?tbm=isch&q=%s',
        url_no_search: 'https://www.google.com/imghp'
      },
      active: true
    },
    d29: {
      id: 'd29',
      alias: ['globo'],
      name: 'Globo',
      action: {
        url: 'https://www.globo.com/busca/?q=%s',
        url_no_search: 'https://www.globo.com/'
      },
      active: false
    },
    d30: {
      id: 'd30',
      alias: ['gm'],
      name: 'Google Mail (GMail)',
      action: {
        url: 'https://mail.google.com/mail/#search/%s',
        url_no_search: 'https://mail.google.com'
      },
      active: true
    },
    d31: {
      id: 'd31',
      alias: ['gmc'],
      name: 'Google Mail (GMail) Compose',
      action: {
        url: 'https://mail.google.com/mail/?view=cm&fs=1&to=%s',
        url_no_search: 'https://mail.google.com/mail/?view=cm&fs=1'
      },
      active: true
    },
    d32: {
      id: 'd32',
      alias: ['gmd'],
      name: 'Google Mail (GMail) - In Drafts',
      action: {
        url: 'https://mail.google.com/mail/#search/in:draft %s',
        url_no_search: 'https://mail.google.com/mail/#search/in:draft'
      },
      active: true
    },
    d33: {
      id: 'd33',
      alias: ['gmF'],
      name: 'Google Mail (GMail) - Filters',
      action: {
        url: 'https://mail.google.com/mail/#settings/filters'
      },
      active: true
    },
    d34: {
      id: 'd34',
      alias: ['gml'],
      name: 'Google Mail (GMail) - In Label (specify)',
      action: {
        url: 'https://mail.google.com/mail/#search/in:%s',
        url_no_search: 'https://mail.google.com/mail/#settings/labels'
      },
      active: true
    },
    d35: {
      id: 'd35',
      alias: ['gms'],
      name: 'Google Mail (GMail) - Starred Items',
      action: {
        url: 'https://mail.google.com/mail/#search/is:starred %s',
        url_no_search: 'https://mail.google.com/mail/#search/is:starred'
      },
      active: true
    },
    d36: {
      id: 'd36',
      alias: ['gmS'],
      name: 'Google Mail (GMail) - Settings',
      action: {
        url: 'https://mail.google.com/mail/#settings/general'
      },
      active: true
    },
    d37: {
      id: 'd37',
      alias: ['gmt'],
      name: 'Google Mail (GMail) - Sent Items',
      action: {
        url: 'https://mail.google.com/mail/#search/in:sent %s',
        url_no_search: 'https://mail.google.com/mail/#search/in:sent'
      },
      active: true
    },
    d38: {
      id: 'd38',
      alias: ['gmu'],
      name: 'Google Mail (GMail) - Unread Items',
      action: {
        url: 'https://mail.google.com/mail/#search/is:unread %s',
        url_no_search: 'https://mail.google.com/mail/#search/is:unread'
      },
      active: true
    },
    d39: {
      id: 'd39',
      alias: ['ip'],
      name: 'IP Address',
      action: {
        url: 'https://ip-api.com/#%s',
        url_no_search: 'https://ip-api.com'
      },
      active: true
    },
    d40: {
      id: 'd40',
      alias: ['jw'],
      name: 'Just Watch',
      action: {
        url: 'https://www.justwatch.com/us/search?q=%s',
        url_no_search: 'https://www.justwatch.com'
      },
      active: true
    },
    d41: {
      id: 'd41',
      alias: ['li'],
      name: 'LinkedIn',
      action: {
        url: 'https://www.linkedin.com/search/results/all/?keywords=%s',
        url_no_search: 'https://www.linkedin.com'
      },
      active: true
    },
    d42: {
      id: 'd42',
      alias: ['map'],
      name: 'Google Maps',
      action: {
        url: 'https://www.google.com/maps/search/%s?hl=en&source=opensearch',
        url_no_search: 'https://www.google.com/maps'
      },
      active: true
    },
    d43: {
      id: 'd43',
      alias: ['mdn'],
      name: 'Mozilla Developer Network',
      action: {
        url: 'https://developer.mozilla.org/en-US/search?q=',
        url_no_search: 'https://developer.mozilla.org'
      },
      active: true
    },
    d44: {
      id: 'd44',
      alias: ['mru'],
      name: 'Mail.ru',
      action: {
        url: 'https://go.mail.ru/search?q=%s',
        url_no_search: 'https://go.mail.ru'
      },
      active: false
    },
    d45: {
      id: 'd45',
      alias: ['naver'],
      name: 'Naver',
      action: {
        url: 'https://search.naver.com/search.naver?query=%s',
        url_no_search: 'https://www.naver.com'
      },
      active: false
    },
    d46: {
      id: 'd46',
      alias: ['nc'],
      name: 'Namecheap Domain Search (supports the author)',
      action: {
        url:
          'https://namecheap.pxf.io/quixer?u=https%3A%2F%2Fwww.namecheap.com%2Fdomains%2Fregistration%2Fresults%2F%3Fdomain%3D%s',
        url_no_search: 'https://namecheap.pxf.io/quixer'
      },
      active: true
    },
    d47: {
      id: 'd47',
      alias: ['nf'],
      name: 'Netflix',
      action: {
        url: 'https://www.netflix.com/search?q=%s',
        url_no_search: 'https://www.netflix.com'
      },
      active: true
    },
    d48: {
      id: 'd48',
      alias: ['pen'],
      name: 'Codepen',
      action: {
        url: 'https://codepen.io/search/pens?q=%s',
        url_no_search: 'https://codepen.io'
      },
      active: true
    },
    d49: {
      id: 'd49',
      alias: ['penN'],
      name: 'New Codepen',
      action: {
        url: 'https://codepen.io/pen/',
        url_no_search: 'https://codepen.io'
      },
      active: true
    },
    d50: {
      id: 'd50',
      alias: ['pi'],
      name: 'Pinterest',
      action: {
        url: 'https://www.pinterest.com/search/pins/?q=%s',
        url_no_search: 'https://www.pinterest.com'
      },
      active: true
    },
    d51: {
      id: 'd51',
      alias: ['qq'],
      name: 'QQ / Sougou',
      action: {
        url: 'https://www.sogou.com/tx?query=%s',
        url_no_search: 'https://www.qq.com'
      },
      active: false
    },
    d52: {
      id: 'd52',
      alias: ['rakuten'],
      name: 'Rakuten',
      action: {
        url: 'https://search.rakuten.co.jp/search/mall/%s',
        url_no_search: 'https://www.rakuten.co.jp/'
      },
      active: false
    },
    d53: {
      id: 'd53',
      alias: ['rd'],
      name: 'Reddit',
      action: {
        url: 'https://www.reddit.com/search?q=%s',
        url_no_search: 'https://www.reddit.com'
      },
      active: true
    },
    d54: {
      id: 'd54',
      alias: ['sf'],
      name: 'Server Fault (Stack Exchange)',
      action: {
        url: 'https://serverfault.com/search?q=%s',
        url_no_search: 'https://serverfault.com'
      },
      active: true
    },
    d55: {
      id: 'd55',
      alias: ['so'],
      name: 'Stack Overflow (Stack Exchange)',
      action: {
        url: 'https://stackoverflow.com/search?q=%s',
        url_no_search: 'https://stackoverflow.com'
      },
      active: true
    },
    d56: {
      id: 'd56',
      alias: ['su'],
      name: 'Super User (Stack Exchange)',
      action: {
        url: 'https://superuser.com/search?q=%s',
        url_no_search: 'https://superuser.com'
      },
      active: true
    },
    d57: {
      id: 'd57',
      alias: ['tg'],
      name: 'Target',
      action: {
        url: 'https://www.target.com/s?searchTerm=%s',
        url_no_search: 'https://www.target.com'
      },
      active: true
    },
    d58: {
      id: 'd58',
      alias: ['tt'],
      name: 'TikTok',
      action: {
        url: 'https://www.tiktok.com/search?q=%s',
        url_no_search: 'https://www.tiktok.com'
      },
      active: false
    },
    d59: {
      id: 'd59',
      alias: ['tw'],
      name: 'Twitter',
      action: {
        url: 'https://twitter.com/search?q=%s',
        url_no_search: 'https://twitter.com'
      },
      active: true
    },
    d60: {
      id: 'd60',
      alias: ['twitch'],
      name: 'Twitch',
      action: {
        url: 'https://www.twitch.tv/search?term=%s',
        url_no_search: 'https://www.twitch.tv'
      },
      active: false
    },
    d61: {
      id: 'd61',
      alias: ['unix'],
      name: 'Unix (Stack Exchange)',
      action: {
        url: 'https://unix.stackexchange.com/search?q=%s',
        url_no_search: 'https://unix.stackexchange.com'
      },
      active: true
    },
    d62: {
      id: 'd62',
      alias: ['vk'],
      name: 'VK',
      action: {
        url: 'https://vk.com/search?c%5Bq%5D=%s',
        url_no_search: 'https://vk.com'
      },
      active: false
    },
    d63: {
      id: 'd63',
      alias: ['whois'],
      name: 'Whois Lookup - domain ownership / information',
      action: {
        url: 'https://www.whois.com/whois/%s',
        url_no_search: 'https://www.whois.com'
      },
      active: true
    },
    d64: {
      id: 'd64',
      alias: ['wiki'],
      name: 'Wikipedia - online encyclopedia',
      action: {
        url: 'https://en.wikipedia.org/w/index.php?search=%s',
        url_no_search: 'https://en.wikipedia.org'
      },
      active: true
    },
    d65: {
      id: 'd65',
      alias: ['wm'],
      name: 'Walmart',
      action: {
        url: 'https://www.walmart.com/search/?query=%s',
        url_no_search: 'https://www.walmart.com'
      },
      active: true
    },
    d66: {
      id: 'd66',
      alias: ['wttr'],
      name: 'Weather Report / wttr.in',
      action: {
        url: 'https://wttr.in/%s',
        url_no_search: 'https://wttr.in'
      },
      active: true
    },
    d67: {
      id: 'd67',
      alias: ['yahoo'],
      name: 'Yahoo',
      action: {
        url: 'https://search.yahoo.com/search?p=%s',
        url_no_search: 'https://www.yahoo.com/'
      },
      active: false
    },
    d68: {
      id: 'd68',
      alias: ['yandex'],
      name: 'Yandex',
      action: {
        url: 'https://www.yandex.ru/yandsearch?text=%s',
        url_no_search: 'https://www.yandex.ru'
      },
      active: false
    },
    d69: {
      id: 'd69',
      alias: ['yt'],
      name: 'YouTube',
      action: {
        url: 'https://www.youtube.com/results?search_query=%s',
        url_no_search: 'https://www.youtube.com'
      },
      active: true
    },
    d70: {
      id: 'd70',
      alias: ['food52'],
      name: 'Food 52',
      action: {
        url: 'https://food52.com/recipes/search?q=%s',
        url_no_search: 'https://food52.com/receipes'
      },
      active: true
    },
    d71: {
      id: 'd71',
      alias: ['ytm'],
      name: 'YouTube Music',
      action: {
        url: 'https://music.youtube.com/search?q=%s',
        url_no_search: 'https://music.youtube.com'
      },
      active: true
    },
    d72: {
      id: 'd72',
      alias: ['qx'],
      name: 'Quixer',
      action: {
        url: 'https://quixer.onl/'
      },
      active: true
    },
    d73: {
      id: 'd73',
      alias: ['qxc'],
      name: 'Quixer Config',
      action: {
        url: 'https://quixer.onl/#config'
      },
      active: true
    },
    d74: {
      id: 'd74',
      alias: ['use'],
      name: 'Can I Use (Browser Support Check)',
      action: {
        url: 'http://caniuse.com/#search=%s',
        url_no_search: 'http://caniuse.com'
      },
      active: true
    },
    d75: {
      id: 'd75',
      alias: ['translate'],
      name: 'Google Translate',
      action: {
        url:
          'https://translate.google.com/?source=osdd&sl=auto&tl=auto&text=%s&op=translate',
        url_no_search: 'https://translate.google.com'
      },
      active: true
    },
    d76: {
      id: 'd76',
      alias: ['psi'],
      name: 'Google Page Speed Insights',
      action: {
        url: 'https://developers.google.com/speed/pagespeed/insights/?url=%s',
        url_no_search: 'https://developers.google.com/speed/pagespeed/insights/'
      },
      active: true
    }
  },
  __trash: {
    services: {}
  }
};
