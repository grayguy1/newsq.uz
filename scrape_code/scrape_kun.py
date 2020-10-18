import requests
from bs4 import BeautifulSoup
import threading
import json, re

lock = threading.Lock()
success = 0
failure_empty = 0
failure_nodiv = 0
total = 0

def get_links(text):
    return re.findall("(?P<url>https?://[^\s]+)", text)

def parse_and_write(write_file, links):
    global lock, success, failure_empty, failure_nodiv, total

    for link in links:
        html = requests.get(link).text
        soup = BeautifulSoup(html, 'html.parser')
        header = soup.findAll('div', {'class':'single-header__title'})
        content = soup.findAll('div', {'class':'single-content'})
        date_time = soup.findAll('div', {'class':'date'})
        num_views = soup.findAll('div', {'class':'view'})

        innerhtml = "".join([str(x) for x in content[0].contents]) 
        content_soup = BeautifulSoup(innerhtml, 'html.parser')
        num_images = len(content_soup.findAll('img'))
        num_quotes = len(content_soup.findAll('blockquote'))

        links = get_links(innerhtml)
        #print(links)
        #links = list(filter(lambda x: "." not in x.split('/')[-1] and all(keyword not in x for keyword in ['youtube', 'telegram', 'facebook', 'twitter', 'mc.yandex.ru', 'kun.uz']), links))
        links = list(filter(lambda x: "." not in x.split('/')[-1] and all(keyword not in x for keyword in ['storage.kun.uz']), links))

        if header and content:
            header = header[0].text.replace('\n', '').strip()
            content = content[0].text.replace('\n', '').strip()
            date_time = date_time[0].text.replace('\n', '').strip()
            num_views = num_views[0].text.replace('\n', '').strip()
            num_links = len(links)

            date = date_time.split(' / ')[1]
            time = date_time.split(' / ')[0]

            date_parts = date.split('.')
            date = date_parts[1] + '/' + date_parts[0] + '/' + date_parts[2]

            if header == '' or content == '':
                failure_empty += 1
            else:
                write_json = {'title': header, 'content': content, 'category': '', 'date': date, \
                'time': time, 'num_views': num_views, 'num_links': num_links, 'num_images': num_images, \
                'url': link, 'num_quotes': num_quotes}

                #print(write_json)
                with lock:
                    success += 1
                    write_file.write(f'{json.dumps(write_json, ensure_ascii=False)}\n')
        else:
            failure_nodiv += 1 
        
        print(f'Success: {success}/{total}, Failure: {failure_empty+failure_nodiv}/{total} - {failure_empty}:{failure_nodiv}')



def main():
    global total
    dir_links = open('telegram/kunuzofficial.txt').read().split('\n')[0:-1]
    links = []
    for link in dir_links:
        split_link = link.split('/')
        split_link.insert(-1, 'uz')
        links.append('/'.join(split_link))

    total = len(links)
    n = int(total/9)
    links = [links[i:i + n] for i in range(0, len(links), n)]
    write_file = open('kun_articles.jsonl', 'a')
    
    threads = [threading.Thread(target=parse_and_write, args=(write_file, link,)) for link in links]
    for thread in threads:
        thread.start()

    for thread in threads:
        thread.join()

if __name__ == '__main__':
    main()