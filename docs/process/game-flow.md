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
| Determine First Player | Task | 最初のActive Playerを決める |
| Opening Draw | Task | 各PlayerへOpening Handを配る |
| Mulligan | Parallel Activity | 両Playerが独立にMulliganする |
| Initialize Game State | Task | Core / Energy / Momentum等を初期化する |
| Execute Turn | Sub-process | Active PlayerのTurnを処理する |
| Game End Condition? | Exclusive Gateway | 勝敗が成立したか判定する |
| Switch Active Player | Task | Active Playerを相手へ切り替える |
| Game End | End Event | 勝敗を確定して終了する |

## Process

~~~mermaid
flowchart TD
    S([Game Start]) --> D[Prepare Decks]
    D --> F[Determine First Player]
    F --> O[Opening Draw]
    O --> M{{Both Players Mulligan}}
    M --> I[Initialize Game State]
    I --> T[[Execute Active Player Turn]]
    T --> E{Game End Condition?}
    E -- Yes --> X([Game End])
    E -- No --> W[Switch Active Player]
    W --> T
~~~

Game End ConditionはOperation完了時だけでなく、Core HPが0以下になった時点またはDraw不能が確定した時点で成立する。

## Related specifications

- Requirements: ../requirements/game-requirements.md
- Turn process: turn-flow.md
- Deck rules: ../rules/deck-rules.md
- Core rules: ../rules/core-rules.md
