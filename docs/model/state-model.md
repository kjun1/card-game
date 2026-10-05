# State Model

## Zone transition state

Runtime Card Instanceの所在と、その配置で適用される状態を区別する。規範的な移動・初期化規則は[Zone transitions](../rules/core-rules.md#zone-transitions)を正本とする。

| 状態 | 適用範囲 | 通常配置時の初期値 | Zone離脱時の扱い |
| --- | --- | --- | --- |
| Ready / Exhausted | Unit ZoneのUnit | Deploy時にReady | Hand / Discardへの移動時に破棄 |
| Accumulated Damage | Unit ZoneのUnit | Deploy時に0 | Hand / Discardへの移動時に破棄 |
| Deploy直後Attack制限 | Unit ZoneのUnit | Deploy時にAttackLocked | Hand / Discardへの移動時に破棄 |
| Set / Revealed | Support ZoneへSetしたTactic | Set時に裏向きのSet | Hand / Discardへの移動時に破棄 |

初回と再配置で同じ初期化を行う。Hand / Deck / DiscardにあるCardには、上表の盤面用状態を適用しない。Unit Cardの静的なMax HPはCard Definitionに残るが、盤面外のCardにCurrent HPを計算してUnitとしての生存判定を行わない。

Supportは通常DeployでFace-up Supportになる。これはSupport Zoneでの配置・公開状態であり、UnitのDamage / 活動状態や、SetしたTacticのSet / Revealed状態を持たせるものではない。

合法なZone移動が成立する時点で、所在の更新と移動元の配置状態の破棄を扱う。破棄前のDamageによるDestroy判定と、移動後のCardにそのDamageを保持することは別である。逐次Effectの次のStepへ、移動元の配置状態を持ち越さない。実際には移動していないCardの状態をCancelや検証失敗だけで破棄せず、成立したReactionの移動を巻き戻さない。

Card DefinitionとPlayer Knowledgeは配置状態ではない。状態を破棄しても、静的定義やPlayerが過去に観測したDamage・Reveal・移動の事実は失わない。Current visibilityは移動先のZoneと新しい配置で判定し、過去の観測から以前の閲覧権限を持ち越さない。[Information Model](information-model.md)を参照する。

これはゲーム上の状態の適用範囲を定めるモデルであり、未適用を`null`・Field省略等のどれで表現するか、Runtime個体IDを維持するか、保存や履歴の方式は指定しない。実際に選択したTargetの参照寿命や移動後の再検証も本節では定義しない。

## Unit activity state

~~~mermaid
stateDiagram-v2
    [*] --> Ready: Deploy
    Ready --> Exhausted: Attack Commit
    Exhausted --> Ready: Owner Turn Start
    Ready --> [*]: Leave Unit Zone
    Exhausted --> [*]: Leave Unit Zone
~~~

Ready / Exhaustedは能動Actionの可否を管理する。Block Abilityの可否とは独立する。

この図は1回のUnit配置の状態遷移を表す。Ready / Exhaust Effectは活動状態だけを変更し、DamageやDeploy直後Attack制限を初期化しない。

## Unit attack eligibility

~~~mermaid
stateDiagram-v2
    [*] --> AttackLocked: Deploy
    AttackLocked --> AttackEnabled: Owner next Turn Start
    AttackLocked --> [*]: Leave Unit Zone
    AttackEnabled --> [*]: Leave Unit Zone
~~~

Deploy直後のUnitはReadyであってもAttackできない。Block AbilityはAttackLockedでも使用できる。

再DeployでもAttackLockedから開始する。以前の配置でAttackEnabledだったことを引き継がない。

## Set state

~~~mermaid
stateDiagram-v2
    [*] --> Set: Set into Support Zone
    Set --> Revealed: Use / Reveal
    Set --> [*]: Leave Support Zone
    Revealed --> [*]: Leave Support Zone
~~~

Set状態ではCard内容はHidden、存在とSlot利用はPublic。

Revealだけでは同じSupport Zoneに留まる。解決済みTacticの通常のDiscardもZone離脱であり、Set / Revealed状態を破棄する。Discardは移動先のZoneであって、この配置の状態ではない。再Setでは新しいSet状態から開始する。

Discardへ移動した後は、所有Playerが全Cardの内容を確認でき、Opponentへは枚数だけを公開する。未RevealのSet CardもDiscardへの移動自体ではOpponentへ内容を公開しない。

これは現在の閲覧権限を表す。過去に公開情報として観測した内容や出来事は既知のままであり、未観測の内容は新たに既知にならない。State / Zoneに基づくCurrent visibilityとPlayer Knowledgeの区別は[Information Model](information-model.md)を参照する。

## Game result

~~~mermaid
stateDiagram-v2
    [*] --> Ongoing
    Ongoing --> Ended: Win / Lose conditions established
    Ended --> [*]
~~~

勝敗条件成立時にGameの結果を固定する。同時適用が定義された処理で双方の敗北条件が成立した場合はDrawとし、それ以外では先に成立した勝敗を確定する。Endedへ遷移した後は残りのEffectを解決せず、結果を再計算しない。支払済みCostと適用済みEffectは保持する。

勝敗を確認する逐次Effect / SimultaneousGroupの境界と複数Playerへの逐次適用順は[Effect Resolution Model](effect-resolution-model.md)に従う。

以下のOperation / Action / Attackの通常の解決経路より、このGame終了を優先する。既に解決済みのOperationの完了やReactionによる元Actionの取消の記録は、Endedからの再開や追加Effectの実行を意味しない。

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

Invalid / Cancelled OperationはOperation Completeを発生させない。勝敗条件成立時に確定したGame終了の結果を先に扱い、Gameが継続する場合だけ同じTurn内で新しいOperationを選択する。InvalidではCost消費・Card移動・Effect解決を行わない。

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

Unit ZoneにあるUnitはAccumulated Damageを保持する。通常Deployでは0から開始し、同じ配置の間はTurn StartのReady化やAttack制限解除でも保持する。

~~~text
Current HP = Max HP - Accumulated Damage
~~~

Current HP <= 0 でDestroyへ遷移する。

DamageとCurrent HPによるDestroy判定を行ってからDiscardへ移動する。Unit Zoneを離れた時点でその配置のAccumulated Damageを破棄するため、移動後のCardに致死Damageや負のCurrent HPを残さない。Damageを受けた事実やDestroyの観測履歴とは区別する。
