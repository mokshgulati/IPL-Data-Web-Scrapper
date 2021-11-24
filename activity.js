let fs = require("fs");
let path = require("path");
let request = require("request");
let cheerio = require("cheerio");

let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";

let currentWD = process.cwd();
let exactPath = path.join(currentWD, "espncricinfo");
fs.mkdirSync(exactPath);
exactPath = path.join(exactPath, "Ipl");
fs.mkdirSync(exactPath);

request(url, cb);
function cb(error, response, html) {
    if (error) {
        console.log(error);
    } else if (response.statusCode == 404) {
        console.log("Page not found!");
    } else {
        dataExtractor(html);
    }
}

function dataExtractor(html) {
    let searchTool = cheerio.load(html);
    let elemRep = searchTool('a[data-hover="View All Results"]');
    let link = elemRep.attr("href");
    let newUrl = `https://www.espncricinfo.com${link}`;
    request(newUrl, newCb);
}

function newCb(error, response, html) {
    if (error) {
        console.log(error);
    } else if (response.statusCode == 404) {
        console.log("Page not found!");
    } else {
        scoreCards(html);
    }
}

function scoreCards(html) {
    let searchTool = cheerio.load(html);
    let elemRepArr = searchTool('a[data-hover="Scorecard"]');
    for (let i = 0; i < elemRepArr.length; i++) {
        let aElem = searchTool(elemRepArr[i]);
        let link = aElem.attr("href");
        let newUrl = `https://www.espncricinfo.com${link}`;
        request(newUrl, callBack);
    }
}

function callBack(error, response, html) {
    if (error) {
        console.log(error);
    } else if (response.statusCode == 404) {
        console.log("Page not found!");
    } else {
        players(html);
    }
}

function players(html) {
    let $ = cheerio.load(html);
    let elemRepArr = $('.Collapsible');
    for (let i = 0; i < elemRepArr.length; i++) {
        let elem = $(elemRepArr[i]).find('h5');
        let teamName = elem.text();
        let teamNameArr = teamName.split(' INNINGS ');
        let teams = path.join(exactPath, teamNameArr[0]);
        if (!fs.existsSync(teams)) {
            fs.mkdirSync(teams);
        }
        let playersArr = $(elemRepArr[i]).find('.Collapsible table tbody tr');
        for (let j = 0; j < playersArr.length; j++) {
            let playersSpecificallyArr = $(playersArr[j]).find('td');
            if (playersSpecificallyArr.length == 8) {
                let playerName = $(playersSpecificallyArr[0]).text().trim();
                let playerNames = path.join(teams, playerName + ".json");
                if (!fs.existsSync(playerNames)) {
                    fs.writeFileSync(playerNames, "");
                }
            }
        }
    }
}