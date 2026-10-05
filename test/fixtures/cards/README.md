# Card Definition fixtures

このディレクトリは[Card Definition Schema](../../../schemas/card.schema.json)の構造契約と静的意味を検証するための入力集であり、製品Card PoolやBalance案ではない。Schemaを書く前にA〜Jの代表定義を作り、必要な構造を抽出した。

`valid`は構造検証の成功を、`invalid`は意図した構造エラーを確認する。`valid`全件は1つの定義集合として静的意味検証も行う。`semantic`は静的意味の正例・負例を分けて保持する。実際の支払い、Target選択、Reaction、勝敗などを実行するものではない。仕様に未記載のDeploy CostやUnit Parameterは、fixtureを完全な静的定義にするための例示値であり、Acceptanceへの新しい前提ではない。

## 最初に設計したA〜J

| 例 | Card Definition | 表現する構造 / Acceptanceとの関係 |
| --- | --- | --- |
| A | [vanilla-unit.json](valid/vanilla-unit.json) | 「歩兵」。Deploy Energy 2、ATK 2、Max HP 3、Abilityなし。AC-AR-008 / AC-TURN-007のDeployに対応。AttackはCoreに任せ、Abilityに列挙しない |
| B | [non-action-tactic.json](valid/non-action-tactic.json) | 依頼のEnergy 1 / 敵Core 2 Damage。非Action Playの構文例。AC-AR-003のEnergy 2 / 1 Damageとは数値が異なる |
| C | [action-tactic.json](valid/action-tactic.json) | 「火矢」。Energy 2、Action、敵Coreを選択して2 Damage。AC-AR-011〜014のPlayに対応。Cancelや解決後DiscardはCardへ書かない |
| D | [settable-tactic.json](valid/settable-tactic.json) | 「双用札」。PlayのみAction / Energy 2、Setは指定なし / Energy 1。AC-AR-004 |
| E | [reaction-support.json](valid/reaction-support.json) | Face-up Supportの「迎撃」。Energy 1 / 敵Core 1 Damage。AC-AR-012 / 017。追加Timing条件は相手Turn |
| F | [reaction-set-card.json](valid/reaction-set-card.json) | 「迎撃札」。Set後だけReaction SourceになるTactic。AC-AR-016 / 017。使用時のRevealと解決後のDiscardはCore / State Modelに委ねる |
| G | [block-unit.json](valid/block-unit.json) | 「護衛」。ATK 1、Max HP 5、Momentum 2。Block StepのFinal TargetをSourceへ変更。AC-ATK-005 / 007 / 008 |
| H | [composite-cost.json](valid/composite-cost.json) | 依頼のEnergy 2 + Momentum 1をまとめたAbility Cost。AC-RESOURCE-008 / 009のTacticとは数値・使用形式が異なる |
| I | [sequential-resolution.json](valid/sequential-resolution.json) | 「組立砲台 / 組立射撃」。Handの選択Card移動 → 敵Core 2 Damage → 自分1 Draw。AC-RESOLUTION-001 |
| J | [simultaneous-resolution.json](valid/simultaneous-resolution.json) | 「共振装置 / 共振補給」。両Coreの2 Damageを明示的Groupにし、その後1 Draw。AC-RESOLUTION-002 |

Acceptanceの原文は[Action / Reaction](../../../docs/acceptance/action-reaction.feature)、[Attack](../../../docs/acceptance/attack.feature)、[Effect resolution](../../../docs/acceptance/effect-resolution.feature)、[Resource](../../../docs/acceptance/resource.feature)、[Turn](../../../docs/acceptance/turn.feature)を参照する。

## Acceptanceに対応する追加定義

以下の対応はCard固有の静的な記述についてのもの。GivenのEnergy残量、現在のZone、Active PlayerなどはRuntime / Game Stateへ別に用意する。

