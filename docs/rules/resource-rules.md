# Resource Rules

## Resource definition

ResourceはPlayerが保持し、Costとして支払いまたは移転するゲーム通貨である。

本作の基本ResourceはEnergyとMomentumである。

## Energy

EnergyはCardやAbilityの基本利用に使用する。

各Playerが独立して保持し、相手へ移転しない。

| Parameter | Value |
| --- | ---: |
| Initial Energy Capacity | 3 |
| Maximum Energy Capacity | 7 |

各Playerの最初のTurnではCapacity 3を使用する。

2回目以降の自分Turn開始時:

1. Energy Capacityを1増加する。最大7。
2. Energyを現在Capacityまで回復する。

Capacity増加はEnergy Refreshより先に行う。

Energyは1 Turnに1回だけ行うOperationの基本出力上限として機能する。

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
