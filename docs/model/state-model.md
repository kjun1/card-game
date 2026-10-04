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

Cancelled ActionはOperation Completeを発生させず、同じTurn内のOperation Selectionへ戻る。

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