| Card Definition | Acceptance fixture / 対応する内容 |
| --- | --- |
| [acceptance-non-action-tactic.json](valid/acceptance-non-action-tactic.json) | AC-AR-003のTactic Play行。「例示Card」、Energy 2 / 非Action / 敵Core 1 Damage |
| [action-unit-deploy.json](valid/action-unit-deploy.json) / [action-support-deploy.json](valid/action-support-deploy.json) / [action-set-tactic.json](valid/action-set-tactic.json) | AC-AR-002のUnit Deploy / Support Deploy / Set行。各操作のEnergy 2 / Actionを独立して指定 |
| [non-action-set-tactic.json](valid/non-action-set-tactic.json) | AC-AR-003のSet行。Energy 2 / Action指定なし |
| [independent-abilities.json](valid/independent-abilities.json) | AC-AR-005「砲台」の「強射」と「小射」。前者のActionを後者へ波及させない。小射はEnergy 1 / 1 Damage。強射のEnergy 2はAC-AR-002のAbility行の例にもなる |
| [tag-action-tactic.json](valid/tag-action-tactic.json) | AC-AR-006「分類札」。Tag `Action`、PlayのAction指定なし、Energy 1 / 1 Damage |
| [non-action-ability.json](valid/non-action-ability.json) | AC-AR-007「小射」。Energy 2 / 敵Coreを選択して2 Damage。AC-AR-005の同名Abilityとは数値が異なる定義 |
| [reaction-timing-self.json](valid/reaction-timing-self.json) | AC-AR-010「迎撃」の自分Turn条件の行。Energy 2 / 敵Core 1 Damage。構造は有効だが相手TurnのReaction Windowでは使用不能。Timing判定はEngineの責務 |
| [confiscation-support.json](valid/confiscation-support.json) | AC-AR-013「没収」。Energy 1 / 宣言中ActionのTactic SourceをHandから所有PlayerのDiscardへ移動。任意の相手Handを閲覧・指定できるという意味ではない |
| [reaction-unit.json](valid/reaction-unit.json) | AC-AR-017のUnit Ability行。Energy 1 / 敵Core 1 Damage |
| [resource-composite-tactic.json](valid/resource-composite-tactic.json) | AC-RESOURCE-008 / 009「連携射撃」。非Action Play / Energy 2 + Momentum 2 / 敵Core 1 Damage |
| [action-tactic-one-damage.json](valid/action-tactic-one-damage.json) | AC-RESOLUTION-003 / 004、AC-DECK-011の「火矢」。Energy 2 / Action / 敵Core 1 Damage。AC-AR-011の2 Damage版とは別fixture |
| [both-player-damage.json](valid/both-player-damage.json) | AC-RESOLUTION-003「両刃装置 / 両刃」。Reaction / Energy 1 / 両Core各2 Damageの逐次適用 |
| [both-player-discard.json](valid/both-player-discard.json) / [both-player-return.json](valid/both-player-return.json) | AC-RESOLUTION-004「整理装置 / 双方整理」。各PlayerのUnit Cardを1枚ずつ指定し、Hand → Discard / Unit Zone → Handを所有Playerごとに逐次適用 |
| [both-player-draw.json](valid/both-player-draw.json) | AC-DECK-011「相互補給所 / 相互補給」。Reaction / Energy 1 / 両Player各1 Draw |
| [multi-draw.json](valid/multi-draw.json) | AC-DECK-003「補給所 / 三枚補充」。Energy 1 / 自分3 Draw。1枚ごとの処理をcountで上書きしない |
| [exhaust-reaction.json](valid/exhaust-reaction.json) | AC-TURN-009のReaction。Energy 1 / 相手Unitを選択してExhaust |
| [move-set-card.json](valid/move-set-card.json) | AC-BOARD-009 / 011「回収係 / 回収」。Energy 1 / 自分Set CardをDiscardへ移動。Revealを含めない |
| [destroy-unit.json](valid/destroy-unit.json) | AC-BOARD-010「処理施設 / 解体」。Energy 1 / 自分UnitをDestroy |

[Deck](../../../docs/acceptance/deck.feature)と[Board / Zone](../../../docs/acceptance/board-zone.feature)にも対応する。Player order、適用済みEffectの保持、Game End後の打ち切りは[Effect Resolution Model](../../../docs/model/effect-resolution-model.md)が正本であり、fixture配列へActive Player依存の順序を埋め込まない。`both` / `each`は同時適用の指定ではない。

