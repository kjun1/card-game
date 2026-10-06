# Capability / Process Catalog

ゲーム上に存在する仕事のID、Actor / Trigger / Inputs / Outcomeと、Process・Decision・要求・規範・AcceptanceへのTraceabilityを管理する。[Issue #22](https://github.com/kjun1/card-game/issues/22)の初期Catalogであり、[#23 Automation Coverage](https://github.com/kjun1/card-game/issues/23)が対象範囲を追跡する親台帳とする。

## Catalog

| ID | Capability | Primary actor | Trigger | Outcome | Main Process | Automation |
| --- | --- | --- | --- | --- | --- | --- |
| [CAP-001](#cap-001-game-setup) | Game Setup | Game System | Game開始の準備 | 最初のTurnを開始できる初期State | Game Flow | Not implemented |
| [CAP-002](#cap-002-mulligan) | Mulligan | 各Player | Opening Hand配布後の交換機会 | 交換・返却・Shuffle完了 / 不正選択の拒否 | Game Flow | Not implemented |
| [CAP-003](#cap-003-turn-execution) | Turn Execution | Active Player | Turn開始・制御権取得 | Turn完了 / Game終了の報告 | Turn Flow / Game Flow | Not implemented |
| [CAP-004](#cap-004-turn-start) | Turn Start | Game System | Active PlayerのTurn開始 | 開始時State更新 / Draw不能によるGame終了 | Turn Flow | Not implemented |
| [CAP-005](#cap-005-unit-deploy) | Unit Deploy | Active Player | Unit Deploy選択・宣言 | Unit配置とOperation完了 / 拒否 / Cancel | Turn Flow / Action・Reaction Flow | Not implemented |
| [CAP-006](#cap-006-support-deploy) | Support Deploy | Active Player | Support Deploy選択・宣言 | Face-up Support配置とOperation完了 / 拒否 / Cancel | Turn Flow / Action・Reaction Flow | Not implemented |
| [CAP-007](#cap-007-set) | Set | Active Player | Set選択・宣言 | 裏向きの事前配置とOperation完了 / 拒否 / Cancel | Turn Flow / Action・Reaction Flow | Not implemented |
| [CAP-008](#cap-008-tactic-play) | Tactic Play | Active Player | TacticのPlay選択・宣言 | Effect解決・Discard・Operation完了 / 拒否 / Cancel | Turn Flow / Action・Reaction Flow | Not implemented |
| [CAP-009](#cap-009-ability-use) | Ability Use | Active Player | Operation Ability選択・宣言 | Ability解決とOperation完了 / 拒否 / Cancel | Turn Flow / Action・Reaction Flow | Not implemented |
| [CAP-010](#cap-010-reaction) | Reaction | Opponent / Defending Player | 合法Actionに対するWindow開始 | Used: 解決と元Action取消 / Declined / 拒否 | Action・Reaction Flow / Attack Flow | Not implemented |
| [CAP-011](#cap-011-attack) | Attack | Active Player / Attacking Player | Attack選択・宣言 | Combat解決 / 宣言拒否 / Cancel / Game終了 | Attack Flow | Not implemented |
| [CAP-012](#cap-012-block) | Block | Defending Player | Reaction未使用のAttackがBlock Stepへ到達 | Final Target変更 / 辞退 / 拒否 | Attack Flow | Not implemented |
| [CAP-013](#cap-013-draw) | Draw | Game System | 必要なDraw要求 | DrawとHand Limit処理 / Draw不能によるGame終了 | Turn Flow / 各Resolution、Setup | Not implemented |
| [CAP-014](#cap-014-effect-resolution) | Effect Resolution | Game System | 既存ProcessがResolutionを開始 | 定義された適用結果 / 勝敗成立時の打ち切り | Action・Reaction Flow / Attack Flow | Not implemented |
| [CAP-015](#cap-015-target-selection) | Target Selection | 文脈上の選択Player | 対象を必要とする選択・候補照会 | 候補提示・Selected Target束縛 / 空集合・不正選択 | Action・Reaction Flow / Attack Flow | Not implemented |
| [CAP-016](#cap-016-game-end) | Game End | Game System | 既存の勝敗確認境界・必要Draw不能 | Continue / 結果固定・伝播とGame終了 | Resolution / Turn Flow / Game Flow | Not implemented |
| [CAP-017](#cap-017-deck-construction) | Deck Construction | 各Player | 対戦用Deckの準備・提出 | 制約を満たすDeck / 不正Deck | Game Flow（準備の詳細は未展開） | Not implemented |

## Responsibility and authority

このrepoにおけるCapabilityは、**ゲーム上で意味のあるOutcomeを生むために、Player / Game Systemが遂行する業務能力・仕事単位**である。本Catalogは「何の仕事が存在するか」とその同一性・参照関係の正本であり、ゲーム規範や処理順の正本にはしない。

| Concept | Responsibility | 正本・対応先 |
| --- | --- | --- |
| Capability | 何の仕事を遂行できる必要があるか。誰が何をきっかけに何を達成するか | 本CatalogのCAP IDと各項目 |
| Process | その仕事を誰がどの順で遂行し、制御を移すか | [BPMN](../process/bpmn/README.md)。Process Markdownは説明・レビュー用プレビュー |
| Decision | Process中の判断で何を評価し何を返すか | [Decision Catalog](../decisions/README.md)のDEC ID |
| Rule | その仕事が従うゲームの規範 | [Rules](../README.md#rules) |
| Requirement / Model | 満たす要求、概念・状態・解決意味論 | [Requirements](../README.md#requirements)、[Model](../README.md#model) |
| Acceptance | Outcomeや境界を観測する合意済み具体例 | [Example Mapping](../acceptance/example-mapping.md)、既存FeatureとScenario ID |
| Implementation | 判断・処理を実行するSoftwareとその検証 | [Domain Engine Architecture](../model/domain-engine-architecture.md)、将来のEngine / Domain tests / Executable Acceptance |

~~~text
CAP-005 Unit Deploy
  → Turn Flow / Action・Reaction Flow
  → DEC-001 Unit Deploy Eligibility
     DEC-002 Effective Cost
     DEC-004 Zone Capacity
  → 既存Processによる支払い・配置・初期化・完了
~~~

Unit Zone Capacityの値はRule、現在の配置要求が上限内かはDEC-004、Unitを配置する仕事はCAP-005である。CatalogへDecision条件表、BPMNの全Task列、Rule全文を複製しない。Inputs / OutcomeはDomain上の情報と到達点を示し、EngineのCommand / Result型やAPI名を固定しない。

Capabilityは実装関数・Component、BPMN Task、Gherkin Scenario、GitHub Issueそのものではない。担当者、期限、工数、進捗率、Issue / PRの作業一覧を管理するWBSにも使わない。

### Identity and granularity

- IDは`CAP-001`形式で割り当てる。番号は実行順、BPMN Task ID、Requirement ID、Scenario ID、Issue番号を意味しない。
- 仕事の意味が維持される限りIDを保持する。名称変更・移設でも維持し、廃止IDは再利用しない。分割・置換時は元IDとの関係を残す。
- 独立した目的、Trigger、Outcomeがあり、ProcessとAcceptanceのまとまった振る舞いへ追跡できる粒度を採る。Energy確認、Card移動、Ready設定、Damage初期化はDeploy等の内部責任として扱う。
- Operation Selectionは独立登録せず、CAP-003 Turn Executionへ含める。選択・再選択・「何もしない」を含むTurnの達成目的を追跡し、単独のUser Task / GatewayをCapabilityへ昇格させない。
- Action分類・Window開始・Cost支払い・Combat内のDamage / Destroyも、それぞれ利用するCapabilityのProcess / Decision / Ruleへ参照する。共通処理という理由だけでTaskを登録しない。

Kindは`Primary`と`Supporting`の2種類だけを使う。Primaryは準備・Turn・操作・応答・対戦終了の目的、Supportingは複数の仕事で再利用するDraw・Effect Resolution・Target Selectionである。Supportingは実装Componentの分類ではなく、独立したTriggerと観測可能なOutcomeを持つDomain上の仕事である。

Game SystemがPrimary ActorとなるTurn Start、Draw、Effect Resolution、Game End等はSystemによる仕事を表す。Target Selectionは再利用されるが、自由な対象の選択主体はPlayerであり、Systemが合法候補評価・情報投影・束縛検証を支える。DEC-003による集合計算そのものとは区別する。固定の`source`等をSystemが文脈から束縛する責任をPlayerの自由選択にしない。

Parent capabilityは目的の包含だけを示す。MulliganはGame Setup、Turn Startと主OperationはTurn Execution、BlockはAttackへ対応する。共有Reaction / Supportingには単一Parentを強制しない。Game Executionや抽象Operationに追加IDは設けず、対戦全体の処理順はGame Flowへ参照する。親・子・共有Capabilityを#23で別々の実装数として合算する根拠にはしない。

### Reading traceability and automation

各項目は共通のFieldで記載し、ID / Nameは見出しを正本とする。Main Process / BPMNのEntry / Exitは所在を確認する境界のみで、順序の全体はリンク先に従う。

Related Decisionsは登録済み判断への参照であり、Decisionが未登録の仕事も存在する。空欄やDEC IDの不在を「検証不要」と解釈しない。Authoritative sourcesはRequirements / Rules / Modelの該当箇所、処理順はMain Process / BPMNへ追跡する。Requirementタグだけでは細則の根拠を表せないため規範への参照も保持する。

Related Acceptanceはその仕事のOutcome / Boundaryを観測するScenarioに限定する。複数の仕事を観測する例は共有できる。Scenario Outlineは同じIDの独立した例であり、操作種別が異なる表では該当行を明記する。Feature名やScenario IDのCapability部分をCAP IDへ改名しない。

全項目のAutomation statusは`Not implemented`である。Domain Engine / Domain tests / Runner / Step Definitions / Executable Acceptanceは存在しない。[Verification Strategy](../verification-strategy.md#current-state-and-future-state)のDefined / Formalized / Statically Verified / Automated / Executable Verifiedは[#23](https://github.com/kjun1/card-game/issues/23)で対象範囲と根拠を伴って整理する。Catalogの存在、Markdown書式や関連ArtifactのCheck成功からCapabilityのStatusを一括付与しない。

Game終了による早期停止はすべての該当項目で既存[Game end](../model/effect-resolution-model.md#game-end)と各Processを優先する。解決済みOperationの完了・ReactionによるCancelの記録を維持することは、終了後のEffect・再選択・Player切替を許可しない。

## CAP-001 Game Setup

| Field | Definition |
| --- | --- |
| Purpose | 対戦を準備し、決定されたFirst Playerが最初のTurnを開始できるStateを整える |
| Kind / Parent capability | Primary / なし |
| Primary Actor | Game System |
| Supporting Actor / System | 各PlayerがDeckを準備しMulliganを選ぶ。Systemが先攻決定・Shuffle・配布・初期化と両者の合流を扱う |
| Trigger | Game開始に向けた両Playerの準備 |
| Inputs | 2人のPlayer、準備するDeck、コイントス結果、Setup規範、各PlayerのMulligan選択 |
| Outcome | Opening HandとMulligan後のDeck、初期Core / Resourceと空のBoard、First Playerが整い、最初のTurnを開始できる |
| Main Process / BPMN | [Game Flow](../process/game-flow.md#bpmn-style-elements) / [Game BPMN](../process/bpmn/game-flow.bpmn)。Entry: `Start_Game`、Exit: `Task_Initialize`後の`Task_ExecuteTurn`開始境界 |
| Related Decisions | Setup固有の登録済みDecisionなし。Deck準備とMulliganを含む既存検証責任はリンク先に従う |
| Authoritative sources | Requirements: [GR-001、GR-014](../requirements/game-requirements.md#requirements)。Rules: [Game setup](../rules/deck-rules.md#game-setup)、[First Player](../rules/deck-rules.md#first-player)、[Energy](../rules/resource-rules.md#energy)、[Momentum](../rules/resource-rules.md#momentum)。Model: [Domain responsibilities](../model/domain-model.md#responsibilities)、[GameState](../model/domain-engine-architecture.md#gamestate) |
| Related Acceptance | [AC-SETUP-001、AC-SETUP-008](../acceptance/setup-mulligan.feature): First Player・Opening前のShuffle・配布・Turn開始境界。[AC-RESOURCE-001、AC-RESOURCE-011](../acceptance/resource.feature): 初期Resource・空Board |
| Uses / Related capability | [CAP-002 Mulligan](#cap-002-mulligan)、[CAP-017 Deck Construction](#cap-017-deck-construction)、配布時の[CAP-013 Draw](#cap-013-draw) |
| Automation status | Not implemented |
| Notes / unresolved questions | Setup / Mulliganの主要順序は既存BPMNにある。Deck準備の判定やMulligan拒否の詳細は未展開で、[Process coverage](#process-coverage-and-unresolved-boundaries)へ参照する。Core初期HPの新しい数値やSetup不正時の全体Outcomeを追加しない |

## CAP-002 Mulligan

| Field | Definition |
| --- | --- |
| Purpose | 各PlayerがOpening Handを一度だけ交換し、交換した同じCard自体を引き直さず対戦準備を終える |
| Kind / Parent capability | Primary / [CAP-001 Game Setup](#cap-001-game-setup) |
| Primary Actor | 各Player（両者が独立に選択） |
| Supporting Actor / System | Game Systemが選択・利用済みの検証、退避と交換、両者完了後の返却・Shuffle、交換枚数の公開を扱う |
| Trigger | Opening Hand配布後にMulliganの選択機会へ到達する |
| Inputs | 各Opening Hand、選択するCard個体、Deck、Mulligan実施状況、相手の交換完了状況 |
| Outcome | 各Playerの交換が完了し、両者完了後に退避Cardの返却・Shuffleを終える。0枚交換も完了した選択。不正な交換・2回目は認められない。片側だけ完了した時点と全体の返却完了を区別する |
| Main Process / BPMN | [Game Flow](../process/game-flow.md#bpmn-style-elements) / [Game BPMN](../process/bpmn/game-flow.bpmn)。Entry: `Gateway_MulliganSplit`、Exit: `Gateway_ReturnJoin`。両者の独立選択・交換と合流を既存Processへ参照 |
| Related Decisions | Mulligan固有の登録済みDecisionなし |
| Authoritative sources | Requirements: [GR-014、GR-015](../requirements/game-requirements.md#requirements)。Rules: [Mulligan](../rules/deck-rules.md#mulligan)、[Information visibility](../rules/core-rules.md#information-visibility)。Model: [Domain responsibilities](../model/domain-model.md#responsibilities)、[Current visibility](../model/information-model.md#current-visibility)、[Player order](../model/effect-resolution-model.md#player-order)のSetup並行進行との区別 |
| Related Acceptance | [AC-SETUP-002、AC-SETUP-003、AC-SETUP-004](../acceptance/setup-mulligan.feature): 交換枚数・退避個体・合流後返却。[AC-SETUP-005、AC-SETUP-006、AC-SETUP-007](../acceptance/setup-mulligan.feature): 再交換・Opening Hand外の拒否・公開範囲 |
| Uses / Related capability | 交換Drawは[CAP-013](#cap-013-draw)。対戦中EffectのPlayer orderでMulliganの並行交換を置き換えない |
| Automation status | Not implemented |
| Notes / unresolved questions | 正常な並行交換はBPMNにあるが、AC-SETUP-005 / AC-SETUP-006の検証・拒否経路は明示されていない。Process coverage incomplete（拒否境界）。[既存の合意](../acceptance/example-mapping.md#setup--mulligan-resolved-questions)を参照し、新しい拒否後の選択手順を補わない |

## CAP-003 Turn Execution

| Field | Definition |
| --- | --- |
| Purpose | Active PlayerがTurnの制御権を持ち、開始処理とOperationの選択・再選択を通じてTurn完了またはGame終了を報告する |
| Kind / Parent capability | Primary / なし（対戦全体はGame Flowへ参照） |
| Primary Actor | Active Player |
| Supporting Actor / System | Game Systemが開始更新・Operation進行・完了状態と固定済み結果の伝播を行う。Opponentは該当時のReaction / Blockを選ぶ。Player切替はGame Flowの責任 |
| Trigger | Game継続中にActive PlayerのTurnが開始し制御権を取得する |
| Inputs | Active Player、現在StateとTurn段階、選ぶOperationと必要なSource / Target、Operationの完了・取消・拒否と固定済みGame結果 |
| Outcome | Game継続時は1つのOperation完了でTurnを終了しGame Flowへ返す。「何もしない」も完了。未完了なら同じTurnで再選択する。終了結果があれば完了数0でも再選択せず報告する |
| Main Process / BPMN | [Turn Flow](../process/turn-flow.md#semantics) / [Turn BPMN](../process/bpmn/turn-flow.bpmn)。Entry: `Start_Turn`、Exit: `End_Turn` / `End_GameEndedTurn`。[Game Flow](../process/game-flow.md) / [Game BPMN](../process/bpmn/game-flow.bpmn)が報告を消費し継続時にPlayerを切り替える |
| Related Decisions | [DEC-009](../decisions/README.md#dec-009-game-end-evaluation)の固定済み結果を利用する。Operation固有Decisionは各子Capabilityへ参照し、Turn末尾で勝敗を再評価しない |
| Authoritative sources | Requirements: [GR-007、GR-008、GR-009、GR-018](../requirements/game-requirements.md#requirements)、[IR-008](../requirements/interaction-requirements.md#requirements)、[PER-001](../requirements/play-experience-requirements.md#requirements)。Rules: [Turn](../rules/core-rules.md#turn)、[Operation](../rules/core-rules.md#operation)。Model: [Turn / Operation cardinality](../model/domain-model.md#turn--operation-cardinality)、[Operation lifecycle](../model/state-model.md#operation-lifecycle)、[Game result](../model/state-model.md#game-result) |
| Related Acceptance | [AC-TURN-007、AC-TURN-008、AC-TURN-009](../acceptance/turn.feature): 完了・何もしない・再選択時の開始処理保持。[AC-TURN-006、AC-TURN-010、AC-TURN-012](../acceptance/turn.feature): 完了数0の終了・完了後の終了優先 |
| Uses / Related capability | [CAP-004 Turn Start](#cap-004-turn-start)、主OperationのCAP-005〜CAP-009 / CAP-011、[CAP-016 Game End](#cap-016-game-end) |
| Automation status | Not implemented |
| Notes / unresolved questions | Operation Selectionはこの仕事の内部境界。「何もしない」を別CapabilityやPassルールにしない。親のTurn全実装を#24の前提にしない |

## CAP-004 Turn Start

| Field | Definition |
| --- | --- |
| Purpose | 自Turnの開始時更新を一度だけ行い、Active PlayerがOperationを選択できる状態へ進める |
| Kind / Parent capability | Primary / [CAP-003 Turn Execution](#cap-003-turn-execution) |
| Primary Actor | Game System |
| Supporting Actor / System | Active Playerは更新対象と次の選択主体。開始更新自体を繰り返し選択する操作ではない |
| Trigger | Active PlayerのTurn開始・制御権取得 |
| Inputs | Active Player、自Unitの配置状態、Energy Capacity / Energy、Deck / Hand、Turn Start実施状況 |
| Outcome | 既存の開始順にUnit状態・Resource・Draw / Hand Limitを更新しOperation Selectionへ進む。必要Draw不能なら更新済みStateを保持しGame終了を報告する |
| Main Process / BPMN | [Turn Flow](../process/turn-flow.md#semantics) / [Turn BPMN](../process/bpmn/turn-flow.bpmn)。Entry: `Start_Turn`、通常Exit: `Task_SelectOperation`、Draw不能時: `Task_RecordFailedDraw`から終了報告 |
| Related Decisions | Draw不能の勝敗確認は[DEC-009](../decisions/README.md#dec-009-game-end-evaluation)。開始更新固有のDecisionは未登録 |
| Authoritative sources | Requirements: [GR-003、GR-009、GR-010、GR-021](../requirements/game-requirements.md#requirements)、[PER-004](../requirements/play-experience-requirements.md#requirements)。Rules: [Turn Start order](../rules/core-rules.md#turn-start-order)、[Energy](../rules/resource-rules.md#energy)、[Draw and Hand Limit](../rules/deck-rules.md#draw-and-hand-limit)。Model: [Unit activity state](../model/state-model.md#unit-activity-state)、[Unit attack eligibility](../model/state-model.md#unit-attack-eligibility)、[Damage state](../model/state-model.md#damage-state) |
| Related Acceptance | [AC-TURN-001、AC-TURN-002、AC-TURN-004、AC-TURN-006、AC-TURN-009](../acceptance/turn.feature): 状態保持・更新順・上限・失敗・再実行なし。[AC-RESOURCE-002](../acceptance/resource.feature): 両Playerそれぞれの最初の自Turn |
| Uses / Related capability | [CAP-013 Draw](#cap-013-draw)、[CAP-016 Game End](#cap-016-game-end) |
| Automation status | Not implemented |
| Notes / unresolved questions | Ready化、Attack制限解除、Energy回復を個別Capabilityへ分割しない。Turn StartでDamageを初期化しない |

## CAP-005 Unit Deploy

| Field | Definition |
| --- | --- |
| Purpose | HandのUnitを自Unit Zoneへ通常Deployし、新しい配置の状態と支払い・Operation完了を成立させる |
| Kind / Parent capability | Primary / [CAP-003 Turn Execution](#cap-003-turn-execution) |
| Primary Actor | Active Player |
| Supporting Actor / System | Game SystemがEligibility / Cost / Capacityを検証し、既存時点で支払い・移動・Runtime State生成・完了を適用する。Action指定時はOpponentがReactionを選ぶ |
| Trigger | Active PlayerがUnit Deployを選択する、またはAction指定Deployを宣言する |
| Inputs | actor、現在のGame / Turn / Operation文脈、所有HandのUnit個体と検証済みCard Definition / Deploy指定・Cost、自Unit Zoneの現在占有、PlayerのResource、適用されるRule文脈 |
| Outcome | Completed: UnitがHandから自Unit Zoneへ移動し、Costと新しい配置Stateが反映されOperationが完了する。Rejected: 支払い・移動・初期化なしで未完了。Action指定時のCancel: Deploy本体を適用せず、成立済みReactionの結果を保持する |
| Main Process / BPMN | [Turn Flow](../process/turn-flow.md#semantics) / [Turn BPMN](../process/bpmn/turn-flow.bpmn)の`Task_SelectOperation`から[Action / Reaction Flow](../process/action-reaction-flow.md#selection-and-validation) / [BPMN](../process/bpmn/action-reaction-flow.bpmn)へ。非ActionのEntry: `Task_ValidateImmediate`、通常Exit: `End_OperationComplete`、拒否・Cancel: `End_OperationNotComplete`。Action宣言の拒否は再宣言へ戻る |
| Related Decisions | 配置受理: [DEC-001 Unit Deploy Eligibility](../decisions/README.md#dec-001-unit-deploy-eligibility)、[DEC-002 Effective Cost](../decisions/README.md#dec-002-effective-cost)、[DEC-004 Zone Capacity](../decisions/README.md#dec-004-zone-capacity)。Window境界: [DEC-007](../decisions/README.md#dec-007-reaction-window-eligibility)、解決時の勝敗境界: [DEC-009](../decisions/README.md#dec-009-game-end-evaluation)。配置直後のAttack資格の観測は[DEC-005](../decisions/README.md#dec-005-attack-eligibility)へ遡るが、Deploy受理の判断ではない |
| Authoritative sources | Requirements: [GR-006、GR-007、GR-010、GR-012、GR-013、GR-016、GR-021](../requirements/game-requirements.md#requirements)、[IR-002、IR-019](../requirements/interaction-requirements.md#requirements)。Rules: [Operation](../rules/core-rules.md#operation)、[Zone transitions](../rules/core-rules.md#zone-transitions)、[Zone Capacity](../rules/deck-rules.md#zone-capacity)、[Cost timing](../rules/resource-rules.md#cost-timing)、[Unit state / Deploy restriction](../rules/combat-rules.md#unit-state)。Model: [Card types](../model/card-model.md#card-types)、[Zone transition state](../model/state-model.md#zone-transition-state)、[Unit attack eligibility](../model/state-model.md#unit-attack-eligibility)、[First vertical slice](../model/domain-engine-architecture.md#first-vertical-slice) |
| Related Acceptance | [AC-BOARD-013](../acceptance/board-zone.feature): 初回配置・Cost・Damage 0 / Ready / AttackLocked・Current HP・完了。[AC-BOARD-001、AC-BOARD-003、AC-BOARD-005（Unit Deploy行）、AC-BOARD-014、AC-BOARD-019](../acceptance/board-zone.feature): 最後の空き・拒否・Action宣言拒否・再配置。[AC-AR-008](../acceptance/action-reaction.feature): Energy不足 / Capacity拒否。[AC-TURN-007](../acceptance/turn.feature): 完了後のTurn境界 |
| Uses / Related capability | Action指定時の[CAP-010 Reaction](#cap-010-reaction)、解決の[CAP-016 Game End](#cap-016-game-end)。初回Sliceは[下記対応](#first-vertical-slice-and-coverage-input)の非Action部分 |
| Automation status | Not implemented |
| Notes / unresolved questions | 初回・再Deployの状態生成は移動に伴う処理でありDecisionへ混ぜない。EffectによるDeployは[Q-SCHEMA-003](../model/card-definition-schema.md#unsupported-concepts-and-open-questions)。具体API・個体IDは[Q-ENGINE-005、Q-ENGINE-006](../model/domain-engine-architecture.md#open-questions) |

## CAP-006 Support Deploy

| Field | Definition |
| --- | --- |
| Purpose | HandのSupportを自Support Zoneへ表向きで配置し、以後のAbility / Reaction等のSourceとしてコミットする |
| Kind / Parent capability | Primary / [CAP-003 Turn Execution](#cap-003-turn-execution) |
| Primary Actor | Active Player |
| Supporting Actor / System | Game Systemが配置資格・全Cost・共有Capacityを検証し支払い・移動・公開状態・完了を適用する。Action指定時はOpponentがReactionを選ぶ |
| Trigger | Support Deploy選択、またはAction指定Deployの宣言 |
| Inputs | 現在State / actor、HandのSupport個体とDeploy定義・Cost、Support ZoneのFace-up Support / Set等の占有、Resource、Rule文脈 |
| Outcome | Completed: 支払い後にFace-up Supportとして配置しOperation完了。Rejected: 支払い・配置なしで未完了。ActionのCancelではDeploy本体を適用せずReaction結果を保持する |
| Main Process / BPMN | [Turn Flow](../process/turn-flow.md) / [Turn BPMN](../process/bpmn/turn-flow.bpmn)から[Action / Reaction Flow](../process/action-reaction-flow.md#selection-and-validation) / [BPMN](../process/bpmn/action-reaction-flow.bpmn)へ。Entry: `Start_OperationSelected`、通常Exit: `End_OperationComplete`。拒否・Cancel経路は同Processへ参照 |
| Related Decisions | [DEC-002](../decisions/README.md#dec-002-effective-cost)、[DEC-004](../decisions/README.md#dec-004-zone-capacity)、[DEC-007](../decisions/README.md#dec-007-reaction-window-eligibility)。勝敗境界は[DEC-009](../decisions/README.md#dec-009-game-end-evaluation)。Support Deployの総合Eligibilityは[未登録](../decisions/README.md#identity-and-granularity)で、DEC-001を流用しない |
| Authoritative sources | Requirements: [GR-006、GR-012、GR-013、GR-016、GR-021](../requirements/game-requirements.md#requirements)、[IR-017、IR-019](../requirements/interaction-requirements.md#requirements)。Rules: [Zone transitions](../rules/core-rules.md#zone-transitions)、[Zone Capacity](../rules/deck-rules.md#zone-capacity)、[Cost timing](../rules/resource-rules.md#cost-timing)。Model: [Support](../model/card-model.md#support)、[Zone transition state](../model/state-model.md#zone-transition-state) |
| Related Acceptance | [AC-BOARD-002 / AC-BOARD-004 / AC-BOARD-005の各Support Deploy行](../acceptance/board-zone.feature): 表向き初回配置・共有Capacity・拒否。[AC-BOARD-021](../acceptance/board-zone.feature): 再Deploy。[AC-AR-002 / AC-AR-003の各Support Deploy行](../acceptance/action-reaction.feature): Action宣言 / 非Action完了 |
| Uses / Related capability | Action指定時の[CAP-010 Reaction](#cap-010-reaction) |
| Automation status | Not implemented |
| Notes / unresolved questions | SupportへUnitのDamage / 活動状態やSet Tacticの配置状態を与えない。個別Deploy解決は汎用Task内部で、独立したSupport Deploy BPMNはない |

## CAP-007 Set

| Field | Definition |
| --- | --- |
| Purpose | Set可能なHandのTacticを裏向きに事前配置し、内容をHiddenのまま存在と占有をコミットする |
| Kind / Parent capability | Primary / [CAP-003 Turn Execution](#cap-003-turn-execution) |
| Primary Actor | Active Player |
| Supporting Actor / System | Game Systemが配置・Cost・Capacityを検証し、移動・Set状態・閲覧権・完了を適用する。Action指定時はOpponentがReactionを選ぶ |
| Trigger | Set選択、または当該SetにAction指定がある場合の宣言 |
| Inputs | actor / State、HandのSet可能なTactic個体とSet固有の定義・Cost、Support Zoneの共通占有、Resource、閲覧者と過去の観測、Rule文脈 |
| Outcome | Completed: 支払いと裏向きSet配置、Operation完了。存在・Slot使用はPublic、内容はHidden。Rejected: 支払い・移動なしで未完了。CancelではSet本体を適用せずReaction結果を保持。再Setも新しい配置になる |
| Main Process / BPMN | [Turn Flow](../process/turn-flow.md) / [Turn BPMN](../process/bpmn/turn-flow.bpmn)から[Action / Reaction Flow](../process/action-reaction-flow.md#selection-and-validation) / [BPMN](../process/bpmn/action-reaction-flow.bpmn)へ。Entry: `Start_OperationSelected`、通常Exit: `End_OperationComplete`、拒否・Cancelは既存経路 |
| Related Decisions | [DEC-002](../decisions/README.md#dec-002-effective-cost)、[DEC-004](../decisions/README.md#dec-004-zone-capacity)、[DEC-007](../decisions/README.md#dec-007-reaction-window-eligibility)、勝敗境界の[DEC-009](../decisions/README.md#dec-009-game-end-evaluation)。Setの総合Eligibilityは[未登録](../decisions/README.md#identity-and-granularity) |
| Authoritative sources | Requirements: [GR-013、GR-015、GR-016、GR-020、GR-021](../requirements/game-requirements.md#requirements)、[IR-017、IR-018、IR-019](../requirements/interaction-requirements.md#requirements)。Rules: [Zone transitions](../rules/core-rules.md#zone-transitions)、[Information visibility](../rules/core-rules.md#information-visibility)、[Zone Capacity](../rules/deck-rules.md#zone-capacity)、[Cost timing](../rules/resource-rules.md#cost-timing)。Model: [Tactic](../model/card-model.md#tactic)、[Set state](../model/state-model.md#set-state)、[Player knowledge](../model/information-model.md#player-knowledge) |
| Related Acceptance | [AC-BOARD-002 / AC-BOARD-004 / AC-BOARD-005の各Set行](../acceptance/board-zone.feature): 配置・拒否。[AC-BOARD-008、AC-BOARD-016](../acceptance/board-zone.feature): 公開範囲・再Set。[AC-AR-004](../acceptance/action-reaction.feature): PlayのAction指定をSetへ波及させない |
| Uses / Related capability | Action指定時の[CAP-010 Reaction](#cap-010-reaction)。事前配置後のReaction使用はCAP-010の仕事 |
| Automation status | Not implemented |
| Notes / unresolved questions | RevealやBoard離脱をSet内部の新規操作にしない。EffectによるSetは[Q-SCHEMA-003](../model/card-definition-schema.md#unsupported-concepts-and-open-questions)。過去に知っていることから現在の閲覧権を拡張しない |

## CAP-008 Tactic Play

| Field | Definition |
| --- | --- |
| Purpose | HandのTacticのPlayを通じて一時的なEffectを解決する |
| Kind / Parent capability | Primary / [CAP-003 Turn Execution](#cap-003-turn-execution) |
| Primary Actor | Active Player |
| Supporting Actor / System | Game SystemがSource / Target / Costを検証し支払い・解決・通常Discard・完了を行う。Action指定時はOpponentがReactionを選ぶ |
| Trigger | Tactic Play選択、またはAction指定Playの宣言 |
| Inputs | actor / State、HandのTactic個体とPlay定義・Action指定・Cost・Target / Resolution、Selected Target、Resource、Rule文脈 |
| Outcome | Completed: PlayのEffectを解決し通常はTacticをDiscardへ移してOperation完了。Rejected: Cost・移動・Effectなしで未完了。Cancelled: 本体未解決、未払いCostを消費せずCancel自体ではHandのCardを移動しない。早期Game終了は既存解決境界に従う |
| Main Process / BPMN | [Turn Flow](../process/turn-flow.md) / [Turn BPMN](../process/bpmn/turn-flow.bpmn)から[Action / Reaction Flow](../process/action-reaction-flow.md#cost-semantics) / [BPMN](../process/bpmn/action-reaction-flow.bpmn)へ。Entry: `Start_OperationSelected`、Exit: `End_OperationComplete` / `End_OperationNotComplete` / `End_OperationGameEnded`。不正Actionは再宣言へ |
| Related Decisions | [DEC-002](../decisions/README.md#dec-002-effective-cost)、対象選択がある場合の[DEC-003](../decisions/README.md#dec-003-legal-target-set)、[DEC-007](../decisions/README.md#dec-007-reaction-window-eligibility)、[DEC-009](../decisions/README.md#dec-009-game-end-evaluation)。Playの総合Eligibilityは[未登録](../decisions/README.md#identity-and-granularity) |
| Authoritative sources | Requirements: [GR-007、GR-010、GR-011、GR-012、GR-013](../requirements/game-requirements.md#requirements)、[IR-006、IR-019、IR-020](../requirements/interaction-requirements.md#requirements)。Rules: [Operation / Action](../rules/core-rules.md#operation)、[Cost timing](../rules/resource-rules.md#cost-timing)。Model: [Tactic](../model/card-model.md#tactic)、[Action keyword](../model/card-model.md#action-keyword)、[Operations and Action](../model/card-definition-schema.md#operations-and-action)、[Action lifecycle](../model/state-model.md#action-lifecycle) |
| Related Acceptance | [AC-AR-003のTactic Play行、AC-AR-006、AC-AR-011、AC-AR-012、AC-AR-013、AC-AR-014](../acceptance/action-reaction.feature): 非Action・分類Tag・辞退後解決・Cancel・Reaction移動保持・再宣言。[AC-RESOURCE-006、AC-RESOURCE-008、AC-RESOURCE-009](../acceptance/resource.feature): Resource・複合Costの拒否 / 成功 |
| Uses / Related capability | [CAP-010 Reaction](#cap-010-reaction)、[CAP-014 Effect Resolution](#cap-014-effect-resolution)、必要な[CAP-015 Target Selection](#cap-015-target-selection)、[CAP-016 Game End](#cap-016-game-end) |
| Automation status | Not implemented |
| Notes / unresolved questions | SetからのReactionはCAP-010へ区別する。終了途中のTactic処理に新しいDiscard時点を補わずProcess / Resolutionを参照する |

## CAP-009 Ability Use

| Field | Definition |
| --- | --- |
| Purpose | Board Sourceが提供するOperation Abilityを使い、定義されたEffectを達成する |
| Kind / Parent capability | Primary / [CAP-003 Turn Execution](#cap-003-turn-execution) |
| Primary Actor | Active Player |
| Supporting Actor / System | Game SystemがSource / Timing / Target / 全Costを検証し支払い・解決・完了を行う。Action指定時はOpponentがReactionを選ぶ |
| Trigger | Operationとして利用するAbilityの選択・宣言 |
| Inputs | actor / State、BoardのUnit / Face-up Support個体、選ぶOperation AbilityとAction指定・条件・Cost・Target / Resolution、Selected Target、Resource、Rule文脈 |
| Outcome | Completed: 支払いとAbilityの解決、Operation完了。Rejected: 支払い・移動・Effectなしで未完了。ActionのCancelでは本体を解決せずReaction結果を保持。致死Effect等の早期終了は共通Processへ報告する |
| Main Process / BPMN | [Turn Flow](../process/turn-flow.md) / [Turn BPMN](../process/bpmn/turn-flow.bpmn)から[Action / Reaction Flow](../process/action-reaction-flow.md#selection-and-validation) / [BPMN](../process/bpmn/action-reaction-flow.bpmn)へ。Entry: `Start_OperationSelected`、Exit: 完了・未完了・Game終了の既存End。Action不正は再宣言へ |
| Related Decisions | [DEC-002](../decisions/README.md#dec-002-effective-cost)、必要な[DEC-003](../decisions/README.md#dec-003-legal-target-set)、[DEC-007](../decisions/README.md#dec-007-reaction-window-eligibility)、[DEC-009](../decisions/README.md#dec-009-game-end-evaluation)。Operation Abilityの総合Eligibilityは[未登録](../decisions/README.md#identity-and-granularity) |
| Authoritative sources | Requirements: [GR-007、GR-010、GR-011、GR-017、GR-021、GR-022](../requirements/game-requirements.md#requirements)、[IR-019](../requirements/interaction-requirements.md#requirements)。Rules: [Operation](../rules/core-rules.md#operation)、[Zone transitions](../rules/core-rules.md#zone-transitions)、[Cost timing](../rules/resource-rules.md#cost-timing)。Model: [Ability](../model/card-model.md#ability)、[Activation / Condition](../model/card-definition-schema.md#ability-condition-and-limit)、[Operation lifecycle](../model/state-model.md#operation-lifecycle) |
| Related Acceptance | [AC-AR-005、AC-AR-007、AC-AR-009](../acceptance/action-reaction.feature): 操作別指定・成功・Action拒否。[AC-RESOURCE-005、AC-RESOURCE-007](../acceptance/resource.feature): Energy / Momentum支払い。[AC-BOARD-007、AC-BOARD-017、AC-BOARD-018、AC-BOARD-020](../acceptance/board-zone.feature): 移動・拒否・Cancel・Reveal |
| Uses / Related capability | [CAP-010 Reaction](#cap-010-reaction)、[CAP-014 Effect Resolution](#cap-014-effect-resolution)、[CAP-015 Target Selection](#cap-015-target-selection)、[CAP-016 Game End](#cap-016-game-end) |
| Automation status | Not implemented |
| Notes / unresolved questions | Reaction Ability / BlockはCAP-010 / CAP-012へ分ける。Trigger / Continuousを自動発火させる仕事は未登録で[Q-SCHEMA-001](../model/card-definition-schema.md#unsupported-concepts-and-open-questions)に残す |

## CAP-010 Reaction

| Field | Definition |
| --- | --- |
| Purpose | Opponentが合法Actionへ事前コミット済みSourceから介入するか辞退するかを選ぶ |
| Kind / Parent capability | Primary / 共有（Action指定OperationとAttackが利用） |
| Primary Actor | Opponent。AttackではDefending Player |
| Supporting Actor / System | Game SystemがWindow開始・Source / Timing / Target / Cost検証・支払い・Reaction解決・元Action Cancelを扱う |
| Trigger | 合法Action宣言がReaction Windowを開始する。Source候補の有無とWindow開始を区別する |
| Inputs | 現在のActionとWindow、応答Player、事前配置SourceとReaction定義・条件・Cost・Resolution、Targetまたは辞退、Resource、Rule / Visibility文脈 |
| Outcome | Used: 支払い・Reaction解決と元Action Cancelを記録し、Reaction結果を保持する。Declined: Action本体へ、AttackではBlock Stepへ進む。Rejected: Cost・Effect・CancelなしでReaction再選択。致死Reactionでも既存Cancel記録と終了結果を報告する |
| Main Process / BPMN | [Action / Reaction Flow](../process/action-reaction-flow.md#selection-and-validation) / [BPMN](../process/bpmn/action-reaction-flow.bpmn)の`Task_ChooseReaction`、[Attack Flow](../process/attack-flow.md#attack-declaration) / [BPMN](../process/bpmn/attack-flow.bpmn)の`Task_ChooseReactionAttack`がEntry。UsedのExitは`Task_CancelAction` / `Task_CancelAttack`から未完了報告。辞退は各Processの本体側境界へ |
| Related Decisions | Window可否の[DEC-007](../decisions/README.md#dec-007-reaction-window-eligibility)、応答受理の[DEC-008](../decisions/README.md#dec-008-reaction-eligibility)、[DEC-002](../decisions/README.md#dec-002-effective-cost)、必要な[DEC-003](../decisions/README.md#dec-003-legal-target-set)、解決時の[DEC-009](../decisions/README.md#dec-009-game-end-evaluation) |
| Authoritative sources | Requirements: [IR-002、IR-003、IR-004、IR-005、IR-006、IR-007、IR-008、IR-009、IR-010、IR-020](../requirements/interaction-requirements.md#requirements)、[PER-003、PER-010](../requirements/play-experience-requirements.md#requirements)。Rules: [Action](../rules/core-rules.md#action)、[Reaction Source](../rules/core-rules.md#reaction-source)、[Reaction Cost](../rules/resource-rules.md#reaction-cost)。Model: [Activation categories](../model/card-model.md#activation-categories)、[Set state](../model/state-model.md#set-state)、[Action lifecycle](../model/state-model.md#action-lifecycle) |
| Related Acceptance | [AC-AR-010、AC-AR-011、AC-AR-012、AC-AR-013、AC-AR-015、AC-AR-016、AC-AR-017](../acceptance/action-reaction.feature): 拒否・辞退・結果保持・Chainなし・Source境界。[AC-ATK-004](../acceptance/attack.feature): Attack Cancel。[AC-TURN-010](../acceptance/turn.feature): 致死Reaction。[AC-RESOURCE-011](../acceptance/resource.feature): Windowあり・Sourceなし |
| Uses / Related capability | [CAP-014 Effect Resolution](#cap-014-effect-resolution)、必要な[CAP-015 Target Selection](#cap-015-target-selection)、[CAP-016 Game End](#cap-016-game-end) |
| Automation status | Not implemented |
| Notes / unresolved questions | SourceなしからWindow省略・自動辞退を追加しない。Hand Reaction例外・Priority / Stackは[Rule Interferenceの未決事項](../acceptance/example-mapping.md#capability-card固有のrule-interferenceを追加可能にする)。Set Tacticの使用時Reveal・通常Discardは既存[Core Procedure](../model/card-definition-schema.md#operations-and-action)に従う |

## CAP-011 Attack

| Field | Definition |
| --- | --- |
| Purpose | 自UnitのAttackで敵Core / UnitへCombatを行い、その結果をOperationとして報告する |
| Kind / Parent capability | Primary / [CAP-003 Turn Execution](#cap-003-turn-execution) |
| Primary Actor | Active Player / Attacking Player |
| Supporting Actor / System | Defending PlayerがReaction / Blockを選ぶ。Game Systemが宣言検証・Commit・Damage・Destroy・完了と終了結果を適用する |
| Trigger | Active PlayerがAttackを選びAttackerとTargetを宣言する |
| Inputs | Active Player / State、Attackerと現在のAttack資格、宣言Target、Defenderの応答、Final Target、UnitのATK / HP / Damage、Rule文脈 |
| Outcome | Resolved: Commit以後のCombat / Destroyを適用しOperation完了を報告。Invalid declaration: 副作用なしで再宣言。Cancelled: Reaction結果を保持し、Attack本体・Block・Combatなしで未完了。勝敗成立時は固定済み結果を報告する |
| Main Process / BPMN | [Attack Flow](../process/attack-flow.md#attack-declaration) / [Attack BPMN](../process/bpmn/attack-flow.bpmn)。Entry: `Start_AttackSelected`、Exit: `End_AttackComplete` / `End_AttackCancelled` / `End_AttackGameEnded`。[Turn Flow](../process/turn-flow.md) / [Turn BPMN](../process/bpmn/turn-flow.bpmn)へ結果を返す |
| Related Decisions | [DEC-005](../decisions/README.md#dec-005-attack-eligibility)、Targetの[DEC-003](../decisions/README.md#dec-003-legal-target-set)、Windowの[DEC-007](../decisions/README.md#dec-007-reaction-window-eligibility)、終了の[DEC-009](../decisions/README.md#dec-009-game-end-evaluation)。応答内のDEC-008 / DEC-006 / DEC-002はCAP-010 / CAP-012へ参照 |
| Authoritative sources | Requirements: [GR-002、GR-007、GR-021、GR-022](../requirements/game-requirements.md#requirements)、[IR-011、IR-012](../requirements/interaction-requirements.md#requirements)。Rules: [Attack](../rules/combat-rules.md#attack)、[Attack Commit](../rules/combat-rules.md#attack-commit)、[Combat resolution](../rules/combat-rules.md#combat-resolution)、[Damage and Destroy](../rules/combat-rules.md#damage-and-destroy)、[Overkill](../rules/combat-rules.md#overkill)。Model: [Attack lifecycle](../model/state-model.md#attack-lifecycle)、[Damage state](../model/state-model.md#damage-state)、[Resolution steps](../model/effect-resolution-model.md#resolution-steps) |
| Related Acceptance | [AC-ATK-001、AC-ATK-002、AC-ATK-003、AC-ATK-004、AC-ATK-011、AC-ATK-012、AC-ATK-013、AC-ATK-014、AC-ATK-015](../acceptance/attack.feature): 宣言・拒否・Commit・Cancel・同時Damage・蓄積・Destroy・Overkill・Game終了 |
| Uses / Related capability | [CAP-010 Reaction](#cap-010-reaction)、[CAP-012 Block](#cap-012-block)、[CAP-014 Effect Resolution](#cap-014-effect-resolution)、[CAP-015 Target Selection](#cap-015-target-selection)、[CAP-016 Game End](#cap-016-game-end) |
| Automation status | Not implemented |
| Notes / unresolved questions | CombatはAttack内部であり独立登録しない。Attack全体を#24へ含めない。Rule Interference拡張は[Q-ENGINE-002〜004](../model/domain-engine-architecture.md#open-questions) |

## CAP-012 Block

| Field | Definition |
| --- | --- |
| Purpose | 防御側がBlock Abilityを使い、宣言された攻撃のFinal TargetをBlocking Unitへ向け直すか辞退する |
| Kind / Parent capability | Primary / [CAP-011 Attack](#cap-011-attack) |
| Primary Actor | Defending Player |
| Supporting Actor / System | Game Systemが防御文脈・Source / Ability・Costを検証し、Cost支払いとFinal Target変更を行う |
| Trigger | Reactionが使用されなかったAttackがBlock Stepへ到達する |
| Inputs | 宣言Attack / Final Target、防御Playerの使用 / 辞退選択、Blocking UnitとBlock Ability、ResourceとCost、Rule文脈 |
| Outcome | Used: Costを支払いFinal TargetをBlocking Unitへ変更。Declined: Targetを変えずAttack Commitへ。Rejected: Cost・Target・Attacker状態を変えず選び直せる。Block自身はOperation完了ではなくCombatへ接続する |
| Main Process / BPMN | [Block step](../process/attack-flow.md#block-step) / [Attack BPMN](../process/bpmn/attack-flow.bpmn)。Entry: `Task_ChooseBlock`、Exit: `Task_AttackCommit`へ合流する境界。拒否はBlock使用 / 辞退選択へ戻る |
| Related Decisions | [DEC-006](../decisions/README.md#dec-006-block-eligibility)、[DEC-002](../decisions/README.md#dec-002-effective-cost)。自由なAttack Target候補のDEC-003と、受理済みBlocking UnitへのFinal Target変更を混同しない |
| Authoritative sources | Requirements: [GR-011](../requirements/game-requirements.md#requirements)、[IR-012、IR-013、IR-014、IR-015、IR-016](../requirements/interaction-requirements.md#requirements)、[PER-005、PER-007](../requirements/play-experience-requirements.md#requirements)。Rules: [Block](../rules/combat-rules.md#block)、[Block Cost](../rules/resource-rules.md#block-cost)、[Momentum](../rules/resource-rules.md#momentum)。Model: [Ability](../model/card-model.md#ability)、[Unit activity state](../model/state-model.md#unit-activity-state)、[Attack lifecycle](../model/state-model.md#attack-lifecycle) |
| Related Acceptance | [AC-ATK-005、AC-ATK-006、AC-ATK-007、AC-ATK-008、AC-ATK-009、AC-ATK-010](../acceptance/attack.feature): Target変更・選択数・活動状態の独立性・移転・拒否 / 辞退・選び直し |
| Uses / Related capability | 後続Combatは[CAP-011 Attack](#cap-011-attack)内部 |
| Automation status | Not implemented |
| Notes / unresolved questions | Reaction / Operation Ability Useとは異なる防御仕事。Blockの可否にAttack資格を流用せず、Blocker属性や新しい回数制限を追加しない |

## CAP-013 Draw

| Field | Definition |
| --- | --- |
| Purpose | 必要なDrawを1枚ずつ処理し、Handへの取得・超過時の処理・Draw不能の報告を成立させる |
| Kind / Parent capability | Supporting / 共有 |
| Primary Actor | Game System |
| Supporting Actor / System | 対象PlayerはDraw先とHand / Deckの所有者。呼出元がDraw要求を与え、PlayerがHand超過で別Cardを選ぶ処理はない |
| Trigger | Turn Start、Card Effect、Opening Hand配布、Mulligan交換から必要なDrawが要求される |
| Inputs | 対象Playerと必要枚数、Deck順序・Hand / Discard、Hand Limit、呼出元の進行文脈とGame状態、閲覧者 |
| Outcome | Draw済みCardと枚数・所在を反映し、各Draw直後に必要なHand Limit処理を終える。必要Draw不能ならその時点の敗北結果と成功済みDrawを保持して停止する。取得後にDeckが空になっただけでは終了しない |
| Main Process / BPMN | [Turn Flow](../process/turn-flow.md#semantics) / [Turn BPMN](../process/bpmn/turn-flow.bpmn)の`Gateway_CanDraw`から`Task_Draw` / `Task_RecordFailedDraw`へ。EffectのDrawは[Action / Reaction Flow](../process/action-reaction-flow.md#effect-resolution-and-game-end) / [BPMN](../process/bpmn/action-reaction-flow.bpmn)・[Attack Flow](../process/attack-flow.md#attack-declaration) / [BPMN](../process/bpmn/attack-flow.bpmn)の解決Task内部。Setup配布・交換は[Game Flow](../process/game-flow.md) / [Game BPMN](../process/bpmn/game-flow.bpmn)の`Task_OpeningDraw` / `Task_ResolveMulliganA` / `Task_ResolveMulliganB`。終了または呼出元への復帰がExit |
| Related Decisions | Draw不能の勝敗は[DEC-009](../decisions/README.md#dec-009-game-end-evaluation)。Hand Limitの判断は[未登録](../decisions/README.md#identity-and-granularity)でありDEC-004のZone Capacityへ統合しない |
| Authoritative sources | Requirements: [GR-003、GR-009、GR-013、GR-014、GR-015、GR-018、GR-019](../requirements/game-requirements.md#requirements)。Rules: [Draw and Hand Limit](../rules/deck-rules.md#draw-and-hand-limit)、[Information](../rules/deck-rules.md#information)、[Game setup / Mulligan](../rules/deck-rules.md#game-setup)。Model: [Resolution steps](../model/effect-resolution-model.md#resolution-steps)、[Player order](../model/effect-resolution-model.md#player-order)、[Current visibility](../model/information-model.md#current-visibility) |
| Related Acceptance | [AC-DECK-003、AC-DECK-004、AC-DECK-005、AC-DECK-006、AC-DECK-008、AC-DECK-011、AC-DECK-012、AC-DECK-013](../acceptance/deck.feature): 逐次Draw・上限・失敗・成功保持・ReactionのPlayer順・Hidden。[AC-TURN-003、AC-TURN-006](../acceptance/turn.feature): Turn Start。[AC-SETUP-008、AC-SETUP-002](../acceptance/setup-mulligan.feature): 配布 / 交換のDraw |
| Uses / Related capability | 終了報告は[CAP-016](#cap-016-game-end)、複数PlayerへのEffect進行は[CAP-014](#cap-014-effect-resolution) |
| Automation status | Not implemented |
| Notes / unresolved questions | 共通Drawの独立BPMNはなく、Effect内の1枚ごとの詳細はRules / Modelが正本。Setupの並行交換へ対戦中のEffect Player orderを適用しない |

## CAP-014 Effect Resolution

| Field | Definition |
| --- | --- |
| Purpose | 複数の操作・応答・Combatから利用される共通の解決を進め、適用済み結果と終了境界を保持する |
| Kind / Parent capability | Supporting / 共有 |
| Primary Actor | Game System |
| Supporting Actor / System | 呼出元のOperation / Reaction / Attackが解決文脈を提供する。必要なPlayerの対象選択は既存の選択境界へ参照 |
| Trigger | 合法な処理が既存ProcessのResolution開始境界へ到達する |
| Inputs | 定義されたResolution / EffectStep / SimultaneousGroup、現在StateとActive Player、Source・束縛済みTarget、支払済みCost、適用するRule文脈 |
| Outcome | 解決を終えて適用済みStateを呼出元へ返す、または既存の勝敗境界で結果を固定し後続Step / 未処理Playerへの適用を打ち切る。支払済みCost・適用済みEffectを保持する |
| Main Process / BPMN | [Action / Reaction Flow](../process/action-reaction-flow.md#effect-resolution-and-game-end) / [BPMN](../process/bpmn/action-reaction-flow.bpmn)の`Task_ResolveImmediate` / `Task_ResolveAction` / `Task_ResolveReaction`内部。[Attack Flow](../process/attack-flow.md#combat) / [BPMN](../process/bpmn/attack-flow.bpmn)の`Task_ResolveAttackReaction`・Combat Damageに共通意味論を接続する。Entry / Exitは各解決の開始と結果返却。独立した共通Resolution BPMNはない |
| Related Decisions | 勝敗境界の[DEC-009](../decisions/README.md#dec-009-game-end-evaluation)。Targetに依存する処理の評価は[DEC-003](../decisions/README.md#dec-003-legal-target-set)へ接続するが、再検証の未決事項を補わない |
| Authoritative sources | Requirements: [GR-002、GR-004、GR-018、GR-019、GR-021](../requirements/game-requirements.md#requirements)。Rules: [Effect resolution](../rules/core-rules.md#effect-resolution)、[Zone transitions](../rules/core-rules.md#zone-transitions)、[Combat resolution](../rules/combat-rules.md#combat-resolution)。Model: [Effect Resolution Model](../model/effect-resolution-model.md)、[Effect](../model/card-model.md#effect)、[Zone transition state](../model/state-model.md#zone-transition-state) |
| Related Acceptance | [AC-RESOLUTION-001、AC-RESOLUTION-002、AC-RESOLUTION-003、AC-RESOLUTION-004](../acceptance/effect-resolution.feature): 全例が逐次 / 同時 / Player順 / 停止という共通境界を観測する。[AC-ATK-011、AC-ATK-013](../acceptance/attack.feature): Combat同時適用。[AC-BOARD-012、AC-BOARD-015、AC-BOARD-020](../acceptance/board-zone.feature): 移動時状態破棄・同Zone Reveal |
| Uses / Related capability | Drawを含む場合の[CAP-013](#cap-013-draw)、必要な[CAP-015 Target Selection](#cap-015-target-selection)、[CAP-016 Game End](#cap-016-game-end) |
| Automation status | Not implemented |
| Notes / unresolved questions | 共通利用するDomain上のSystemの仕事であり、Resolution Controller / ExecutorのComponent一覧ではない。Target寿命は[Q-ENGINE-001](../model/domain-engine-architecture.md#open-questions)、一般の同時Effect競合は[Q-SCHEMA-005](../model/card-definition-schema.md#unsupported-concepts-and-open-questions) |

## CAP-015 Target Selection

| Field | Definition |
| --- | --- |
| Purpose | 現在の合法候補を許可された情報で提示し、Playerの選択をその文脈のSelected Targetとして束縛・検証する |
| Kind / Parent capability | Supporting / 共有 |
| Primary Actor | 当該操作を選択するPlayer。Operation / AttackはActive Player、ReactionはOpponent / Defending Player |
| Supporting Actor / System | Game Systemが合法集合評価・閲覧者向け候補提示・実選択の所属検証を担う。固定のSource等はSystemが文脈参照として束縛する |
| Trigger | 対象を必要とするOperation / Reaction / Attack / Effect文脈で候補を照会・選択・検証する |
| Inputs | actor / viewer、Sourceと操作・Ability / EffectのTarget条件、現在Stateと閲覧権、Rule文脈、選択する実個体または固定文脈参照 |
| Outcome | 照会では合法候補（空集合を含む）を提示しState / Costを変えない。選択では現在の合法集合へ属するSelected Targetを束縛する。不適合・必要な対象なしでは利用元の既存拒否経路へ進む。照会によって後の受理を予約しない |
| Main Process / BPMN | [Action / Reactionの選択・検証](../process/action-reaction-flow.md#selection-and-validation) / [BPMN](../process/bpmn/action-reaction-flow.bpmn)の`Task_DeclareAction` / `Task_ChooseReaction`と検証Task。[Attack declaration](../process/attack-flow.md#attack-declaration) / [BPMN](../process/bpmn/attack-flow.bpmn)の`Task_DeclareAttack` / `Task_ChooseReactionAttack`と検証Task。非Actionの選択は[Turn](../process/turn-flow.md) / [Turn BPMN](../process/bpmn/turn-flow.bpmn)の`Task_SelectOperation`から操作検証へ。Entry / Exitは各候補照会・選択とその利用元への返却。候補照会の独立Task / BPMNはない |
| Related Decisions | [DEC-003 Legal Target Set](../decisions/README.md#dec-003-legal-target-set)。選択を含む最終受理は利用元のEligibility / Runtime Validationの責任 |
| Authoritative sources | Requirements: [GR-015、GR-020、GR-022](../requirements/game-requirements.md#requirements)。Rules: [Information visibility](../rules/core-rules.md#information-visibility)、[Attack](../rules/combat-rules.md#attack)。Model: [Target semantics](../model/card-model.md#target-semantics)、[Target Evaluation](../model/domain-engine-architecture.md#target-evaluation)、[Information Model](../model/information-model.md)、[Target definitions and references](../model/card-definition-schema.md#target-definitions-and-references) |
| Related Acceptance | [AC-TARGET-001、AC-TARGET-002、AC-TARGET-003、AC-TARGET-004、AC-TARGET-005](../acceptance/target-selection.feature): 各例が候補提示・束縛拒否・空集合・Card制約・閲覧権の境界を観測する。[AC-AR-009 / AC-AR-010の各不正Target行](../acceptance/action-reaction.feature)、[AC-ATK-002の不正Target行](../acceptance/attack.feature): 利用元の拒否 |
| Uses / Related capability | 選択を必要とするCAP-008 / CAP-009 / CAP-010 / CAP-011 / CAP-014から利用 |
| Automation status | Not implemented |
| Notes / unresolved questions | DEC-003は合法集合を計算する判断であり、候補の提示と選択・束縛の仕事全体ではない。移動後の再検証・skip等は[Q-ENGINE-001](../model/domain-engine-architecture.md#open-questions)、Hidden参照 / 投影は[Q-ENGINE-005、Q-ENGINE-006](../model/domain-engine-architecture.md#open-questions) / [Q-SCHEMA-004](../model/card-definition-schema.md#unsupported-concepts-and-open-questions) |

## CAP-016 Game End

| Field | Definition |
| --- | --- |
| Purpose | 既存の勝敗確認境界で継続または終了を扱い、成立した最初の結果を固定・伝播して対戦を終える |
| Kind / Parent capability | Primary / 共有（Game Flowで最終記録） |
| Primary Actor | Game System |
| Supporting Actor / System | 解決中Processが判定境界・State・Draw不能を提供し、Turn / Game Flowが固定済み結果を受け取る。Playerは勝敗の対象 |
| Trigger | 逐次適用または明示SimultaneousGroup後の既存判定境界、必要Draw不能、固定済み終了結果の報告に到達する |
| Inputs | 両Core HP、必要Draw不能と対象Player、到達した解決境界、適用済みStateとCost、既存のGame Result |
| Outcome | 継続条件なら呼出元へContinue。勝敗成立ならWin / Lose / Drawを固定し、残りのEffect・再選択・Player切替を停止して結果を伝播・記録しGameを終了する。固定済み結果を再評価しない |
| Main Process / BPMN | 判定は[Action / Reaction](../process/action-reaction-flow.md#effect-resolution-and-game-end) / [BPMN](../process/bpmn/action-reaction-flow.bpmn)・[Attack](../process/attack-flow.md#combat) / [BPMN](../process/bpmn/attack-flow.bpmn)の解決内部と[Turn](../process/turn-flow.md#semantics) / [BPMN](../process/bpmn/turn-flow.bpmn)の`Task_RecordFailedDraw`。固定済み結果はTurnの終了報告を経て[Game Flow](../process/game-flow.md) / [Game BPMN](../process/bpmn/game-flow.bpmn)の`Task_FinalizeGameResult` → `End_Game`へ。判定を末尾Gatewayへ遅延しない |
| Related Decisions | [DEC-009 Game End Evaluation](../decisions/README.md#dec-009-game-end-evaluation)が判断する。結果の固定・停止・伝播・最終記録はこの仕事を実行する既存Processの責任 |
| Authoritative sources | Requirements: [GR-002、GR-003、GR-004、GR-007、GR-008、GR-018、GR-019](../requirements/game-requirements.md#requirements)。Rules: [Game objective](../rules/core-rules.md#game-objective)、[Draw and Hand Limit](../rules/deck-rules.md#draw-and-hand-limit)、[Combat resolution](../rules/combat-rules.md#combat-resolution)。Model: [Game result](../model/state-model.md#game-result)、[Game end](../model/effect-resolution-model.md#game-end) |
| Related Acceptance | [AC-TURN-006、AC-TURN-010、AC-TURN-012、AC-TURN-013、AC-TURN-014](../acceptance/turn.feature): Draw不能・取消・完了との優先・停止と保持。[AC-RESOLUTION-002、AC-RESOLUTION-003](../acceptance/effect-resolution.feature): 同時敗北によるGame Draw / 逐次敗北。[AC-DECK-005、AC-DECK-010、AC-DECK-013](../acceptance/deck.feature): 継続 / 逐次Draw失敗。[AC-ATK-015](../acceptance/attack.feature): 致死Combat |
| Uses / Related capability | CAP-003 / CAP-004 / CAP-010 / CAP-011 / CAP-013 / CAP-014と終了報告を共有 |
| Automation status | Not implemented |
| Notes / unresolved questions | DEC-009の評価と結果適用を区別する。Unit DestroyをGame敗北にしない。一般の同時Effect競合は[Q-SCHEMA-005](../model/card-definition-schema.md#unsupported-concepts-and-open-questions) |

## CAP-017 Deck Construction

| Field | Definition |
| --- | --- |
| Purpose | Playerが対戦用の構築制約を満たすDeckを用意する |
| Kind / Parent capability | Primary / なし（Game SetupのDeck準備へ接続） |
| Primary Actor | 各Player |
| Supporting Actor / System | Game Systemが提出Deckを現在の構築制約へ照合する。Card Pool / Format / Access Ruleの具体方式は選定しない |
| Trigger | Game開始前に対戦で使用するDeckを準備・提出する |
| Inputs | Deck内のCardとName別採用数、Deck Size、現在のFormat / Access Rule |
| Outcome | 現在の制約を満たすDeck、または構築制約に不適合という判定。修正・再提出の詳細なProcessは未定義 |
| Main Process / BPMN | [Game Flow](../process/game-flow.md#bpmn-style-elements) / [Game BPMN](../process/bpmn/game-flow.bpmn)の`Task_PrepareDeckA` / `Task_PrepareDeckB`が準備境界。合流先は`Gateway_PrepareJoin`。構築・提出検証・拒否の内部Processは未展開で、Process coverage incomplete |
| Related Decisions | Deck構築固有の登録済みDecisionなし |
| Authoritative sources | Requirements: [GR-005](../requirements/game-requirements.md#requirements)。Rules: [Deck construction](../rules/deck-rules.md#deck-construction)、[Parameters](../rules/deck-rules.md#parameters)。Model: [Domain responsibilities](../model/domain-model.md#responsibilities)、[Card Pool classification](../model/card-model.md#card-pool-classification)。具体方式の検討先は[Card-pool architecture](../design/card-pool.md) |
| Related Acceptance | [AC-DECK-001、AC-DECK-002](../acceptance/deck.feature): 他の制約を満たす前提でDeck枚数 / 同一Name枚数の合法・不正境界を観測する |
| Uses / Related capability | 準備したDeckを[CAP-001 Game Setup](#cap-001-game-setup)へ渡す |
| Automation status | Not implemented |
| Notes / unresolved questions | [Q-SCHEMA-007](../model/card-definition-schema.md#unsupported-concepts-and-open-questions): Pool Identity / Access Rule方式は未合意。既存の枚数Acceptanceから全Formatの構築検証完了を主張しない |

## First vertical slice and coverage input

[#24](https://github.com/kjun1/card-game/issues/24)の親Capabilityは**CAP-005 Unit Deploy**であり、初回の非Action Deployを[AC-BOARD-013](../acceptance/board-zone.feature)へ接続する。CAP全体にはAction指定・再Deploy等も含まれるため、1 Sliceの成功で全体を自動化済みとはしない。

| Trace | CAP-005内の責任・観測 | 参照先 |
| --- | --- | --- |
| Actor / Trigger / Input | Turn Start済みのActive Player Aが、Handの検証済みUnit個体の非Action Deployを選択。現在Resourceと自Unit Zoneを入力とする | [CAP-005](#cap-005-unit-deploy)、[First vertical slice](../model/domain-engine-architecture.md#first-vertical-slice) |
| CAP-005 → Process → Decision | TurnのOperation選択からAction / Reactionの非Action検証へ。DEC-001がDEC-002 / DEC-004を利用し、配置受理を判断する | [Turn BPMN](../process/bpmn/turn-flow.bpmn)、[Action / Reaction BPMN](../process/bpmn/action-reaction-flow.bpmn)、[DEC-001](../decisions/README.md#dec-001-unit-deploy-eligibility)、[DEC-002](../decisions/README.md#dec-002-effective-cost)、[DEC-004](../decisions/README.md#dec-004-zone-capacity) |
| Requirements / Rules / Model → Outcome | GR-013 / GR-021等から通常配置とState生成へ。支払い・Hand → Unit Zone・Damage 0 / Ready / AttackLocked・Current HP・Operation完了を解決直後に観測する | [Zone transitions](../rules/core-rules.md#zone-transitions)、[Cost timing](../rules/resource-rules.md#cost-timing)、[Zone transition state](../model/state-model.md#zone-transition-state)、[AC-BOARD-013](../acceptance/board-zone.feature) |
| 拒否Boundary | 満杯Zone / Energy不足でCost・Hand・Boardを変えずOperation未完了。副作用なしの拒否を正常Deployと区別する | [AC-BOARD-003](../acceptance/board-zone.feature)、[AC-AR-008のCost支払い不能 / Capacity超過行](../acceptance/action-reaction.feature) |
| 周辺判断へのTrace | WindowなしはDEC-007、解決の勝敗境界はDEC-009、配置直後のAttack不可はDEC-005へ対応 | [Decision CatalogのSlice対応](../decisions/README.md#first-vertical-slice-and-follow-ups) |

Setup / Turn Startの全実装はGivenの前提にせず、Reaction / Attack / Blockの実装範囲へ広げない。具体API・Event / Result形式はArchitectureの既存Questionに従う。

[#23](https://github.com/kjun1/card-game/issues/23)はCAP IDを親キーに、Main Process / BPMN、Related DecisionsのDEC ID、Authoritative sourcesのRequirement ID・Rule / Model、Related AcceptanceのScenario IDを入力として、EngineとExecutable Verificationの根拠へ対応付ける。各FieldはCoverage作成の入口であり、Coverage Matrixや正式Statusの代わりにはしない。

## Example Mapping correspondence

Example MappingのCapability見出しは具体例を検討するまとまりであり、本CatalogのOutcome別の仕事と多対多で対応する。既存見出し・Scenario IDは維持する。

| Example Mapping capability | Catalog capability / boundary |
| --- | --- |
| [Turnを開始し制御権を渡す](../acceptance/example-mapping.md#capability-turnを開始し制御権を渡す) | CAP-003 Turn Execution、CAP-004 Turn Start、CAP-013 Draw、CAP-016 Game End |
| [ActionとReactionの成立を判断する](../acceptance/example-mapping.md#capability-actionとreactionの成立を判断する) | CAP-005〜CAP-009の操作別Action / 非Action境界、CAP-010 Reaction。Window判断はDEC-007 |
| [Attackに防御しCombatを解決する](../acceptance/example-mapping.md#capability-attackに防御しcombatを解決する) | CAP-011 Attack、CAP-012 Block、CAP-010 Reaction、CAP-014 Effect Resolution、CAP-016 Game End |
| [SetupとMulliganで対戦を準備する](../acceptance/example-mapping.md#capability-setupとmulliganで対戦を準備する) | CAP-001 Game Setup、CAP-002 Mulligan、配布 / 交換のCAP-013 Draw |
| [EnergyとMomentumの予算を管理する](../acceptance/example-mapping.md#capability-energyとmomentumの予算を管理する) | 初期化はCAP-001、更新はCAP-004、支払いはCAP-005〜CAP-010 / CAP-012の責任。Cost評価はDEC-002。予算や支払いTaskを追加Capabilityにしない |
| [BoardのZoneと配置状態と公開情報を管理する](../acceptance/example-mapping.md#capability-boardのzoneと配置状態と公開情報を管理する) | 配置はCAP-005 / CAP-006 / CAP-007、移動 / RevealはCAP-009 / CAP-010 / CAP-014、Combat DestroyはCAP-011。閲覧権 / Knowledgeは各仕事の共通規範 |
| [Deckを構築しDrawとHandを管理する](../acceptance/example-mapping.md#capability-deckを構築しdrawとhandを管理する) | CAP-017 Deck Construction、CAP-013 Draw、CAP-016 Game End |
| [Effectの解決順と勝敗判定の境界を扱う](../acceptance/example-mapping.md#capability-effectの解決順と勝敗判定の境界を扱う) | CAP-014 Effect Resolution、CAP-016 Game End |
| [Targetの制約から現在の合法対象を求める](../acceptance/example-mapping.md#capability-targetの制約から現在の合法対象を求める) | CAP-015 Target SelectionがDEC-003を利用。設計例EX IDとAcceptance Scenario IDを区別する |
| [Card固有のRule Interferenceを追加可能にする](../acceptance/example-mapping.md#capability-card固有のrule-interferenceを追加可能にする) | 将来の表現可能性の要求。各仕事のDecision / Rule Evaluationへの拡張点であり、現版の実行Capabilityとして独立登録しない |

## Process coverage and unresolved boundaries

Catalogの記述のために新しいTrigger、Outcome、拒否後の処理を追加しない。既存Questionに対応する不足はそこへ参照し、Process詳細の不足はPRのfollow-up候補とする。新しいBPMNは作成しない。

| Capability / boundary | 既存の根拠と不足 |
| --- | --- |
| CAP-001 / CAP-002 Setup・Mulligan | Game BPMNにはOpening前Shuffle、独立選択・並行交換、両者完了の合流後返却 / Shuffle、初期化がある。正常系のProcess正本がないとは扱わない。一方、AC-SETUP-005 / AC-SETUP-006にある実施済み / 対象不正の検証・拒否経路は明示されず、Process coverage incomplete。既存の拒否結果を参照し、再選択手順等は補わない |
| CAP-017 Deck Construction | Game BPMNのPrepare Deckは粗い境界で、提出検証・不正判定のProcess詳細がない。Process coverage incomplete。AC-DECK-001 / AC-DECK-002は枚数境界に限り、Format / Access Ruleの具体方式はQ-SCHEMA-007 |
| CAP-005〜CAP-009の固有操作 | 汎用Action / Reaction BPMNが検証・支払い・解決・拒否を担い、具体的な配置やPlay後DiscardはRules / Modelにある。操作別全Task列がないことからProcessを新設しない。Support Deploy / Set / Tactic Play / Abilityの総合EligibilityはDecision Catalogで未登録 |
| CAP-013 / CAP-014 / CAP-015の共通仕事 | 呼出元のBPMN境界を追跡できるが、Draw / Resolution内部の全Stepや候補照会は独立BPMNに展開されていない。共通意味論の正本はRules / Model。共通Processの詳細化を検討する場合も既存順序・並行性・観測境界を維持する |
| Target寿命・投影、干渉拡張 | [Q-ENGINE-001〜006](../model/domain-engine-architecture.md#open-questions)、[Q-SCHEMA-001〜007](../model/card-definition-schema.md#unsupported-concepts-and-open-questions)。共有参照の再検証、不適合時処理、干渉競合、情報投影等の未合意仕様をCatalogで決めない |

## Unregistered areas

初期Catalogは主要Flow・主要Acceptance・#24のSlice・#23の追跡軸を対象とし、全仕事の網羅を宣言しない。

| 未登録領域 | 現在の扱い |
| --- | --- |
| Rule Interference固有の仕事、Trigger / Continuous / Replacement / Priority / Stack | [既存の拡張要求とQuestion](../acceptance/example-mapping.md#capability-card固有のrule-interferenceを追加可能にする)のみ。未合意のMechanicにTrigger / OutcomeやCAP IDを付けない |
| EffectによるDeploy / Set、Board Zone間移動、任意ZoneのReveal、ATK / HP変更、Card固有Limit | [Schemaの未対応領域](../model/card-definition-schema.md#unsupported-concepts-and-open-questions)へ参照。通常Operationや現在のEffectから結果を推測しない |
| 独立した情報閲覧・Knowledge管理、保存 / 履歴 / Hidden個体追跡 | 現版は各仕事の[Information Model](../model/information-model.md)への参照で扱う。具体的な独立Process・Trigger / Outcomeは未定義 |
| 製品Card Pool / Format管理、Balance / Playtest、UI / Network / DB | [Design](../README.md#design)と[Verification Strategy](../verification-strategy.md)の責任。対戦Capabilityの親台帳へ実装Componentや設計活動を混ぜない |

Operation Selection、Cost支払い、配置初期化、CombatのDamage / Destroy、「何もしない」は未登録の仕様欠落ではなく、上記Capabilityに含めた内部責任である。正式Coverage Status、Engine実装、Runtime Semantic Validation、Cucumber / Step Definitions / Executable Acceptanceは#23 / #24等の後続範囲とする。
