const puppeteer = require('puppeteer');
const ObjectsToCsv = require('objects-to-csv');
const common = require('./module/common');
const twitter = require('./module/twitter');
const csv = require('csv');
const fs = require('fs');

fs.createReadStream(__dirname + '/target.csv')
  .pipe(csv.parse(function(err, keywords) {

    (async () => {
      const browser = await puppeteer.launch(
        {
          headless: false
        }
      );
      const page = await browser.newPage({
        waitUntil: 'domcontentloaded'
      });

      const data = await twitter.twitterMain(keywords, page);
      console.log(data);
      // datas.unshift(twitter.makeTwitterCsvHeader(datas))

      await browser.close()

      const date = new Date();
      const path = 'output/' + date.getFullYear() + '-' + ('00' + (date.getMonth() + 1)).slice(-2) + '-' + ('00' + date.getDate()).slice(-2) + '/';

      common.makeOutputDir(path);

      const csv = new ObjectsToCsv(data);
      await csv.toDisk(path + 'twitter.csv');

    })();

  }));
