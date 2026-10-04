# State Model

## Unit activity state

~~~mermaid
stateDiagram-v2
    [*] --> Ready
    Ready --> Exhausted: Attack Commit
    Exhausted --> Ready: Owner Turn Start
~~~

Ready / Exhaustedは能動Actionの可否を管理する。Block Abilityの可否とは独立する。

## Unit attack eligibility

~~~mermaid
stateDiagram-v2
    [*] --> AttackLocked: Deploy
    AttackLocked --> AttackEnabled: Owner next Turn Start
~~~

Deploy直後のUnitはReadyであってもAttackできない。Block AbilityはAttackLockedでも使用できる。

## Set state

~~~mermaid
stateDiagram-v2
    [*] --> Set: Set into Support Zone
    Set --> Revealed: Use / Reveal
    Revealed --> Discarded: Tactic resolved
~~~

Set状態ではCard内容はHidden、存在とSlot利用はPublic。

## Operation lifecycle

OperationはActive PlayerがTurn中に選択する主操作である。

~~~mermaid
stateDiagram-v2
    [*] --> Selected
    Selected --> Invalid: non-Action validation failed
    Selected --> Cancelled: selected Action receives Reaction
    Selected --> Completed: valid non-Action paid and resolved
    Selected --> Completed: Action resolved without Reaction
    Invalid --> [*]
    Cancelled --> [*]
    Completed --> [*]
~~~

Invalid / Cancelled OperationはOperation Completeを発生させない。更新後のStateでGame終了を先に評価し、Gameが継続する場合だけ同じTurn内で新しいOperationを選択する。InvalidではCost消費・Card移動・Effect解決を行わない。

Gameが継続する場合、Completed OperationだけがTurn Endを発生させる。Game終了時はOperation完了判定・再選択・Player切替へ進まず、completed Operationが0でも終了する。

## Action lifecycle

~~~mermaid
stateDiagram-v2
    [*] --> Declared
    Declared --> Cancelled: Reaction resolved
    Declared --> Committed: No Reaction / Cost paid
    Committed --> Resolved
    Cancelled --> [*]
    Resolved --> [*]
~~~

ActionがCancelledされた場合、そのActionを含むOperationもCancelledとなる。

CancelそのものではHandのCardを移動せず、未払いEnergy Costも消費しない。Reactionが適用したCost・Card移動・状態変更は保持する。Gameが継続し合法であれば、同じCardの再宣言は新しいActionとReaction Windowを開始する。

## Attack lifecycle

~~~mermaid
stateDiagram-v2
    [*] --> Declared
    Declared --> Cancelled: Reaction
    Declared --> BlockStep: No Reaction
    BlockStep --> Committed: Block decision complete
    Committed --> Combat
    Combat --> Resolved
    Cancelled --> [*]
    Resolved --> [*]
~~~

## Damage state

UnitはAccumulated Damageを保持する。

~~~text
Current HP = Max HP - Accumulated Damage
~~~

Current HP <= 0 でDestroyへ遷移する。
