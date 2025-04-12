## 在线音乐播放器

这是一个在线音乐播放器，集成api增加删除歌曲，方便批量添加

## api
```获取音乐列表:``` 
方式：GET
```
https://你的域名/api/music/list
```

```下载音乐到服务器：```
方式：GET
```
https://你的域名/api/download?url=音乐下载链接&name=保存后的歌曲名称
```
环境变量 ：url 必须  name 非必须

## 音乐直链链接
```支持的格式: mp3/wav/falc/m4a/ape```

https://你的域名/music/歌曲名-歌手.文件后缀名
