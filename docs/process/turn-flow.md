# Turn Flow

## Purpose

1 Turnの開始からOperation完了による制御移譲までを定義する。

## Participants

- Active Player
- Opponent
- Game System

## Process elements

| Element | Type | Responsibility |
| --- | --- | --- |
| Turn Start | Start Event | Active PlayerのTurnを開始する |
| Ready Units | Task | Active PlayerのUnitをReadyにする |
| Clear Deploy Attack Lock | Task | Deploy直後Attack制限を解除する |
| Increase Capacity | Conditional Task | 2回目以降の自分TurnでEnergy Capacityを+1する |
| Refresh Energy | Task | EnergyをCapacityまで回復する |
| Draw | Task | 1枚Drawする |
| Deck Empty? | Exclusive Gateway | Draw可能か判定する |
| Select Operation | User Task | Active PlayerがOperationを選択する |
| Execute Operation | Sub-process | 選択Operationを処理する |
| Operation Complete | End Event | Turnを完了しOpponentへ制御を渡す |

## Process

~~~mermaid
flowchart TD
    S([Turn Start]) --> R[Ready Units]
    R --> L[Clear Deploy Attack Lock]
    L --> C{Second or later own Turn?}
    C -- Yes --> U[Increase Energy Capacity by 1 / max 7]
    C -- No --> E[Refresh Energy to Capacity]
    U --> E
    E --> D[Draw 1]
    D --> Q{Card available?}
    Q -- No --> X([Active Player Loses])
    Q -- Yes --> O[Select Operation]
    O --> P[[Execute Operation]]
    P --> F([Operation Complete / Turn End])
~~~

ActionがReactionによりCancelされた場合、Operationは完了していないためSelect Operationへ戻る。

「何もしない」を選択した場合は、その時点でOperation Completeとなる。
