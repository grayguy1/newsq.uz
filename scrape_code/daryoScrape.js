// Imports
const fs = require('fs');
const fetch = require("node-fetch");
const nhp = require('node-html-parser')
const getUrls = require('get-urls');
const { parse } = nhp;
let success = 0;
let errors = 0;
let num_articles = 0;
// Env variables
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
// Global Veriables
const writeFileName = 'daryo_articles';
let articles = []
//Functions
async function scrapeLinkPage(url) {
  if(url.trim() == '') {
    errors += 1;
    return;
  }
  try {
    const response = await fetch(url);
    const body = await response.text();
    const root = parse(body);
    let articleContent = '';
    let articleTitle = '';
    let articleDate = '';
    let articleCategory = '';
    articleContentSelector = root
      .querySelector('.postContent')
    if(articleContentSelector == null) return;
    articleContent = Array.from(root
      .querySelector('.postContent')
      .querySelectorAll('p'))
      .map(el => el.text)
      .join('\n');
    articleTitle = root
      .querySelector('.articleContHead')
      .querySelector('.title-1')
      .text;
    console.log("\n")
    console.log(articleTitle)
    articleDate = root
      .querySelector('.articleContHead')
      .querySelector('.articleDatas')
      .querySelector('.itemData')
      .querySelector('span')
      .text;
    console.log("Date is received")
    let articleNumViews = root
    .querySelector('.articleContHead')
    .querySelector('.articleDatas')
    .querySelector('.itemData')
    .querySelectorAll('span')[1]
    .text.trim();
    console.log(articleNumViews)
    let html = articleContentSelector.innerHTML
    var articleNumImages = (html.match(/<img/g) || []).length;
    var all_links = Array.from(getUrls(html))
    var articleNumQuotes = (articleContent.match(/”, —/g) || []).length;
    console.log(all_links)
    var real_links = all_links.filter(link => {
      let link_parts = link.split('/')
      return !link_parts[link_parts.length - 1].includes('.')
    })
    console.log(real_links)
    let articleNumLinks = real_links.length
    let articleTime = articleDate.split(',')[0]
    articleDate = articleDate.split(',')[1].trim()
    articleDate = [
      articleDate.split('.')[1],
      articleDate.split('.')[0],
      articleDate.split('.')[2]]
      .join('/');
    articleCategory = root
      .querySelector('.itemCat')
      .text;
    AddToArticles(url, articleContent, articleCategory, articleTitle, articleDate, articleTime, articleNumViews, articleNumImages, articleNumLinks, articleNumQuotes);
    success += 1;
  }
  catch(error) {
    errors += 1;
  }
}

async function retrieveLinks() {
    linkFiles = fs.readdirSync(`./telegram/`);
      data = fs.readFileSync(`${__dirname}/telegram/daryo.txt`, 'utf8');
      counter = 0
      for(url of data.split('\n')){
        await scrapeLinkPage(url);
        //console.clear();  
        console.log(`Url: ${url}`);
        console.log(`Successes: ${success}, Errors: ${errors}`);
        counter += 1
        //if (counter === 200) break;
      };
      console.log(articles)
      fs.writeFileSync(`${__dirname}/${writeFileName}.jsonl`, JSON.stringify(articles), 'utf8');
      articles = [];
    //fs.writeFileSync(`${__dirname}/${writeFileName}_${year}.jsonl`, JSON.stringify(articles), 'utf8');
}
function AddToArticles(url, content, category, title, date, time, numViews, numImages, numLinks, numQuotes) {
  let newArticle = {
    'content': content,
    'category': category,
    'title': title,
    'date': date,
    'url': url,
    'time': time,
    'num_views': numViews,
    'num_images': numImages,
    'num_links': numLinks,
    'num_quotes': numQuotes
  };
  articles.push(newArticle);
}
async function main() {
  await retrieveLinks();
}
main();