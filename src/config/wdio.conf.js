const defaultTimeoutInterval = process.env.DEBUG ? (60 * 60 * 500) : 90000;
const utils = require("./util.mocha");

exports.config = {
  runner: 'local',
  specs: [
    './wdio/specs/*.js'
  ],
  exclude: [
    './wdio/specs/file-to-exclude.js'
  ],
  maxInstances: 15,

  capabilities: [
    {
      maxInstances: 5,
      browserName: 'chrome',
      'goog:chromeOptions': {
        mobileEmulation: { 'deviceName': 'Nexus 7' },
        args: ['--no-sandbox',
          '--disable-gpu',
          '--disable-notifications',
          '--headless',
          //'--window-size=411,731',
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
        ]
      }
    },
  ],
  sync: true,
  logLevel: 'silent',
  deprecationWarnings: true,
  bail: 0,

  baseUrl: 'https://ibsstorage1.z13.web.core.windows.net',
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,

  services: ['selenium-standalone'],

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 90000,
    compilers: ['js:@babel/register'],
  },
  reporters: [
    'spec',
    ['junit', {
      outputDir: './wdio/reports/junit-results/',
      outputFileFormat: function (opts) { // optional
        return `results-${opts.cid}.${opts.capabilities}.xml`
      }
    }
    ],
    ['mochawesome', {
      outputDir: './wdio/reports/mocha-results/',
      outputFileFormat: function (opts) {
        return `results-${opts.cid}.${opts.capabilities}.json`
      },
      mochawesomeOpts: {
        includeScreenshots: true,
        screenshotUseRelativePath: true
      }
    }
    ],
    // ['allure', {
    //     outputDir: './wdio/reports/allure-results/',
    //     disableWebdriverStepsReporting: true,
    //     disableWebdriverScreenshotsReporting: false,
    //   }
    // ],
  ],
  /**
   * Gets executed once before all workers get launched.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   */
  onPrepare: function (config, capabilities) {
    console.log('=========Test execution started=========');
  },
  /**
   * Gets executed just before initialising the webdriver session and test framework. It allows you
   * to manipulate configurations depending on the capability or spec.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that are to be run
   */
  beforeSession: function (config, capabilities, specs) {
    require('@babel/register');
  },
  /**
  // Gets executed before test execution begins. At this point you can access all global
  // variables, such as `browser`. It is the perfect place to define custom commands.
  * @param {Array.<Object>} capabilities list of capabilities details
  * @param {Array.<String>} specs List of spec file paths that are to be run
  */
  before: function (capabilities, specs) {
    /**
     * Setup the Chai assertion framework
     */
    const chai = require('chai');
    global.expect = chai.expect;
    global.assert = chai.assert;
    global.should = chai.should();
  },
  /**
   * Gets executes aftr test execution.
   */
  afterTest: function (test, context, { error, result, duration, passed, retries }) {
    if (error !== undefined) {
      try {
        utils.takeScreenshot(test.title, true)
      } catch {
        console.log('>> Capture Screenshot Failed!');
      }
    }
  },
  /**
   * Gets executed after all workers got shut down and the process is about to exit. It is not
   * possible to defer the end of the process using a promise.
   * @param {Object} exitCode 0 - success, 1 - fail
   */
  onComplete: function (exitCode) {
    const mergeResults = require('wdio-mochawesome-reporter/mergeResults')
    mergeResults('./wdio/reports/mocha-results/', "results-*")
    console.log('=========Test execution completed=========');
  }
}
