const keys = require('../keys')
const fs = require('fs').promises

const threshold = 70

async function loginUser(page) {
    await page.goto('https://twitter.com/login');
    console.log('Navigating to login')

    // Login
    await page.waitForSelector('input[name=session\\5busername_or_email\\5d]')
    await page.type('input[name=session\\5busername_or_email\\5d]', keys.user)
    console.log('Entered username')

    await page.waitForSelector('input[name=session\\5bpassword\\5d]')
    await page.type('input[name=session\\5bpassword\\5d]', keys.password)
    console.log('Entered password')

    await page.waitForSelector('div[data-testid=LoginForm_Login_Button]')
    await page.click('div[data-testid=LoginForm_Login_Button]')
    console.log('Submit.')

    // wait till page load
    await page.waitForNavigation()
    await page.waitFor(5000)
    console.log('Should be logged in now.')
}

async function extractUsers(page, target, browser) {
    await page.goto('https://twitter.com/' + target + '/followers')
    await page.waitFor(4500)
    const bodyHeight = await page.evaluate(_ => window.innerHeight)
    await loadUsers(0, bodyHeight, page, browser)
    console.log('done!')
}

async function loadUsers(scrollPos, bodyHeight, page, browser) {
    const visited = []
    while(scrollPos < (await page.evaluate(_ => document.body.scrollHeight))) {
        await page.waitFor(4500)
        const userSelector = 'div[data-testid=UserCell]'
        const users = await page.$$(userSelector)
        await addProspects(users, browser, page, visited)
        console.log('current scroll = ' + await page.evaluate(_ => window.scrollY))
        await page.evaluate(scrollPosition => {
            window.scrollBy(0, scrollPosition);
        }, bodyHeight);
        scrollPos += bodyHeight
        console.log("new scroll position = " + scrollPos)
    }
    const result = visited.map((v) => 'https://twitter.com' + v)
    try {  
        await fs.writeFile('results.json', JSON.stringify(result, null, '\t'))
    } catch(e) {
        console.log('Failed to save result!')
    }
}

async function addProspects(users, browser, page, visited) {
    for(user of users) {
        const url = await user.$eval('a', e => e.getAttribute('href'))
        if(visited.includes(url)) continue
        visited.push(url)
        console.log('analyzing user ' + url.substring(1, url.length))
        const userPage = await browser.newPage();
        userPage.setUserAgent(keys.agent)
        await userPage.goto('https://twitter.com' + url)
        await userPage.waitFor(4500)
        const followCounts = await userPage.$$('a[title]')
        let followers = 0
        let following = 0
        for(entry of followCounts) {
            const value = await entry.evaluate(node => node.innerText)
            if(value.includes('Follow')) {
                if(value.includes('ing')) {
                    following = getNumberFromText(value)
                } else {
                    followers = getNumberFromText(value)
                }
            }
        }
        const popScore = (followers / following) * 100
        if(popScore <= threshold) {
            console.log('adding https://twitter.com' + url)
        }
        await userPage.waitFor(1000)
        await userPage.close()
        await page.waitFor(3000)
    }
}

function getNumberFromText(text) {
    const raw = text.substring(0, text.indexOf('F') - 1).replace(',', '')
    let value
    if(raw.charAt(raw.length - 1) == "K") {
        value = parseInt(raw.substring(0, raw.length - 1)) * 1000
    } else if(raw.charAt(raw.length - 1) == "M") {
        value = parseInt(raw.substring(0, raw.length - 1)) * 1000000
    } else {
        value = parseInt(raw)
    }
    return value
}

module.exports = { loginUser, extractUsers }