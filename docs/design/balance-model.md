# Balance Model

## Purpose

数値調整を個別Cardの感覚だけで行わず、ゲーム全体のResource・Tempo・Board交換として評価する。

## Primary economic axes

### Energy

Energyは自分のTurn StartでCapacityまで回復し、次の自分Turn Startまで利用できる基本Cost Budgetである。

このBudgetは、自分Turnで完了させるOperationと、Opponent Turn中に使用するReactionの双方で共有される。

したがってEnergyの評価では、単一OperationのCostだけでなく、相手TurnへどれだけEnergyを残すかも扱う。

### Momentum

現在の追加価値と相手の将来価値を交換する。

Momentum Costは単純な消費ではなく相手へのResource移転である。

### Board Capacity

Unit ZoneとSupport Zoneの有限Capacityによって継続価値を制約する。

Support ZoneではFace-up SupportとSet Cardが同じCapacityを競合する。

### Card availability

Handは現在利用可能な未コミット選択肢を表す。

## Provisional parameters

| Parameter | Value |
| --- | ---: |
| Core HP | 20 |
| Deck Size | 30 |
| Opening Hand | 5 |
| Hand Limit target | 7 |
| Unit Zone Capacity | 5 |
| Support Zone Capacity | 3 |
| Initial Energy Capacity | 3 |
| Maximum Energy Capacity | 7 |
| Total Momentum | 6 |
| Initial Momentum | 3 : 3 |

これらはルール構造から分離して調整可能なBalance Parameterとして扱う。

## Card valuation dimensions

- Energy効率
- 即時Board変化
- 継続Board価値
- Hand Advantage
- Core Damage期待値
- Unit Damage / Removal能力
- Reaction可能性
- Momentum Cost / Momentum供与量
- Zone占有
- Ability再利用性

## Momentum evaluation

Momentum 1の価値は通常Resource 1と同一視しない。

~~~text
Current benefit
-
Future opponent opportunity created by transferred Momentum
~~~

Block、Reaction、追加AbilityでMomentum用途が競合することも含めて評価する。

## Playtest metrics

- Average completed Operations per Game
- Average Game Duration
- Operation reselections per Turn
- Core Damage per Turn
- Energy spent on completed Operation
- Energy spent on Reactions
- Energy remaining after own Operation
- Unused Energy at next own Turn Start
- Momentum distribution over time
- Momentum spent per Player
- Block frequency
- Reaction Window frequency
- Reaction activation frequency
- Action cancel / redeclare count
- Unit survival duration
- Unit / Support Zone occupancy
- Cards in Hand over time
- Deck-out frequency

## Validation questions

- TurnとOperationの区別がプレイヤーに自然に理解できるか。
- Energyを自分Operationと相手Turn中のReactionへどう配分するかが意味のある判断になるか。
- 毎Turn全回復するEnergyのCost差が十分な意思決定になるか。
- Momentumが一方へ固定されず往復するか。
- Momentumの現在価値と相手へ渡す将来価値が釣り合うか。
- Reactionが戦略性を増やしつつ進行を過剰に停止させないか。
- BlockがCore Damageを完全に抑制しすぎないか。
- Support Zoneの継続価値とReaction準備の競合が有効な選択になるか。

## Future baseline

Vanilla Unit Curve、Damage、Draw、Removal、Reaction、Momentum Ability等のPower Budgetは、最小Card Setを用いたプレイテスト結果から定義する。
