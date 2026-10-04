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
    Set --> Discarded: Card Effect moves to Discard
    Revealed --> Discarded: Tactic resolved
~~~

Set状態ではCard内容はHidden、存在とSlot利用はPublic。

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

UnitはAccumulated Damageを保持する。

~~~text
Current HP = Max HP - Accumulated Damage
~~~

Current HP <= 0 でDestroyへ遷移する。
