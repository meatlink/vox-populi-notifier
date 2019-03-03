const getTitlesFromFile = require("./get_texts_from_file.js");
const fs = require("fs");
const util = require("util");
const readDir = util.promisify(fs.readdir);
const path = require("path");
const notify = require("./notify_telegram.js");


const currentHtmlDirectory = process.env.CURRENT_HTML_DIRECTORY || "html/current";
const previousHtmlDirectory = process.env.PREVIOUS_HTML_DIRECTORY || "html/previous";

main();

async function main () {
    const [currentTitles, previousTitles] = await getTitles();
    console.log(currentTitles.length);
    console.log(previousTitles.length);
    const [added, removed] = compareTitles(currentTitles, previousTitles);
    if (added.length > 0 || removed.length > 0)
      notify({ added, removed });
}

async function getFileNames () {
    const [currentHtmlFile, previousHtmlFile] = await Promise.all([
        getFileNameFromDirectory(currentHtmlDirectory),
        getFileNameFromDirectory(previousHtmlDirectory)
    ]);

    const currentHtml = path.join(currentHtmlDirectory, currentHtmlFile);
    const previousHtml = path.join(previousHtmlDirectory, previousHtmlFile);

    return [currentHtml, previousHtml];
}

async function getTitles () {
    const [currentHtml, previousHtml] = await getFileNames();
    const dirtyLists = await Promise.all([
        getTitlesFromFile(currentHtml),
        getTitlesFromFile(previousHtml)
    ]);
    const [currentTitles, previousTitles] = dirtyLists.map(stripSpacesFromList);
    [currentTitles, previousTitles].forEach(a => {a.sort();});
    return [currentTitles, previousTitles];
}

async function getFileNameFromDirectory (dir) {
    const files = await readDir(dir);
    return files[0];
}

function stripSpacesFromList (list) {
    return list.map(el => {
        return String(el).replace(/^\s+|\s+$/g, '');
    });
}

function compareTitles (curr, prev) {
  const currCount = convertToCount(curr);
  const prevCount = convertToCount(prev);
  console.log(currCount);
  console.log(prevCount);
  const currCountKeys = Object.getOwnPropertyNames(currCount);
  const prevCountKeys = Object.getOwnPropertyNames(prevCount);
  const added = [];
  const removed = [];
  for (const key of currCountKeys) {
    if (! prevCountKeys.includes(key)) added.push(key);
    else
      for (let i = 0 ; i < currCount[key] - prevCount[key]; i++)
        added.push(key);
  }
  for (const key of prevCountKeys) {
    if (! currCountKeys.includes(key)) removed.push(key);
    else
      for (let i = 0 ; i < prevCount[key] - currCount[key]; i++)
        removed.push(key);
  }
    
  console.log("added:", added);
  console.log("removed:", removed);
  return [added, removed];
}

function convertToCount (list) {
  const dict = {};
  for (const el of list)
    dict[el] = dict.hasOwnProperty(el) ? dict[el] + 1 : 1 ;
  return dict;
}
