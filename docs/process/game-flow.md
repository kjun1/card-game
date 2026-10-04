# Game Flow

> Formal BPMN 2.0 model: [bpmn/game-flow.bpmn](bpmn/game-flow.bpmn)

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
| Prepare Decks | Parallel Tasks | 両PlayerのDeckを確定する |
| Coin Toss | Service Task | First Playerを決定する |
| Opening Draw | Service Task | 各PlayerへOpening Handを配る |
| Mulligan | Parallel User Tasks | 両Playerが独立に交換対象を選び同数Drawする |
| Return / Shuffle | Parallel User Tasks | 両Player完了後、退避CardをDeckへ戻してShuffleする |
| Initialize Game State | Service Task | Core / Energy / Momentum等を初期化する |
| Execute Turn | Sub-process | Active PlayerのTurnを処理する |
| Game End Condition? | Exclusive Gateway | 勝敗またはDrawが成立したか判定する |
| Switch Active Player | Service Task | Active Playerを相手へ切り替える |
| Game End | End Event | Win / Lose / Drawを確定して終了する |

## Review preview

~~~mermaid
flowchart TD
    S([Game Start]) --> P{{Prepare Decks in parallel}}
    P --> F[Coin Toss]
    F --> O[Opening Draw]
    O --> M{{Both Players Mulligan}}
    M --> R{{After both complete: return cards / shuffle}}
    R --> I[Initialize Game State]
    I --> T[[Execute Active Player Turn]]
    T --> E{Game End Condition?}
    E -- Yes --> X([Game End])
    E -- No --> W[Switch Active Player]
    W --> T
~~~

First Playerはコイントスで決定し、先攻・後攻補正は設けない。

Mulliganで退避したCardをDeckへ戻すのは、両Playerの交換処理が完了した後である。

同一処理によって両Playerの敗北条件が同時に成立した場合はDrawとする。
