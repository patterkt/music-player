## 这是一个音乐直链服务

## api
```获取音乐列表:```
```
https://your—doamin/api/music/list
```

下载音乐到服务器：
GET http://你的ip:5000/api/download?url=音乐下载链接&name=保存后的歌曲名称
或
https://你的域名/api/download?url=音乐下载链接&name=保存后的歌曲名称

环境变量 ：url 必须  name 非必须

音乐直链链接,支持的格式.mp3/.wav/.falc/.m4a
http://你的ip:5000/music/歌曲名.mp3 或 https://你的域名/music/歌曲名.mp3


