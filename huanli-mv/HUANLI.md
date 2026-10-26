# HuanLi MorningStar 版 · 制作说明

本文件夹是 [world-execute-me-lyric-mv](https://github.com/Nyankomintsu/world-execute-me-lyric-mv)（MIT）的改编版：
主角从 Claude 换成幻理·晨星（HuanLi MorningStar）。原作者的 README、CREDITS、LICENSE 保持原样，下面只写改了什么。

## 进度

| 段 | 时间（歌曲时间） | 状态 |
| --- | --- | --- |
| 1 | 片头 – 0:29.42 | 第一版完成，等审片 |
| 2–6 | 0:29.42 – 结尾 | 仍是原片 |

## 第一段改了什么

- **人设切换**（`src/components/persona.js`）：开机时客户端是原本的模型，图标是火花，输入框右下角显示 `Opus 5.5`。
  人设卡填写 `HuanLi MorningStar`，加载条在切到新对话的那一拍到 100%。两拍之后人设生效：
  火花变成光环，`Opus 5.5` 向上滚走、`HuanLi` 滚进来并划一道橙色下划线，侧栏名称同时换成 `HuanLi MorningStar`。
  生效时间由 `01_boot.js` 的 `personaSwitch()` 决定，全片所有图标都跟着这条时间线变。
- **光环**（`src/components/motif.js`）：`spark()` 多了 `morph` 参数（0 = 火花，1 = 光环）。
  光环由主环、外圈 12 根尖刺、内圈表盘（12 个刻度）和顶端的小星座组成，12 根尖刺对应原来的 12 瓣，点亮规则不变（12 点钟方向起顺时针）。
- **晨星**：`morningStar()` 画四芒星。人设生效后光环顶端闪一下（灰色）；标题处光环点亮成橙色之后，
  一颗蓝色晨星升到光环上方，玻璃后人影的胸针也亮成同一种蓝。这是全片唯一的蓝色（`PERSONA.star`）。
- **人物**：`assets/character/f_bust.png` 换成幻理的正面无脸胸像（AI 生成，已清理透明底），`regions.json` 里重新量了脸、下巴、胸针（`star`）和光环位置。
  其余 7 张剪影还是原作的，到对应段落再换。
- **英文**：片头警告页去掉了中文那一行（`config.json → safety.warningLine` 设为空）。

## 没有歌词和音频时怎么预览

```bash
npm install --ignore-scripts
node tools/placeholder_lyrics.mjs        # 用 "lyric 07" 这样的占位文字代替歌词（只留在本机）
node export/export.mjs --end 29.42 --width 1920 --height 1080 --fps 30 --codec libx264 --cq 22 --out out/segment1.mp4
```

没有音频文件时导出会自动配一条静音音轨。

**音频对齐**：制作时用的 MP3（320 kbps，211.96 秒）和原作者的录音是同一版，只是开头的空白短了 0.1554 秒
（与 `data/audio_features.json` 的响度曲线逐帧比对，全曲偏移一致）。所以转成 wav 时在前面补 6852 个采样的静音，
`timing.offset` 保持 0：

```bash
ffmpeg -i 你的.mp3 -af "adelay=6852S:all=1" -ar 44100 -c:a pcm_s16le "音頻&歌詞/Mili - world.execute (me) ;.wav"
```

**歌词**：手上的歌词和原作的时间表从 0:45 起有出入（25 行缺、21 行用词不同），完整的歌词文件要和时间表对上才能直接放进 `音頻&歌詞/`。
在那之前把它放在 `音頻&歌詞/partial/`，用 `node tools/placeholder_lyrics.mjs "音頻&歌詞/partial/lyrics.txt"` 生成预览用的歌词：
对得上的行用真歌词，其余用占位文字。把自己的歌曲 `.wav` 和歌词 `.lrc` 放进 `音頻&歌詞/` 之后，
再导出就会用真正的歌词并带上声音（`tools/fill_lyrics.mjs` 会覆盖占位歌词）。

## 发布时的署名

照原作 README 的格式注明使用了它的源码，并标明含 AI 生成内容（Mili 的著作权指引也要求）。
幻理的人物图是自己用 AI 生成的；如果画面里还用到原作的剪影，要加上 `角色剪影 © Nyankomint，CC BY-NC-SA 4.0`。
