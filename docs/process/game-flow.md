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
| Mulligan Selection | Parallel User Tasks | 両Playerが独立に交換対象を選ぶ |
| Mulligan Exchange | Parallel Service Tasks | 選択Cardを退避して同数Drawし、両Player分の交換完了を待つ |
| Return / Shuffle | Parallel Service Tasks | 両Playerの交換完了後、退避CardをDeckへ戻してShuffleする |
| Initialize Game State | Service Task | Core / Energy / Momentum等を初期化する |
| Execute Turn | Sub-process | Active PlayerのTurnを処理する |
| Game End Reported? | Exclusive Gateway | Turn Flowから受け取った終了結果で分岐する |
| Switch Active Player | Service Task | Active Playerを相手へ切り替える |
| Finalize Game Result | Service Task | Turn Flowが評価したWin / Lose / DrawをGameの結果として確定する |
| Game End | End Event | Game全体を終了する |

## Review preview

~~~mermaid
flowchart TD
    S([Game Start]) --> P{{Prepare Decks in parallel}}
    P --> F[Coin Toss]
    F --> O[Opening Draw]
    O --> M{{Mulligan in parallel}}
    M --> MA[Player A selects Mulligan Cards]
    M --> MB[Player B selects Mulligan Cards]
    MA --> XA[System: Set Aside / Draw A]
    MB --> XB[System: Set Aside / Draw B]
    XA --> J{{Both exchanges complete}}
    XB --> J
    J --> R{{System: return cards / shuffle for each Player}}
    R --> I[Initialize Game State]
    I --> T[[Execute Active Player Turn]]
    T --> E{Game End Reported?}
    E -- Yes --> FGR[Finalize Game Result]
    FGR --> X([Game End])
    E -- No --> W[Switch Active Player]
    W --> T
~~~

First Playerはコイントスで決定し、先攻・後攻補正は設けない。

Mulliganで退避したCardをDeckへ戻すのは、両Playerの交換処理が完了した後である。

同一処理によって両Playerの敗北条件が同時に成立した場合はDrawとする。

勝敗条件の評価はTurn Flowが行う。Game Flowは返された`gameEnded`と結果を使用し、盤面から勝敗を再判定しない。終了が報告された場合は結果を確定し、継続の場合だけActive Playerを切り替える。
