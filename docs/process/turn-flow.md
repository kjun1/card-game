# Turn Flow

> Formal BPMN 2.0 model: [bpmn/turn-flow.bpmn](bpmn/turn-flow.bpmn)

## Purpose

Active Playerが制御権を取得してから、1つのOperationが完了しOpponentへ制御権を移すまでを定義する。

TurnはOperationそのものではない。Turn Start処理とOperation Selection / Resolutionを含む制御区間である。

## Participants

- Active Player
- Opponent
- Game System

## Review preview

~~~mermaid
flowchart TD
    S([Turn Start / Gain Control]) --> R[Ready Units]
    R --> L[Clear Deploy Attack Lock]
    L --> U[Increase Energy Capacity by 1 / max 7]
    U --> E[Refresh Energy to Capacity]
    E --> Q{Deck has a Card?}
    Q -- No --> X([Active Player Loses])
    Q -- Yes --> D[Draw 1]
    D --> H{Hand exceeds limit?}
    H -- Yes --> HD[Discard just-drawn Card]
    H -- No --> O[Select Operation]
    HD --> O
    O --> P[[Execute Selected Operation]]
    P --> G{Game ended?}
    G -- Yes --> GE([Game End])
    G -- No --> F{Operation completed?}
    F -- No / Cancelled --> O
    F -- Yes --> T([Turn End / Transfer Control])
~~~

## Semantics

- Turn Start処理はTurnにつき1回だけ行う。
- Energy CapacityはGame Setup時に2で初期化し、すべてのTurn Startで1増加する。
- EnergyはCapacity増加後にCapacityまで回復する。
- OperationはActive PlayerがTurn中に選択する主操作である。
- OperationまたはReactionの解決でGameが終了した場合、Operation完了判定より先にGame終了へ進み、再選択や制御権移転は行わない。
- Gameが終了しておらずActionがReactionでCancelされた場合、そのOperationは完了していないためOperation Selectionへ戻る。
- この再選択ではTurn Start処理を繰り返さない。
- 1 Turn中に複数のOperation選択が発生し得るが、Turnを終了させるcompleted Operationは1つだけである。
- 「何もしない」を選択した場合は、その選択をOperation CompleteとしてTurnを終了する。
- DrawによってHand Limitを超えた場合、そのDrawで得たCardを直ちにDiscardする。
