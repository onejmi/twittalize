const puppeteer = require('puppeteer-core');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
}); 

const keys = require('./keys')
const interactionUtils = require('./util/interaction')

const browserPath = keys.browserPath

async function start() {
    const browser = await puppeteer.launch({ executablePath: browserPath });
    const page = await browser.newPage();
    await page.setUserAgent(keys.agent)

    await interactionUtils.loginUser(page)

    //ask user for target account
    const target = await
        new Promise((resolve) => 
        rl.question('What account would you like to analyze? ', (answer) => resolve(answer)))

    await interactionUtils.extractUsers(page, target, browser)

    await browser.close();
}

start()