$('#loading').hide()

var firebaseConfig = {
  apiKey: "AIzaSyDF7ry0eeBu1b1xAYZgKahPzM_SeEfe5HY",
  authDomain: "newsquz.firebaseapp.com",
  databaseURL: "https://newsquz.firebaseio.com",
  projectId: "newsquz",
  storageBucket: "newsquz.appspot.com",
  messagingSenderId: "579535195899",
  appId: "1:579535195899:web:871f10ca93503457946a5e",
  measurementId: "G-M6K6T1KZLD"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

load_rankings()
var start_date = new Date();
start_date.setDate(start_date.getDate() - 365);
var end_date = new Date();

var topics = new Set(['Sport', 'Dunyo', 'Madaniyat', 'Texnologiyalar', 'Mahalliy', 'Koronavirus']);

function epochToJsDate(ts){
  // ts = epoch timestamp
  // returns date obj
  return new Date(ts);
}

function load_rankings(){
  firebase.database().ref('data/').once('value', e => {
    let all_articles = e.val()
    let counter = 0;
    for (var i = 0; i < all_articles.length; i++){
      let date = epochToJsDate(all_articles[i]['date'])
      var topic = all_articles[i]['topic']
      if (date >= start_date && date <= end_date && topics.has(topic)){
        console.log(date)
        add_ranking_row(counter + 1, all_articles[i]['title'], all_articles[i]['labels'], all_articles)
        counter += 1;
      }
      if (counter === 100) break;
    }
  })
}

var time_options = document.getElementById('time_options')
time_options.addEventListener('change', e => {
  var option_chosen = time_options.value;
  console.log(option_chosen)
  start_date = new Date()
  if(option_chosen === 'none') {
    start_date.setDate(start_date.getDate() - 365);
  } else if(option_chosen === 'week') {
    start_date.setDate(start_date.getDate() - 7);
  } else if (option_chosen === 'month') {
    start_date.setDate(start_date.getDate() - 30);
  }
  document.querySelector('tbody').innerHTML = ""
  load_rankings()
})

var topic_options = document.getElementById('topic_options')
topic_options.addEventListener('change', e => {
  var topic_chosen = topic_options.value;
  console.log(topic_chosen)
  if (topic_chosen === 'none'){
    topics = new Set(['Sport', 'Dunyo', 'Madaniyat', 'Texnologiyalar', 'Mahalliy', 'Koronavirus']);
  } else{
    topics = new Set([topic_chosen])
  }
  document.querySelector('tbody').innerHTML = ""
  load_rankings()
})

function add_ranking_row(rank_text, title_text, engagement_rate_text, all_articles){
  var table = document.querySelector('tbody')
  var tr = document.createElement('tr')
  var rank = document.createElement('td')
  var title = document.createElement('td')
  var rate = document.createElement('td')
  rank.className = 'rank'
  title.className = 'title'
  rate.className = 'rate'
  rank.innerHTML = String(rank_text)
  var a_tag = document.createElement('a')
  a_tag.href = 'article.html'
  a_tag.innerHTML = String(title_text)
  a_tag.addEventListener('click', e => {
    e.preventDefault()
    localStorage.setItem('article', JSON.stringify(all_articles[parseInt(a_tag.parentElement.id) - 1]))
    console.log(localStorage.getItem('article'))
    window.location = a_tag.href
  })
  title.appendChild(a_tag)
  title.id = rank_text
  rate.innerHTML = String(engagement_rate_text)
  tr.appendChild(rank)
  tr.appendChild(title)
  tr.appendChild(rate)
  table.appendChild(tr)
}