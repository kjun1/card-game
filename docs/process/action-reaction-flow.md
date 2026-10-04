# Action / Reaction Flow

> Formal BPMN 2.0 model: [bpmn/action-reaction-flow.bpmn](bpmn/action-reaction-flow.bpmn)

## Purpose

Actionとして定義されたOperationに対するReaction処理とOperation完了条件を定義する。

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
    D --> R[Opponent chooses Reaction or decline]
    R --> G{Use Reaction?}
    G -- Yes --> RC[Pay Reaction Cost]
    RC --> RR[Resolve Reaction]
    RR --> X[Cancel Declared Action]
    X --> U([Operation Not Complete / Reselect])

    G -- No --> AC[Pay Action Cost]
    AC --> AR[Resolve Action]
    AR --> C
~~~

Operation解決後のGame終了判定は[Turn Flow](turn-flow.md)で行う。ReactionでGameが終了した場合も、Operation再選択よりGame終了を優先する。

## Cost semantics

Action本体のEnergy CostはDeclaration時点では消費しない。

Reactionが使用された場合:

- Reaction側Costは消費する。
- Reaction Effectを解決する。
- 元ActionをCancelする。
- 元Actionの未払いEnergy Costは消費しない。
- Reactionによる状態変更は巻き戻さない。

再宣言されたActionは新しいReaction Windowを発生させる。Reaction回数に一律のシステム上限は設けない。
