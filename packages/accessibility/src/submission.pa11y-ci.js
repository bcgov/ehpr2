const defaults = {
  wait: 1500,
  timeout: 240000,
  hideElements: '#__next [data-no-a11y-scan]',
  standard: 'WCAG2AA',
  runners: ['axe'],
  viewport: {
    width: 1300,
    height: 2400,
  },
  chromeLaunchConfig: {
    ignoreHTTPSErrors: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
};

const screenCap = fileName => `screen capture screenCaptures/${fileName}.png`;

const urls = [
  {
    url: 'http://localhost:3000/submission/1',
    actions: [screenCap('screencap_personal')],
  },
  {
    url: 'http://localhost:3000/submission/2',
    actions: [screenCap('screencap_contact')],
  },
  {
    url: 'http://localhost:3000/submission/3',
    actions: [screenCap('screencap_credential')],
    hideElements: 'div[class*="singleValue"]',
  },
  {
    url: 'http://localhost:3000/submission/4',
    actions: [screenCap('screencap_preferences')],
  },
  {
    url: 'http://localhost:3000/submission/5',
    actions: [screenCap('screencap_review')],
  },
  {
    url: 'http://localhost:3000/confirmation?id=12345678910',
    actions: [screenCap('screencap_confirmation')],
  },
];

module.exports = {
  defaults,
  urls,
};
