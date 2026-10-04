# Example Mapping

要求をCapability、Rule、具体的なExampleへ分解する。各ExampleのIDはFeatureのScenario / Scenario Outlineへ対応し、Outlineの表の各行は同じIDの独立した例である。要求タグは要求への追跡、Rule参照は数値や処理の細則の根拠を表す。

要求の定義表: [GR](../requirements/game-requirements.md#requirements)、[IR](../requirements/interaction-requirements.md#requirements)、[PER](../requirements/play-experience-requirements.md#requirements)。例示Cardはテスト用fixtureであり、実際のCard Poolに追加するものではない。

## Capability: Turnを開始し制御権を渡す

| Rule | 内容と根拠 |
| --- | --- |
| T1 | 自分のUnitのReady化・Attack制限解除、Capacity増加後のEnergy回復を行う。[Turn Start order](../rules/core-rules.md#turn-start-order)、[Energy](../rules/resource-rules.md#energy)、[Turn Flow](../process/turn-flow.md#semantics) |
| T2 | 必要なDrawを1枚行い、Hand Limit 7超過なら引いたCardをDiscardする。Draw要求時にDeckが空なら敗北する。[Draw and Hand Limit](../rules/deck-rules.md#draw-and-hand-limit)、[Game objective](../rules/core-rules.md#game-objective) |
| T3 | Game継続中に1 Operation完了でTurnを終える。取消では未完了で再選択しTurn Startを繰り返さない。[Turn / Operation](../rules/core-rules.md#turn)、[Turn Flow](../process/turn-flow.md#semantics) |
| T4 | Game終了はOperation完了・再選択・Player切替より優先する。同一解決による双方敗北はDraw。[Game objective](../rules/core-rules.md#game-objective)、[Turn Flow](../process/turn-flow.md#semantics)、[Turn cardinality](../model/domain-model.md#turn--operation-cardinality) |

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
| AC-TURN-011 | T4 | 同一Effectで両Core HP 2→0ならDraw | GR-002, GR-004 |
| AC-TURN-012 | T3, T4 | 非Actionの完了でBのCore HP 2→0。Game終了しBのTurnを開始しない | GR-002, GR-007 |

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
| C6 | Core HP ≤ 0でGameを終了する。Attack完了から次Turnへ進む前に勝敗を判定する。[Game objective](../rules/core-rules.md#game-objective)、[Combat](../process/attack-flow.md#combat)、[Turn Flow](../process/turn-flow.md#semantics) |

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

## Resolved questions

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

この3 Capabilityの例に必要なQuestionは上記の結論で確定している。将来のゲームAPI、詳細Card Schema、Runnerへの接続実装は後続範囲であり、今回の具体例に未確定の振る舞いを持ち込まない。
