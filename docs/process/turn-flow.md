# Turn Flow

> Formal BPMN 2.0 model: [bpmn/turn-flow.bpmn](bpmn/turn-flow.bpmn)

## Purpose

Active Playerが制御権を取得してから、Operation完了またはGame終了の結果をGame Flowへ返すまでを定義する。Player切替とGame全体の終了処理はGame Flowが行う。

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
    Q -- No --> X[Record Failed Required Draw]
    X --> V[Evaluate Win / Lose / Draw]
    Q -- Yes --> D[Draw 1]
    D --> H{Hand exceeds limit?}
    H -- Yes --> HD[Discard just-drawn Card]
    H -- No --> O[Select Operation]
    HD --> O
    O --> P[[Execute Selected Operation]]
    P --> V
    V --> G{Game ended?}
    G -- Yes --> GE([Game End Reported])
    G -- No --> F{Operation completed?}
    F -- No / Invalid or Cancelled --> O
    F -- Yes --> T([Turn Complete])
~~~

## Semantics

- Turn Start処理はTurnにつき1回だけ行う。
- Energy CapacityはGame Setup時に2で初期化し、すべてのTurn Startで1増加する。
- EnergyはCapacity増加後にCapacityまで回復する。
- OperationはActive PlayerがTurn中に選択する主操作である。
- Operation Flowは完了状態と、当該解決に属するEffectを反映したStateを返す。Turn FlowがCore HP・Draw失敗等の敗北条件を評価し、`gameEnded`と勝敗またはDrawの結果を決定する。
- Turn StartのDraw不能も失敗を記録して同じ勝敗評価へ渡す。Operation選択へは進まない。
- 同じ解決で両Playerの敗北条件が成立した場合はDrawとして報告する。
- OperationまたはReactionの解決でGameが終了した場合、Operation完了判定より先にGame終了へ進み、再選択や制御権移転は行わない。
- Gameが終了しておらず非Actionの検証失敗またはActionのCancelでOperationが未完了の場合、Operation Selectionへ戻る。
- この再選択ではTurn Start処理を繰り返さない。
- 1 Turn中に複数のOperation選択が発生し得るが、Gameが継続する通常のTurn終了ではcompleted Operationは1つだけである。Draw不能や致死Reactionによってcompleted Operationが0のままGameが終了する場合もある。
- 「何もしない」を選択した場合は、その選択をOperation CompleteとしてTurnを終了する。
- DrawによってHand Limitを超えた場合、そのDrawで得たCardを直ちにDiscardする。
- `Game End Reported`は`gameEnded = true`と評価結果を、`Turn Complete`は`gameEnded = false`をGame Flowへ返す。Game Flowは受け取った結果に従ってGame終了またはPlayer切替を行う。
