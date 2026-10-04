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
    Turn --> Operation : selects until completion or game end
    Operation <|-- Action
    Action --> Reaction
    Card --> Ability
    Ability --> Effect
~~~

## Responsibilities

| Concept | Responsibility |
| --- | --- |
| Game | 対戦ライフサイクルと終了条件。勝敗条件成立時に結果を固定し、残りのEffectを停止する |
| Player | 意思決定主体、ResourceとZoneの所有 |
| Core | Playerに対応する勝敗対象 |
| Card | Parameter / Tag / Abilityを持つObject |
| Zone | Cardの所在、公開範囲、利用可能ルール |
| Turn | Active Playerが制御権を持つ区間。Turn StartからOperation完了またはGame終了まで続く |
| Operation | Active PlayerがTurn中に選択する主操作。Gameが継続する場合、完了するとTurnを終了させる |
| Action | Reaction可能なOperation。Attack、または当該操作・AbilityにActionが明記されたOperation |
| Reaction | Actionに従属する応答。CancelはOperationを完了させず、Game継続時は同じTurnを継続する |
| Ability | Cardが提供する利用可能な機能 |
| Effect | Game Stateに実際に発生する変更 |

Discardは各Playerが所有するZoneである。所有Playerは全Cardの内容を確認でき、Opponentへは枚数だけを公開する。

Gameの終了結果はEffectの途中でも確定し、その後は変更しない。同時適用が定義された処理による双方敗北と、順番に解決する途中の敗北は区別する。後者では残りのEffectへ進まない。

## Turn / Operation cardinality

Gameが継続する通常のTurn終了では、1 Turnはcompleted Operationを1つだけ持つ。Game終了をOperation完了判定より優先するため、Turn StartのDraw不能や致死Reactionによってcompleted Operationが0のまま終了する場合もある。

ActionがReactionでCancelされGameが継続する場合、同じTurn内でOperationを再選択するため、Operation SelectionまたはAction Declarationは複数回発生し得る。Game終了時は再選択やPlayer切替を行わない。

~~~text
Turn
├─ Turn Start (once; failed Draw may end Game)
└─ Operation Selection
    ├─ Game ended → Game End (no reselection or Player switch)
    ├─ Invalid Non-Action / Cancelled Action → reselect if Game continues
    └─ Completed Operation → Turn End if Game continues
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
