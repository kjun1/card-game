# Turn Flow

## Purpose

Active Playerが制御権を取得してから、1つのOperationが完了しOpponentへ制御権を移すまでを定義する。

TurnはOperationそのものではない。Turn Start処理とOperation Selection / Resolutionを含む制御区間である。

## Participants

- Active Player
- Opponent
- Game System

## Process elements

| Element | Type | Responsibility |
| --- | --- | --- |
| Turn Start | Start Event | Active Playerが制御権を取得する |
| Ready Units | Task | Active PlayerのUnitをReadyにする |
| Clear Deploy Attack Lock | Task | Deploy直後Attack制限を解除する |
| Increase Capacity | Conditional Task | 2回目以降の自分TurnでEnergy Capacityを+1する |
| Refresh Energy | Task | EnergyをCapacityまで回復する |
| Draw | Task | 1枚Drawする |
| Deck Empty? | Exclusive Gateway | Draw可能か判定する |
| Select Operation | User Task | Active Playerが主操作を選択する |
| Execute Operation | Sub-process | 選択したOperationを処理する |
| Operation Complete? | Exclusive Gateway | 選択Operationが完了したか判定する |
| Turn End | End Event | Opponentへ制御権を移す |

## Process

~~~mermaid
flowchart TD
    S([Turn Start / Gain Control]) --> R[Ready Units]
    R --> L[Clear Deploy Attack Lock]
    L --> C{Second or later own Turn?}
    C -- Yes --> U[Increase Energy Capacity by 1 / max 7]
    C -- No --> E[Refresh Energy to Capacity]
    U --> E
    E --> D[Draw 1]
    D --> Q{Card available?}
    Q -- No --> X([Active Player Loses])
    Q -- Yes --> O[Select Operation]
    O --> P[[Execute Selected Operation]]
    P --> F{Operation completed?}
    F -- No / Cancelled --> O
    F -- Yes --> T([Turn End / Transfer Control])
~~~

## Semantics

- Turn Start処理はTurnにつき1回だけ行う。
- OperationはActive PlayerがTurn中に選択する主操作である。
- ActionがReactionでCancelされた場合、そのOperationは完了していないためOperation Selectionへ戻る。
- この再選択ではTurn Start処理を繰り返さない。
- 1 Turn中に複数のOperation選択が発生し得るが、Turnを終了させるcompleted Operationは1つだけである。
- 「何もしない」を選択した場合は、その選択をOperation CompleteとしてTurnを終了する。
