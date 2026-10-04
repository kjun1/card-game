# Example Mapping

要求をCapability、Rule、具体的なExampleへ分解する。各ExampleのIDはFeatureのScenario / Scenario Outlineへ対応し、Outlineの表の各行は同じIDの独立した例である。要求タグは要求への追跡、Rule参照は数値や処理の細則の根拠を表す。

各Capabilityの未解決QuestionはこのMappingで明示し、その結論に依存する期待結果はGherkinへ追加しない。議論・合意はGitHub Issuesで進め、確定後に根拠と対応Scenarioを更新する。

要求の定義表: [GR](../requirements/game-requirements.md#requirements)、[IR](../requirements/interaction-requirements.md#requirements)、[PER](../requirements/play-experience-requirements.md#requirements)。例示Cardはテスト用fixtureであり、実際のCard Poolに追加するものではない。

## Capability: Turnを開始し制御権を渡す

| Rule | 内容と根拠 |
| --- | --- |
| T1 | 自分のUnitのReady化・Attack制限解除、Capacity増加後のEnergy回復を行う。[Turn Start order](../rules/core-rules.md#turn-start-order)、[Energy](../rules/resource-rules.md#energy)、[Turn Flow](../process/turn-flow.md#semantics) |
| T2 | 必要なDrawを1枚行い、Hand Limit 7超過なら引いたCardをDiscardする。Draw要求時にDeckが空なら敗北する。[Draw and Hand Limit](../rules/deck-rules.md#draw-and-hand-limit)、[Game objective](../rules/core-rules.md#game-objective) |
| T3 | Game継続中に1 Operation完了でTurnを終える。取消では未完了で再選択しTurn Startを繰り返さない。[Turn / Operation](../rules/core-rules.md#turn)、[Turn Flow](../process/turn-flow.md#semantics) |
| T4 | Game終了はOperation完了・再選択・Player切替より優先する。勝敗条件成立時に結果を固定して残りのEffectを打ち切る。同時に成立した双方敗北だけがDrawであり、同じEffectでも逐次処理の後半は解決しない。GR-018、[Game objective](../rules/core-rules.md#game-objective)、[Turn Flow](../process/turn-flow.md#semantics)、[Turn cardinality](../model/domain-model.md#turn--operation-cardinality) |

[turn.feature](turn.feature)のExamples:

| Scenario ID | Rule | 具体例と期待結果 | Requirements |
| --- | --- | --- | --- |
| AC-TURN-001 | T1, T2 | AのUnitだけReady・制限解除。相手のUnitは変わらず、Deck 10→9・Hand 3→4 | GR-009 |
| AC-TURN-002 | T1 | Capacity 2→3 / 6→7 / 7→7、Energy 1から更新後Capacityへ回復 | GR-009, GR-010, PER-004 |
| AC-TURN-003 | T2 | Hand 6→7で引いたCardを保持 | GR-009 |
| AC-TURN-004 | T2 | Hand 7からDrawしたCardだけDiscardし元の7枚を保持 | GR-009 |
| AC-TURN-005 | T2 | Deck最後の1枚をDrawして0枚になっても継続 | GR-003, GR-009 |
| AC-TURN-006 | T1, T2, T4 | Ready・Energy更新後のDraw失敗で敗北。Operation選択なし、完了数0 | GR-003, GR-009 |
| AC-TURN-007 | T3 | Energy 3→1のDeploy完了でAからBへ交替 | GR-007, PER-001 |
| AC-TURN-008 | T3 | 何もしない選択でCostを消費せず1 Operation完了・交替 | GR-007, PER-001 |
| AC-TURN-009 | T3 | Cancel後もCapacity 3・Energy 3・Deck 9・Hand 4。ReactionでExhaustしたUnitをReadyに戻さない | GR-008, GR-009, IR-006, IR-008, PER-004 |
| AC-TURN-010 | T4 | ReactionでAのCore HP 2→0。完了数0でもGame終了し再選択しない | GR-002, GR-008, IR-005, IR-008 |
| AC-TURN-011 | T4 | 同時Damageで両Core HP 2→0ならDraw | GR-002, GR-004 |
| AC-TURN-012 | T3, T4 | 非Actionの完了でBのCore HP 2→0。Game終了しBのTurnを開始しない | GR-002, GR-007 |
| AC-TURN-013 | T4 | BのCore HP 2→0でAの勝利を直ちに確定。同じEffectの後半にあるAの空DeckからのDrawは行わず、DrawやA敗北へ変わらない | GR-002, GR-007, GR-018 |
| AC-TURN-014 | T4 | 同じEffectでBのCore HP 2→1の後、AのDraw失敗でA敗北を確定。既に与えたDamageとCostを保持し、残りのBへの1 Damageは行わない | GR-002, GR-003, GR-007, GR-018 |

## Capability: ActionとReactionの成立を判断する

| Rule | 内容と根拠 |
| --- | --- |
| A1 | Attackは常にAction。他の操作は当該操作・AbilityへのAction指定だけで判定し、未指定は非Action。分類Tagや同じCardの別操作の指定を波及させない。[Action](../rules/core-rules.md#action)、[Action keyword](../model/card-model.md#action-keyword) |
| A2 | 非Actionも合法性・支払い可能性を検証して支払い・解決する。不正なら副作用なしで未完了。Action不正は宣言へ、Reaction不正はReaction選択へ戻る。[Operation](../rules/core-rules.md#operation)、[Selection and validation](../process/action-reaction-flow.md#selection-and-validation) |
| A3 | Action宣言時は本体Energyを払わない。Reaction辞退なら本体Costを払い解決する。[Cost timing](../rules/resource-rules.md#cost-timing)、[Cost semantics](../process/action-reaction-flow.md#cost-semantics) |
| A4 | Reactionを支払い・解決して元ActionをCancelする。未払いEnergyと手札はCancel自体では失わず、ReactionのCost・Effect・Card移動は戻さない。[Action](../rules/core-rules.md#action)、[Cost semantics](../process/action-reaction-flow.md#cost-semantics) |
| A5 | 合法な再宣言は新Windowを作る。ReactionへのReactionは作らない。[Action](../rules/core-rules.md#action)、[Cost semantics](../process/action-reaction-flow.md#cost-semantics) |
| A6 | 通常のReaction SourceはBoardへ事前コミットしたUnit Ability・Face-up Support Ability・Set Card。Handから直接使用できない。[Reaction Source](../rules/core-rules.md#reaction-source) |

[action-reaction.feature](action-reaction.feature)のExamples:

| Scenario ID | Rule | 具体例と期待結果 | Requirements |
| --- | --- | --- | --- |
| AC-AR-001 | A1 | 指定のないUnitのAttackでもReaction Windowが開く | IR-001, IR-002, IR-011 |
| AC-AR-002 | A1, A3 | Deploy / Set / Play / AbilityへのAction指定でWindowが開きEnergy 3を維持 | IR-001, IR-002, IR-019, PER-002 |
| AC-AR-003 | A1, A2 | 指定のない5種の操作はWindowなしでEnergy 3→1・解決・完了 | IR-001, IR-002, IR-019, PER-002 |
| AC-AR-004 | A1 | PlayだけAction指定のCardをSetするとWindowなし、Energy 3→2 | IR-001, IR-002, IR-019 |
| AC-AR-005 | A1 | 同じCardの「強射」のAction指定を「小射」へ波及させない | IR-001, IR-002, IR-019 |
| AC-AR-006 | A1 | 意味分類Tag「Action」は操作の動作キーワードにならない | IR-001, IR-019 |
| AC-AR-007 | A2 | 合法な非ActionでEnergy 3→1・相手Core HP 10→8・完了 | GR-007, GR-010, IR-001, IR-019 |
| AC-AR-008 | A2 | Energy 1でCost 2 / Unit Zone 5体で追加Deployは拒否、CardとEnergyを保持して再選択 | GR-007, GR-010, GR-016, IR-019 |
| AC-AR-009 | A2 | Energy不足 / 不正TargetのActionはWindowなしで再宣言 | GR-010, IR-002 |
| AC-AR-010 | A2 | Cost不足 / 不正Target / Timing不正のReactionはCost・Effect・Cancelなしで再選択 | IR-003, IR-005, IR-007 |
| AC-AR-011 | A3 | 宣言時Energy 3、辞退後1。Core HP 10→8、TacticはDiscard | GR-010, IR-002, IR-006 |
| AC-AR-012 | A4 | Reaction側Energy 3→2・Core Damageを維持。元Action側Energy 3・手札を保持 | IR-005, IR-006, IR-007, IR-008, IR-020 |
| AC-AR-013 | A4 | Reactionで宣言CardをDiscardした場合は取消後もHandへ戻さない | IR-005, IR-006, IR-007, IR-020 |
| AC-AR-014 | A4, A5 | 同じ手札Cardの再宣言で2つ目のWindow、辞退後のみ本体Costを払う | IR-006, IR-008, IR-009, IR-020 |
| AC-AR-015 | A5 | 相手のReaction使用時に自分のReactionがあってもChainを作らない | IR-005, IR-010, PER-010 |
| AC-AR-016 | A2, A6 | HandのReaction CardはSource不正、Energy 3・Cardを保持 | IR-003, IR-004, PER-003 |
| AC-AR-017 | A4, A6 | Boardの3種のSourceから合法なReaction、Energy 3→2・元Action取消 | IR-003, IR-005, PER-003 |

## Capability: Attackに防御しCombatを解決する

| Rule | 内容と根拠 |
| --- | --- |
| C1 | Ready・Attack制限なしの自UnitでEnemy Core / UnitへAttackできる。敵UnitがいてもCoreを狙える。宣言時はExhaustしない。[Attack](../rules/combat-rules.md#attack)、[Attack declaration](../process/attack-flow.md#attack-declaration) |
| C2 | ReactionありならAttack取消、Block・Combatなし。ReactionなしならBlock後にCommitしAttackerをExhaustする。[Reaction](../rules/combat-rules.md#reaction)、[Attack Commit](../rules/combat-rules.md#attack-commit)、[Attack Flow](../process/attack-flow.md#review-preview) |
| C3 | Blockは最大1体、Core / Unit両方へのAttackに使え、Final Targetを変える。Ready / Exhausted・Deploy直後に依存せず、BlockでExhaust・Window発生なし。[Block](../rules/combat-rules.md#block)、[Block step](../process/attack-flow.md#block-step) |
| C4 | Block AbilityとCostを検証する。不正ならCost・Target・Attacker状態を変えず再選択。Momentumは支払った分だけ相手へ移転。[Block step](../process/attack-flow.md#block-step)、[Momentum](../rules/resource-rules.md#momentum)、[Block Cost](../rules/resource-rules.md#block-cost) |
| C5 | CoreへATK分、Unit同士は互いのATK分を同時に与える。Damageは蓄積しCurrent HP ≤ 0ならDestroy。余剰Damageの通常移転なし。[Combat resolution](../rules/combat-rules.md#combat-resolution)、[Damage and Destroy](../rules/combat-rules.md#damage-and-destroy)、[Overkill](../rules/combat-rules.md#overkill) |
| C6 | Core HP ≤ 0でGameを終了する。致死Damage時点で勝敗を固定し、残るEffectや次Turnへ進まない。[Game objective](../rules/core-rules.md#game-objective)、[Combat](../process/attack-flow.md#combat)、[Turn Flow](../process/turn-flow.md#semantics) |

[attack.feature](attack.feature)のExamples:

| Scenario ID | Rule | 具体例と期待結果 | Requirements |
| --- | --- | --- | --- |
| AC-ATK-001 | C1 | 敵UnitがいてもCore / Unitへ合法に宣言、AttackerはReady | IR-011, IR-002 |
| AC-ATK-002 | C1 | Exhausted / Deploy直後 / 自分のCoreをTargetとする宣言は拒否 | IR-002, IR-011 |
| AC-ATK-003 | C1, C2, C5 | 宣言・Block選択中はReady、CommitでExhaust、Core HP 10→7 | IR-011, IR-012 |
| AC-ATK-004 | C2 | Reactionで取消しAttacker Ready、Blockなし・Momentum維持・Combatなし | IR-005, IR-008, IR-012 |
| AC-ATK-005 | C3, C4, C5 | Core / UnitへのAttackを護衛へ向け、元Targetは無傷、Window追加なし | IR-013, IR-015, GR-011 |
| AC-ATK-006 | C3, C4 | 2体のBlock指定は拒否、Momentum・Final Target・Attackerを維持 | IR-013, IR-014 |
| AC-ATK-007 | C3 | Ready / Exhausted × Attack制限あり / なしの4通りでBlock可能、状態維持 | IR-013, IR-016 |
| AC-ATK-008 | C4 | Momentum 2のBlockで防御側3→1・攻撃側3→5、合計6・Energy維持 | GR-011, IR-013, PER-005 |
| AC-ATK-009 | C4 | Abilityなし / Cost不足なら不変で再選択、その後Block辞退でCore HP 10→7 | GR-011, IR-013 |
| AC-ATK-010 | C4 | 不正な一般兵から合法な護衛へ選び直し、Costは1回分だけ移転 | IR-013 |
| AC-ATK-011 | C5 | ATK 3対2で双方Damageを同時適用し双方生存 | IR-011 |
| AC-ATK-012 | C5 | 既存Damage 1と2へ2ずつ加算し3と4になる | IR-011 |
| AC-ATK-013 | C5 | ATK 4 / HP 3対ATK 3 / HP 4で双方Current HP 0、双方Discard | IR-011 |
| AC-ATK-014 | C5 | ATK 7を残HP 2のUnitへ与えCurrent HP -5、余剰5は他へ移らない | IR-011 |
| AC-ATK-015 | C2, C5, C6 | ATK 3でCore HP 2→-1、Attack完了・勝利で次Turn開始なし | GR-002, GR-007, IR-011 |

`IR-011`はAttackをActionとする上位要求であり、ATK・Damage・Destroyの計算そのものを記した要求ではない。AC-ATK-011〜014の詳細な期待結果はC5で示したCombat Rulesに基づく。要求タグだけで細則の根拠まで表したとみなさない。

## Capability: SetupとMulliganで対戦を準備する

| Rule | 内容と根拠 |
| --- | --- |
| S1 | コイントスでFirst Playerを決定し、先攻・後攻の追加補正はない。各DeckをShuffleして順序をランダムにしてからOpening Hand 5枚を配る。[First Player](../rules/deck-rules.md#first-player)、[Parameters / Game setup](../rules/deck-rules.md#game-setup)、[Game Flow](../process/game-flow.md#review-preview)、[Game BPMN](../process/bpmn/game-flow.bpmn) |
| S2 | 各PlayerはGame開始時に1回、Opening Handから0〜5枚を交換できる。[Mulligan](../rules/deck-rules.md#mulligan)、[Game Flow](../process/game-flow.md#bpmn-style-elements) |
| S3 | 選択CardをDeck外へ退避してから同数Drawし、両Playerの交換完了後にそれぞれのDeckへ戻してShuffleする。同じ交換Card自体を引き直さない。[Mulligan](../rules/deck-rules.md#mulligan)、[Game Flow](../process/game-flow.md#review-preview)、[Game BPMN](../process/bpmn/game-flow.bpmn)の交換処理から合流後のReturn / Shuffleへの順序 |
| S4 | Mulliganの交換枚数だけをOpponentへ公開し、選択・退避Cardの内容は公開しない。[Mulligan](../rules/deck-rules.md#mulligan)、[Information visibility](../rules/core-rules.md#information-visibility) |

[setup-mulligan.feature](setup-mulligan.feature)のExamples:

| Scenario ID | Rule | 具体例と期待結果 | Requirements |
| --- | --- | --- | --- |
| AC-SETUP-001 | S1 | コイントス結果でA / BがFirst Playerとなり、両Playerの合法な30枚Deckから各5枚をOpening Handへ配る。Mulligan前は両Deck 25枚・Hand 5枚で追加配布なし。双方0枚交換で準備を終えた後に最初のTurnを開始するのはコイントスで決まったPlayer | GR-001, GR-014 |
| AC-SETUP-002 | S2, S3 | AがOpening Handの0 / 1 / 5枚を交換しBは未完了。AのHandは5枚、Deckは25 / 24 / 20枚、退避は0 / 1 / 5枚。保持CardはHandに残り、交換Card自体は引き直さない | GR-014 |
| AC-SETUP-003 | S3 | A / Bのどちらが先に2枚交換しても、相手の3枚交換完了までは先に終えた側の2枚を退避しDeck 23枚を維持。双方完了後に各自の退避Cardを戻してShuffleし、双方Deck 25枚・Hand 5枚になる | GR-014 |
| AC-SETUP-004 | S3 | Opening Handの「斥候」の個体Xを退避して、Deck先頭の同一Nameの別個体YをDrawする。Xは退避したままでYをHandに加える | GR-014 |
| AC-SETUP-005 | S2 | 0 / 2枚の交換で既に自分のMulliganを完了したPlayerは再度Mulliganできず、Hand・DeckのCardは変わらない | GR-014 |
| AC-SETUP-006 | S2 | Opening Handの4枚とDeck内の1枚を交換対象にしても、Opening Hand外のCardをMulliganで交換することはできない | GR-014 |
| AC-SETUP-007 | S2, S3, S4 | Opening Handから0 / 2 / 5枚を交換するとOpponentへその枚数を知らせるが、交換・退避Cardの内容は公開しない | GR-014, GR-015 |
| AC-SETUP-008 | S1 | 両Playerの準備済み30枚DeckをOpening Draw前に必ずShuffleして順序をランダムにし、そのDeckから各5枚を配る。特定の並びや毎回異なる並びは要求しない | GR-014 |

初期Resourceが先攻・後攻で共通であることはR1・AC-RESOURCE-001、両Playerの最初の自TurnがEnergy 3になることはR2・AC-RESOURCE-002へつなぐ。Setup時点と最初のTurn Start後を混同しない。

### Setup / Mulligan: resolved questions

| Question | 結論と根拠 | 反映先 |
| --- | --- | --- |
| 0枚交換するとMulliganの権利は残るか | 0枚も許可されたMulliganの選択であり、完了後に2回目は行えない。[Mulligan](../rules/deck-rules.md#mulligan) | S2、AC-SETUP-002・005 |
| 自分だけ交換完了したら退避Cardを戻せるか | 両Playerの交換完了まで戻せない。BPMNの合流後にReturn / Shuffleへ進む。[Game Flow](../process/game-flow.md#review-preview) | S3、AC-SETUP-003 |
| 同一Nameの別Cardも交換後Drawから除外するか | 退避の対象は選択したCard自体。同一NameのCardをDeckから除く規則はない。[Mulligan](../rules/deck-rules.md#mulligan) | S3、AC-SETUP-004 |

### Setup / Mulligan: agreed decisions

| Question ID | 合意内容と根拠 | Acceptance Scenario ID |
| --- | --- | --- |
| Q-SETUP-001 | ユーザー合意: 交換枚数のみ相手へ知らせ、交換・退避Cardの内容は非公開。S4へ反映 | AC-SETUP-007 |
| Q-SETUP-002 | ユーザー合意: Opening Handを配る前にDeckをShuffleし、順序をランダムにする。S1へ反映 | AC-SETUP-008 |

## Capability: EnergyとMomentumの予算を管理する

| Rule | 内容と根拠 |
| --- | --- |
| R1 | Setupで各PlayerのEnergy Capacity / Energyを2、Momentumを3ずつに初期化する。先攻・後攻の追加補正はない。[Energy](../rules/resource-rules.md#energy)、[Momentum](../rules/resource-rules.md#momentum)、[Game setup](../rules/deck-rules.md#game-setup)、[First Player](../rules/deck-rules.md#first-player) |
| R2 | 自分のTurn StartでCapacityを1増加（最大7）した後にEnergyをCapacityへ回復する。各Playerの最初の自TurnはCapacity / Energy 3。[Energy](../rules/resource-rules.md#energy)、[Turn Start order](../rules/core-rules.md#turn-start-order)、[Turn Flow](../process/turn-flow.md#semantics)、[Turn BPMN](../process/bpmn/turn-flow.bpmn) |
| R3 | Energyは相手へ移転せず、自TurnのOperationと相手Turn中のReactionで同じ予算を共有する。相手Turn開始・Cancel後の再選択で回復しない。Setup Energy 2に利用時点の制限はないが、通常SetupではBoardにReaction Sourceがなく、最初の自Turn前にReactionできない。[Energy](../rules/resource-rules.md#energy)、[Reaction Source](../rules/core-rules.md#reaction-source) |
| R4 | Cost全体の支払い可能性を先に検証する。不正な非ActionはCost消費・Card移動・Effect解決なしで未完了になる。EnergyとMomentumは別Resourceであり、MomentumをEnergy代替にしない。[Resource definition](../rules/resource-rules.md#resource-definition)、[Momentum](../rules/resource-rules.md#momentum)、[Cost timing](../rules/resource-rules.md#cost-timing)、[Operation](../rules/core-rules.md#operation)、[Selection and validation](../process/action-reaction-flow.md#selection-and-validation)、[Operation lifecycle](../model/state-model.md#operation-lifecycle) |
| R5 | Momentum Nを支払ったPlayerからOpponentへN移転し、通常のCost支払いでは両Playerの合計6を維持する。[Momentum](../rules/resource-rules.md#momentum)、[Cost semantics](../process/action-reaction-flow.md#cost-semantics)、[Action / Reaction BPMN](../process/bpmn/action-reaction-flow.bpmn) |
| R6 | EnergyとMomentumはPublic情報である。[Information visibility](../rules/core-rules.md#information-visibility)、[Playerの責務](../model/domain-model.md#responsibilities) |

[resource.feature](resource.feature)のExamples:

| Scenario ID | Rule | 具体例と期待結果 | Requirements |
| --- | --- | --- | --- |
| AC-RESOURCE-001 | R1 | First PlayerがA / BのどちらでもMulligan完了後・最初のTurn Start前の両PlayerはCapacity 2 / Energy 2 / Momentum 3、合計Momentum 6 | GR-010, GR-011 |
| AC-RESOURCE-002 | R2 | A / B各自の最初のTurn StartでCapacity 2→3・Energy 2→3。相手のEnergy Capacity / Energyはその時点の値を保つ | GR-009, GR-010, PER-004 |
| AC-RESOURCE-003 | R2, R3 | Aの自TurnでEnergy 3→1のOperationを完了。BのTurn StartでAは1のまま、BのActionへのAのReactionで1→0。Bが何もしないでTurnを完了し、Aの次Turn StartでCapacity 3→4・Energy 0→4 | GR-009, GR-010, IR-005, PER-004 |
| AC-RESOURCE-005 | R3, R4 | Energy 2で非ActionのEnergy Cost 2をちょうど支払い0にする。OpponentのEnergyと両PlayerのMomentumは変わらない | GR-010, PER-004 |
| AC-RESOURCE-006 | R4 | Energy 1・Momentum 6でもEnergy Cost 2の非Actionを実行できない。Cost・Card移動・Effectなしで同じTurnのOperation選択へ戻る | GR-007, GR-010, GR-011 |
| AC-RESOURCE-007 | R5 | Momentum Cost 2で3:3→1:5、Cost 3で3:3→0:6、BがCost 6を使い0:6→6:0。各支払い後の合計6と両PlayerのEnergyを維持する | GR-011, PER-005 |
| AC-RESOURCE-008 | R4, R5 | Energy 2かつMomentum 2を必要とする非Actionで、Energyのみ不足 / Momentumのみ不足 / 両方不足 / Momentum 0は拒否する。足りている側も支払わず、相手への移転・Effect解決・Operation完了なし | GR-007, GR-010, GR-011 |
| AC-RESOURCE-009 | R4, R5 | Energy 2・Momentum 2を持つAがEnergy 2かつMomentum 2の非Actionを実行し、AはEnergy 0 / Momentum 0、BはMomentum 4→6。Energy移転なしで解決・完了 | GR-007, GR-010, GR-011, PER-005 |
| AC-RESOURCE-010 | R6 | AのEnergy 2 / Momentum 1、BのEnergy 4 / Momentum 5を両Playerが確認できる | GR-015 |
| AC-RESOURCE-011 | R1, R3 | 通常Setupでは両BoardにCardがない。先攻のActionでWindowは開くが、後攻は最初の自Turn前に使えるReaction Sourceがなく、HandもSourceにはできずSetup Energy 2を保持する | GR-010, IR-003, IR-004 |

`AC-RESOURCE-004`（初回自Turn前に合法なBoard Sourceを仮定する例）はQ-RESOURCE-001の合意により廃止し、IDを再利用しない。通常SetupでReactionできない例をAC-RESOURCE-011として追加した。

複合Costの例は既存の「Cost支払い可能性を検証してから支払う」を具体化し、Costの内部支払い順や詳細Card Schemaを定義しない。

既存Featureの対応例:

| Scenario ID | Rule | 既存の具体例 | Requirements |
| --- | --- | --- | --- |
| [AC-TURN-002](turn.feature) | R2 | Capacity 2→3 / 6→7 / 7→7の後にEnergy回復。相手の値は更新しない | GR-009, GR-010, PER-004 |
| [AC-TURN-009](turn.feature) | R3 | Cancel後の再選択でEnergy Refreshを繰り返さない | GR-008, GR-009, IR-006, IR-008, PER-004 |
| [AC-AR-009〜012](action-reaction.feature) | R3, R4 | Action / ReactionのCost不足、Action宣言時の未払い、Reaction辞退時の支払い、Cancel後の未払いEnergy保持とReaction支払い保持 | GR-010, IR-002, IR-003, IR-005, IR-006, IR-007, IR-008, IR-020 |
| [AC-ATK-008〜009](attack.feature) | R4, R5 | BlockでのMomentum移転と不足時の拒否 | GR-011, IR-013, PER-005 |

### Resource: resolved questions

| Question | 結論と根拠 | 反映先 |
| --- | --- | --- |
| 後攻の最初のTurnでもEnergyは2のままか | Setupの2に対して自分のTurn StartでCapacity増加・Refreshを行うので、先攻・後攻とも最初の自Turnは3。[Energy](../rules/resource-rules.md#energy) | R1〜R2、AC-RESOURCE-001〜002 |
| 相手Turnになれば自分のEnergyも回復するか | 自分のTurn Startだけで回復し、相手Turn中のReactionも同じBudgetを使う。[Energy](../rules/resource-rules.md#energy) | R3、AC-RESOURCE-003 |
| Resourceの片方が足りない複合Costを一部だけ支払うか | Cost支払い可能性の検証が先で、不正な非ActionはCost消費なし。十分なResourceも支払わない。[Operation](../rules/core-rules.md#operation)、[Selection and validation](../process/action-reaction-flow.md#selection-and-validation) | R4、AC-RESOURCE-008〜009 |
| Momentum合計6に例外を新設するか | 通常のCostによる移転だけを例にし、原則を破る特殊処理を追加しない。[Momentum](../rules/resource-rules.md#momentum) | R5、AC-RESOURCE-007〜009 |

### Resource: agreed decisions

| Question ID | 合意内容と根拠 | Acceptance Scenario ID |
| --- | --- | --- |
| Q-RESOURCE-001 | ユーザー合意: Setup Energy 2は存在するが、通常SetupにはReaction Sourceがなく最初の自Turn前にReactionできない。即時対応用Cardや事前配置を追加しない。R1・R3へ反映 | AC-RESOURCE-011 |

## Capability: BoardのZoneと公開情報を管理する

| Rule | 内容と根拠 |
| --- | --- |
| Z1 | 単一Board上で各PlayerがUnit ZoneとSupport Zoneを持つ。Unitは自分のUnit Zoneへ、SupportとSet可能なCardは自分のSupport Zoneへ配置する。[Board](../rules/core-rules.md#board)、[Domain Model](../model/domain-model.md#model)、[Card types](../model/card-model.md#card-types) |
| Z2 | Unit Zone Capacityは5、Support Zone Capacityは3。Face-up SupportとSet Cardは同じSupport Zone Capacityを使用する。[Parameters](../rules/deck-rules.md#parameters)、[Zone Capacity](../rules/deck-rules.md#zone-capacity)、[IR-017](../requirements/interaction-requirements.md#requirements)、[Board Capacity](../design/balance-model.md#board-capacity) |
| Z3 | Capacityを超えるDeploy / SetはCost支払い前に拒否する。非ActionではCost・Card移動・Effectの副作用なしでOperation未完了となり、Game継続中は再選択する。Actionの不正な宣言はReaction Windowも開かない。[Operation](../rules/core-rules.md#operation)、[Selection and validation](../process/action-reaction-flow.md#selection-and-validation)、[Action / Reaction BPMN](../process/bpmn/action-reaction-flow.bpmn)、[Operation lifecycle](../model/state-model.md#operation-lifecycle) |
| Z4 | 基本ルールで自分のBoard Cardを任意Discardして空きを作ることはできない。Card Effectによる移動・Destroyは別であり、UnitのDestroyはDiscardへの移動を伴う。[GR-017](../requirements/game-requirements.md#requirements)、[Board](../rules/core-rules.md#board)、[Zone Capacity](../rules/deck-rules.md#zone-capacity)、[Damage and Destroy](../rules/combat-rules.md#damage-and-destroy)、[Effect](../model/card-model.md#effect) |
| Z5 | Unit・Face-up Support・Zone使用数はPublic。Set Cardは存在とSlot使用がPublic、内容はHiddenであり、HandからSetしても内容はOpponentへ公開されない。[Information visibility](../rules/core-rules.md#information-visibility)、[Information](../rules/deck-rules.md#information)、[Set state](../model/state-model.md#set-state) |
| Z6 | DiscardはOpponentへ枚数だけを公開し、所有Playerは全Cardの内容を確認できる。未RevealのSet CardもDiscard移動によってOpponentへ内容を公開しない。[Information visibility](../rules/core-rules.md#information-visibility)、[Information](../rules/deck-rules.md#information)、[Zoneの責務](../model/domain-model.md#responsibilities) |

[board-zone.feature](board-zone.feature)のExamples:

| Scenario ID | Rule | 具体例と期待結果 | Requirements |
| --- | --- | --- | --- |
| AC-BOARD-001 | Z1, Z2 | 自分のSupport Zoneと相手のUnit Zoneが満杯でも、自分のUnit Zone 4→5へDeployできる。Energy 3→1、CardはHandから自分のUnit Zoneへ移動 | GR-006, GR-012, GR-013, GR-016 |
| AC-BOARD-002 | Z1, Z2 | 自分のUnit Zoneが満杯でも、Face-up / Setが2:0・1:1・0:2のSupport ZoneへSupport DeployまたはSetを行い、最後の1 Slotを使える | GR-006, GR-012, GR-016, IR-017 |
| AC-BOARD-003 | Z2, Z3 | Unit Zone 5体への非Action Deployを拒否。Energy 3・Hand・Boardを保ち、Operation未完了で同じTurnの再選択へ戻る | GR-007, GR-010, GR-016 |
| AC-BOARD-004 | Z2, Z3 | Face-up / Setが3:0・2:1・1:2・0:3のSupport Zoneでは非Action Support DeployとSetをどちらも拒否。Cost・Card・既存の占有を維持 | GR-007, GR-010, GR-016, IR-017 |
| AC-BOARD-005 | Z2, Z3 | Action指定のUnit Deploy / Support Deploy / Setも、配置先が満杯なら宣言を拒否。Cost・Cardを維持しReaction Windowを開かない | GR-010, GR-016, IR-002, IR-017 |
| AC-BOARD-006 | Z4 | 自分のUnit / Face-up Support / Set Cardを基本ルールだけで任意Discardしようとしても拒否され、満杯のZoneに空きはできない | GR-007, GR-017 |
| AC-BOARD-007 | Z4 | fixture AbilityによるUnit / Face-up Support / Set CardのHandへの移動、またはUnitのDestroyによるDiscard移動は成立し、元のZoneに1 Slotの空きができる | GR-013, GR-017 |
| AC-BOARD-008 | Z1, Z2, Z5 | HandのCardをSetするとSupport Zoneの使用数は1→2。Unit・Face-up Support・Setの存在・Slot使用はPublicだがSet Cardの内容はOpponentへ公開されない | GR-013, GR-015, IR-017, IR-018 |
| AC-BOARD-009 | Z4, Z6 | 未RevealのSet Cardを合法なEffectでDiscardへ移す。Discardは2→3枚でOpponentは枚数だけを確認でき、所有Playerは3枚すべての内容を確認できる | GR-015, GR-017, IR-018 |

### Board / ZoneのQuestion

| Question | 状態・結論と根拠 | Acceptance Scenario ID |
| --- | --- | --- |
| Unit ZoneとSupport Zone、両PlayerのZoneは同じCapacityを共有するか | 解決済み。各Playerが別々のUnit Zone / Support Zoneを持ち、各ZoneのCapacityで判定する。単一Boardであることは全Cardに1つの共通Capacityを設ける意味ではない。Z1・Z2 | AC-BOARD-001〜002 |
| Face-up Supportが少なければSet専用の空きSlotを使えるか | 解決済み。Face-up SupportとSetは合計で3 Slotを使い、配置比率によらず満杯なら両操作を拒否する。IR-017・Z2 | AC-BOARD-002・004 |
| Set済みTacticなら基本ルールで任意Discardしてよいか | 解決済み。GR-017の対象は自分のBoard Card全体であり、Set Cardも含む。規範文書の表記をこの既存要求へ揃え、Effectによる移動と区別する。Z4 | AC-BOARD-006〜007 |
| HiddenなSet Cardは占有SlotもOpponentに見せないか | 解決済み。内容だけがHiddenであり、存在とSlot使用はPublic。Z5 | AC-BOARD-008 |
| Q-BOARD-001: Discardへ移動したCardの内容はPublicか。Set CardがRevealを経ずに移動した場合も同じか | ユーザー合意により解決済み。相手には枚数のみ公開し、所有Playerは全Cardの内容を確認できる。未RevealのSet Cardも同じ扱い。Z6 | AC-BOARD-009、AC-DECK-012 |

## Capability: Deckを構築しDrawとHandを管理する

| Rule | 内容と根拠 |
| --- | --- |
| D1 | Deck Sizeは30、同一Nameは最大3枚。現在のFormatとAccess Ruleを満たすことも必要だが、その具体方式は定めない。[Parameters](../rules/deck-rules.md#parameters)、[Deck construction](../rules/deck-rules.md#deck-construction)、[Access Rule](../design/card-pool.md#access-rule)、[Format](../design/card-pool.md#format) |
| D2 | Drawは1枚ずつ処理する。Hand Limitは7であり、Drawで超えた場合はそのCardを直ちにDiscardし、既存Handの別Cardを代わりに選べない。[Draw and Hand Limit](../rules/deck-rules.md#draw-and-hand-limit)、[Card availability](../design/balance-model.md#card-availability)、[Zoneの責務](../model/domain-model.md#responsibilities) |
| D3 | Deckが0枚になるだけでは敗北せず、必要なDrawの時点でCardがなければ直ちに敗北を確定する。残りのEffectを解決せず、再選択・Player切替も行わない。既に適用したCost・Effectは保持する。GR-018、[Draw and Hand Limit](../rules/deck-rules.md#draw-and-hand-limit)、[Game objective](../rules/core-rules.md#game-objective)、[Turn Flow](../process/turn-flow.md#semantics)、[Turn BPMN](../process/bpmn/turn-flow.bpmn) |
| D4 | Deck内容とHandはHidden。通常のDrawでHandへ加えただけでは、その内容をOpponentへ公開しない。超過してDiscardへ移動した場合も相手へは枚数のみ公開し、所有Playerは全内容を確認できる。[Information](../rules/deck-rules.md#information)、[Information visibility](../rules/core-rules.md#information-visibility)、[Domain Model](../model/domain-model.md#model) |
| D5 | 同じEffectで両PlayerにDrawを要求する場合はActive Playerから処理する。先にDraw不能になったPlayerの敗北を直ちに確定し、残りのDrawへ進まない。[Draw and Hand Limit](../rules/deck-rules.md#draw-and-hand-limit)、[Game objective](../rules/core-rules.md#game-objective) |

[deck.feature](deck.feature)のExamples:

| Scenario ID | Rule | 具体例と期待結果 | Requirements |
| --- | --- | --- | --- |
| AC-DECK-001 | D1 | Format / Access Rule・同一Name枚数の制約を満たすfixture Deckで、29枚は不正・30枚は合法・31枚は不正 | GR-005 |
| AC-DECK-002 | D1 | 合計30枚で他の制約を満たすfixture Deckの同一Nameが1・2・3枚なら合法、4枚なら不正 | GR-005 |
| AC-DECK-003 | D2 | Hand 6枚から3枚DrawするEffectで1枚目だけを保持して7枚になり、2枚目は3枚目のDraw前にDiscard、3枚目も直ちにDiscard | GR-013 |
| AC-DECK-004 | D2 | Hand 7枚でDrawすると引いたCardだけをDiscard。既存の7枚を保ち、Handの別Cardを選択して置き換える余地はない | GR-013 |
| AC-DECK-005 | D2, D3 | Drawだけを行うEffectでDeck最後の1枚をHandへ加え、Deckが0枚になってもGameは継続する | GR-003, GR-013 |
| AC-DECK-006 | D3 | Deck 0枚で必要なDrawを発生させると、Hand 3枚でも上限の7枚でも敗北。相手が勝利し、Operation再選択・次のTurn開始はない | GR-003, GR-007 |
| AC-DECK-007 | D4 | Board AbilityでDeckからCardをHandへ加えても、DrawしたCardの内容と残りのDeck内容はOpponentへ公開されない | GR-013, GR-015 |
| AC-DECK-008 | D2, D3 | Deck 1枚・Hand 6枚で2枚DrawするだけのEffectを使用。1枚目のDrawは成功してHand 7枚・Deck 0枚となるが、同じEffectの2枚目の必要なDrawで敗北し、再選択・次Turnへ進まない | GR-003, GR-007, GR-013 |
| AC-DECK-009 | D3 | AのDeck 0枚・BのCore HP 2で「Aが1枚Draw後、Bへ2 Damage」のEffectを使用。AのDraw失敗で直ちにA敗北・B勝利を確定し、後続Damageは行わずBのCore HPは2を保つ | GR-002, GR-003, GR-007, GR-018 |
| AC-DECK-010 | D3, D5 | 両Deck 0枚で両Playerが1枚DrawするEffectを使用。Active Player A / Bから先にDrawしてそのPlayerだけが敗北し、相手のDrawは行わずDrawにもならない | GR-003, GR-004, GR-007, GR-018 |
| AC-DECK-011 | D3, D5 | 非Active PlayerのBoard Reactionが両者へ1枚Drawを要求しても、Source所有者ではなくActive Player A / Bが先。Active PlayerのDeck 0枚で敗北を確定し、Reaction側のDeck 1枚・Handは変わらず、支払ったCostは保持する | GR-003, GR-007, GR-018, IR-005 |
| AC-DECK-012 | D2, D4 | Hand超過のDrawで得たCardをDiscardへ移動しても、OpponentへはDiscard枚数だけを公開する。所有PlayerはDiscardの全内容を確認できる | GR-013, GR-015 |
| AC-DECK-013 | D2, D3, D5 | 両者への1枚DrawでActive Playerの最後の1枚のDrawは成功。その後Opponentの空DeckからのDrawでOpponentの敗北を確定し、成功済みDrawを保持する | GR-003, GR-007, GR-013, GR-018 |

`GR-013`はHandとBoardの区別を要求する上位要求であり、Hand Limitの数値や超過時の処理はD2が示すDeck Rulesに基づく。Deck構築の例は全fixture Cardが現在のFormat / Access Ruleを満たす前提とし、Card Pool方式や製品Cardを定義しない。Turn Start固有のDraw・上限・Deck切れは既存のAC-TURN-003〜006で引き続き確認する。

### Deck / Draw / HandのQuestion

| Question | 状態・結論と根拠 | Acceptance Scenario ID |
| --- | --- | --- |
| Deck Size 30は上限か、ちょうど30枚か | 解決済み。ParametersはDeck Sizeを30と定義し、同一Nameは別途「最大3枚」とする。Deckの枚数は30枚として例示する。D1 | AC-DECK-001〜002 |
| 同一Nameの制限を超えなければFormat / Access Ruleは不要か | 解決済み。Deck constructionは両方を要求する。今回の数値例はFormat / Access Ruleを満たすfixtureに限定し、具体方式の決定は範囲外とする。D1 | AC-DECK-001〜002 |
| 複数枚Drawなら最後にまとめてHand Limitを適用するか | 解決済み。Drawは1枚ずつ処理し、上限を超えたそのCardを直ちにDiscardする。D2 | AC-DECK-003 |
| Hand上限では、引いたCardを残すため既存のCardを捨てられるか | 解決済み。別Cardの選択はできず、そのDrawで得たCardをDiscardする。D2 | AC-DECK-004 |
| 最後のCardをDrawした時点で敗北するか。Handが満杯なら空DeckからのDrawは省略できるか | 解決済み。敗北するのは必要なDraw時にDeckにCardがない場合。Hand上限処理はCardをDrawした後なので、満杯でも必要なDraw不能は敗北となる。D2・D3 | AC-DECK-005〜006・008 |
| Deck内容・HandがHiddenなら枚数もHiddenと解釈するか | 解決済み。Core RulesはDeck / HandをZoneに含め、Zone使用数をPublicとしている。内容のHiddenから枚数のHiddenを導かず、本Featureは内容公開だけを検証する。[Board](../rules/core-rules.md#board)、D4 | AC-DECK-007 |
| Q-DECK-001: 複数部分からなるEffectの途中でDrawに失敗した場合、残りのEffectは解決するか | ユーザー合意により解決済み。勝敗条件成立時に結果を固定して残りのEffectを打ち切り、適用済みのCost・Effectを保持する。同時成立だけをDrawとし、逐次処理の後半で結果を変えない。D3・T4・GR-018 | AC-DECK-009、AC-TURN-011・013〜014 |
| Q-DECK-002: 両PlayerにDrawを要求する1つのEffectでは、どちらから処理し、双方のDraw不能を同時敗北として扱うか | ユーザー合意により解決済み。Active Playerから処理し、必要なDrawに失敗した時点で敗北を確定する。相手のDrawへ進めず、両Deckが空でも同時敗北にはしない。D3・D5 | AC-DECK-010〜011・013 |

## Turn / Action / Attack: resolved questions

| Question | 結論 | 反映先 |
| --- | --- | --- |
| Attack以外の操作は基本ルールでActionになるか | 基本ルールでは非Action。当該操作・AbilityにAction指定がある場合だけAction | IR-019、A1、AC-AR-001〜003 |
| PlayをActionにしたら同じCardのSetや別AbilityもActionになるか | 操作・Abilityごとに独立。指定を波及させない | IR-019、A1、AC-AR-004〜005 |
| Actionは分類用Tagか | 動作キーワードであり、意味分類のTagとは別に指定する | Card Model、A1、AC-AR-006 |
| Cancelされた手札Cardはどこへ行くか | Cancel自体では移動しない。未払いEnergyを保ち、合法なら同じCardを再宣言できる | IR-006、IR-020、A4〜A5、AC-AR-012〜014 |
| Reactionが移動させたCardは手札保持のため戻すか | ReactionのCost・Effect・Card移動は巻き戻さない。Cancelによる保持はReaction結果を打ち消さない | IR-007、IR-020、A4、AC-AR-013 |
| 非Actionなら不正なCostやTargetも受け付けるか | 非Actionも検証する。不正なら副作用なしで未完了となり同じTurnで再選択する | A2、AC-AR-007〜008 |
| 完了済みOperationが0でもGameが終了するか | Turn StartのDraw不能や致死Reactionで終了し得る。Game終了を再選択・Player切替より優先する | T4、AC-TURN-006・010 |
| 仕様CIが通ればゲーム動作も検証済みか | 現段階では構文・参照の検証のみ。ゲーム実装とRunner導入後に同じ例を実行する | [検証方針](README.md#local-validation-and-ci) |

対象の6 Questionはユーザー合意により解決済みであり、上記のRule・Scenarioと規範文書へ反映した。Turn / Action / Attackの既存例は、真に同時の処理によるDrawと、結果確定後の追加Effectを伴わない完了・取消の記録を維持する。将来のゲームAPI、詳細Card Schema、Runnerへの接続実装は後続範囲であり、今回の具体例に未確定の振る舞いを持ち込まない。
