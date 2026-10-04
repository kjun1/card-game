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
    Q -- No --> X[Record Failed Draw / Fix Defeat Result]
    X --> V[Receive Fixed Result]
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
- Operation Flowは[Effect Resolution Model](../model/effect-resolution-model.md)に従ってEffectStepを処理し、勝敗成立時に結果を固定する。Turn Flowへは、その時点までに適用したStateと`gameEnded`、固定済みの結果を返す。Turn Flowは残りのEffectStepを再開せず、結果を再評価しない。
- Turn StartのDraw不能は、その場でActive Playerの敗北とOpponentの勝利を固定する。Operation選択へは進まない。
- 同時と定義された1つの処理で両Playerの敗北条件が同時に成立した場合はDrawとして報告する。同じEffect内の別々の逐次処理を同時成立とみなさない。
- OperationまたはReactionの途中でもGameが終了したら、Operation完了判定より先に固定済みの結果をGame Flowへ返し、後続Effect・再選択・制御権移転を行わない。
- Gameが終了しておらず非Actionの検証失敗またはActionのCancelでOperationが未完了の場合、Operation Selectionへ戻る。
- この再選択ではTurn Start処理を繰り返さない。
- 1 Turn中に複数のOperation選択が発生し得るが、Gameが継続する通常のTurn終了ではcompleted Operationは1つだけである。Draw不能や致死Reactionによってcompleted Operationが0のままGameが終了する場合もある。
- 「何もしない」を選択した場合は、その選択をOperation CompleteとしてTurnを終了する。
- DrawによってHand Limitを超えた場合、そのDrawで得たCardを直ちにDiscardする。
- Discard移動時の公開範囲は[Information Model](../model/information-model.md#current-visibility)に従う。現在の閲覧権と過去の観測情報は別の責任として扱う。
- `Game End Reported`は`gameEnded = true`と固定済みの結果を、`Turn Complete`は`gameEnded = false`をGame Flowへ返す。Game Flowは受け取った結果に従ってGame終了またはPlayer切替を行う。

完了状態はProcess間の報告情報であり、Game終了後に追加のゲーム処理を行う指示ではない。全Effectを解決済みのOperationの完了記録やReactionによる元ActionのCancel記録は維持するが、終了時にTurn Flowはその記録を使って再選択・Player切替へ進まない。
