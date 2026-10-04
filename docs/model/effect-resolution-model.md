# Effect Resolution Model

## Purpose

Effectの順序、同時適用、Player間の処理順、勝敗を確認する境界を共通の概念として定義する。[GR-018・GR-019](../requirements/game-requirements.md#requirements)と[Core Rules](../rules/core-rules.md#effect-resolution)を具体化し、Operation / Reaction / Combatで共有する。

## Concepts

~~~text
Resolution
└─ EffectStep（順序付き）
   ├─ Sequential Effect
   └─ SimultaneousGroup
      └─ Effect（同時に適用する集合）
~~~

| Concept | Responsibility |
| --- | --- |
| Resolution | 解決するEffectStepの順序と進行を扱い、Game終了時は残りを停止する |
| EffectStep | 逐次的なEffect適用、または明示された同時適用のまとまりを表す |
| Effect | Damage・Draw・Card移動など、Game Stateへの変更を表す |
| SimultaneousGroup | 同時と定義されたEffectを一括適用し、全体の結果に対して勝敗を確認する |
| Player order | 同じEffectを複数Playerへ逐次適用する際の対象Playerの順序を定める |

これはゲーム意味論の概念モデルであり、Card Schemaのフィールド、保存形式、Engine APIを指定するものではない。AbilityのResolutionやCombatの解決を同じ概念で記述できる。

## Resolution steps

Resolutionは定義された順序でEffectStepを解決する。

1. Sequential Effectではその適用後に勝敗条件を確認する。
2. SimultaneousGroupではGroup内のEffectを同時に適用し、その全体の結果に対して勝敗条件を確認する。Groupの途中で一方だけの敗北を確定しない。
3. Gameが継続する場合だけ、次のEffectStepへ進む。

Drawは[Deck Rules](../rules/deck-rules.md#draw-and-hand-limit)に従って1枚ずつ処理する。複数枚Drawを大きなStepにまとめて、途中のDraw失敗や直後のHand Limit処理を飛ばすことはできない。

SimultaneousGroupは、両Coreへの同時Damageや[Unit同士のCombat Damage](../rules/combat-rules.md#combat-resolution)など、同時適用が定義された処理を表す。両Playerが対象というだけで同時になるわけではなく、両者Drawのように逐次処理が定められたEffectをGroup化して順序を変えない。

## Player order

同じEffectを複数Playerへ逐次適用する場合、対象のActive Playerから処理し、Gameが継続している場合にOpponentへ進む。この順序をDraw・Discard・Card移動・Damage等で共通に使う。ReactionでもSourceの所有者を先にしない。

各適用後の勝敗確認は継続して行う。Active Player側の処理でGameが終了した場合は、Opponent側へ進まない。対象外のPlayerを追加する規則ではなく、対象が1人ならそのPlayerだけへ適用する。

このPlayer orderとEffectStep列の明示順序は別である。例えば「BへDamage、その後AがDraw」という別々のStepを、Active PlayerがAだからという理由で並べ替えない。明示されたSimultaneousGroupにもPlayer間の先後は付けない。

SetupのMulligan選択・交換の並行進行は[Game Flow](../process/game-flow.md)の責務であり、このEffectのPlayer orderとは別に扱う。

## Game end

勝敗条件が成立した最初の判定境界で結果を固定する。明示された同時適用で両Playerの敗北条件が成立した場合だけDrawとする。以降のEffectStepや未処理Playerへの適用を停止し、支払済みCostと適用済みEffectを保持する。

Costの検証と支払い時点は[Resource Rules](../rules/resource-rules.md#cost-timing)に従う。Resolutionの停止によって支払済みCostを払い戻さず、Actionの未払いCostを新たに支払うこともない。解決済みOperationの完了やReactionによる取消の記録は、Game終了後のEffectを許可するものではない。

[Action / Reaction Flow](../process/action-reaction-flow.md#effect-resolution-and-game-end)と[Attack Flow](../process/attack-flow.md#combat)はこの境界で固定した結果を返す。Turn / Game Flowはその結果を再評価せず伝播する。

## Examples and boundaries

| Resolution | 結果 |
| --- | --- |
| AのCardをDiscardへ移動 → BのCoreへ致死Damage → AがDraw | Card移動とDamageを保持して勝敗を確定し、後続Drawは行わない |
| 両Coreへ同時に致死Damageを与えるGroup → Draw | Group全体の適用で双方敗北が成立してDrawとして終了し、次のDraw処理は行わない |
| 両Coreへ逐次致死Damageを適用 | Active Playerへの適用で敗北を確定し、OpponentへのDamageは行わない |

詳細なTrigger処理、同時Effect間の依存・競合の解決方法、複合処理のCard記法はこのモデルでは定義しない。Acceptanceは合意済みの処理だけを具体化する。[Example Mapping](../acceptance/example-mapping.md)、[Effect Resolution](../acceptance/effect-resolution.feature)を参照する。
