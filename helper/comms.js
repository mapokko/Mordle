var words4 = require('./words4.json');
var words5 = require('./words5.json');
var words6 = require('./words6.json');

function randomWords(l, n) {
  let rep;
  switch (l) {
    case 4:
      rep = words4.data;
      break;
    case 5:
      rep = words5.data;
      break;
    case 6:
      rep = words6.data;
      break;
    default:
      rep = [];
      break;
  }
  let words = [];
  const raw = new Set();

  while (raw.size !== n) {
    // raw.add(Math.floor(Math.random() * words4.data.length) + 1);
    raw.add(rep[Math.floor(Math.random() * rep.length) + 1]);
  }
  raw.forEach((k, v) => {
    words.push(k);
  });

  return words;
}

function valid(word) {
  const l = word.length;
  let rep;
  switch (l) {
    case 4:
      rep = words4.data;
      break;
    case 5:
      rep = words5.data;
      break;
    case 6:
      rep = words6.data;
      break;
    default:
      rep = [];
      break;
  }

  if (rep.indexOf(word) > -1) {
    return true;
  } else {
    return false;
  }
}

export {randomWords, valid};
