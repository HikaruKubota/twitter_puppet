const fs = require('fs');

exports.makeCsvHeader = datas => {
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
  let array = Object.keys(obj);
  array.sort().reverse();
  array.forEach(e => {
    Object.assign(sorted, {[e]: null});
  });
  return sorted;
}

exports.makeOutputDir = path => {
  if (!isExistFile(path)) {
    fs.mkdirSync(path);
  }
}

isExistFile = path => {
  try {
    fs.statSync(path);
    return true
  } catch(err) {
    return false
  }
}

// 四捨五入
exports.orgRound = (value, base) => {
  return Math.round(value / base) * base;
}

//5秒から15秒
exports.makeForRandomSec = () => {
  const sec = getRandomInt(10) * 1000 + 5000
  console.log(sec);
  return sec;
}

getRandomInt = max => {
  return Math.floor(Math.random() * Math.floor(max));
}
