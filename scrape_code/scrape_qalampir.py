import requests
from bs4 import BeautifulSoup
import threading
import json
import os, re

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
        try:
            html = requests.get(link).text
            soup = BeautifulSoup(html, 'html.parser')
            header = soup.findAll('h1', {'class':'title'})
            content = soup.findAll('div', {'class':'stickyContent'})
            date_time = soup.findAll('span', {'itemprop':'datePublished'})
            num_views_parent = soup.findAll('span', {'itemprop':'isPartOf'})
            category = soup.findAll('span', {'class': 'category_news'})

            views_html = "".join([str(x) for x in num_views_parent[0].contents]) 
            views_soup = BeautifulSoup(views_html, 'html.parser')
            num_views = views_soup.findAll('span', {'class': 'flex_row'})

            innerhtml = "".join([str(x) for x in content[0].contents]) 
            content_soup = BeautifulSoup(innerhtml, 'html.parser')
            num_images = len(content_soup.findAll('img'))
            num_quotes = len(content_soup.findAll('blockquote'))

            links = get_links(innerhtml)
            links = list(filter(lambda x: "." not in x.split('/')[-1], links))

            if header and content:
                header = header[0].text.replace('\n', '').strip()
                content = content[0].text.replace('\n', '').strip()
                date_time = date_time[0].text.replace('\n', '').strip()
                num_views = num_views[0].text.replace('\n', '').strip()
                category = category[0].text.replace('\n', '').strip()
                num_links = len(links)

                months = {
                    'Январь': '01',
                    'Февраль': '02',
                    'Март': '03',
                    'Апрель': '04',
                    'Май': '05',
                    'Июнь': '06',
                    'Июль': '07',
                    'Август': '08',
                    'Сентябрь': '09',
                    'Октябрь': '10',
                    'Ноябрь': '11',
                    'Декабрь': '12'
                }

                date_parts = date_time.split(' ')
                date = months[date_parts[1]] + "/" + date_parts[0] + "/" + '2020'
                time = date_parts[-1]

                if header == '' or content == '':
                    failure_empty += 1
                else:
                    write_json = {'title': header, 'content': content, 'category': category, 'date': date, \
                    'time': time, 'num_views': num_views, 'num_links': num_links, 'num_images': num_images, \
                    'url': link, 'num_quotes': num_quotes}

                    with lock:
                        success += 1
                        write_file.write(f'{json.dumps(write_json, ensure_ascii=False)}\n')
            else:
                failure_nodiv += 1 
        except:
            failure_empty += 1
        
        print(f'Success: {success}/{total}, Failure: {failure_empty+failure_nodiv}/{total} - {failure_empty}:{failure_nodiv}')



def main():
    global total
    links = open('telegram/qalampir.txt').read().split('\n')[0:-1]
    '''
    for link in dir_links:
        split_link = link.split('/')
        split_link.insert(-1, 'uz')
        links.append('/'.join(split_link))
    '''
    total = len(links)
    n = int(total/9)
    links = [links[i:i + n] for i in range(0, len(links), n)]
    write_file = open('qalampir_articles.jsonl', 'a')
    
    threads = [threading.Thread(target=parse_and_write, args=(write_file, link,)) for link in links]
    for thread in threads:
        thread.start()

    for thread in threads:
        thread.join()


if __name__ == '__main__':
    main()
