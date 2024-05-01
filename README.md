# Air Poker (inspired by 嘘喰い)

[![Build Status](https://github.com/darai0512/air-poker/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/darai0512/air-poker/actions)

## Rule

- 原作になるべく沿いつつ、ゲーム性を第一に改変
- プレイヤーは上側と下側を一人で同時にこなす
- ベットフェーズにおいては、上側のルールを優先する
  - ペアを作るまで相手の数字を見れない
  - 下を優先してベット時にカードオープンしてしまうと、（ネタバレ済のため）相手の役がわかり、ベットが単調になる

### 原作との差異

- カード消費がないケース(v42p183)
  - 役作りで使用済みカードを使うミスした時
  - 制限時間オーバー
  - 天災

## Reference

- https://phmpk.hatenablog.com/entry/2016/06/11/073000
- card animation
  - https://codepen.io/agdales/pres/qbrRvp
- Trump design: ["白魔空間"](http://shiroma.client.jp/download/material/trump_23x32/)

# for Developper
## Local dev

```
$docker compose exec mongo /bin/sh
sh-4.4# mongosh mongodb://root:root@localhost:27778/?directConnection=true
> use test
> show collections
> db.matching.find({})
> db.matching.drop()
```