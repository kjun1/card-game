# card-game

1対1の対戦型カードゲームの要求・ルール・モデル・設計を管理するリポジトリ。

## Core concept

- 単一盤面で Unit / Support / Tactic を運用する。
- Turn は Active Player が制御権を持つ区間であり、Turn Startから1つのOperationが完了するまで続く。
- Operation は Active Player がTurn中に選択する主操作であり、完了すると相手へ制御権が移る。
- ReactionでActionがCancelされた場合、そのOperationは完了していないため同じTurnでOperationを選択し直す。
- Energy は自分のTurn Startで回復し、次の自分Turn StartまでCard / Abilityの基本Costに使用する。
- Momentum は追加能力や Block に使用し、使用した分が相手へ移転する。
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
