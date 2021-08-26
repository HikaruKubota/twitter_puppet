const common = require('./common');

exports.twitterMain = async (keywords, page) => {
  const datas = [];

  for (let i = 0; i < keywords.length; i++) {
    const data = {};
    const keyword = keywords[i][0];
    data[0] = keyword;
    try {
      console.log(keyword);
      await gotoPage(keyword, page);
      Object.assign(data, await getSearchCountPages(page, keyword));

      const tmp = await getSALARY_rbo(page, keyword, 'job')
      tmp.forEach(e => {
        Object.assign(data, e);
      });

      const tmp2 = await getSALARY_rbo(page, keyword, 'salary')
      tmp2.forEach(e => {
        Object.assign(data, e);
      });

      datas.push(data)
    } catch (error) {
      console.log(error);
    }
  }

  return datas;
}

gotoPage = async (keyword, page) => {

  // + は自動変換
  keyword = keyword.replace(/\+/g, "%2B")

  // # は自動変換
  keyword = keyword.replace(/\#/g, "%23")

  //Todo このif文が肥大化していくようであれば別に切り分ける。
  if(keyword.length == 1) {
    keyword += "言語";
  }

  console.log(keyword);

  let url = 'https://jp.twitter.com/求人?q=エンジニア+' + keyword
  console.log(url);
  await page.goto(url, {waitUntil: "domcontentloaded"});
  await page.waitFor(common.makeForRandomSec());
}

//求人検索結果 9,777 件中 1 ページ目
getSearchCountPages = async (page, keyword) => {
  let item;
  let searchCountPages;

  try {
    item = await page.$('#searchCountPages');
    searchCountPages = await (await item.getProperty('textContent')).jsonValue()
    searchCountPages = SearchCountPagesReplace(searchCountPages);;

  } catch(e) {
    console.log(e);
    console.log('検索結果が無かったと思われる。');
    console.log('値は取得できない');
    searchCountPages = 0;
  }

  let data = {
    '総件数': +searchCountPages
  }
  return data;
}

//推定年収 or 雇用形態
getSALARY_rbo = async (page, keyword, type) => {
  let items;
  if (type == 'salary') {
    items = await page.$$('#SALARY_rbo > ul > li > a');
  } else if (type == 'job') {
    items = await page.$$('#JOB_TYPE_rbo > ul > li > a');
  }

  let datas = [];
  for (const item of items){
    let rbLabel = await item.$('.rbLabel');
    let rbCount = await item.$('.rbCount');

    rbLabel = await (await rbLabel.getProperty('textContent')).jsonValue();
    rbCount = await (await rbCount.getProperty('textContent')).jsonValue();

    if (type == 'salary') {
      rbLabel = common.orgRound(rbLabelReplace(rbLabel), 100) + '万円';
    }
    rbCount = rbCountReplace(rbCount)

    const data = {
      [rbLabel]: +rbCount
    }
    datas.push(data);
  }

  return datas;
}

exports.makeTwitterCsvHeader = datas => {
  let csvHeader = {};
  datas.forEach(data => {
    const dataKeys = Object.keys(data);
    dataKeys.forEach(dataKey => {
      Object.assign(csvHeader, {[dataKey]: null});
    });
  });
  csvHeader = objectSort(csvHeader);
  return csvHeader
}

objectSort = obj => {
  let sorted = {};
  let header = {
    言語: null,
    勤務地: null,
    掲載期間: null,
    新卒: null,
    正社員:null,
    派遣社員: null,
    契約社員: null,
    嘱託社員: null,
    業務委託: null,
    請負: null,
    'アルバイト･パート': null,
    'ボランティア': null,
    'インターン': null,
    '総件数': null
  };
  let array = Object.keys(obj);
  array.sort().reverse();
  array.forEach(e => {
    Object.assign(sorted, {[e]: null});
  });
  return Object.assign(header, sorted);
}
