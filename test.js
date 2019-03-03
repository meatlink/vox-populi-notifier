const process = require("process");

const Telegraf = require("telegraf");

const express = require("express");
const bodyParser = require("body-parser");

const fs = require("fs");
const util = require("util");
const readFile = util.promisify(fs.readFile);
const stat = util.promisify(fs.stat);
const writeFile = util.promisify(fs.writeFile);



class File {
  constructor(filename) {
    this.filename = filename;
  }
  async getContent () {
    let fileExists = true;
    try {
      await stat(this.filename);
    }
    catch (e) {
      fileExists = false;
    }
    let content;
    if (fileExists)
      content = JSON.parse(await readFile(this.filename, "utf8"));
    else
      content = [];
    return content;
  }
  async setContent (content) {
    await writeFile(this.filename, JSON.stringify(content), "utf8");
  }
}



class Registry {
  constructor(kw) {
    this.file = new File(kw.filename);
  }
  async add(chatID) {
    const content = await this.file.getContent();
    content.push(chatID);
    this.file.setContent(filterUnique(content));

    function filterUnique(list) {
      const unique = [];
      for (const el of list)
        if (! unique.includes(el)) unique.push(el);
      return unique;
    }
  }
  async getAll() {
    return await this.file.getContent();
  }
}


const registry = new Registry({filename: "hello.world"});

const bot = new Telegraf(process.env.TELEGRAM_TOKEN)
bot.start((ctx) => {
  registry.add(ctx.chat.id);
});
bot.hears(/ping/i, (ctx) => {
  ctx.reply("pong!");
});
bot.launch()


const app = express();
app.use(bodyParser.json());
app.post("/notify", async (req, res) => {
  const clients = await registry.getAll();
  await Promise.all(clients.map(client => { bot.telegram.sendMessage(client, formatMessage(req.body)); }));
  res.send();
});

function formatMessage (data) {
  let msg = "";
  if (data.added.length > 0) {
    msg += "Добавлены: \n";
    for (const title of data.added)
      msg += `- ${title}\n`;
  }
  if (data.removed.length > 0) {
    msg += "Пропали: \n";
    for (const title of data.removed)
      msg += `- ${title}\n`;
  }
  return msg;
}

app.listen(8080, () => { console.log("listening"); });
