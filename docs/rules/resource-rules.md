# Resource Rules

## Resource definition

ResourceはPlayerが保持し、Costとして支払いまたは移転するゲーム通貨である。

本作の基本ResourceはEnergyとMomentumである。

## Energy

EnergyはCardやAbilityの基本利用に使用する。

各Playerが独立して保持し、相手へ移転しない。

| Parameter | Value |
| --- | ---: |
| Setup Energy Capacity | 2 |
| Setup Energy | 2 |
| Maximum Energy Capacity | 7 |

Game Setup時に各PlayerのEnergy CapacityとEnergyを2で初期化する。

すべての自分Turn Startで以下を処理する。

1. Energy Capacityを1増加する。最大7。
2. Energyを現在Capacityまで回復する。

Capacity増加はEnergy Refreshより先に行う。

したがって各Playerの最初の自分TurnではCapacity 3 / Energy 3となる。

Game Setup時のEnergy 2には、利用開始を最初の自Turnまで待つ制約はない。ただし、通常SetupではBoardにReaction Sourceがないため、最初の自Turn前には実際にReactionできない。Energyの保有と合法なSourceの存在は別の条件である。

Energyは、**自分のTurn Startから次の自分Turn Startまで** Card / Abilityの基本Costに利用できる予算である。

この期間には、自分Turnで完了させるOperationだけでなく、Opponent Turn中に使用するReaction Costも含まれる。

ReactionによってActionがCancelされOperationを選択し直しても、Energy Refreshは行わない。

## Momentum

Momentumは追加Abilityおよび一部の特殊処理に使用する。

| Parameter | Value |
| --- | ---: |
| Total Momentum | 6 |
| Initial Player A | 3 |
| Initial Player B | 3 |

PlayerがMomentum Nを使用した場合:

- 使用PlayerのMomentumをN減少させる。
- OpponentのMomentumをN増加させる。

原則:

~~~text
Momentum(A) + Momentum(B) = 6
~~~

Momentumを単純なEnergy代替としては扱わない。

## Cost timing

### Non-Action Operation Cost

合法性とCost支払い可能性を検証した後、Costを支払ってOperationを解決する。
不正なOperationではCostを消費せず、Operationを完了しない。

### Action Cost

Action Declaration時にはAction本体のEnergy Costを消費しない。
Reactionがなかった場合にCostを支払う。
ReactionされたActionの未払いEnergy Costは消費しない。

### Reaction Cost

Reactionを使用する場合はReaction Costを支払い、そのCostは戻らない。

### Block Cost

Block Abilityに設定されたCostをBlock Stepで支払う。

例:

~~~text
Momentum 2: Block
~~~

Momentumを使用した場合は通常のTransferを適用する。
