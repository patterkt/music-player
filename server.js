const express = require('express');
const path = require('path');
const fs = require('fs');
const rangeParser = require('range-parser');
const bytes = require('bytes');
const NodeCache = require('node-cache');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
// Add default value for MUSIC_DIR
const musicDir = path.join(__dirname, '..', process.env.MUSIC_DIR || 'music');

// 创建缓存实例，TTL 设置为1小时
const cache = new NodeCache({ 
  stdTTL: 3600,
  checkperiod: 120,
  maxKeys: 100  // 最多缓存100个文件的信息
});

// 流量统计
const stats = {
  totalBytes: 0,
  requests: 0
};

// 静态文件服务
app.use('/static', express.static(musicDir));

// 直链生成
app.get('/music/:filename', async (req, res) => {
  const filename = req.params.filename;
  
  // 检查文件名是否合法
  if (!filename.match(/^[a-zA-Z0-9\u4e00-\u9fa5][a-zA-Z0-9\u4e00-\u9fa5\s\-_.]+\.(mp3|wav|flac|m4a)$/)) {
    return res.status(400).send('Invalid filename');
  }

  const normalizedPath = path.normalize(filename);
  if (normalizedPath.includes('..')) {
    return res.status(403).send('Access denied');
  }

  const filepath = path.join(musicDir, filename);

  // 从缓存获取文件信息
  let fileInfo = cache.get(filepath);
  if (!fileInfo) {
    try {
      const stat = await fs.promises.stat(filepath);
      fileInfo = {
        size: stat.size,
        mtime: stat.mtime.toUTCString(),
        exists: true
      };
      cache.set(filepath, fileInfo);
    } catch (err) {
      return res.status(404).send('File not found');
    }
  }

  const range = req.headers.range;

  // 设置通用响应头
  res.set({
    'Cache-Control': 'public, max-age=3600',
    'Last-Modified': fileInfo.mtime,
    'Accept-Ranges': 'bytes',
    'Content-Type': 'audio/mpeg'
  });

  // 处理范围请求
  if (range) {
    const ranges = rangeParser(fileInfo.size, range);
    
    if (ranges === -1 || ranges === -2) {
      return res.status(416).send('Range not satisfiable');
    }

    const { start, end } = ranges[0];
    const chunk = end - start + 1;

    res.status(206);
    res.set({
      'Content-Range': `bytes ${start}-${end}/${fileInfo.size}`,
      'Content-Length': chunk
    });

    const stream = fs.createReadStream(filepath, { 
      start, 
      end,
      highWaterMark: 64 * 1024 // 64KB 缓冲区
    });

    stats.totalBytes += chunk;
    stats.requests += 1;

    stream.on('error', (error) => {
      console.error(`Stream error for ${filename}:`, error);
      if (!res.headersSent) {
        res.status(500).send('Internal server error');
      }
    });

    stream.pipe(res);
  } else {
    res.set({
      'Content-Length': fileInfo.size
    });

    const stream = fs.createReadStream(filepath, {
      highWaterMark: 64 * 1024 // 64KB 缓冲区
    });

    stats.totalBytes += fileInfo.size;
    stats.requests += 1;

    stream.on('error', (error) => {
      console.error(`Stream error for ${filename}:`, error);
      if (!res.headersSent) {
        res.status(500).send('Internal server error');
      }
    });

    stream.pipe(res);
  }
});

// 统计接口
app.get('/stats', (req, res) => {
  res.json({
    totalTransferred: bytes(stats.totalBytes),
    totalRequests: stats.requests
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});