const fs = require("fs");
const util = require("util");
const readFile = util.promisify(fs.readFile);
const cheerio = require("cheerio");

async function getTitlesFromFile(filename) {
    const content = await readFile(filename, "utf8");
    const $ = cheerio.load(content);
    const headers = $(".primary_content").find("h4");
    const headersTexts = [];
    headers.each((i, el) => {
        headersTexts.push($(el).text());
    });
    return headersTexts;
}

module.exports = getTitlesFromFile;
