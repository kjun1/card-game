# Decision Catalog

Domain EngineがRuntimeで行う判断のID、Inputs / Outputs、責任、規範・Process・AcceptanceへのTraceabilityを管理する。[Issue #21](https://github.com/kjun1/card-game/issues/21)の初期Catalogであり、ゲーム全体の判断を網羅するものではない。

## Catalog

| ID | Decision | Output | Main consumer | Automation |
| --- | --- | --- | --- | --- |
| [DEC-001](#dec-001-unit-deploy-eligibility) | Unit Deploy Eligibility | Allowed / Rejected | Unit Deployの非Action検証・Action宣言検証 | Not implemented |
| [DEC-002](#dec-002-effective-cost) | Effective Cost | ResourceごとのEffective Cost | Deploy / Operation / Reaction / Blockの支払い可能性検証と支払い | Not implemented |
| [DEC-003](#dec-003-legal-target-set) | Legal Target Set | 現在のLegal Target Set（空集合を含む） | Target候補取得・Selected Target検証 | Not implemented |
| [DEC-004](#dec-004-zone-capacity) | Zone Capacity | Effective Capacity、Within Capacity / Exceeds Capacity | Unit / Support Deploy・Setの配置先検証 | Not implemented |
| [DEC-005](#dec-005-attack-eligibility) | Attack Eligibility | Allowed / Rejected | Attack宣言検証 | Not implemented |
| [DEC-006](#dec-006-block-eligibility) | Block Eligibility | Allowed / Rejected | Block選択検証 | Not implemented |
| [DEC-007](#dec-007-reaction-window-eligibility) | Reaction Window Eligibility | Open / Do not open | 合法宣言後のWindow開始境界 | Not implemented |
| [DEC-008](#dec-008-reaction-eligibility) | Reaction Eligibility | Allowed / Rejected、辞退は有効 | Action / AttackのReaction選択検証 | Not implemented |
| [DEC-009](#dec-009-game-end-evaluation) | Game End Evaluation | Continue / Game Result（Win / Lose / Draw） | Resolution・必要なDrawの勝敗判定境界 | Not implemented |

## Responsibility and authority

このrepoでDecisionは、現在のDomain情報と規範を評価し、後続Processが使える結果を返す判断である。Inputsは言語固有の引数や型ではなく、判断に必要な情報を表す。

~~~text
Process
  → Decision point
  → Inputs
  → Rule / State evaluation
  → Decision Output
  → Process continuation
~~~

例えばUnit Deployの検証境界は、actor・HandのSource・配置先・CostとResourceからDEC-001のAllowed / Rejectedを得る。Allowedの後にいつ支払い・移動・初期化・完了を行うか、Rejectedからどの選択へ戻るかはBPMN / Processの責任である。

| 正本 | 管理する責任 | Decision Catalogとの関係 |
| --- | --- | --- |
| [Requirements](../README.md#requirements) | ゲームが満たす要求 | 判断の目的と制約へ参照する |
| [Rules](../README.md#rules) | 何が正しい・合法かを定める規範 | Authoritative sourcesへ参照し、数値・ルール全文をCatalogに再定義しない |
| [BPMN / Process](../process/bpmn/README.md) | いつ・誰が・どの順で処理し、制御を移すか | Task / Gateway / Task内部の判断境界とOutputの利用先を対応付ける |
| [Models](../README.md#model) | 概念・関係・状態・データ構造・解決意味論 | 判断に必要な情報と解決境界を参照する |
| [Acceptance](../acceptance/README.md) | 合意済みの具体的な振る舞いと観測境界 | 既存Scenario IDを参照し、Scenarioを複製しない |
| Decision Catalog | Decision identity、Inputs / Outputs、判断責任、Traceability | Runtimeの判断契約の正本。ゲーム規範や処理順を置き換えない |
| [Domain Engine Architecture](../model/domain-engine-architecture.md) | 実行責任の分解と接続 | Catalogの判断をRule Evaluation / Runtime Validation等へ接続する。具体API・class・型は固定しない |

「Unit Zoneの上限はいくつか」という規範と、「現在の配置要求は上限内か」という判断は別である。DEC-004は上限の値をRulesから評価し、現在の占有と配置要求に対する結果を返す。Catalogにある条件の要約やDecision tableは責任の説明であり、規範を変更する根拠にはしない。

OutputにUI表示・エラーメッセージ・診断形式を含めない。候補照会や評価だけでCost支払い、Zone移動、Effect適用、Window開始を実行しない。判定結果の適用、Event / Resultの報告と閲覧者別投影はEngine / Processの責任である。

### Identity and granularity

IDは`DEC-001`形式で割り当て、判断の意味が維持される限り保持する。番号は実行順ではなく、BPMN Gateway ID、Requirement ID、Acceptance Scenario IDとも独立する。廃止したIDは再利用せず、責任を分割・置換する場合は元のIDとの関係を記録する。移設してもIDを維持する。

汎用のOperation Legalityは今回独立登録しない。Unit DeployはHandからの配置、AttackはAttackerと宣言Target、ReactionはWindow内の応答、BlockはReactionなしの防御段階を入力に持ち、同じAllowed / Rejectedでも責任が異なる。これらを個別Eligibilityとして追跡し、上位の総合合法性へ同じ条件を二重登録しない。

Effective Cost、Legal Target Set、Zone Capacityは操作の最終受理とは異なる結果を返し、複数の検証境界から利用するため共有Decisionとする。全Resourceが有効Costを満たすかの比較は各Eligibilityの条件として扱い、初回は別のResource Sufficiency IDを設けない。Costの導出はDEC-002だけを参照する。Support Deploy / Set / Tactic Play / 通常Abilityの総合Eligibility、Hand Limit、Destroy判定等は未登録であり、対応する既存規範・Processは引き続き有効である。

### Rule evaluation and information boundary

[Rule Evaluation](../model/domain-engine-architecture.md#rule-evaluation)の`Base Rule + Rule Interference → Effective Rule`へ接続する。干渉のない現版ではBase RuleとEffective Ruleは同値である。将来のModifier、Permission / Prohibition、Replacementは既存の拡張責任であり、Catalogの追加によって使用可能になったとは扱わない。未対応の干渉を無視してBase Ruleだけで判断を確定することもない。

Legalであることと、Playerへ内容を表示可能であることは分ける。[Information Model](../model/information-model.md)に従い、内部の実個体参照・合法集合と、閲覧者が現在観測可能な情報を区別する。Current visibilityは現在の閲覧権、Player Knowledgeは過去の観測から得た知識であり、知っていることから現在の閲覧権やHidden個体追跡を追加しない。

### Automation evidence

全項目のAutomation statusは`Not implemented`とする。Domain Engine、Domain tests、Runner / Step Definitionsは未実装である。[Verification Strategyの状態語彙](../verification-strategy.md#current-state-and-future-state)であるDefined / Formalized / Statically Verified / Automated / Executable Verifiedは、対象範囲と根拠を伴って[#23](https://github.com/kjun1/card-game/issues/23)で具体化する。

Catalogの書式Check、参照レビュー、関連FeatureやCard定義のCheck成功は、Runtime Decision自体を機械検証した根拠ではない。ここでは個々のDecisionへStatically Verified / Automated / Executable Verifiedを付けず、Coverage Statusの体系やMatrixを追加しない。Related Acceptanceは仕様との対応であり、実行済みScenarioの一覧ではない。

## DEC-001 Unit Deploy Eligibility

| Field | Definition |
| --- | --- |
| Purpose | 通常のUnit Deploy意思決定を現在の入力で受理できるか判断する。非Action検証とAction指定Deployの宣言検証で共通の配置資格を使う |
| Inputs | actor / Active Player、Game ResultとTurn / Operation段階、Source個体の所有Player・現在Zoneと参照定義、定義のCard Type・Deploy Operation・当該操作の条件、配置先Unit Zone、DEC-004のCapacity結果、DEC-002のEffective Cost、支払Playerの現在Resource、当該Deployに適用されるEffective Rule |
| Decision / Output | actor・Source・Operation / Timingの資格、配置先が上限内か、全Resourceで有効Costを支払えるかを評価しAllowed / Rejectedを返す。Unitであることと自分のHandにあることを含む。配置状態を生成する判断ではない |
| Authoritative sources | Requirements: [GR-007、GR-010、GR-012、GR-013、GR-016、GR-021](../requirements/game-requirements.md#requirements)。Rules: [Operation](../rules/core-rules.md#operation)、[Zone transitions](../rules/core-rules.md#zone-transitions)、[Zone Capacity](../rules/deck-rules.md#zone-capacity)、[Cost timing](../rules/resource-rules.md#cost-timing)。Model: [Card types](../model/card-model.md#card-types)、[GameState](../model/domain-engine-architecture.md#gamestate)、[Zone transition state](../model/state-model.md#zone-transition-state) |
| Used from Process / BPMN | [Turn](../process/turn-flow.md): `Task_SelectOperation` / `Task_ExecuteOperation`から[Action / Reaction](../process/action-reaction-flow.md#selection-and-validation)へ。[Action / Reaction BPMN](../process/bpmn/action-reaction-flow.bpmn): Unit Deployについて`Task_ValidateImmediate` → `Gateway_ImmediateValid`、Action指定時は`Task_ValidateAction` → `Gateway_ActionValid` |
| Process continuation | Allowedを受けて、非Actionなら既存の支払い・解決へ、合法なAction宣言ならWindow開始境界へ進む。Rejectedの非Actionは未完了を返し、Actionは再宣言へ戻る。Cost・移動・配置初期化・完了はProcess / State Transitionが行う |
| Related Acceptance | [AC-BOARD-001、AC-BOARD-003、AC-BOARD-005（Unit Deployの行）、AC-BOARD-013、AC-BOARD-014、AC-BOARD-019](../acceptance/board-zone.feature)、[AC-AR-008](../acceptance/action-reaction.feature)、[AC-TURN-007](../acceptance/turn.feature)。判断と配置State生成の対応は[BoardのExample Mapping](../acceptance/example-mapping.md#capability-boardのzoneと配置状態と公開情報を管理する)を参照 |
| Automation status | Not implemented |
| Notes / unresolved questions | 非Actionの初回Deployが最初のSlice。初回・再Deployの初期化はRules / Modelの責任であり、追加Decisionにしない。EffectによるDeployは対象外で、[Q-SCHEMA-003](../model/card-definition-schema.md#unsupported-concepts-and-open-questions)に従う |

判定の集約は次の形とする。個々の規範・数値は上記正本を参照し、条件の全組合せや拒否理由の優先順位は定義しない。

| actor / Source / Operationの資格 | DEC-004で上限内 | 全ResourceでDEC-002を支払える | Output |
| --- | --- | --- | --- |
| すべて成立 | Yes | Yes | Allowed |
| 必要条件のいずれかが不成立 | 任意 | 任意 | Rejected |
| 任意 | No | 任意 | Rejected |
| 任意 | 任意 | No | Rejected |

## DEC-002 Effective Cost

| Field | Definition |
| --- | --- |
| Purpose | 操作・Abilityに適用するCostを、Resource残量や支払い処理から独立して評価する |
| Inputs | 選択したOperation / AbilityのBase Cost、Source・支払Player・対象と現在のGameState、利用するProcess / Timing、対象Rule・Subject / Scope / Durationを識別する干渉文脈（将来対応する範囲）、適用可能なEffective Rule |
| Decision / Output | Base Costに適用可能なRule評価を接続し、Energy / Momentum等のResourceごとのEffective Costを返す。現版の干渉なしの範囲ではEffective Cost = Base Cost。現在の残量と比較した支払い可能性や、支払い済み状態はOutputに含めない |
| Authoritative sources | Requirements: [GR-010、GR-011、GR-023、GR-024、GR-025、GR-026](../requirements/game-requirements.md#requirements)。Rules: [Resource definition](../rules/resource-rules.md#resource-definition)、[Momentum](../rules/resource-rules.md#momentum)、[Cost timing](../rules/resource-rules.md#cost-timing)。Model: [Ability](../model/card-model.md#ability)、[Rule Evaluation](../model/domain-engine-architecture.md#rule-evaluation)、[Card Definition integration](../model/domain-engine-architecture.md#card-definition-integration) |
| Used from Process / BPMN | [Action / Reaction](../process/action-reaction-flow.md#cost-semantics) / [BPMN](../process/bpmn/action-reaction-flow.bpmn): `Task_ValidateImmediate`、`Task_ValidateAction`、`Task_ValidateReaction`と`Task_PayImmediateCost`、`Task_PayActionCost`、`Task_PayReactionCost`。[Attack](../process/attack-flow.md#block-step) / [BPMN](../process/bpmn/attack-flow.bpmn): `Task_ValidateAttackReaction`、`Task_ValidateBlock`と`Task_PayAttackReactionCost`、`Task_PayBlockCost` |
| Process continuation | 各Eligibility / Runtime Validationは全Resourceの残量と有効Costを比較する。支払いProcessは既存時点でCostを適用し、Momentumなら移転する。Action宣言で本体Energyを支払ったり、Costの一部だけを先に支払ったりする指示ではない |
| Related Acceptance | 干渉なしのCost利用: [AC-BOARD-013](../acceptance/board-zone.feature)、[AC-AR-008、AC-AR-009、AC-AR-010、AC-AR-011、AC-AR-012](../acceptance/action-reaction.feature)、[AC-RESOURCE-005、AC-RESOURCE-006、AC-RESOURCE-007、AC-RESOURCE-008、AC-RESOURCE-009](../acceptance/resource.feature)、[AC-ATK-008、AC-ATK-009](../acceptance/attack.feature)。Modifier適用のExecutable Acceptanceは存在しない |
| Automation status | Not implemented |
| Notes / unresolved questions | Cost Modifierの優先順位・合成・下限・支払い境界間での再評価は今回確定しない。[Rule InterferenceのExample Mapping](../acceptance/example-mapping.md#capability-card固有のrule-interferenceを追加可能にする)、[Q-ENGINE-002、Q-ENGINE-003、Q-ENGINE-004](../model/domain-engine-architecture.md#open-questions)へ接続する。将来例の存在からModifier実装済みとは扱わない |

## DEC-003 Legal Target Set

| Field | Definition |
| --- | --- |
| Purpose | 評価するOperation / Ability / Effect文脈で、現在選択できる合法対象を求めるRuntime Decision |
| Inputs | Definition Target Constraint、Effect Target Requirement（AttackではCoreが与えるTarget制約とAttack Rule）、現在のGameStateと個体の存在・Zone・配置状態、actor / ControllerとSource・選択文脈、Current visibility / viewer、Effective Rule。Player Knowledgeは閲覧権限を拡張する入力にしない |
| Decision / Output | `Legal Target Set = Definition Target Constraint ∩ Effect Target Requirement ∩ Runtime Eligibility`として現在の集合を返す。空集合も結果である。Runtime Eligibilityは現在状態・選択可能性・Visibilityと干渉評価済みのRuleを使う。この式は責任の合成であり、フィルタの固定実行順ではない |
| Authoritative sources | Requirements: [GR-015、GR-020、GR-022、GR-023、GR-024、GR-025、GR-026](../requirements/game-requirements.md#requirements)。Rules: [Information visibility](../rules/core-rules.md#information-visibility)、[Attack](../rules/combat-rules.md#attack)。Model: [Target semantics](../model/card-model.md#target-semantics)、[Target Evaluation](../model/domain-engine-architecture.md#target-evaluation)、[Information Model](../model/information-model.md)、[Static Semantic boundary](../model/card-definition-schema.md#structural-validation-and-semantic-validation) |
| Used from Process / BPMN | [Action / Reactionの選択・検証](../process/action-reaction-flow.md#selection-and-validation) / [BPMN](../process/bpmn/action-reaction-flow.bpmn): `Task_DeclareAction`、`Task_ChooseReaction`の選択と`Task_ValidateImmediate`、`Task_ValidateAction`、`Task_ValidateReaction`。[Attack宣言](../process/attack-flow.md#attack-declaration) / [BPMN](../process/bpmn/attack-flow.bpmn): `Task_DeclareAttack` / `Task_ValidateAttack`、`Task_ChooseReactionAttack` / `Task_ValidateAttackReaction`。候補照会の独立Taskは現BPMNにないが、これらの選択境界から同じ評価を使う |
| Process continuation | Playerは合法集合からSelected Targetを選び、Runtime Validationは実際のCommand入力Stateで所属を検証する。内部集合と閲覧者向け候補情報を区別する。候補照会はState / Resourceを変えず、後のCommand受理を予約しない。不正Targetは各Processの既存拒否経路へ戻る |
| Related Acceptance | [AC-TARGET-001、AC-TARGET-002、AC-TARGET-003、AC-TARGET-004、AC-TARGET-005](../acceptance/target-selection.feature)、[AC-AR-009、AC-AR-010](../acceptance/action-reaction.feature)、[AC-ATK-001、AC-ATK-002](../acceptance/attack.feature)。[TargetのExample Mapping](../acceptance/example-mapping.md#capability-targetの制約から現在の合法対象を求める)を参照 |
| Automation status | Not implemented |
| Notes / unresolved questions | Static target compatibilityは存在し得る互換種別の確認であり、このDecisionではない。広いSupport Zone制約とRevealは静的にvalidでも、現在Setがなければ空集合。PublicなSetの存在を選択できることからHiddenなName / Abilityの表示権を導かない。`source` / `declared_action_source`の文脈束縛は自由な候補選択と区別する。複数Stepの合同充足性・移動後の参照寿命・再検証・不適合処理は[Q-ENGINE-001、Q-ENGINE-005、Q-ENGINE-006](../model/domain-engine-architecture.md#open-questions)、[Q-SCHEMA-004](../model/card-definition-schema.md#unsupported-concepts-and-open-questions)へ残す |

## DEC-004 Zone Capacity

| Field | Definition |
| --- | --- |
| Purpose | 通常Deploy / Setで配置先Zoneの上限を超えるか判断する。個別操作の最終受理と区別する |
| Inputs | 配置先の所有PlayerとZone種別、現在の占有個体・使用数、通常Deploy / Setによる配置要求、[Parameters](../rules/deck-rules.md#parameters)のBase Capacity、当該Zone / Player / 操作のEffective Ruleと干渉文脈 |
| Decision / Output | Effective Capacityを評価し、配置要求後の占有がWithin Capacity / Exceeds Capacityのどちらか返す。現版の干渉なしではEffective Capacity = Base Capacity。Support ZoneではFace-up SupportとSet / Revealed Tacticの共通占有を評価し、Player・Zoneごとの容量を混ぜない |
| Authoritative sources | Requirements: [GR-006、GR-016、GR-017、GR-023、GR-024、GR-025、GR-026](../requirements/game-requirements.md#requirements)、[IR-017](../requirements/interaction-requirements.md#requirements)。Rules: [Board](../rules/core-rules.md#board)、[Parameters](../rules/deck-rules.md#parameters)、[Zone Capacity](../rules/deck-rules.md#zone-capacity)。Model: [Domain Model](../model/domain-model.md#responsibilities)、[GameState](../model/domain-engine-architecture.md#gamestate)、[Rule Evaluation](../model/domain-engine-architecture.md#rule-evaluation) |
| Used from Process / BPMN | [Action / Reaction](../process/action-reaction-flow.md#selection-and-validation) / [BPMN](../process/bpmn/action-reaction-flow.bpmn): Unit / Support Deploy・Setについて`Task_ValidateImmediate` → `Gateway_ImmediateValid`、`Task_ValidateAction` → `Gateway_ActionValid`。DEC-001の配置条件として利用する |
| Process continuation | 上限内という結果を他の資格・支払い可能性と合わせて検証する。超過なら既存拒否経路へ進み、支払い・配置・Window開始を行わない。このDecisionはSlotを予約したり、既存Board Cardを任意Discardしたりしない |
| Related Acceptance | [AC-BOARD-001、AC-BOARD-002、AC-BOARD-003、AC-BOARD-004、AC-BOARD-005、AC-BOARD-008、AC-BOARD-013](../acceptance/board-zone.feature)、[AC-AR-008](../acceptance/action-reaction.feature) |
| Automation status | Not implemented |
| Notes / unresolved questions | Hand LimitはこのDecisionへ統合しない。Slot配置UIやEffectによるDeploy / Board Zone間移動は定義しない。Capacity Modifierは未実装で、[Q-ENGINE-002、Q-ENGINE-004](../model/domain-engine-architecture.md#open-questions)、[Q-SCHEMA-003](../model/card-definition-schema.md#unsupported-concepts-and-open-questions)を参照 |

## DEC-005 Attack Eligibility

| Field | Definition |
| --- | --- |
| Purpose | 現在のAttackerと宣言TargetでAttackを宣言できるか判断する |
| Inputs | actor / Active Player、Game ResultとTurn / Attack段階、自分のUnit ZoneのAttacker・Ready / Exhausted・Deploy Attack制限、宣言Target、DEC-003のCore Attack制約による合法集合、AttackのPermission / Prohibitionを含むEffective Rule |
| Decision / Output | Attackerの有効なAttack資格と宣言Targetの合法性からAllowed / Rejectedを返す。干渉なしのAttack資格は現在のReady / Attack制限を用いる。Combat結果やAttack Commit後の状態は返さない |
| Authoritative sources | Requirements: [GR-007、GR-021、GR-022、GR-023、GR-024、GR-025、GR-026](../requirements/game-requirements.md#requirements)、[IR-002、IR-011](../requirements/interaction-requirements.md#requirements)。Rules: [Unit state](../rules/combat-rules.md#unit-state)、[Attack](../rules/combat-rules.md#attack)。Model: [Unit attack eligibility](../model/state-model.md#unit-attack-eligibility)、[Rule Evaluation](../model/domain-engine-architecture.md#rule-evaluation)、[Target Evaluation](../model/domain-engine-architecture.md#target-evaluation) |
| Used from Process / BPMN | [Attack declaration](../process/attack-flow.md#attack-declaration) / [Attack BPMN](../process/bpmn/attack-flow.bpmn): `Task_DeclareAttack` → `Task_ValidateAttack` → `Gateway_AttackValid` |
| Process continuation | AllowedならReaction Window開始境界へ、Rejectedなら再宣言へ戻る。判定・宣言でAttackerをExhaustしない。Exhaustは既存の`Task_AttackCommit` / `Task_ExhaustAttacker`の責任 |
| Related Acceptance | [AC-ATK-001、AC-ATK-002、AC-ATK-003](../acceptance/attack.feature)、配置直後の資格: [AC-BOARD-013、AC-BOARD-014、AC-BOARD-019](../acceptance/board-zone.feature) |
| Automation status | Not implemented |
| Notes / unresolved questions | Block資格とは共有しない。将来のAttack禁止を単なるExhaustへ置き換えない。干渉の詳細は[Q-ENGINE-002、Q-ENGINE-004](../model/domain-engine-architecture.md#open-questions)。初回Deploy Sliceでは配置直後Attack不可の観測を追跡し、Attack Procedureの実装を要求しない |

## DEC-006 Block Eligibility

| Field | Definition |
| --- | --- |
| Purpose | AttackのBlock Stepで、選択した防御UnitのBlockを受理できるか判断する |
| Inputs | 防御Player、継続中のGameと宣言Attack・Reaction未使用・Block段階、宣言Target / 現在のFinal Target、選択Blocking Unitの所有・現在のUnit Zone所在と選択数、SourceのBlock Abilityと条件、DEC-002のEffective Cost、支払Playerの全Resource、Blockに適用されるEffective Rule |
| Decision / Output | 正しい防御文脈、選択Unit数・Source / Ability資格、全Costの支払い可能性を評価しAllowed / Rejectedを返す。Ready / ExhaustedとDeploy直後Attack制限をAttack資格から流用しない。Block辞退はPlayerの選択としてProcessが扱う |
| Authoritative sources | Requirements: [GR-011](../requirements/game-requirements.md#requirements)、[IR-012、IR-013、IR-014、IR-015、IR-016](../requirements/interaction-requirements.md#requirements)。Rules: [Block](../rules/combat-rules.md#block)、[Block Cost](../rules/resource-rules.md#block-cost)、[Momentum](../rules/resource-rules.md#momentum)。Model: [Ability](../model/card-model.md#ability)、[Unit activity state](../model/state-model.md#unit-activity-state)、[Rule Evaluation](../model/domain-engine-architecture.md#rule-evaluation) |
| Used from Process / BPMN | [Block step](../process/attack-flow.md#block-step) / [Attack BPMN](../process/bpmn/attack-flow.bpmn): `Task_ChooseBlock` / `Task_SelectBlockingUnit` → `Task_ValidateBlock` → `Gateway_BlockValid` |
| Process continuation | AllowedならBlock Cost支払い・Final Target変更・Attack Commitへ、RejectedならBlock使用 / 辞退の選択へ戻る。判断はCost移転・Target変更・AttackerやBlocking UnitのExhaustを行わない |
| Related Acceptance | [AC-ATK-005、AC-ATK-006、AC-ATK-007、AC-ATK-008、AC-ATK-009、AC-ATK-010](../acceptance/attack.feature) |
| Automation status | Not implemented |
| Notes / unresolved questions | BlockはReactionでもActionでもない。Reaction使用時にBlockへ進まないことはProcessの制御責任。新しいBlocker属性・回数Limitを追加しない。拡張する場合は[Q-SCHEMA-006](../model/card-definition-schema.md#unsupported-concepts-and-open-questions)、[Q-ENGINE-002、Q-ENGINE-004](../model/domain-engine-architecture.md#open-questions)を参照 |

## DEC-007 Reaction Window Eligibility

| Field | Definition |
| --- | --- |
| Purpose | 当該処理がReaction Windowを開始する条件を満たすか判断する。Source候補の存在やReaction選択の合法性とは分ける |
| Inputs | Operation種別（Attackを含む）、検証済み定義の当該操作 / AbilityのAction指定、Game Result・Process段階、宣言の合法性結果（Unit DeployならDEC-001、AttackならDEC-005）、Window許可のEffective Rule。Reaction / Block内かという文脈も含む |
| Decision / Output | 有効なAction分類と合法宣言・Window開始文脈からOpen / Do not openを返す。Action指定を同じCardの別操作へ波及させず、意味分類Tagから推測しない。非Action、不正宣言、Reaction / Block自身へのWindowはDo not open。現版の合法ActionはReaction SourceがなくてもOpen |
| Authoritative sources | Requirements: [IR-001、IR-002、IR-009、IR-010、IR-011、IR-013、IR-019](../requirements/interaction-requirements.md#requirements)、[GR-023、GR-024、GR-025、GR-026](../requirements/game-requirements.md#requirements)。Rules: [Action](../rules/core-rules.md#action)、[Block](../rules/combat-rules.md#block)。Model: [Action keyword](../model/card-model.md#action-keyword)、[Rule Evaluation](../model/domain-engine-architecture.md#rule-evaluation) |
| Used from Process / BPMN | [Action / Reaction](../process/action-reaction-flow.md#principle) / [BPMN](../process/bpmn/action-reaction-flow.bpmn): `Gateway_IsAction`のAction分類を前提に、`Gateway_ActionValid`の合法枝 → `Task_ChooseReaction`でWindowを開始する判断境界。[Attack](../process/attack-flow.md#attack-declaration) / [BPMN](../process/bpmn/attack-flow.bpmn): `Gateway_AttackValid`の合法枝 → `Task_ChooseReactionAttack`。単一の「Window可否」Gatewayを追加するものではない |
| Process continuation | `Gateway_IsAction`の分類結果だけではWindowを開始せず、宣言検証後にOpenの結果を使ってOpponentへ選択を渡す。Action / Non-Actionの分類とOpen / Do not openを同一視しない。Do not openの非Actionはその検証・解決へ、不正Actionは再宣言へ進む。Window開始そのものと主体間の制御移譲はProcessの責任 |
| Related Acceptance | [AC-AR-001、AC-AR-002、AC-AR-003、AC-AR-004、AC-AR-005、AC-AR-006、AC-AR-009、AC-AR-014、AC-AR-015](../acceptance/action-reaction.feature)、[AC-BOARD-005](../acceptance/board-zone.feature)、[AC-ATK-001、AC-ATK-002、AC-ATK-007](../acceptance/attack.feature)、[AC-RESOURCE-011](../acceptance/resource.feature) |
| Automation status | Not implemented |
| Notes / unresolved questions | Reaction AvailableとWindow Openは別の結果。将来の特定ActionのReaction禁止は拡張要求であり、現版の必須Windowを変更しない。複数Permission / Prohibitionの競合は[Q-ENGINE-002、Q-ENGINE-004](../model/domain-engine-architecture.md#open-questions)へ残す |

## DEC-008 Reaction Eligibility

| Field | Definition |
| --- | --- |
| Purpose | 開いたWindowでOpponentが選択したReactionを受理できるか判断する。元Actionの資格判定と区別する |
| Inputs | 応答actorとActive Player / Opponent、Game Result・宣言Action・現在のReaction Window、選択または辞退、Source個体の所有・Zone・配置状態とUnit / Face-up Support / Set CardのReaction定義、Activation / Timing条件、Selected TargetとDEC-003の合法集合・文脈参照、DEC-002のEffective Cost、actorの現在Resource、Current visibilityとEffective Rule |
| Decision / Output | Window / actor、Source・Timing・Target、全Costの支払い可能性を評価し、選択ReactionにAllowed / Rejectedを返す。Window内の辞退は有効な選択とする。通常のHand Sourceは許可しない。元ActionをCancelする結果やReaction Effectの結果は返さない |
| Authoritative sources | Requirements: [IR-003、IR-004、IR-005、IR-007、IR-010](../requirements/interaction-requirements.md#requirements)、[GR-010、GR-022、GR-023、GR-024、GR-025、GR-026](../requirements/game-requirements.md#requirements)。Rules: [Reaction Source](../rules/core-rules.md#reaction-source)、[Action](../rules/core-rules.md#action)、[Reaction Cost](../rules/resource-rules.md#reaction-cost)。Model: [Activation categories](../model/card-model.md#activation-categories)、[Target Evaluation](../model/domain-engine-architecture.md#target-evaluation)、[Information Model](../model/information-model.md) |
| Used from Process / BPMN | [Action / Reactionの選択・検証](../process/action-reaction-flow.md#selection-and-validation) / [BPMN](../process/bpmn/action-reaction-flow.bpmn): `Task_ChooseReaction` → `Task_ValidateReaction` → `Gateway_ReactionValid`。[Attack宣言](../process/attack-flow.md#attack-declaration) / [BPMN](../process/bpmn/attack-flow.bpmn): `Task_ChooseReactionAttack` → `Task_ValidateAttackReaction` → `Gateway_AttackReactionValid` |
| Process continuation | AllowedのReactionは支払い・解決・元Action取消へ、RejectedはReaction選択へ戻る。有効な辞退は元Actionの支払い・解決、AttackではBlock Stepへ進む。`Gateway_UsesReaction` / `Gateway_AttackReaction`はPlayerの使用 / 辞退を消費する分岐であり、SystemがPlayerの選択を代行する判断ではない |
| Related Acceptance | [AC-AR-010、AC-AR-011、AC-AR-015、AC-AR-016、AC-AR-017](../acceptance/action-reaction.feature)、[AC-ATK-004](../acceptance/attack.feature)、[AC-RESOURCE-003、AC-RESOURCE-011](../acceptance/resource.feature) |
| Automation status | Not implemented |
| Notes / unresolved questions | 利用可能候補の照会も同じSource / Timing / Target / Cost資格を使う。Reaction Available / Not Availableは使用可能な候補の有無として追跡でき、初回は別IDの条件を二重管理しない。候補0件からWindow省略や自動辞退を追加しない。候補・Source内容の投影は[Q-ENGINE-005、Q-ENGINE-006](../model/domain-engine-architecture.md#open-questions)。将来のHand Reaction例外は未合意Mechanicとして[Rule InterferenceのExample Mapping](../acceptance/example-mapping.md#capability-card固有のrule-interferenceを追加可能にする)を参照 |

## DEC-009 Game End Evaluation

| Field | Definition |
| --- | --- |
| Purpose | 既存の勝敗判定境界でGame継続か確定対象の勝敗結果かを判断する。残りの処理の停止・制御移譲を判断責任へ混ぜない |
| Inputs | 現在の固定済みGame Result、両Player / Core HP、必要なDraw要求と実行不能の事実・対象Player、現在到達した逐次適用または明示SimultaneousGroup全体の判定境界、適用済みStateと有効な勝敗規範。未適用の後続Effectは敗北条件へ加えない |
| Decision / Output | 固定済みなら同じGame Resultを返し、再判定しない。継続中なら当該境界でCore HP条件・必要なDraw不能を評価し、敗北条件なしではContinue、一方の敗北では対応するWin / Lose、定義された同時適用による双方敗北ではDrawを返す。結果の保持はGameState / Resolution Controlへ渡す |
| Authoritative sources | Requirements: [GR-002、GR-003、GR-004、GR-007、GR-008、GR-018、GR-019](../requirements/game-requirements.md#requirements)。Rules: [Game objective](../rules/core-rules.md#game-objective)、[Effect resolution](../rules/core-rules.md#effect-resolution)、[Draw and Hand Limit](../rules/deck-rules.md#draw-and-hand-limit)、[Combat resolution](../rules/combat-rules.md#combat-resolution)。Model: [Game result](../model/state-model.md#game-result)、[Resolution steps](../model/effect-resolution-model.md#resolution-steps)、[Player order](../model/effect-resolution-model.md#player-order)、[Game end](../model/effect-resolution-model.md#game-end) |
| Used from Process / BPMN | 判定: [Action / Reaction](../process/action-reaction-flow.md#effect-resolution-and-game-end) / [BPMN](../process/bpmn/action-reaction-flow.bpmn)の`Task_ResolveImmediate`、`Task_ResolveAction`、`Task_ResolveReaction`内部の共通Resolution境界。[Attack](../process/attack-flow.md#combat) / [BPMN](../process/bpmn/attack-flow.bpmn)の`Task_ResolveAttackReaction`内部と`Task_DamageCore`。[Turn](../process/turn-flow.md#semantics) / [BPMN](../process/bpmn/turn-flow.bpmn)の必要なDraw境界`Gateway_CanDraw` → `Task_RecordFailedDraw`。末尾Gatewayへ評価を遅延しない |
| Process continuation | Resolution Controlが最初の終了結果を保持し、残りのEffect・未処理Playerへの適用を停止する。結果消費: Action / Reactionの`Gateway_OperationGameEnded`、Attackの`Gateway_AttackGameEnded`、Turnの`Task_ReceiveGameResultTurn` / `Gateway_GameEndedTurn`、[Game](../process/game-flow.md) / [BPMN](../process/bpmn/game-flow.bpmn)の`Gateway_GameEnded` / `Task_FinalizeGameResult`。これらは固定済み結果を伝播し、再評価しない |
| Related Acceptance | [AC-TURN-005、AC-TURN-006、AC-TURN-010、AC-TURN-011、AC-TURN-012、AC-TURN-013、AC-TURN-014](../acceptance/turn.feature)、[AC-DECK-005、AC-DECK-006、AC-DECK-008、AC-DECK-009、AC-DECK-010、AC-DECK-011、AC-DECK-013](../acceptance/deck.feature)、[AC-RESOLUTION-001、AC-RESOLUTION-002、AC-RESOLUTION-003](../acceptance/effect-resolution.feature)、[AC-ATK-015](../acceptance/attack.feature) |
| Automation status | Not implemented |
| Notes / unresolved questions | Deckが空なだけでは敗北せず、必要なDraw不能を入力とする。双方への逐次処理と同時適用を区別し、後半を仮に実行してDrawへ変更しない。Unitの致死Damage / DestroyはCore HPによるGame敗北と別責任。一般の同時Effect競合は[Q-SCHEMA-005](../model/card-definition-schema.md#unsupported-concepts-and-open-questions)を参照 |

停止時のCost保持、未払いCostを支払わないこと、Operation完了 / Cancelの記録とGame終了報告の順序は既存のProcess / Resolution Modelが管理する。DEC-009は追加Effect、Operation再選択、Player切替を実行しない。

## First vertical slice and follow-ups

[#24](https://github.com/kjun1/card-game/issues/24)の[最初のVertical Slice](../model/domain-engine-architecture.md#first-vertical-slice)は、非Action Unit Deployの[AC-BOARD-013](../acceptance/board-zone.feature)を対象とする。

| Trace | Decision responsibility | 後続処理・観測の正本 |
| --- | --- | --- |
| AC-BOARD-013 → Unit Deploy検証 | DEC-001がDEC-002のEffective CostとDEC-004の配置結果、actor / Hand Source / Unit資格を使う | [Action / Reaction BPMN](../process/bpmn/action-reaction-flow.bpmn)の`Task_ValidateImmediate` → `Gateway_ImmediateValid` |
| 合法な非Action → 支払い・通常Deploy | Cost支払い、Hand → Unit Zone移動、配置初期化はDecision Outputを適用する処理 | [Cost timing](../rules/resource-rules.md#cost-timing)、[Zone transitions](../rules/core-rules.md#zone-transitions)、[Zone transition state](../model/state-model.md#zone-transition-state) |
| 解決直後 → State / Events / Result | 非ActionのWindowなしはDEC-007、Game継続の判定境界はDEC-009へ対応。Damage 0 / Ready / AttackLocked、Current HP、Operation CompletedはState / Processの観測 | [First vertical slice](../model/domain-engine-architecture.md#first-vertical-slice)、[Observation points](../acceptance/README.md#observation-points) |
| 配置直後のAttack不可 | DEC-005のAttack資格へ遡れる。Attack Command / Reaction / Block全体の実装をこのSliceへ含めない | [Deploy restriction](../rules/combat-rules.md#deploy-restriction)、[Unit attack eligibility](../model/state-model.md#unit-attack-eligibility) |
| AC-BOARD-003 / AC-AR-008 → 拒否 | DEC-004で満杯、またはDEC-002のCostを全Resourceで支払えずDEC-001はRejected | 支払い・Card移動なし、Operation未完了を既存[Scenario](../acceptance/action-reaction.feature)で観測 |

この対応はSliceの実装・自動化範囲を拡大する指示ではない。正常Deployと既存拒否境界から、判断と支払い・配置State生成・完了を区別して追跡する。

[#22 Capability / Process Catalog](https://github.com/kjun1/card-game/issues/22)は仕事のActor / Trigger / OutcomeをProcessへ結び付け、本CatalogのDecision IDを利用できる。[#23 Automation Coverage](https://github.com/kjun1/card-game/issues/23)は各項目のAuthoritative sources、Used from Process / BPMN、Related Acceptanceと未実装状態を入力に、Requirement → Decision / Rule → Process → Scenario → Engine Capability → Executable Verificationを対応付ける。Capability Catalog / Coverage Matrix自体はここで作らない。

## Unresolved boundaries

合意済み範囲でOutputを定め、以下の拡張では既存Questionの解決を先に行う。Catalog作成のために未合意の結果を補わない。新たに一意なOutputを決められない例が見つかった場合は、既存Questionへ結び付けるかPRにfollow-up Issue候補として記載する。

| Question | Affected decisions / boundary |
| --- | --- |
| [Q-ENGINE-001](../model/domain-engine-architecture.md#open-questions) | DEC-003とその利用先。共有Targetの複数Stepの合同充足性、所在変更後の寿命・再検証、不適合時のskip / 再選択 / 停止 |
| [Q-ENGINE-002、Q-ENGINE-003、Q-ENGINE-004](../model/domain-engine-architecture.md#open-questions) | DEC-002、DEC-004、DEC-005、DEC-007、DEC-008等の将来Rule Interference。Modifier優先順位、Replacement競合、Priority / Stack、Trigger queue、Continuous layers、Scope / Durationの形式 |
| [Q-ENGINE-005、Q-ENGINE-006](../model/domain-engine-architecture.md#open-questions) | API・診断・途中観測・閲覧者別投影・Runtime個体ID・保存・履歴・Player Knowledge。Domain契約から具体APIやHidden追跡方式を固定しない |
| [Q-SCHEMA-003、Q-SCHEMA-004、Q-SCHEMA-005、Q-SCHEMA-006](../model/card-definition-schema.md#unsupported-concepts-and-open-questions) | EffectによるDeploy / Set、任意ZoneのReveal、一般の同時Effect競合、Card固有Limit。現在の通常配置・Set対象Reveal・合意済み同時適用から拡張の期待結果を推測しない |

本CatalogはMarkdownによる管理層であり、Domain Engine、Runtime validator、DMN XML / Engine、Cucumber / Step Definitions / Executable Acceptanceを追加しない。Rules / Requirementsの意味、新しいゲームMechanic、Card Pool / Balanceも変更しない。
