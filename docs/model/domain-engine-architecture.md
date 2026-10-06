# Domain Engine Architecture

## Purpose

Domain Engine実装前に、現在のRequirements / Rules / Model / BPMNを実行する責任と入出力の境界を整理する。[Issue #16](https://github.com/kjun1/card-game/issues/16)のTarget semanticsと[Issue #13](https://github.com/kjun1/card-game/issues/13)のRule Interference要求を接続し、最小実装から既存Acceptanceへ接続できる設計とする。

判断の根拠は[TargetのExample Mapping](../acceptance/example-mapping.md#capability-targetの制約から現在の合法対象を求める)と[Rule InterferenceのExample Mapping](../acceptance/example-mapping.md#capability-card固有のrule-interferenceを追加可能にする)。本書は実現上の責任分解であり、処理順の正本である[BPMN](../process/bpmn/README.md)や解決意味論の正本である[Effect Resolution Model](effect-resolution-model.md)を再定義しない。

~~~text
Requirements → Rules / Model → Card Definition → Validation
  → Domain Engine → Executable Acceptance
~~~

## Scope and non-scope

今回決めるのは、Engineの責任、GameState / Command / Event / Resultの概念、Validation層、Rule / Target EvaluationとResolutionの接続、最初のVertical Sliceである。API名・型・保存形式・クラス配置は確定しない。

Engine本体、実装言語、Runtime class、Cucumber Runner、Step Definitions、Modifier / Replacement / Trigger / Continuous Engine、Priority / Stack、UI、Network、DB、Card Pool、Balance、製品Card Setは実装しない。将来のRule Interference要求は、現版でHand ReactionやReaction禁止等を使用可能にするものではない。

## Engine responsibility

EngineはGame Systemとして、現在状態と意思決定から既存ルールに従う進行を行い、観測可能なState・Event・進行結果を返す。Playerの意思決定は行わず、BPMNのUser Taskに達したら必要な選択を報告する。

| Responsibility | Boundary |
| --- | --- |
| Process progression | BPMNの分岐・選択待ち・Operation lifecycleを扱う。Game / Turn / Action / Attackの責任を維持する |
| Rule Evaluation | Base Ruleと現在の文脈からEffective Ruleを評価する。Target・Cost・許可・Capacity・予定処理への干渉をここへ接続する |
| Runtime Validation | actor、Source、Selected Target、Timing、Resource等が評価済みの条件を満たすか判定する |
| Cost application | 合法性と全Costの支払い可能性を確認してから、既存の支払い時点でEnergy消費・Momentum移転を行う |
| Resolution control | 既存Resolution / EffectStep / SimultaneousGroupに従って解決を進める |
| State transition | EffectまたはCore Procedureを適用し、成立したZone移動に伴う状態の破棄・初期化を行う |
| Game End Evaluation | 既存の判定境界で結果を固定する。Turn / Gameへ伝播し、後続Effect・再選択・Player切替を停止する |
| Reporting | 実際に成立した出来事とCommand結果を返す。現在の情報閲覧権と観測済み知識を区別する |

UIの表示、通信、永続化は外側の責任とする。合法候補を得るための読み取りでもEngineと同じRule / Target Evaluationを使用する。

## Input and output

概念的な入口は次の形を採る。`execute`というAPI名や戻り値の言語表現は提案であり固定しない。

~~~text
execute(GameState, Command)
  → Updated GameState
  → Events
  → Result
~~~

Stateだけを返す形では、不正な選択・次の意思決定待ち・Operation完了を区別しにくく、支払いと移動の観測もState差分からの推測になる。EventsとResultを分けて返す形なら、途中で止まるActionや既存Acceptanceの観測境界を直接扱えるため、これを設計上の入口とする。

検証済みのCard Definition集合とCore RuleはEngineが参照する不変の定義文脈として必要である。GameState中の個体がどの定義を参照するかを解決できるようにし、CommandごとにCardのルールやSchemaを複製しない。依存の渡し方・定義集合の保存先は確定しない。

合法Target候補や利用可能な選択の読み取りは、GameState・actor / viewer・Operation / Ability文脈を入力として同じ評価責任へ接続する。読み取りでCost、State、Eventを発生させない。候補取得がCommandの受理を予約することはなく、実際のCommandはその入力Stateで検証する。

## GameState

GameStateは対戦の現在状態と進行文脈であり、静的Card Definitionではない。[Domain Model](domain-model.md)、[State Model](state-model.md)、[Information Model](information-model.md)を元に以下の責任を持つ。

| Concept | Required information |
| --- | --- |
| Players / Core | 2人のPlayerと各Core HP |
| Resources | 各PlayerのEnergy Capacity / Energy / Momentum |
| Zones | Deck / Hand / Unit Zone / Support Zone / Discardの所属個体。Drawに必要なDeck順序と現在の占有数 |
| Card Instances | 定義への参照、所有Player、現在の所在とZoneに適用される配置状態 |
| Turn / Active Player | 制御権を持つPlayer、Turn Start済みか、現在のTurn進行段階 |
| Operation state | 選択・宣言・選択待ち・Commit・解決・取消・完了を区別する文脈。Source、選択名とSelected Targetの束縛、必要なら宣言Target / Final Target |
| Game Result | Ongoing、または固定済みのWin / Lose / Draw。Commandの実行結果とは別 |
| Information context | 閲覧者ごとのCurrent visibilityを判定する情報。観測済み事実・Player Knowledgeの表現は保存方式と合わせて別途検討する |

~~~text
Card Definition ≠ Card Instance ≠ GameState
~~~

Card InstanceのDamage・Ready / Exhausted・AttackLocked・Set / Revealedは適用Zoneにだけ存在する配置状態である。[Zone transition state](state-model.md#zone-transition-state)に従い、盤面外へ持ち越さず、通常Deploy / Setで初期化する。Selected Targetは現在のOperation / Ability文脈の束縛であり、静的定義にも対象Card自身の恒久属性にもならない。

将来の有効なRule InterferenceにはGame内のSubject / Scope / Duration等の文脈が必要になるが、現時点でModifier一覧、持続期間カウンタ、Trigger queue等の保存形を追加しない。GameStateとCard DefinitionはCore Rule正本の永続的な書き換えを表さない。

## Command

CommandはPlayerの意思決定またはGame進行要求であり、内部Effectとは区別する。actor、利用するRuntime Source / 定義内Operation・Ability、必要なSelected Target等を、現在のBPMN段階に合わせて伝えられることが必要である。

| Candidate | Decision / process boundary |
| --- | --- |
| StartTurn | Game進行側によるTurn Start要求。[Turn BPMN](../process/bpmn/turn-flow.bpmn)のStart以降を進める。Playerが繰り返しResource回復できる操作にしない |
| Deploy / Set / PlayTactic / UseAbility | Active PlayerのOperation選択。Action指定は検証済み定義から評価し、Commandが自由に上書きしない |
| DeclareAttack | AttackerとTargetの宣言。[Attack BPMN](../process/bpmn/attack-flow.bpmn)の`Task_DeclareAttack`。宣言だけでExhaust・Combatをしない |
| ChooseReaction | Window内でOpponentがSource・Targetを選ぶか辞退する。`Task_ChooseReaction` / `Task_ChooseReactionAttack`。元Actionとは別の意思決定 |
| ChooseBlock | Reactionなしの場合の防御側のBlock使用 / 辞退とBlocking Unitの指定。`Task_ChooseBlock` / `Task_SelectBlockingUnit`。Reactionとは別段階 |
| DoNothing | Active Playerが主Operationとして何もしない選択。Operation Completeとなる。Reaction / Blockの辞退や独立Passとは混同しない |

BlockするかどうかとBlocking Unit選択を1つの入力で渡すかはAPI設計に残すが、BPMN上の段階と不正時の戻り先を保持する。DeclareAttack・ChooseReaction・ChooseBlockを1 Commandへまとめない。Damage・Draw・Move・Cancel・Attack CommitはPlayerが自由に呼ぶCommandの候補ではなく、既存のEffect / Core Procedureとして進行側が適用する。

## State, event and result

| Concept | Meaning | Example |
| --- | --- | --- |
| State | 今何が成立しているか | Energy = 2、CardがUnit ZoneにありReady、Reaction選択待ち |
| Event | 今回の進行で実際に成立した出来事 | Energy 1を支払った、Cardが移動した、Windowが開いた |
| Result | このCommandの受理・拒否、進行到達点、必要な次の意思決定と固定済みGame結果の報告 | 不正Targetで拒否、Reaction待ち、Operation未完了 / 完了、Game終了 |

Eventの概念候補は、CostPaid、MomentumTransferred、CardMoved、ReactionWindowOpened、DamageApplied、UnitDestroyed、ActionCancelled、OperationCompleted、GameEnded。公開API名・payload・細分化はAcceptanceで観測する必要に合わせて後続で決める。例えばCostPaidとMomentumTransferredに同じ移転が現れても、2回適用する指示ではない。

OperationCompletedはOperation lifecycleの出来事として観測でき、Resultはその完了状態を呼び出し元へ報告できる。GameEndedも、出来事の記録とGameStateの固定済み結果とResultの終了報告を区別する。EventからStateを復元するEvent SourcingやEvent Busは要求しない。

適用前の予定Destroy等はRule Evaluationの入力であり、まだ成立Eventではない。将来Replacementを導入する場合も、評価する予定処理と実際に成立した出来事を区別して報告する。

不正Commandは、既存仕様が定める選択への戻り先・理由をResultで報告し、Cost・移動・Damage等の成立Eventを生成しない。受理された宣言がReaction待ちになることはOperation完了を意味しない。ReactionでActionがCancelされても、成立済みReactionのState / Eventsを保持する。Game終了時の完了・取消記録は[State Model](state-model.md#game-result)と[Game end](effect-resolution-model.md#game-end)に従い、終了後の処理継続を示さない。

State / Events / 候補 / 拒否理由をPlayerへ見せる際は[Information Model](information-model.md)に従う。Engine内部の個体参照と観測者へ公開できる識別情報を区別し、未RevealのCard移動Eventから内容やHidden個体追跡を漏らさない。観測用の投影形式は未確定とする。

## Validation layers

| Layer | Input / responsibility | Does not guarantee |
| --- | --- | --- |
| Structural Validation | Card JSONの形・type・required・closed object・数値等。[Schema](../../schemas/card.schema.json)と[check-cards](../../scripts/check-cards.mjs) | 定義内参照の意味、実盤面での使用可否 |
| Static Semantic Validation | 構造検証済み定義集合のID一意性、symbol Scope、条件の矛盾、Effect参照ごとの存在し得る互換種別。[card-semantics](../../scripts/card-semantics.mjs) | 全selector候補の適合、現在の合法集合、Step間の状態変化 |
| Runtime Semantic Validation | Commandを現在のState / 文脈へ束縛し、actor・実Target・Zone・Timing・Resource・Visibility・Capacity・Effective Ruleを検証 | 未合意Mechanicを補完して使用可能にすること |

静的保証の詳細は[Schema文書](card-definition-schema.md#structural-validation-and-semantic-validation)を正本とする。Runtime ValidationはEffect実行とは別の責任であり、合法性・全Costの支払い可能性の確認後に既存の支払い・解決へ進む。Sourceの移動や自動Revealの影響を静的検証が模擬することもない。

## Rule Evaluation

[GR-023〜026](../requirements/game-requirements.md#requirements)の拡張点を次の責任として設ける。

~~~text
Base Rule + current State / subject / process context
  → Rule Evaluation（適用可能なRule Interferenceを評価）
  → Effective Rule
  → Validation / Cost / Resolution / State Transitionで使用
~~~

| Evaluation responsibility | Base information | Interference example / consumer |
| --- | --- | --- |
| Effective Cost / Parameter / Capacity | Card定義のCost・ATK、CoreのHand Limit・Zone Capacity等 | Cost +1、ATK +2、Capacity +1。支払い可能性・Combat・上限検証が有効値を使う |
| Permission / Prohibition | CoreのTiming・Source・Attack資格・Reaction Window条件等 | 特定UnitのAttack禁止、特定ActionのReaction不可、特定CardだけHand Reaction許可。Processの可否判断と検証が使う |
| Proposed transition | 適用しようとするDestroy・Damage等の処理と対象文脈 | Destroyの代わりにHandへ戻す。State変更を確定する前に介入可能にする |

Modifierは値を、Permission / Prohibitionは行為の可否・例外を、Replacementは予定処理を扱うという責任分解を採る。これは例から導いた拡張境界であり、Type列挙を網羅的Schemaに固定しない。「最初のDamageを0にする」が量のModifierかReplacementか、適用・消費時点も今回決めない。

Core Ruleを評価する箇所を独立できることが必要である。例えばAttack資格はReady / AttackLockedからBase Ruleを評価してから有効な干渉を考慮し、Processが直接その2値だけでAttackを許可しない。`evaluateAttackPermission`、`evaluateEffectiveCost`、`evaluateLegalTargets`等は責任の例であり、関数名・クラス構造の確定ではない。

この評価はCommand入口だけの一括前処理ではない。Reaction Windowを開く判断、Costの検証・支払い、Target選択、Effect / Core Procedureの予定State変更など、Ruleを使用する境界から接続する。Replacementも通常Effect実行とCoreによる致死Damage後のDestroyの両方で、予定処理が成立する前に評価へ接続できるようにする。Destroyを先に成立させ、後から戻すEffectを足す設計にしない。

現版で干渉がない場合はEffective RuleがBase Ruleと一致し、既存Core / BPMNをそのまま実行する。将来の干渉はSubject / Rule / Scope / Durationを識別して評価するが、競合順序・Layer・再帰等は未確定である。未対応の干渉を導入した定義を黙って無視して受理せず、Mechanicの合意と対応ができるまで扱わない。Modifier Engineや登録APIは今回実装しない。

## Target Evaluation

[GR-022とCard Model](card-model.md#target-semantics)に従い、合法Target評価は次の責任を合成する。

~~~text
Definition Target Constraint + Effect Target Requirement
  + Core Runtime Rule（Rule Interferenceを評価したEffective Rule）
  + Current State / Visibility / selection context
    → Legal Target Set
    → Player choice
    → Selected Target binding / Runtime Validation
~~~

Effect RequirementはEffectの対象契約、Target ConstraintはCard固有制約、Runtime Eligibilityは有効なRuntime Ruleと現在状態を合わせた資格である。Core Runtime Ruleの段階で禁止候補を永久に捨ててから例外Permissionを足すのではなく、干渉を評価した結果を用いる。この図は責任の合成であり、フィルタの固定実行順ではない。

例として`opponent / support_zone`とRevealでは、Set Tacticが互換候補種別なので定義を静的に受理する。Runtimeの候補は相手の現在のSet Cardだけであり、Face-up Support / Revealed Tacticは残らない。現在Setが0枚なら合法集合は空。Card固有の所有者・Zone制約をEffect側から広げない。

UI向け候補列挙とCommandのSelected Target検証は同じ評価を使う。前者はactor / viewerに許可された情報で候補を返し、後者は実参照が現在の合法集合に属するか検証する。Setの存在がPublicなら内容を明かさず選択できるが、相手Handの内容閲覧・検索やHidden個体追跡を新たに許可しない。`each`は既存Schemaの各Playerの1枚選択であり、同時適用を意味しない。

Attack TargetはCardの`targets`へ複製せず、Coreが与えるTarget制約とAttack Ruleを同じ評価責任で扱う。`source` / `declared_action_source`は文脈参照として束縛し、候補集合の自由選択とは区別する。

同じ選択参照を複数Stepで使う場合の合同充足性・再検証・移動後の参照寿命はQ-ENGINE-001に残す。全Resolutionを初期Stateの単純な積集合で検証したり、適用不能を自動skipしたりする決定は含めない。

## Processing pipeline and BPMN

概念的にはCommand → Rule Evaluation → Validation → Cost → Resolution内のState Transition / Game End Evaluation → Result / Eventsとなる。ただし1本の一括処理ではなく、BPMNの分岐・User Task・判定境界を保って進行する。State変更と勝敗確認はResolution内で必要な境界ごとに行い、全解決の末尾へ遅延しない。

| Process / exact BPMN boundary | Engine integration |
| --- | --- |
| [Action / Reaction](../process/bpmn/action-reaction-flow.bpmn): `Task_ValidateImmediate` → `Task_PayImmediateCost` → `Task_ResolveImmediate` | 非ActionのSource・Target・有効Cost・Capacity等を検証。合法なら支払い・解決、不正なら未完了で再選択へ |
| Action / Reaction: `Task_ValidateAction` → `Task_ChooseReaction` | 合法な宣言だけでWindowを開いてOpponentの意思決定を待つ。本体EnergyをDeclarationで支払わない |
| Action / Reaction: `Task_ValidateReaction` → `Task_PayReactionCost` → `Task_ResolveReaction` → `Task_CancelAction` | Reactionを検証・支払い・解決して元Actionを取消。元Actionの未払いCostと未移動Cardを保ち、Reaction結果は保持。辞退側は本体Cost・解決へ |
| [Attack](../process/bpmn/attack-flow.bpmn): `Task_DeclareAttack` → Reaction選択 → `Task_ChooseBlock` / `Task_SelectBlockingUnit` → `Task_AttackCommit` | 宣言・Reaction・Blockを別の入力境界にする。ReactionなしでだけBlockへ進み、CommitでExhaustする |
| [Turn](../process/bpmn/turn-flow.bpmn): `Task_ReceiveGameResultTurn` → `Gateway_GameEndedTurn` → `Gateway_OperationCompleted` | 終了結果を先に伝播。継続中だけ完了ならTurn End、未完了なら同じTurnの選択へ。Turn Startを繰り返さない |
| [Game](../process/bpmn/game-flow.bpmn): `Gateway_GameEnded` → `Task_FinalizeGameResult` / `Task_SwitchActivePlayer` | 固定済み結果を再評価せず記録し、継続中のTurn完了時だけPlayerを切り替える |

不正Actionは宣言へ、不正ReactionはReaction選択へ、不正BlockはBlock使用 / 辞退の選択へ戻す。Commandの拒否だけで支払い・移動・Cancel・Exhaustを起こさない。Game Endは選択待ちや次Turnより優先し、完了済みOperationが0でも終了を返す。

次のPlayerへの切替と次Turn Startは別の進行境界である。Acceptanceは[Observation points](../acceptance/README.md#observation-points)で宣言後・選択待ち・解決直後を観測する。1 Commandで相手Turn Startの回復・Drawまで無条件に進めず、User Task待ちやTurn境界に到達したResultを返せるようにする。新しい停止操作やPassをゲームルールに追加する意味ではない。

## Effect Resolution integration

既存の`Resolution → EffectStep[] → Sequential Effect / SimultaneousGroup`をそのまま利用する。責任を分ける価値は、各EffectのState変更が、順序・Player order・終了打ち切りを独自に管理することを避けられる点にある。

| Responsibility | Work / authoritative source |
| --- | --- |
| Resolution Controller | Step順序、逐次 / 同時境界、複数Playerへの順序、Game End時の打ち切り。[Resolution steps](effect-resolution-model.md#resolution-steps)、[Player order](effect-resolution-model.md#player-order)、[Game end](effect-resolution-model.md#game-end) |
| Effect Executor | Damage / Draw / Move / Destroy / Ready / Exhaust / Reveal等の1 Effectが要求するState変更。予定処理のRule Evaluationと、成立した移動時の[Zone transitions](../rules/core-rules.md#zone-transitions)へ接続する |
| Core Procedure application | 通常Deploy / Set、Attack Commit、Turn Start、Cancel、Tactic解決後のDiscard等。Card Resolutionへの複製なしに、State変更とRule評価を共有する |

ControllerとExecutorは概念上の責任であり、クラスやModule分割を固定しない。SimultaneousGroupをExecutorの逐次呼び出しと途中の勝敗判定へ分割しない。両UnitのCombatはCore Procedureによる同時Damageで、Card JSONにCombat Effectを書かない。Drawの1枚ごとの処理・Hand Limit・失敗時停止も既存正本に従い、Executor内の一括更新で判定境界を失わない。

Eventsも既存の適用境界を観測できるようにする。双方の同時Damage、Destroy前の致死Damage、移動後の配置状態破棄を最終Stateだけから推測しない。途中の観測情報の形式は後続設計へ残すが、同時処理の途中で勝敗を確定する根拠にはしない。新しいTrigger queueをEvent列から開始することもない。

## Card Definition integration

静的定義はCost・Target Constraint・ResolutionなどCard固有の差分を提供する。Coreは通常Deploy / Setの移動と初期化、Attack、Reaction Window、Cancel、Cost timing、Game End等を提供し、Cardへ複製しない。

Engineは構造・静的意味の検証済み定義を参照し、同じ定義を使う複数Card Instanceを区別する。Zone移動やCost支払いで静的定義を書き換えず、Runtimeに基本CostとEffective Costを区別する。[Unsupported concepts](card-definition-schema.md#unsupported-concepts-and-open-questions)を未対応のまま維持し、将来のRule Interference Schemaを今回追加しない。

## Acceptance integration

~~~text
Gherkin
  → Step Definition
  → Given: validated Card Definitions + fixture GameState
  → When: Command / legal-choice query
  → Domain Engine
  → Then: Event / State / Result assertion
~~~

Givenは定義と現在状態を分け、Scenarioで指定した値をfixtureの最終値として構成する。Whenは意思決定の段階ごとにCommandを渡す。Thenは移動・支払いなどのEvent、現在状態、拒否 / 選択待ち / 完了 / 終了のResultを観測する。Step Definitionはルールを実装せずEngineの入力・観測へ翻訳し、UIやDBを経由しない。

今の`npm test`は検証器のテスト、`check:spec`はGherkinの構文・要求参照・Scenario IDの検証であり、この経路を実行する受入テストではない。RunnerとStep Definitionsは次の最小実装から対象Scenarioにだけ接続する。

## Open questions

| ID | Question / limit | Resolve before |
| --- | --- | --- |
| Q-ENGINE-001 | 共有Selected Targetの複数Stepでの合同充足性、先行Effect後の対象寿命・再検証時点、不適合時のskip / 再選択 / 停止等をどう扱うか。現在の静的検証は各参照の型互換性のみ。[Q-SCHEMA-004](card-definition-schema.md#unsupported-concepts-and-open-questions) | 対象の所在・状態を途中で変える複数Step実装 |
| Q-ENGINE-002 | Priority / Stack、Trigger queue、Continuous Layer、Timestamp / Active Player precedence、affected Playerの選択をどう定めるか。[Q-SCHEMA-001](card-definition-schema.md#unsupported-concepts-and-open-questions) | これらに依存するMechanic追加 |
| Q-ENGINE-003 | 複数Replacementの競合・再帰・Infinite loop、Modifierとの関係、「最初のDamage」の適用・消費境界をどう定めるか | Modifier / Replacement Engine実装 |
| Q-ENGINE-004 | Subject / Rule / Scope / DurationとReplacement / ContinuousをどうSchemaに表すか。Zone移動時に干渉が継続するか | 干渉Cardの定義形式追加 |
| Q-ENGINE-005 | Rule Evaluation・Command・Event / Resultの具体API、診断・途中観測・閲覧者別投影をどう表すか | 各Vertical Sliceで必要な範囲の接続 |
| Q-ENGINE-006 | Runtime個体IDの採番・再利用・移動後の同一性、Stateの保存・履歴・Player Knowledgeをどう表すか | 個体参照を必要とする最小実装では最小方式、Hidden追跡・永続化等は該当実装前 |

未決事項は[Issue #13](https://github.com/kjun1/card-game/issues/13)・[Issue #16](https://github.com/kjun1/card-game/issues/16)に結び付く今回の決定範囲と区別する。両Issueの目的は要求・責任境界の確定であり、全Mechanicの実装ではない。新しい具体例が必要になった時点で[Change policy](../README.md#change-policy)へ戻る。

## First vertical slice

次の実装PRは、GameState + Card Instance + Zone + Resource + 非Action Unit Deploy + Operation Completeを最小単位とする。最初に[AC-BOARD-013](../acceptance/board-zone.feature)を実行してgreenにする。GivenでTurn Start済みのStateを用意するため、SetupやTurn Startの全実装は前提にしない。

| Stage | Concrete work / observation |
| --- | --- |
| Given | AがActive Player、両Core HP 10、両Energy 3。AのHandに未DeployのMax HP 5の「新兵」、非Action Deploy / Energy Cost 2、Unit Zoneに空き。静的定義と個体を分ける |
| Command / validation | AのDeploy意思決定を渡す。Sourceの所属・Hand所在・Operation、非Action、有効Cost 2と全支払い可能性、有効Capacityを確認する。干渉なしのRule EvaluationはBase Ruleと同じ結果を返す |
| State transition | Energy 3→1。「新兵」をHandから自Unit Zoneへ移動し、Damage 0 / Ready / AttackLockedを生成する。Current HP 5、現時点でAttack不可という初期配置の資格を確認する。Attack手続きの実装は含めない |
| Events / result | 支払い・移動・配置状態生成・Operation完了を観測でき、Game継続とCompletedを返す。次のPlayerのTurn Startを実行せず解決直後をassertする |
| Acceptance connection | 最小Runnerと対象Step Definitionsを実装し、既存Scenarioの文言と要求・観測境界を維持して接続する |

最小sliceの拒否境界は、既存[AC-BOARD-003](../acceptance/board-zone.feature)の満杯Zoneと[AC-AR-008](../acceptance/action-reaction.feature)のEnergy不足を使う。Cost・Hand・Board不変、Operation未完了を確かめる。これはCore判定がRule Evaluationを経由することと、検証前にStateを変更しないことの確認になる。

Reaction、Attack、Block、Trigger、Replacementをこのsliceへ広げない。Game / Turnの全進行は別のsliceで[AC-TURN-007](../acceptance/turn.feature)等へ接続する。最初からすべての未決APIやMechanicを実装する必要はない。
