Feature: 操作別のAction指定とReactionによる取消
  Playerとして、Reactionできる操作を識別し、取消による未払いCostの保全とReaction結果の維持を判断したい。

  Background:
    Given AがActive PlayerでTurn Startが完了している
    And Gameは継続中で両PlayerのCore HPは10である
    And AとBのEnergyはそれぞれ3である

  @IR-001 @IR-002 @IR-011 @AC-AR-001
  Scenario: AttackはCardのAction指定がなくてもActionになる
    Given AのUnit「歩兵」はReadyでAttack制限がなくCardにAction指定はない
    When Aが「歩兵」からBのCoreへのAttackを宣言する
    Then BのReaction Windowが開く
    And 「歩兵」はReadyのままである

  @IR-001 @IR-002 @IR-019 @PER-002 @AC-AR-002
  Scenario Outline: 操作にAction指定があればReaction Windowを開く
    Given AのCard「例示Card」の<操作>にはAction指定がある
    And その操作のCostはEnergy 2でSourceとTargetとZoneの空きは合法である
    When Aが「例示Card」の<操作>を宣言する
    Then BのReaction Windowが開く
    And AのEnergyは3のままである
    And その操作のEffectはまだ発生しない

    Examples:
      | 操作           |
      | Unit Deploy    |
      | Support Deploy |
      | Set            |
      | Tactic Play    |
      | Ability使用    |

  @IR-001 @IR-002 @IR-019 @PER-002 @AC-AR-003
  Scenario Outline: Attack以外はAction指定がなければ非Actionとして解決する
    Given AのCard「例示Card」の<操作>にはAction指定がない
    And その操作のCostはEnergy 2でSourceとTargetとZoneの空きは合法である
    And その操作の追加Effectは<追加Effect>である
    When Aが「例示Card」の<操作>を選択する
    Then Reaction Windowは開かない
    And AのEnergyは1になり<結果>
    And そのOperationは完了する

    Examples:
      | 操作           | 追加Effect           | 結果                                              |
      | Unit Deploy    | なし                 | 「例示Card」がHandからUnit Zoneへ移動する          |
      | Support Deploy | なし                 | 「例示Card」がHandからSupport Zoneへ表向きで移動する |
      | Set            | なし                 | 「例示Card」がHandからSupport Zoneへ裏向きで移動する |
      | Tactic Play    | BのCoreへの1 Damage  | BのCoreに1 Damageを与え「例示Card」がDiscardへ移動する |
      | Ability使用    | BのCoreへの1 Damage  | BのCoreに1 Damageを与える                          |

  @IR-001 @IR-002 @IR-019 @AC-AR-004
  Scenario: 同じCardのPlayにあるAction指定はSetに波及しない
    Given AのHandのTactic「双用札」はPlayにAction指定がありSetには指定がない
    And 「双用札」のSet CostはEnergy 1でAのSupport Zoneには空きが1つある
    When Aが「双用札」をSetする
    Then Reaction Windowは開かない
    And AのEnergyは2になる
    And 「双用札」はAのSupport Zoneに裏向きで存在する
    And SetのOperationは完了する

  @IR-001 @IR-002 @IR-019 @AC-AR-005
  Scenario: 同じCardの別AbilityへAction指定を波及させない
    Given AのBoardのSupport「砲台」はAbility「強射」とAbility「小射」を持つ
    And 「強射」にはAction指定があり「小射」には指定がない
    And 「小射」はEnergy 1でBのCoreに1 Damageを与える
    When Aが「小射」を使用する
    Then Reaction Windowは開かない
    And AのEnergyは2になりBのCore HPは9になる
    And 「小射」のOperationは完了する

  @IR-001 @IR-019 @AC-AR-006
  Scenario: 分類用Tagを操作のAction指定として扱わない
    Given AのHandのTactic「分類札」は意味分類用Tagに「Action」を持つ
    And 「分類札」のPlayには動作キーワードとしてのAction指定がない
    And 「分類札」はEnergy 1でBのCoreに1 Damageを与える
    When Aが「分類札」をPlayする
    Then Reaction Windowは開かない
    And AのEnergyは2になりBのCore HPは9になる
    And 「分類札」はAのDiscardへ移動してOperationが完了する

  @GR-007 @GR-010 @IR-001 @IR-019 @AC-AR-007
  Scenario: 合法な非ActionはCostを支払ってEffectを解決する
    Given AのBoardのAbility「小射」にはAction指定がなくCostはEnergy 2である
    And 「小射」の合法なTargetはBのCoreでEffectは2 Damageである
    When Aが「小射」をBのCoreに使用する
    Then AのEnergyは1になりBのCore HPは8になる
    And Reaction Windowは開かない
    And 「小射」のOperationは完了する

  @GR-007 @GR-010 @GR-016 @IR-019 @AC-AR-008
  Scenario Outline: 不正な非Actionは副作用なしでOperation再選択へ戻る
    Given AのHandのUnit「歩兵」のDeployにはAction指定がなくCostはEnergy 2である
    And AのEnergyは<Energy>でUnit ZoneのUnit数は<Unit数>である
    When Aが「歩兵」のDeployを選択する
    Then Deployは<理由>のため拒否される
    And AのEnergyは<Energy>でUnit ZoneのUnit数は<Unit数>のままである
    And 「歩兵」はAのHandに残る
    And Reaction Windowは開かずOperationは未完了である
    And Aは同じTurnでOperationを選択し直せる

    Examples:
      | Energy | Unit数 | 理由           |
      | 1      | 4      | Cost支払い不能 |
      | 3      | 5      | Zone Capacity超過 |

  @GR-010 @IR-002 @AC-AR-009
  Scenario Outline: 不正なAction宣言ではReaction Windowを開かない
    Given AのBoardのAction Ability「砲撃」はEnergy 2で敵Coreに2 Damageを与える
    And AのEnergyは<Energy>で宣言するTargetは<Target>である
    When Aが「砲撃」を宣言する
    Then 宣言は<理由>のため拒否され再宣言を求められる
    And Reaction Windowは開かずAのEnergyは<Energy>のままである
    And 両PlayerのCore HPは10のままである
    And Operationは未完了である

    Examples:
      | Energy | Target  | 理由           |
      | 1      | BのCore | Cost支払い不能 |
      | 3      | AのCore | 不正Target     |

  @IR-003 @IR-005 @IR-007 @AC-AR-010
  Scenario Outline: 不正なReactionはCostもEffectも適用せず選択をやり直す
    Given AがEnergy 2のAction Tactic「火矢」を宣言しBのReaction Windowが開いている
    And BのBoardのReaction「迎撃」はEnergy 2で敵Coreに1 Damageを与える
    And BのEnergyは<Energy>でReactionのTargetは<Target>である
    And 「迎撃」を使用できるTimingは<許可Turn>のReaction Windowである
    When Bが「迎撃」を選択する
    Then Reactionは<理由>のため拒否されBはReactionを選び直せる
    And Aの「火矢」はCancelされず解決もされない
    And AのEnergyは3でBのEnergyは<Energy>のままである
    And 両PlayerのCore HPは10のままである

    Examples:
      | Energy | Target  | 許可Turn   | 理由           |
      | 1      | AのCore | 相手のTurn | Cost支払い不能 |
      | 3      | BのCore | 相手のTurn | 不正Target     |
      | 3      | AのCore | 自分のTurn | 不正Timing     |

  @GR-010 @IR-002 @IR-006 @AC-AR-011
  Scenario: Reactionを辞退したときだけAction本体のCostを支払い解決する
    Given AのHandのAction Tactic「火矢」はEnergy 2でBのCoreに2 Damageを与える
    When Aが「火矢」を宣言する
    Then BのReaction Windowが開きAのEnergyは3のままである
    When BがReactionを辞退する
    Then AのEnergyは1でBのCore HPは8になる
    And 「火矢」はAのDiscardに移動してOperationが完了する

  @IR-005 @IR-006 @IR-007 @IR-008 @IR-020 @AC-AR-012
  Scenario: Cancelで元の手札とEnergyを保ちReactionのCostとEffectを維持する
    Given AのHandのAction Tactic「火矢」はEnergy 2でBのCoreに2 Damageを与える
    And BのBoardのReaction「迎撃」はEnergy 1でAのCoreに1 Damageを与える
    And Aが「火矢」を宣言している
    When Bが「迎撃」を使用する
    Then BのEnergyは2になりAのCore HPは9になる
    And 「火矢」はCancelされBのCore HPは10のままである
    And AのEnergyは3のままで「火矢」はAのHandに残る
    And Operationは未完了でAは同じTurn内でOperationを選び直せる

  @IR-005 @IR-006 @IR-007 @IR-020 @AC-AR-013
  Scenario: Reaction自身が移動させた手札CardはCancel後も戻さない
    Given AのHandのAction Tactic「火矢」はEnergy 2でBのCoreに2 Damageを与える
    And BのBoardのReaction「没収」はEnergy 1で宣言されたTacticを相手HandからDiscardへ移動する
    And Aが「火矢」を宣言している
    When Bが「没収」を使用する
    Then 「火矢」はAのDiscardにありHandへ戻らない
    And AのEnergyは3でBのEnergyは2になる
    And 元ActionはCancelされBのCore HPは10のままである
    And AはHandに存在しない「火矢」を再宣言できない

  @IR-006 @IR-008 @IR-009 @IR-020 @AC-AR-014
  Scenario: 合法なら保持した同じCardを再宣言し新しいReaction Windowを開く
    Given AのHandのAction Tactic「火矢」はEnergy 2でBのCoreに2 Damageを与える
    And BのBoardのReaction「迎撃」はEnergy 1でAのCoreに1 Damageを与える
    And Aが「火矢」を宣言しBが「迎撃」を使用したため最初のActionがCancelされた
    When Aが同じ「火矢」を再宣言する
    Then 2回目のActionに対する新しいReaction Windowが開く
    And AのEnergyは3で「火矢」はまだHandにある
    When Bが2回目のReactionを辞退する
    Then Action解決直後で次のTurn Start前のAのEnergyは1でBのEnergyは2である
    And AのCore HPは9でBのCore HPは8になる
    And 「火矢」はAのDiscardに移動してOperationが完了する

  @IR-005 @IR-010 @PER-010 @AC-AR-015
  Scenario: Reactionに対して別のReactionを連鎖させない
    Given AがEnergy 2のAction Tactic「火矢」を宣言している
    And BのBoardのReaction「迎撃」はEnergy 1でAのCoreに1 Damageを与える
    And AのBoardにもEnergy 1のReaction「反射」が存在する
    When Bが「迎撃」を使用する
    Then Aに「迎撃」へのReaction Windowは開かない
    And 「迎撃」が解決されAのCore HPは9でBのEnergyは2になる
    And 「火矢」はCancelされAのEnergyは3のままである

  @IR-003 @IR-004 @PER-003 @AC-AR-016
  Scenario: HandにあるCardを直接Reaction Sourceにできない
    Given AがEnergy 2のAction Tactic「火矢」を宣言しBのReaction Windowが開いている
    And BのHandのTactic「迎撃札」はSet後に使えるEnergy 1のReactionを持つ
    When BがHandの「迎撃札」をReaction Sourceに選択する
    Then Sourceは拒否されBはReactionを選び直せる
    And 「迎撃札」はBのHandに残りBのEnergyは3のままである
    And Aの「火矢」はCancelされず解決もされない

  @IR-003 @IR-005 @PER-003 @AC-AR-017
  Scenario Outline: 事前にBoardへ置いたSourceからReactionできる
    Given AがEnergy 2のAction Tactic「火矢」を宣言しBのReaction Windowが開いている
    And BのBoardの<Source>は合法なReactionとしてEnergy 1でAのCoreに1 Damageを与える
    When BがそのReactionを使用する
    Then BのEnergyは2でAのCore HPは9になる
    And 「火矢」はCancelされOperationは未完了である

    Examples:
      | Source                   |
      | Unit Ability             |
      | Face-up Support Ability  |
      | Set済みのTactic           |
