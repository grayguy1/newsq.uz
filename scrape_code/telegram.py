from telethon import TelegramClient
import os, re
from datetime import datetime, date

api_id = '1156429'
api_hash = '2102334474a113ff99f4ffdb80657aec'
messages = []

count = 0
channels = ['kunuzofficial', 'daryo', 'qalampir']
errors = 0
def get_links(text):
    return re.findall("(?P<url>https?://[^\s]+)", text)

for channel in channels:
    keyword = 'kun.uz/' if channel == 'kunuzofficial' else ("dy.uz" if channel == 'daryo' else channel)
    with TelegramClient('anon', api_id, api_hash) as client:
        try:
            for message in client.iter_messages(channel):
                print(channel)
                print(count)
                print(errors)
                try:
                    d = message.date
                    if d.date() < date(2020, 1, 1): 
                        print(date)
                        break
                    
                    if message.message is not None and message.message != '':
                        links = get_links(message.message.replace('\n', ' '))
                        print(links)
                        links = list(filter(lambda x: keyword in x, links))
                        messages.append(links[0])
                        count += 1
                except: 
                    print("inside error")
                    errors += 1
                if count == 10000: break
        except:
            print('error happened')
            errors += 1

        with open('telegram/' + channel + '.txt', 'w') as the_file:
            for line in messages:
                the_file.write(line + '\n')
        the_file.close()
        count = 0
        errors = 0
        messages = []
