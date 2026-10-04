# card-game

1対1の対戦型カードゲームの要求・ルール・モデル・設計を管理するリポジトリ。

## Core concept

- 単一盤面で Unit / Support / Tactic を運用する。
- Energy は1 Turnの1 Operationで使用できる基本出力予算として機能する。
- Momentum は追加能力や Block に使用し、使用した分が相手へ移転する。
- 1 Turnにつき1 Operationを完了し、その時点で相手Turnへ移る。
- Action と定義された Operation だけが Reaction Window を発生させる。
- Reaction は原則として事前に Board へコミットされた Card / Ability から行う。
- Attack は Reaction の後に Block Step と Combat を持つ。

## Documentation

- [Documentation index](docs/README.md)
- [Game requirements](docs/requirements/game-requirements.md)
- [Core rules](docs/rules/core-rules.md)
- [Domain model](docs/model/domain-model.md)
- [Card-pool architecture](docs/design/card-pool.md)

## Documentation policy

- requirements: ゲームが満たすべき要求
- process: 誰が、いつ、何を行い、どこへ制御が移るか
- rules: 現在有効な規範的ルール
- model: 用語・状態・データ構造
- design: 設計空間、バランス仮説、検証対象

検討履歴、却下案、未決事項の議論は仕様本文へ混ぜず、GitHub Issuesで管理する。
