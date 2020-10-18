Date.prototype.yyyymmdd = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();
  
    return [this.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
           ].join('');
};
      
function epochToJsDate(ts){
    // ts = epoch timestamp
    // returns date obj
    return new Date(ts);
}

function load_article_data() {
    let article = JSON.parse(localStorage.getItem('article'))
    console.log(article)
    document.getElementById('text_content').innerHTML = article['content']
    document.getElementById('num_views').innerHTML = article['num_views']
    document.getElementById('num_links').innerHTML = article['num_links']
    let week_days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    document.getElementById('day_of_week').innerHTML = week_days[article['day_of_week']]
    let date = epochToJsDate(article['date'])
    document.getElementById('date_time').innerHTML = date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear() + " " + article['time']
    document.getElementById('num_quotes').innerHTML = article['num_quotes']
    document.getElementById('num_images').innerHTML = article['num_images']
    document.getElementById('title').innerHTML = article['title']

}

load_article_data()