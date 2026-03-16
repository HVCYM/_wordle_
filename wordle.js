'use strict';

const API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
const WordListAPI = 'https://raw.githubusercontent.com/tabatkins/wordle-list/main/words';

let cellIndex = 0, idx = 0;
let word = "", secretWord = "";
let wordSet = new Set();
let found = false;

const new_freq = new Array(26).fill(0);
let freq = new Array(1).fill(0);
const alert_box = document.getElementById('alert_box');
const grade = ['Genius', 'Magnificient', 'Impressive', 'Great', 'Nice'];

async function isValidWord(word) {
  const response = await fetch(`${API}${word}`);
  return  wordSet.has(word) || response.status === 200;
}

async function getRandomFiveLetterWord() {
  const res = await fetch(WordListAPI);
  const text = await res.text();
  const wordList = text.split('\n');
  wordSet = new Set(wordList);
  const word = wordList[Math.floor(Math.random() * wordList.length)];
  return word;
}

async function init() { 
  const tgt = await getRandomFiveLetterWord();
  secretWord = tgt.toLowerCase();
  freq = new Array(26).fill(0);
  for (let i = 0; i < 5; i++) {
    freq[secretWord[i].charCodeAt(0) - 97] += 1;
  }
}

function isAlpha(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

function alertBox(msg) {
  alert_box.textContent = msg;
  alert_box.classList.add('alert_cell');
  setTimeout(() => {
    alert_box.classList.remove('alert_cell');
    alert_box.textContent = '';
  }, 1500);
}

document.addEventListener("keyup", async function(event) {
  let key_pressed = event.key.toLowerCase();
  if (key_pressed === "enter") {
    if (word.length < 5) {
      alertBox('Not enough letters');
    } else {
      const valid = await isValidWord(word);
      if (!valid) {
        alertBox("Not in word list");
      } else {
        const backupWord = word.split('');
        found = word === secretWord;
        for (idx = 0; idx < 5; idx++) {
          let cell_box = document.getElementById(`${cellIndex - 4 + idx}`);
          if (word[idx] === secretWord[idx]) {
            cell_box.classList.add('correct');
            new_freq[word[idx].charCodeAt(0) - 97] += 1;
            backupWord[idx] = '#';
          }
        }
        for (idx = 0; idx < 5; idx++) {
          if (backupWord[idx] === '#') {
            continue;
          }
          let c = backupWord[idx].charCodeAt(0) - 97;
          let cell_box = document.getElementById(`${cellIndex - 4 + idx}`);
          if (new_freq[c] < freq[c]) {
            cell_box.classList.add('present');
            new_freq[c] += 1;
          } else {
            cell_box.classList.add('absent');
          }
        }
        for (idx = 0; idx < 5; idx++) {
          new_freq[word[idx].charCodeAt(0) - 97] = 0;
        }
        if (found) {
          alertBox(grade[cellIndex / 5 - 1]);
        }
        word = ""
      }
    }
  } else if(key_pressed === "backspace" && word.length > 0) {
    const cellBox = document.getElementById(`${cellIndex}`);
    cellBox.textContent = '';
    word = word.slice(0, -1);
    cellIndex -= 1;
  } else if (isAlpha(key_pressed) && word.length < 5 && !found && cellIndex < 30) {
    cellIndex += 1;
    const cellBox = document.getElementById(`${cellIndex}`);
    cellBox.textContent = key_pressed;
    word = word + key_pressed;
  }
  if (cellIndex == 30 && !found && word.length == 0) {
    const answer = secretWord.toUpperCase()
    setTimeout(() => alertBox(answer), 1000);
  }
});

init();
