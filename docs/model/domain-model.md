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
    Turn --> Operation
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
| Turn | 1 Operationを完了する区間 |
| Operation | Turn中の主要操作 |
| Action | Reaction可能なOperation |
| Reaction | Actionに従属する応答 |
| Ability | Cardが提供する利用可能な機能 |
| Effect | Game Stateに実際に発生する変更 |

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
