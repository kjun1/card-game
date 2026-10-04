# Attack Flow

> Formal BPMN 2.0 model: [bpmn/attack-flow.bpmn](bpmn/attack-flow.bpmn)

## Purpose

Attack ActionのDeclarationからReaction、Block、Combat、Operation完了までを定義する。

## Review preview

~~~mermaid
flowchart TD
    S[Select Attack Operation] --> D[Declare Attacker and Target]
    D --> R[Defender chooses Reaction or decline]
    R --> G{Use Reaction?}

    G -- Yes --> RC[Pay Reaction Cost]
    RC --> RR[Resolve Reaction]
    RR --> X[Cancel Attack]
    X --> O([Operation Not Complete / Reselect])

    G -- No --> B[Defender chooses Block or no Block]
    B --> BG{Use Block Ability?}
    BG -- Yes --> BC[Select Blocking Unit and Pay Cost]
    BC --> BT[Change Final Target]
    BT --> C[Attack Commit]

    BG -- No --> C
    C --> E[Exhaust Attacker]
    E --> T{Final Target}
    T -- Core --> CD[Deal ATK Damage to Core]
    T -- Unit --> UD[Deal simultaneous ATK Damage]
    UD --> K[Destroy Units with Current HP <= 0]
    CD --> V[Evaluate Game End]
    K --> V
    V --> F{Game Ended?}
    F -- Yes --> GE([Game End])
    F -- No --> OC([Operation Complete])
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
