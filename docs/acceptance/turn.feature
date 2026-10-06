Feature: Turnごとの更新とOperation完了による制御権移転
  Active Playerとして、Turn Startを一度だけ処理し、Operationが完了したら相手へ制御権を渡したい。
  Gameが終了した場合はOperation完了の有無にかかわらず対戦を終了する。

  Background:
    Given Player AとPlayer BのGameが継続中である
    And 両PlayerのCore HPは10である
    And 次にTurnを開始するPlayerはAである

  @GR-009 @GR-021 @AC-TURN-001
  Scenario: Turn StartではDamageを保持して自分のUnitだけReady化とAttack制限解除を行う
    Given AのUnit「先遣隊」はMax HP 6でDamage 2かつExhaustedでDeploy直後のAttack制限がある
    And BのUnit「守備隊」はMax HP 5でDamage 1かつExhaustedでDeploy直後のAttack制限がある
    And AのDeckは10枚でHandは3枚である
    When AのTurnを開始する
    Then 「先遣隊」はReadyになりAttack制限が解除される
    And 「守備隊」はExhaustedのままでAttack制限も残る
    And 「先遣隊」のDamageは2で「守備隊」のDamageは1のままである
    And AのDeckは9枚でHandは4枚になる

  @GR-009 @GR-010 @PER-004 @AC-TURN-002
  Scenario Outline: Capacityを先に増やしてからEnergyを回復する
    Given AのEnergy Capacityは<開始Capacity>でEnergyは1である
    And BのEnergy Capacityは4でEnergyは2である
    And AのDeckは10枚でHandは3枚である
    When AのTurnを開始する
    Then AのEnergy Capacityは<終了Capacity>になる
    And AのEnergyは<終了Capacity>になる
    And BのEnergy Capacityは4でEnergyは2のままである

    Examples:
      | 開始Capacity | 終了Capacity |
      | 2            | 3            |
      | 6            | 7            |
      | 7            | 7            |

  @GR-009 @AC-TURN-003
  Scenario: Handが上限未満ならDrawしたCardをHandへ加える
    Given AのHandは6枚である
    And AのDeckは10枚で一番上のCardは「補給」である
    When AのTurnを開始する
    Then AのHandは7枚になり「補給」が含まれる
    And AのDeckは9枚になる
    And 「補給」はDiscardに移動しない
    And AはOperationを選択できる

  @GR-009 @AC-TURN-004
  Scenario: Hand上限を超えたらそのDrawで得たCardだけをDiscardする
    Given AのHandは7枚でその中に「保持するCard」がある
    And AのDeckは10枚で一番上のCardは「引いたCard」である
    When AのTurnを開始する
    Then AのHandは元の7枚のままである
    And 「引いたCard」はAのDiscardにある
    And 「保持するCard」はAのHandに残る
    And AのDeckは9枚になる

  @GR-003 @GR-009 @AC-TURN-005
  Scenario: Deckの最後の1枚をDrawしても敗北しない
    Given AのDeckには「最後のCard」が1枚だけある
    And AのHandは3枚である
    When AのTurnを開始する
    Then 「最後のCard」はAのHandにある
    And AのDeckは0枚になる
    And Gameは継続しAはOperationを選択できる

  @GR-003 @GR-009 @AC-TURN-006
  Scenario: Turn Startで必要なDrawができなければOperation選択前に敗北する
    Given AのDeckは0枚である
    And AのEnergy Capacityは2でEnergyは0である
    And AのUnit「先遣隊」はExhaustedでDeploy直後のAttack制限がある
    When AのTurnを開始する
    Then AのUnit「先遣隊」はReadyになりAttack制限が解除される
    And AのEnergy Capacityは3でEnergyは3になる
    And Aの敗北とBの勝利でGameが終了する
    And AはOperationを選択できない
    And このTurnの完了済みOperation数は0である
    And BのTurnは開始しない

  @GR-007 @PER-001 @AC-TURN-007
  Scenario: Operationが1つ完了すると相手のTurnへ移る
    Given AのTurn Startが完了している
    And AのEnergyは3でUnit Zoneには空きが1つある
    And AのHandのUnit「歩兵」はDeploy CostがEnergy 2でAction指定がない
    And BのDeckは10枚でHandは3枚である
    When Aが「歩兵」をDeployする
    Then 「歩兵」はAのUnit ZoneにありAのEnergyは1になる
    And AのTurnは完了済みOperationを1つ持って終了する
    And 次のActive PlayerはBになる
    And AはそのTurnで2つ目のOperationを選択できない

  @GR-007 @PER-001 @AC-TURN-008
  Scenario: 何もしない選択もOperationを完了させる
    Given AのTurn Startが完了している
    And AのEnergyは3でHandは4枚である
    And BのDeckは10枚でHandは3枚である
    When Aが「何もしない」を選択する
    Then AのEnergyは3でHandは4枚のままである
    And AのTurnは完了済みOperationを1つ持って終了する
    And 次のActive PlayerはBになる

  @GR-008 @GR-009 @IR-006 @IR-008 @PER-004 @AC-TURN-009
  Scenario: Cancel後の再選択でTurn Startを繰り返さない
    Given AのTurn Start後にEnergy Capacityは3でEnergyは3である
    And AのDeckは9枚でHandは4枚である
    And AのUnit「先遣隊」はReadyでAttack制限がない
    And AがHandのEnergy 2のAction Tactic「火矢」を宣言している
    And BのBoardのReactionはEnergy 1で「先遣隊」をExhaustする
    And BのEnergyは2である
    When BがそのReactionを使用する
    Then 「火矢」のActionはCancelされOperationは未完了である
    And Aは同じTurn内でOperationを選択し直せる
    And AのEnergy Capacityは3でEnergyは3のままである
    And AのDeckは9枚でHandは4枚のままである
    And 「先遣隊」はExhaustedのままである
    And BのEnergyは1になる
    And BのTurnは開始しない

  @GR-002 @GR-008 @IR-005 @IR-008 @AC-TURN-010
  Scenario: 致死ReactionではOperation再選択よりGame終了を優先する
    Given AのTurn Startが完了しておりこのTurnの完了済みOperation数は0である
    And AのCore HPは2である
    And AがEnergy 2のAction Tactic「火矢」を宣言しておりEnergyは3である
    And BのBoardのReactionはEnergy 1でAのCoreに2 Damageを与える
    And BのEnergyは2である
    When BがそのReactionを使用する
    Then AのCore HPは0になりAの敗北とBの勝利でGameが終了する
    And 元ActionはCancelされAのEnergyは3のままである
    And このTurnの完了済みOperation数は0である
    And AにOperation再選択を求めない
    And BのTurnは開始しない

  @GR-002 @GR-004 @AC-TURN-011
  Scenario: 同じEffectで両Coreへ同時にDamageを与えて双方のHPが0になればDrawになる
    Given AのTurn Startが完了している
    And 両PlayerのCore HPは2である
    And AのEnergyは3である
    And AのBoardのAbility「共振」はAction指定がなくEnergy 1で両Coreに同時に2 Damageを与える
    When Aが「共振」を使用する
    Then 両PlayerのCore HPが0になりGameはDrawとして終了する
    And AのEnergyは2になり「共振」のOperationは完了する
    And どちらか一方だけの勝利にはならない
    And BのTurnは開始しない

  @GR-002 @GR-007 @AC-TURN-012
  Scenario: 完了したOperationが致死でも相手のTurnを開始しない
    Given AのTurn Startが完了している
    And BのCore HPは2である
    And AのEnergyは3である
    And AのBoardのAbility「砲撃」はAction指定がなくEnergy 1でBのCoreに2 Damageを与える
    When Aが「砲撃」を使用する
    Then 「砲撃」のOperationは完了しAのEnergyは2になる
    And BのCore HPは0になりAの勝利とBの敗北でGameが終了する
    And BのTurnは開始しない

  @GR-002 @GR-007 @GR-018 @AC-TURN-013
  Scenario: Coreへの致死Damageで勝利を確定したら後続Drawを行わない
    Given AのTurn Startが完了している
    And BのCore HPは2である
    And AのEnergyは3でDeckは0枚でHandは3枚である
    And AのBoardのAbility「追撃補給」にはAction指定がなくCostはEnergy 1である
    And 「追撃補給」はBのCoreへ2 Damageを与え、その後Aに1枚Drawさせる
    When Aが「追撃補給」を使用する
    Then BのCore HPが0になった時点でAの勝利とBの敗北が確定しGameが終了する
    And 後続のAのDrawは要求されずHandは元の3枚のままである
    And Aの敗北やGameのDrawへ結果は変わらない
    And 支払済みのCostを戻さずAのEnergyは2である
    And AにOperation再選択を求めずBのTurnも開始しない

  @GR-002 @GR-003 @GR-007 @GR-018 @AC-TURN-014
  Scenario: Effectの途中で敗北しても適用済みのDamageとCostを戻さない
    Given AのTurn Startが完了している
    And BのCore HPは2である
    And AのEnergyは3でDeckは0枚でHandは3枚である
    And AのBoardのAbility「連続補給射撃」にはAction指定がなくCostはEnergy 1である
    And 「連続補給射撃」はBのCoreへ1 Damage、Aの1枚Draw、BのCoreへ1 Damageを順に行う
    When Aが「連続補給射撃」を使用する
    Then 最初のDamageでBのCore HPは1になる
    And 続くAのDraw失敗でAの敗北とBの勝利が直ちに確定しGameが終了する
    And 最後のDamageは発生せずBのCore HPは1を保つ
    And 支払済みのCostを戻さずAのEnergyは2である
    And AのHandは元の3枚のままでGameの結果はDrawにならない
    And AにOperation再選択を求めずBのTurnも開始しない
