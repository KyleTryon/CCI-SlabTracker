const Json2csvParser = require('json2csv').Parser
const fs = require('fs')
const moment = require('moment')

let token = ""
let Slack = require('slack')
let bot = new Slack({token})

async function getHistory(date) {
    return await bot.channels.history({'channel':'CHANNELID', 'inclusive':'true', "oldest": date, 'count':'1000'})
}

totalResult = []

getHistory(moment().subtract(30, "days").format('X')).then( async (result) => {
    

    //this is the captured messages
    totalResult = result.messages
    //this is the timestamp of the newest message
    let newTime = result.messages[0].ts
    let moreMessages =  result.has_more
    while (moreMessages) {
        var newResult = await getHistory(newTime)
        totalResult = totalResult.concat(newResult.messages)
        newTime = newResult.messages[0].ts
        moreMessages =  newResult.has_more
        console.log(newTime)
    }

    console.log(totalResult.length)
    var filtered = totalResult.filter(item => {
        return item.text == "..."
    })
    console.log(filtered.length)

    
    try {
        fs.writeFile('results.json', JSON.stringify(filtered), (err) => {
            if (err) throw err
            console.log('json saved')
        })
    } catch (err) {
        console.error(err);
      }
    
    try {
        const parser = new Json2csvParser();
        const csv = parser.parse(filtered);


        fs.writeFile('results.csv', csv, (err) => {
            if (err) throw err
            console.log('csv saved')
        })

      } catch (err) {
        console.error(err);
      }


})

