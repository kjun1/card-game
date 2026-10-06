# Game Requirements

## Purpose

本作は、2人のPlayerが構築したDeckを用いて対戦し、Card・Resource・Board状態を管理しながら相手Coreを攻略するゲームを提供する。

## Scope

~~~text
Deck Construction
    ↓
Game Setup
    ↓
Mulligan
    ↓
Alternating Turns
    ↓
Operation / Interaction / Combat
    ↓
Victory / Defeat
~~~

## Requirements

| ID | Requirement |
| --- | --- |
| GR-001 | Gameは2人のPlayerによる1対1対戦として成立しなければならない。 |
| GR-002 | 相手Core HPを0以下にしたPlayerが勝利しなければならない。 |
| GR-003 | 必要なDrawを行えないPlayerは敗北しなければならない。 |
| GR-004 | 同一処理によって両Playerの敗北条件が同時に成立した場合、GameをDrawとして終了しなければならない。 |
| GR-005 | PlayerはGame開始前にCard Poolの制約下でDeckを構築できなければならない。 |
| GR-006 | Gameは単一のBoardを使用し、Unit ZoneとSupport Zoneを区別しなければならない。 |
| GR-007 | TurnはActive Playerが制御権を持つ区間であり、Turn Start後に選択されたOperationが完了しGameが継続する場合、Opponentへ制御権を移さなければならない。Game終了をOperation完了判定より優先し、Operationが一度も完了せずGameが終了する場合も認めなければならない。 |
| GR-008 | Reaction等で選択中のOperationがCancelされ、Gameが継続する場合、そのTurnを終了せずActive PlayerへOperation選択権を戻さなければならない。Game終了時は再選択や制御権移転を行ってはならない。 |
| GR-009 | Turn開始時にUnit状態、Energy、Drawを更新しなければならない。 |
| GR-010 | EnergyはCard / Abilityの基本利用量を制約するResourceとして機能しなければならない。 |
| GR-011 | Momentumは使用すると相手へ移転するResourceとして機能しなければならない。 |
| GR-012 | Cardは少なくともUnit、Support、Tacticの役割を表現できなければならない。 |
| GR-013 | HandとBoardは未コミット情報とコミット済み情報として区別されなければならない。 |
| GR-014 | Game開始時にOpening Handを配布し、各Playerが1回のMulliganを行えなければならない。 |
| GR-015 | Public情報とHidden情報をルール上区別できなければならない。 |
| GR-016 | Zone Capacityを超えるDeploy / Setを許可してはならない。 |
| GR-017 | Playerは基本ルールによって自分のBoard Cardを任意にDiscardできてはならない。 |
| GR-018 | 勝敗条件が成立した時点でGameの結果を確定し、残りのEffectを解決してはならない。適用済みのCost・Effectと確定した結果を保持し、同時に成立した双方の敗北条件だけをDrawとして扱わなければならない。 |
| GR-019 | 同じEffectを複数Playerへ逐次適用する場合、対象のActive Playerから処理し、Gameが継続する場合だけOpponentへ進まなければならない。このPlayer orderはSourceの所有者によらず、明示された同時適用とは区別しなければならない。 |
| GR-020 | 現在の情報閲覧権限とPlayerが過去の観測から得た知識を区別しなければならない。非公開領域への移動によって観測済みの事実を失わせず、未観測の内容への閲覧権限や知識も与えてはならない。 |
| GR-021 | Zone移動に伴うCardのZone依存Runtime Stateの生成・保持・破棄を明確にしなければならない。Boardを離れたCardは以前の配置に属する状態を破棄し、通常のDeploy / Setでは初回・再配置とも新しい配置の初期状態を生成しなければならない。 |
| GR-022 | Card固有のTarget Constraint、Effect Target Requirement、現在のRuntime EligibilityとSelected Targetを区別しなければならない。合法対象はこれらの制約の積集合から求め、広いTarget ConstraintでもEffectに適合しない対象を合法としてはならない。定義の静的適合性と、現在存在する合法対象の有無を区別し、対象の提示は現在の情報閲覧権限を超えてはならない。 |
| GR-023 | Card固有のRule InterferenceによってCore Ruleの有効値・条件・予定処理を変更可能でなければならない。Core RuleをCard Definitionへ複製せず、通常のGame State変更EffectとRule Interferenceを区別し、Base Ruleから干渉を評価してEffective Ruleを導出できなければならない。 |
| GR-024 | Rule Interferenceは少なくとも、値を変更するModifier、Operation / Action / Reaction等の可否・例外を変更するPermission / Prohibition、適用前の予定処理へ介入するReplacementの責任を表現可能でなければならない。この分類だけで個別Mechanicや網羅的な表現形式を確定してはならない。 |
| GR-025 | Rule InterferenceのSubject、対象Rule、Scope、Durationを識別できなければならない。特定Card・Player・Operation・Zone等への干渉と全体のルール変更、一時的なGame中の干渉とCore Ruleの永続的な変更を区別しなければならない。 |
| GR-026 | 複数のRule Interferenceが適用可能・競合する場合でも、将来一意な解決方式を追加できなければならない。適用可能な干渉を無視してCore Ruleだけで有効値・合法性・予定処理を確定してはならない。競合の優先順位や選択方法は個別Mechanicの合意で定める。 |

## Traceability

| Requirement | Primary downstream specification |
| --- | --- |
| GR-001〜004 | ../rules/core-rules.md |
| GR-005 | ../design/card-pool.md, ../rules/deck-rules.md |
| GR-006 | ../model/domain-model.md |
| GR-007〜009 | ../process/turn-flow.md |
| GR-010〜011 | ../rules/resource-rules.md |
| GR-012〜013 | ../model/card-model.md |
| GR-014 | ../rules/deck-rules.md |
| GR-015 | ../rules/core-rules.md |
| GR-016〜017 | ../rules/deck-rules.md |
| GR-018 | ../rules/core-rules.md, ../process/turn-flow.md |
| GR-019 | ../rules/core-rules.md, ../model/effect-resolution-model.md |
| GR-020 | ../rules/core-rules.md, ../model/information-model.md |
| GR-021 | ../rules/core-rules.md, ../rules/combat-rules.md, ../model/state-model.md, ../acceptance/board-zone.feature |
| GR-022 | [Target semantics](../model/card-model.md#target-semantics), [Schema / static validation](../model/card-definition-schema.md#structural-validation-and-semantic-validation), [Target examples](../acceptance/example-mapping.md#capability-targetの制約から現在の合法対象を求める), [Target acceptance](../acceptance/target-selection.feature) |
| GR-023〜026 | [Rule Interference examples and questions](../acceptance/example-mapping.md#capability-card固有のrule-interferenceを追加可能にする), [Card Model](../model/card-model.md#rule-interference), [Engine evaluation boundary](../model/domain-engine-architecture.md#rule-evaluation) |
