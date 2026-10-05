# Attack Flow

> Formal BPMN 2.0 model: [bpmn/attack-flow.bpmn](bpmn/attack-flow.bpmn)

## Purpose

Attack ActionのDeclarationからReaction、Block、Combat、Destroy Checkまでを定義し、解決結果と更新後のGame StateをTurn Flowへ返す。

## Review preview

~~~mermaid
flowchart TD
    S[Select Attack Operation] --> D[Declare Attacker and Target]
    D --> VA[Validate Attack]
    VA --> AV{Attack valid?}
    AV -- No --> D
    AV -- Yes --> R[Defender chooses Reaction, targets or decline]
    R --> VR[Validate Reaction]
    VR --> RV{Reaction valid?}
    RV -- No --> R
    RV -- Yes --> G{Use Reaction?}

    G -- Yes --> RC[Pay Reaction Cost]
    RC --> RR[Resolve Reaction]
    RR --> X[Cancel Attack]
    X --> O([Operation Incomplete])

    G -- No --> B[Defender chooses Block or no Block]
    B --> BG{Use Block Ability?}
    BG -- Yes --> BS[Select Blocking Unit]
    BS --> BV[Validate Block]
    BV --> VBG{Block valid?}
    VBG -- No --> B
    VBG -- Yes --> BC[Pay Block Cost]
    BC --> BT[Change Final Target]
    BT --> C[Attack Commit]

    BG -- No --> C
    C --> E[Exhaust Attacker]
    E --> T{Final Target}
    T -- Core --> CD[Deal ATK Damage to Core]
    T -- Unit --> UD[Deal simultaneous ATK Damage]
    UD --> K[Destroy Units with Current HP <= 0]
    CD --> GE{Game ended?}
    GE -- Yes --> ER([Game End Reported])
    GE -- No --> K
    K --> OC([Attack Resolution End])
~~~

Gameが継続する場合、`Attack Resolution End`は`operationCompleted = true`、取消時の`Operation Incomplete`は`operationCompleted = false`を更新後のGame Stateとともに返す。

ReactionやCore Damageで勝敗条件が成立した場合は、その場で結果を固定し、後続の逐次Effectを行わない。`gameEnded = true`と固定済みの結果、その時点までのStateを[Turn Flow](turn-flow.md)へ返す。Turn Flowは勝敗を再評価せず、Operation再選択・Player切替へ進まない。

致死ReactionでもAttackのCancel記録を保持し、`Operation Incomplete`から終了結果を返す。CoreへのAttack本体を解決して勝敗が確定した場合は、既存のAttack完了記録とともに`Game End Reported`へ進む。この報告は終了後の追加Effectを意味しない。

## Attack declaration

AttackerはReadyかつAttack可能でなければならない。

Targetには常にEnemy CoreまたはEnemy Unitを指定できる。

Declaration時点ではAttackerをExhaustしない。

AttackerとTargetの選択はAttacking PlayerのUser Taskとし、Ready・Attack制限・Targetの合法性はGame Systemが検証する。不正な宣言は宣言へ戻り、Reaction Windowを開かない。

ReactionもDefending Playerの選択後にGame SystemがSource・Timing・Target・Cost支払い可能性を検証する。辞退は有効な選択として扱い、不正なReactionはCostを消費せずReaction選択へ戻す。合法なReactionだけがSystemによるCost支払い・解決・Attack Cancelへ進む。

Reaction内部のEffectStep・SimultaneousGroup・勝敗判定は[Effect Resolution Model](../model/effect-resolution-model.md)に従う。両Playerへ逐次適用するEffectはDrawに限らず[Player order](../model/effect-resolution-model.md#player-order)を使い、Reaction Sourceの所有PlayerではなくActive Playerから処理する。

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

Blocking Unitの選択はDefending PlayerのUser Taskとする。その後、Game SystemがBlock AbilityとCost支払い可能性を検証し、Costを支払い、Final Targetを変更する。Momentumの支払いでは同量をOpponentへ移転する。

不正なBlockはBlockするかどうかの選択へ戻し、別のBlocking Unitの選択またはBlock辞退を受け付ける。この段階ではCost支払い・Target変更・AttackerのExhaustを行わない。

## Combat

Attack Commit時にAttackerをExhaustする。

- Final TargetがCore: Attacker ATK分をCoreへDamage
- Final TargetがUnit: 両UnitがATK分を1つのSimultaneousGroupとして同時にDamage

Unit Damageは蓄積し、Current HPが0以下ならDestroyする。

Destroy対象はUnit Zoneにある時点のDamageとCurrent HPで決める。Discardへの移動時に[Zone transitions](../rules/core-rules.md#zone-transitions)に従ってその配置の状態を破棄する。状態の破棄をDamage適用やDestroy対象の判定より先に行わない。

CoreへのDamageで勝敗条件が成立したら、[Game end](../model/effect-resolution-model.md#game-end)に従って結果を固定して返し、後続処理へ進まない。Gameが継続する場合はDestroy Checkを行ってAttack解決を完了する。Unit同士のDamageはSimultaneousGroup全体を適用してからDestroy Checkを行い、Active Playerを先にDamage処理する逐次Effectへ変更しない。

DestroyによるDiscard移動後の閲覧権は[Current visibility](../model/information-model.md#current-visibility)に従う。OpponentはDiscard内容を自由に確認できないが、UnitがPublicだった時点の観測は[Player knowledge](../model/information-model.md#player-knowledge)として別に扱う。

通常のOverkill Damageは他Targetへ移動しない。
