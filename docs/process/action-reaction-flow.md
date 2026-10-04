# Action / Reaction Flow

> Formal BPMN 2.0 model: [bpmn/action-reaction-flow.bpmn](bpmn/action-reaction-flow.bpmn)

## Purpose

Actionとして定義されたOperationに対するReaction処理とOperation完了条件を定義し、完了状態と更新後のGame StateをTurn Flowへ返す。

## Principle

- ActionだけがReaction Windowを発生させる。
- ActionではないOperationはReactionを挟まず解決する。
- Reactionを受けたActionは成立しない。
- Reaction後、Gameが終了していなければ同じTurnを継続する。
- Reactionに対するReactionは発生させない。

## Review preview

~~~mermaid
flowchart TD
    S[Operation Selected] --> A{Is Action?}
    A -- No --> N[Resolve Operation]
    N --> C([Operation Complete])

    A -- Yes --> D[Declare Action]
    D --> VA[Validate Action]
    VA --> AV{Action valid?}
    AV -- No --> D
    AV -- Yes --> R[Opponent chooses Reaction, targets or decline]
    R --> VR[Validate Reaction]
    VR --> RV{Reaction valid?}
    RV -- No --> R
    RV -- Yes --> G{Use Reaction?}
    G -- Yes --> RC[Pay Reaction Cost]
    RC --> RR[Resolve Reaction]
    RR --> X[Cancel Declared Action]
    X --> U([Operation Incomplete])

    G -- No --> AC[Pay Action Cost]
    AC --> AR[Resolve Action]
    AR --> C
~~~

`Operation Complete`は`operationCompleted = true`、`Operation Incomplete`は`operationCompleted = false`を更新後のGame Stateとともに[Turn Flow](turn-flow.md)へ返す。

Game終了判定とOperation再選択の判断はTurn Flowが行う。Reactionで致死状態になった場合も、まずGame終了判定を行う。

## Selection and validation

- Active PlayerはActionのSource・Target等を宣言し、OpponentはReactionのSource・Target等を選択するか辞退する。
- Game SystemはAction宣言の合法性とCost支払い可能性を検証し、合法な宣言だけがReaction Windowを開く。
- Reactionの辞退は有効な選択として扱う。Reactionを選択した場合は、Game SystemがSource・Timing・Target・Cost支払い可能性を検証する。
- 不正なAction宣言は宣言へ、不正なReactionはReaction選択へ戻る。検証失敗ではCost消費・Effect解決・Action Cancelを行わない。

## Cost semantics

Action本体のEnergy CostはDeclaration時点では消費しない。

Cost支払いはGame SystemのService Taskとする。検証後に設定されたCostを引き、Momentumを使用した場合は同量をOpponentへ移転する。

Reactionが使用された場合:

- Reaction側Costは消費する。
- Reaction Effectを解決する。
- 元ActionをCancelする。
- 元Actionの未払いEnergy Costは消費しない。
- Reactionによる状態変更は巻き戻さない。

再宣言されたActionは新しいReaction Windowを発生させる。Reaction回数に一律のシステム上限は設けない。
