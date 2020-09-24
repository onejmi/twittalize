# Twittalize 🧪 - Follow filter to save precious time!

Currently does **not** do advanced follow-back analysis. Works off of ```following:follower``` ratio. 

Results are saved in ```results.json``` file.

Remember to install the dependencies before starting: ```npm install```

## Configuration ⚙
Create a ```keys.js``` with this template:
```javascript
module.exports = { 
    user: 'TWITTER_USERNAME', 
    password: 'TWITTER_PASSWORD',
    agent: 'USER_AGENT',
    browserPath: 'BROWSER_EXECUTABLE_PATH'
}
```

<br><br>
This tool performs web scraping (without the use of the official Twitter API). 
⚠ **USE AT YOUR OWN RISK** ⚠

PR always appreciated.
