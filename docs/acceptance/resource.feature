Feature: Energyの共有予算とMomentumの移転
  各Playerとして、自分のTurn StartまでのEnergyをOperationとReactionへ配分したい。
  Momentumを使用したときは、支払った分が相手へ移転する。

  Background:
    Given Player AとPlayer Bが対戦する

  @GR-010 @GR-011 @AC-RESOURCE-001
  Scenario Outline: 先攻と後攻のResourceを同じ値で初期化する
    Given コイントスで決まったFirst Playerは<先攻>である
    And 両PlayerのOpening Handはそれぞれ5枚である
    And 両PlayerはまだMulliganを行っていない
    When 両Playerが0枚交換のMulliganを完了してGame開始の準備が整う
    Then 最初のTurn Start前の両PlayerのEnergy Capacityはそれぞれ2である
    And 両PlayerのEnergyはそれぞれ2である
    And 両PlayerのMomentumはそれぞれ3で合計6である

    Examples:
      | 先攻 |
      | A    |
      | B    |

  @GR-009 @GR-010 @PER-004 @AC-RESOURCE-002
  Scenario Outline: 各Playerの最初の自TurnでEnergyを3にする
    Given Gameは継続中で両PlayerのCore HPは10である
    And <開始Player>はまだ自分のTurnを開始しておらず次のActive Playerである
    And <開始Player>のEnergy Capacityは2でEnergyは2である
    And <開始Player>のDeckは25枚でHandは5枚である
    And <相手>のEnergy Capacityは<相手Capacity>でEnergyは<相手Energy>である
    When <開始Player>の最初の自Turnを開始する
    Then <開始Player>のEnergy Capacityは3でEnergyは3になる
    And <相手>のEnergy Capacityは<相手Capacity>でEnergyは<相手Energy>のままである

    Examples:
      | 開始Player | 相手 | 相手Capacity | 相手Energy |
      | A          | B    | 2            | 2          |
      | B          | A    | 3            | 3          |

  @GR-009 @GR-010 @IR-005 @PER-004 @AC-RESOURCE-003
  Scenario: 自TurnのOperationと相手TurnのReactionでEnergyを共有する
    Given AのTurn Startが完了しておりGameは継続中である
    And 両PlayerのCore HPは10である
    And AのEnergy Capacityは3でEnergyは3である
    And BのEnergy Capacityは3でEnergyは0である
    And 両PlayerのDeckは10枚でHandは3枚である
    And AのFace-up Support「防衛拠点」はAction指定のないAbility「砲撃」を持ちEnergy 2でBのCoreに1 Damageを与える
    And 「防衛拠点」のReaction「牽制」はEnergy 1でBのCoreに1 Damageを与える
    And BのHandのAction Tactic「火矢」はEnergy 2でAのCoreに1 Damageを与える
    When Aが「砲撃」を使用する
    Then 「砲撃」のOperationは完了しAのEnergyは1になる
    And BのTurn Start前のBのEnergyは0のままである
    And 次のActive PlayerはBになる
    When BのTurnを開始する
    Then BのEnergy Capacityは4でEnergyは4になる
    And AのEnergy Capacityは3でEnergyは1のままである
    When Bが「火矢」を宣言しAがReaction「牽制」を使用する
    Then AのEnergyは0になりBのEnergyは4のままである
    And BのCore HPは8でAのCore HPは10である
    And 「火矢」はCancelされBは同じTurnでOperationを選び直せる
    When Bが「何もしない」を選択する
    Then BのTurnは終了し次のActive PlayerはAになる
    And Aの次のTurn Start前のEnergyは0のままである
    When Aの次のTurnを開始する
    Then AのEnergy Capacityは4でEnergyは4になる
    And BのEnergy Capacityは4でEnergyは4のままである

  @GR-010 @PER-004 @AC-RESOURCE-005
  Scenario: 残りEnergyと同じCostを支払っても相手へEnergyは移転しない
    Given AのTurn Startが完了しておりGameは継続中で両PlayerのCore HPは10である
    And AのEnergyは2でBのEnergyは4である
    And 両PlayerのMomentumはそれぞれ3である
    And AのBoardのAbility「射撃」はAction指定がなくEnergy 2でBのCoreに1 Damageを与える
    When Aが「射撃」を使用する
    Then 「射撃」のOperationは完了しAのEnergyは0になる
    And BのCore HPは9になる
    And 次のTurn Start前のBのEnergyは4のままである
    And 両PlayerのMomentumはそれぞれ3のままである

  @GR-007 @GR-010 @GR-011 @AC-RESOURCE-006
  Scenario: Momentumが十分でも不足したEnergyの代わりに支払えない
    Given AのTurn Startが完了しておりGameは継続中で両PlayerのCore HPは10である
    And AのEnergyは1でMomentumは6である
    And BのEnergyは4でMomentumは0である
    And AのHandのTactic「小火」はPlayにAction指定がなくEnergy 2でBのCoreに1 Damageを与える
    When Aが「小火」をPlayしようとする
    Then Energy不足でPlayは拒否されOperationは未完了になる
    And AのEnergyは1でMomentumは6のままである
    And BのEnergyは4でMomentumは0のままである
    And 「小火」はAのHandに残りBのCore HPは10のままである
    And Aは同じTurnでOperationを選び直せる

  @GR-011 @PER-005 @AC-RESOURCE-007
  Scenario Outline: Momentumを使い切る場合も支払った分だけ相手へ移転する
    Given <使用Player>のTurn Startが完了しておりGameは継続中で両PlayerのCore HPは10である
    And AのMomentumは<使用前A>でBのMomentumは<使用前B>である
    And AのEnergyは3でBのEnergyは2である
    And <使用Player>のBoardのAbility「加勢」はAction指定がなくCostはMomentum <Cost>のみでOpponentのCoreに1 Damageを与える
    When <使用Player>が「加勢」を使用する
    Then 「加勢」のOperationは完了しOpponentのCore HPは9になる
    And AのMomentumは<使用後A>でBのMomentumは<使用後B>になる
    And 両PlayerのMomentumの合計は6のままである
    And 次のTurn Start前のAのEnergyは3でBのEnergyは2のままである

    Examples:
      | 使用Player | 使用前A | 使用前B | Cost | 使用後A | 使用後B |
      | A          | 3       | 3       | 2    | 1       | 5       |
      | A          | 3       | 3       | 3    | 0       | 6       |
      | B          | 0       | 6       | 6    | 6       | 0       |

  @GR-007 @GR-010 @GR-011 @AC-RESOURCE-008
  Scenario Outline: 複合Costの一部が不足すればどのResourceも支払わない
    Given AのTurn Startが完了しておりGameは継続中で両PlayerのCore HPは10である
    And AのEnergyは<AのEnergy>でMomentumは<AのMomentum>である
    And BのEnergyは4でMomentumは<BのMomentum>である
    And AのHandのTactic「連携射撃」はPlayにAction指定がなくEnergy 2とMomentum 2の両方をCostとしBのCoreに1 Damageを与える
    When Aが「連携射撃」をPlayしようとする
    Then <不足Resource>不足でPlayは拒否されOperationは未完了になる
    And AのEnergyは<AのEnergy>でMomentumは<AのMomentum>のままである
    And BのEnergyは4でMomentumは<BのMomentum>のままである
    And 「連携射撃」はAのHandに残りBのCore HPは10のままである
    And Aは同じTurnでOperationを選び直せる

    Examples:
      | AのEnergy | AのMomentum | BのMomentum | 不足Resource       |
      | 1         | 2           | 4           | Energy             |
      | 2         | 1           | 5           | Momentum           |
      | 1         | 1           | 5           | EnergyとMomentum   |
      | 7         | 0           | 6           | Momentum           |

  @GR-007 @GR-010 @GR-011 @PER-005 @AC-RESOURCE-009
  Scenario: 複合Costを両方支払えるならEnergy消費とMomentum移転を行う
    Given AのTurn Startが完了しておりGameは継続中で両PlayerのCore HPは10である
    And AのEnergyは2でMomentumは2である
    And BのEnergyは4でMomentumは4である
    And AのHandのTactic「連携射撃」はPlayにAction指定がなくEnergy 2とMomentum 2の両方をCostとしBのCoreに1 Damageを与える
    When Aが「連携射撃」をPlayする
    Then AのEnergyは0でMomentumは0になる
    And 次のTurn Start前のBのEnergyは4でMomentumは6になる
    And 両PlayerのMomentumの合計は6のままである
    And BのCore HPは9になり「連携射撃」はAのDiscardに移動する
    And 「連携射撃」のOperationは完了する

  @GR-015 @AC-RESOURCE-010
  Scenario: Cost支払い後のEnergyとMomentumを両Playerへ公開する
    Given AのTurn Startが完了しておりGameは継続中で両PlayerのCore HPは10である
    And AのEnergyは3でBのEnergyは4である
    And 両PlayerのMomentumはそれぞれ3である
    And AのBoardのAbility「協力射撃」はAction指定がなくEnergy 1とMomentum 2の両方をCostとしBのCoreに1 Damageを与える
    When Aが「協力射撃」を使用する
    Then 次のTurn Start前の以下のResource値はAとBのどちらにもPublic情報として確認できる
      | Player | Energy | Momentum |
      | A      | 2      | 1        |
      | B      | 4      | 5        |

  @GR-010 @IR-003 @IR-004 @AC-RESOURCE-011
  Scenario: 通常Setupでは最初の自Turn前に使えるReaction Sourceがない
    Given コイントスで決まったFirst PlayerはAである
    And 両Playerは通常のSetupでOpening Handをそれぞれ5枚受け取りまだMulliganを行っていない
    And AのOpening HandにはEnergy 2でBのCoreに1 Damageを与えるAction Tactic「火矢」がある
    When 両Playerが0枚交換のMulliganを完了してGame開始の準備が整う
    Then 両PlayerのUnit ZoneとSupport ZoneにはCardがない
    And 最初のTurn Start前の両PlayerのEnergy Capacityは2でEnergyは2である
    When Aの最初のTurnを開始しAが「火矢」を宣言する
    Then 「火矢」のReaction Windowは開く
    And Bには使用できるReaction Sourceがない
    And BはHandのCardをReaction Sourceとして直接使用できない
    And Bの最初のTurnはまだ開始しておらずEnergy Capacityは2でEnergyは2のままである
