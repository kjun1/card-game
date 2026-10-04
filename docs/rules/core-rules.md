# Core Rules

この文書はGame全体に共通する規範的ルールを定義する。Resource、Combat、Deck固有ルールは各文書へ分離する。

## Game objective

2人のPlayerが対戦する。

以下のいずれかで相手を敗北させたPlayerが勝利する。

- 相手Core HPを0以下にする。
- 相手が必要なDrawを実行できない。

## Board

各Playerは以下のZoneを持つ。

- Deck
- Hand
- Unit Zone
- Support Zone
- Discard

Unit ZoneとSupport Zoneは単一盤面上に存在する。

## Card types

- Unit
- Support
- Tactic

詳細は ../model/card-model.md を参照する。

## Turn

Turnは、そのPlayerがTurn Start処理を行い、1回のOperationを完了するまでの区間である。

Operation完了時に相手PlayerのTurnへ移る。

### Turn Start order

1. 自分のUnitをReadyにする。
2. Deploy直後によるAttack制限を解除する。
3. 必要な場合Energy Capacityを増加する。
4. EnergyをCapacityまで回復する。
5. 1枚Drawする。

Draw不能なら即座に敗北する。

## Operation

Playerは1 Turnにつき1回のOperationを完了する。

Operation例:

- Unit Deploy
- Support Deploy
- Set
- Tactic Play
- Ability使用
- Attack
- 何もしない

何もしない場合、その時点でOperation Completeとする。

独立したPassルールは設けない。

## Action

ActionはReaction可能なOperationである。

Action Declaration後、必ずReaction Windowを開く。

ActionではないOperationには原則Reaction Windowを開かない。

### Reactionなし

Action Costを支払い、Action固有処理を解決し、Operation Completeとする。

### Reactionあり

1. Reaction Costを支払う。
2. Reactionを解決する。
3. 宣言済みActionをCancelする。
4. Action側の未払いEnergy Costは消費しない。
5. ReactionによるCost・状態変更は巻き戻さない。
6. Action側PlayerへOperation選択権を戻す。

Reactionに対するReactionは行わない。

再宣言されたActionには新しいReaction Windowを開く。

## Reaction Source

Reaction Sourceは原則Board上に存在する。

- Unit Ability
- Face-up Support Ability
- Set Card

Handから直接Reactionすることは基本ルールでは認めない。

## Information visibility

### Public
- Core HP
- Energy
- Momentum
- Unit
- Face-up Support
- Ready / Exhausted
- Accumulated Damage
- Zone使用数
- Set Cardの存在

### Hidden
- Deck内容
- Hand
- Set Cardの内容

## Core invariants

- 1 Turn = 1 completed Operation
- Operation Completeで相手Turnへ移る
- ActionのみReaction可能
- ReactionされたActionは成立しない
- Reaction後も同じPlayerのTurnを継続する
- Handからの直接Reactionなし
- Momentumは原則として両Player間で保存される

## Related rules

- Resource: resource-rules.md
- Combat: combat-rules.md
- Deck / Setup / Mulligan: deck-rules.md
