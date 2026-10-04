# card-game

1対1の対戦型カードゲームのルール・設計リポジトリ。

## Core concept

- 単一盤面でUnit / Support / Tacticを運用する。
- 基本資源 `Energy` と、使用すると相手へ移転する副次資源 `Momentum` を持つ。
- 1 Turnにつき1 Operationを行い、完了すると相手Turnへ移る。
- `Action` と定義されたOperationだけがReaction可能。
- Reactionは原則として事前にBoardへコミットされたCard / Abilityから行う。
- AttackではReaction後にBlock Stepを持つ。

## Documentation

- [Documentation index](docs/README.md)
- [Core rules](docs/rules/core-rules.md)
- [System model](docs/design/system-model.md)
- [Card-pool architecture](docs/design/card-pool.md)

## Documentation policy

- `docs/rules/`: 現在有効なルールのみを記述する。
- `docs/design/`: ルールを支える概念・責任・設計境界を記述する。
- 検討履歴や未決事項は仕様本文へ混ぜず、GitHub Issuesで管理する。
