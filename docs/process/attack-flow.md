# Attack Flow

## Purpose

Attack ActionのDeclarationからReaction、Block、Combat、Operation完了までを定義する。

## Process

~~~mermaid
flowchart TD
    S[Select Attack Operation] --> D[Declare Attacker and Target]
    D --> R{Defender uses Reaction?}

    R -- Yes --> RR[Resolve Reaction]
    RR --> X[Cancel Attack]
    X --> O[Return to Operation Selection]

    R -- No --> B{Use Block Ability?}
    B -- Yes --> BC[Select Blocking Unit and Pay Cost]
    BC --> BT[Change Final Target to Blocking Unit]
    BT --> C[Attack Commit]

    B -- No --> C
    C --> E[Exhaust Attacker]
    E --> T{Final Target}
    T -- Core --> CD[Deal ATK Damage to Core]
    T -- Unit --> UD[Deal simultaneous ATK Damage]
    CD --> V[Check Victory]
    UD --> K[Destroy Units with Current HP <= 0]
    K --> V
    V --> F([Operation Complete])
~~~

## Attack declaration

AttackerはReadyかつAttack可能でなければならない。

Targetには常にEnemy CoreまたはEnemy Unitを指定できる。

Declaration時点ではAttackerをExhaustしない。

## Block step

Reactionが使用されなかった場合のみ実施する。

BlockはUnitが持つAbilityで表現する。

~~~text
Momentum 2: Block
~~~

- 1 Attackにつき最大1 Unit
- Core / Unitの双方へのAttackをBlock可能
- Ready / Exhaustedに関係なく使用可能
- Deploy直後でも使用可能
- BlockしてもExhaustしない
- Momentum Costを使用した場合は相手へ移転する
- BlockはActionではないためReaction Windowを作らない

## Combat

Attack Commit時にAttackerをExhaustする。

- Final TargetがCore: Attacker ATK分をCoreへDamage
- Final TargetがUnit: 両UnitがATK分を同時にDamage

Unit Damageは蓄積し、Current HPが0以下ならDestroyする。

通常のOverkill Damageは他Targetへ移動しない。