同じNameが異なる数値で登場する場合も、既存Scenarioごとの例を別のtechnical `id`で保存している。製品Cardの同一性や同名3枚制限をtechnical `id`で置き換えるものではない。

## 構文の境界例

- [ready-unit.json](valid/ready-unit.json): 既存State ModelのReady遷移をSource Unitへ適用する記述。Energy 0、Condition / Limitのnullも検証する。新しいAcceptance Scenarioではない。
- [reveal-set-card.json](valid/reveal-set-card.json): Set CardのReveal Effectを明示する記述。Player Knowledgeの実装やReaction時の自動Revealを規定しない。
- [zero-parameters.json](valid/zero-parameters.json): ATK / Max HP / Costの非負整数という構造上の下限。Max HP 0のUnitが生存・Deploy可能であることや推奨Balanceを保証しない。

## Invalid fixtureと検証

[invalid-expectations.json](invalid-expectations.json)は各JSONに対して期待する`instancePath`、JSON Schema `keyword`、必要な`params`を記載する。単にどこかで失敗するだけでは成功扱いにせず、対象フィールドで期待する種類のエラーがあることを確認する。

対象は未知のCard Type / Effect / Activation、必要Parameter不足、負数 / 非整数 / 空Cost、負のMax HP、Step形式の混在、空Group / Resolution、同時Draw、不正Target、重複Tag、操作・ActivationとCard Typeの不整合、SetなしReaction、Block外のFinal Target変更、未対応Condition / Limit、Reaction / BlockへのAction付与、typo、Runtime状態・Target ID・Player Knowledgeの混入を含む。

```sh
npm run check:cards
```

このコマンドは[Schema文書](../../../docs/model/card-definition-schema.md#structural-validation-and-semantic-validation)に定める構造契約と静的意味を検証する。実際の個体や状態、可視性、支払い可能性、Timing、勝敗はDomain Engine側のRuntime semantic validation / 実行で確認する。

## Static semantic fixtures

`semantic/valid/`と`semantic/invalid/`の各JSONファイルはCard Definitionの非空配列であり、各ファイルを独立した入力集合として検証する。配列は検証用の容器で、Card Schemaに集合形式を追加するものではない。同じtechnical IDでも別fixture集合への登場は許可し、同じ集合内の重複を拒否する。

| 正例 | 確認する境界 |
| --- | --- |
| [broad-selections.json](semantic/valid/broad-selections.json) | 型・状態を省略しても互換候補が残るSelection、未使用の有効なSelection |
| [local-symbols-and-ids.json](semantic/valid/local-symbols-and-ids.json) | Operation / Abilityごとの独立した選択名、別Card間の同じAbility IDとName、明示された`constructor`という選択名 |
| [runtime-boundaries.json](semantic/valid/runtime-boundaries.json) | Reaction内の宣言Source参照、Source移動後の状態やSet Card使用時のRevealを静的に実行・保証しない境界 |
| [revealed-tactic.json](semantic/valid/revealed-tactic.json) | Support ZoneのFace-up TacticはReveal後のCardを表し得る |

負例は未解決選択名、他Scopeの選択名、Card / Ability ID重複、CoreへのCard移動、Support SourceへのReady、Hand UnitのDestroy、Face-up限定選択へのReveal、成立しないSelection条件、Reaction外の宣言Source参照を含む。[semantic/invalid-expectations.json](semantic/invalid-expectations.json)に`semantic/`から始まる診断種別、配列内の位置を含むJSON Pointer、必要なparamsを記録する。構造エラー、JSON破損、空集合を意味検証での意図した拒否として数えない。期待漏れ、存在しないfixtureへの期待、異なる診断での失敗も検出する。

静的正例は実際のGame Stateでの合法性を保証しない。例えば`reveal(source)`を持つSet Card由来Reactionは型として扱えるが、使用時に既にRevealされたSourceへEffectを適用できるかは現在状態を見て判断する。先行Effectによる状態変化を静的検証が模擬することもない。
