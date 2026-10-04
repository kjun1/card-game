# Action / Reaction Flow

## Purpose

Actionとして定義されたOperationに対するReaction処理とOperation完了条件を定義する。

## Principle

- ActionだけがReaction Windowを発生させる。
- ActionではないOperationはReactionを挟まず解決する。
- Reactionを受けたActionは成立しない。
- Reaction後も同じTurnを継続する。

## Process

~~~mermaid
flowchart TD
    S[Select Operation] --> A{Is Action?}
    A -- No --> N[Resolve Operation]
    N --> C([Operation Complete])

    A -- Yes --> D[Declare Action]
    D --> R{Opponent uses Reaction?}
    R -- Yes --> RC[Pay Reaction Cost]
    RC --> RR[Resolve Reaction]
    RR --> X[Cancel Declared Action]
    X --> S

    R -- No --> AC[Pay Action Cost]
    AC --> AR[Resolve Action]
    AR --> C
~~~

## Cost semantics

Action本体のEnergy CostはDeclaration時点では消費しない。

Reactionが使用された場合:

- Reaction側Costは消費する。
- Reaction Effectを解決する。
- 元ActionをCancelする。
- 元Actionの未払いEnergy Costは消費しない。
- Reactionによる状態変更は巻き戻さない。

## Repetition

Reaction後に新しく宣言されたActionは、新しいReaction Windowを発生させる。

Reaction回数に一律のシステム上限は設けない。

Reactionに対するReactionは発生させない。
