export const default_config = {
  'updated_at': 0,
  'preferences': {
    'default_service': 0
  },
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
      id: '2',
      alias: 'gm:',
      name: 'Gmail / Google Mail',
      action: {
        url: 'https://mail.google.com/mail/u/0/#search/%s'
      }
    },
    {
      id: '3',
      alias: 'g:',
      name: 'Google',
      action: {
        url: 'https://www.google.com/search?hl=en&q=%s'
      }
    }
  ]
}
