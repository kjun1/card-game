# Domain Model

## Purpose

ゲームを構成する主要概念と関係を定義する。

## Model

~~~mermaid
classDiagram
    class Game
    class Player {
      +Energy
      +Momentum
    }
    class Core {
      +HP
    }
    class Deck
    class Hand
    class UnitZone
    class SupportZone
    class Discard
    class Card
    class Unit
    class Support
    class Tactic
    class Turn
    class Operation
    class Action
    class Reaction
    class Ability
    class Effect

    Game "1" --> "2" Player
    Player "1" --> "1" Core
    Player "1" --> "1" Deck
    Player "1" --> "1" Hand
    Player "1" --> "1" UnitZone
    Player "1" --> "1" SupportZone
    Player "1" --> "1" Discard

    Card <|-- Unit
    Card <|-- Support
    Card <|-- Tactic

    Deck o-- Card
    Hand o-- Card
    UnitZone o-- Unit
    SupportZone o-- Card
    Discard o-- Card

    Game --> Turn
    Turn --> Operation : selects until one completes
    Operation <|-- Action
    Action --> Reaction
    Card --> Ability
    Ability --> Effect
~~~

## Responsibilities

| Concept | Responsibility |
| --- | --- |
| Game | 対戦ライフサイクルと終了条件 |
| Player | 意思決定主体、ResourceとZoneの所有 |
| Core | Playerに対応する勝敗対象 |
| Card | Parameter / Tag / Abilityを持つObject |
| Zone | Cardの所在、公開範囲、利用可能ルール |
| Turn | Active Playerが制御権を持つ区間。Turn Startからcompleted Operationまで続く |
| Operation | Active PlayerがTurn中に選択する主操作。完了するとTurnを終了させる |
| Action | Reaction可能なOperation |
| Reaction | Actionに従属する応答。ActionをCancelしてもTurnは終了させない |
| Ability | Cardが提供する利用可能な機能 |
| Effect | Game Stateに実際に発生する変更 |

## Turn / Operation cardinality

1 Turnはcompleted Operationを1つだけ持つ。

ただしActionがReactionでCancelされた場合、同じTurn内でOperationを再選択するため、Operation SelectionまたはAction Declarationは複数回発生し得る。

~~~text
Turn
├─ Turn Start (once)
└─ Operation Selection
    ├─ Cancelled Action → reselect
    ├─ Cancelled Action → reselect
    └─ Completed Operation → Turn End
~~~

## Value classification

~~~text
Value
├─ Resource
│  ├─ Energy
│  └─ Momentum
├─ Stat
│  ├─ Core HP
│  ├─ Unit ATK
│  └─ Unit Max HP
└─ Capacity
   ├─ Unit Zone Capacity
   ├─ Support Zone Capacity
   └─ Hand Limit
~~~
