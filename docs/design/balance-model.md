# Balance Model

## Purpose

数値調整を個別Cardの感覚だけで行わず、ゲーム全体のResource・Tempo・Board交換として評価する。

## Primary economic axes

### Energy

Game Setup時にEnergy Capacity / Energyを2で初期化し、自分の各Turn StartでCapacityを1増加してからEnergyをCapacityまで回復する。

したがって各Playerの最初の自分TurnではEnergy 3となる一方、後攻Playerも先攻Playerの最初のTurn中にSetup Energy 2をReactionへ使用できる。

Energyは自分のTurn Startから次の自分Turn Startまで利用できる基本Cost Budgetである。

このBudgetは、自分Turnで完了させるOperationと、Opponent Turn中に使用するReactionの双方で共有される。

### Momentum

現在の追加価値と相手の将来価値を交換する。

Momentum Costは単純な消費ではなく相手へのResource移転である。

### Board Capacity

Unit ZoneとSupport Zoneの有限Capacityによって継続価値を制約する。

満杯のZoneへ追加Deploy / Setはできず、基本ルールによる任意Discardで空きを作ることもできない。

Support ZoneではFace-up SupportとSet Cardが同じCapacityを競合する。

### Card availability

Handは現在利用可能な未コミット選択肢を表す。

Hand Limitを超えるDrawは、そのDrawn Card自体をDiscardするため、Hand Limit到達後の追加Draw価値は低下する。

## Provisional parameters

| Parameter | Value |
| --- | ---: |
| Core HP | 20 |
| Deck Size | 30 |
| Copies per Card Name | 3 |
| Opening Hand | 5 |
| Hand Limit | 7 |
| Unit Zone Capacity | 5 |
| Support Zone Capacity | 3 |
| Setup Energy Capacity | 2 |
| Setup Energy | 2 |
| First own Turn Energy | 3 |
| Maximum Energy Capacity | 7 |
| Total Momentum | 6 |
| Initial Momentum | 3 : 3 |

これらはルール構造から分離して調整可能なBalance Parameterとして扱う。

先攻・後攻補正は現時点では設けず、プレイテストで必要性を評価する。

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

- First-player win rate
- Average completed Operations per Game
- Average Game Duration
- Operation reselections per Turn
- Core Damage per Turn
- Energy spent on completed Operation
- Energy spent on Reactions
- Energy remaining after own Operation
- Unused Energy at next own Turn Start
- Hand-limit overflow count
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

- 先攻補正なしでFirst Player Advantageが許容範囲か。
- Setup Energy 2が後攻Playerの初回Reaction能力として適切か。
- Energyを自分Operationと相手Turn中のReactionへどう配分するかが意味のある判断になるか。
- 毎Turn全回復するEnergyのCost差が十分な意思決定になるか。
- Momentumが一方へ固定されず往復するか。
- Momentumの現在価値と相手へ渡す将来価値が釣り合うか。
- Reactionが戦略性を増やしつつ進行を過剰に停止させないか。
- BlockがCore Damageを完全に抑制しすぎないか。
- Support Zoneの継続価値とReaction準備の競合が有効な選択になるか。
- Hand Limit到達後のDraw処理が過度な不利益にならないか。

## Future baseline

Vanilla Unit Curve、Damage、Draw、Removal、Reaction、Momentum Ability等のPower Budgetは、最小Card Setを用いたプレイテスト結果から定義する。
