# Game Flow

## Purpose

Game開始からGame終了までの最上位Processを定義する。

## Participants

- Player A
- Player B
- Game System

## BPMN-style elements

| Element | Type | Responsibility |
| --- | --- | --- |
| Game Start | Start Event | Game Processを開始する |
| Prepare Decks | Task | 両PlayerのDeckを確定する |
| Coin Toss | Task | First Playerを決定する |
| Opening Draw | Task | 各PlayerへOpening Handを配る |
| Mulligan | Parallel Activity | 両Playerが独立にMulliganする |
| Initialize Game State | Task | Core / Energy / Momentum等を初期化する |
| Execute Turn | Sub-process | Active PlayerのTurnを処理する |
| Game End Condition? | Exclusive Gateway | 勝敗またはDrawが成立したか判定する |
| Switch Active Player | Task | Active Playerを相手へ切り替える |
| Game End | End Event | Win / Lose / Drawを確定して終了する |

## Process

~~~mermaid
flowchart TD
    S([Game Start]) --> D[Prepare Decks]
    D --> F[Coin Toss / Determine First Player]
    F --> O[Opening Draw]
    O --> M{{Both Players Mulligan}}
    M --> I[Initialize Game State]
    I --> T[[Execute Active Player Turn]]
    T --> E{Game End Condition?}
    E -- Yes --> X([Game End])
    E -- No --> W[Switch Active Player]
    W --> T
~~~

First Playerはコイントスで決定する。

先攻・後攻に対する追加補正は設けない。

Game End ConditionはOperation完了時だけでなく、Core HPが0以下になった時点またはDraw不能が確定した時点で成立する。

同一処理によって両Playerの敗北条件が同時に成立した場合はDrawとする。
