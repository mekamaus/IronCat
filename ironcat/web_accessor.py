from urllib.request import urlopen


def web_get(data):
    response = urlopen('http://python.org/')
    print(response.read())
    return data


def web_post(data):
    return data
