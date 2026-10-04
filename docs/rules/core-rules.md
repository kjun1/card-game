# Core Rules

この文書はGame全体に共通する規範的ルールを定義する。Resource、Combat、Deck固有ルールは各文書へ分離する。

## Game objective

2人のPlayerが対戦する。

以下のいずれかで相手を敗北させたPlayerが勝利する。

- 相手Core HPを0以下にする。
- 相手が必要なDrawを実行できない。

同一のEffect、Combat Resolution、State Check等によって両Playerの敗北条件が同時に成立した場合、GameはDrawとして終了する。

## Board

各Playerは以下のZoneを持つ。

- Deck
- Hand
- Unit Zone
- Support Zone
- Discard

Unit ZoneとSupport Zoneは単一盤面上に存在する。

Zone Capacityを超えるDeploy / Setは実行できない。

Playerは基本ルールによって自分のUnit / Supportを任意にDiscardして空きを作ることはできない。Card Effect等による移動・Destroyはこの制約の対象外である。

## Card types

- Unit
- Support
- Tactic

詳細は ../model/card-model.md を参照する。

## Turn

Turnは、**Active Playerがゲーム進行の制御権を持つ区間**である。

Turn Startから始まり、そのTurnで選択された1つのOperationが完了した時点で終了する。Turn終了後、Opponentが新しいActive Playerとなる。

ActionがReactionによってCancelされた場合、そのActionを含むOperationは完了していない。そのためTurnは終了せず、同じActive PlayerがOperationを選択し直す。

したがって、1 Turn中に複数回のOperation選択やAction Declarationが発生することはあるが、Turnを終了させるcompleted Operationは1つだけである。

### Turn Start order

1. 自分のUnitをReadyにする。
2. Deploy直後によるAttack制限を解除する。
3. Energy Capacityを1増加する。最大7。
4. EnergyをCapacityまで回復する。
5. 1枚Drawする。
6. DrawによってHand Limitを超えた場合、そのDrawで得たCardを直ちにDiscardする。

Draw不能なら即座に敗北する。

Turn Start処理はTurn中に一度だけ実行し、ReactionによるOperation再選択では再実行しない。

## Operation

Operationは、**Active PlayerがTurn中に選択する主操作**である。

Operation例:

- Unit Deploy
- Support Deploy
- Set
- Tactic Play
- Ability使用
- Attack
- 何もしない

Operationは、解決または「何もしない」の選択によって完了する。

Actionに分類されるOperationがReactionでCancelされた場合、そのOperationは完了せず、同じTurn内でOperation Selectionへ戻る。

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
6. Operationは未完了のため、同じActive PlayerへOperation選択権を戻す。

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

- TurnはActive Playerが制御権を持つ区間である。
- Turn Start処理は各Turnにつき1回だけ行う。
- completed Operationが1つ発生するとTurnが終了し、Opponentへ制御権が移る。
- CancelされたActionはOperation Completeを発生させない。
- ActionのみReaction可能。
- ReactionされたActionは成立しない。
- Reaction後も同じActive PlayerのTurnを継続する。
- Handからの直接Reactionなし。
- Momentumは原則として両Player間で保存される。

## Related rules

- Resource: resource-rules.md
- Combat: combat-rules.md
- Deck / Setup / Mulligan: deck-rules.md
