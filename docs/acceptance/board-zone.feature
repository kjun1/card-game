Feature: BoardのZone Capacityと公開情報
  Playerとして、自分のZoneの空きと公開されたBoard情報から合法なDeploy / Setを判断したい。
  基本ルールによる任意DiscardとCard Effectによる移動を区別する。

  Background:
    Given AがActive PlayerでTurn Startが完了している
    And Gameは継続中で両PlayerのCore HPは10である
    And AとBのEnergyはそれぞれ3である

  @GR-006 @GR-012 @GR-013 @GR-016 @AC-BOARD-001
  Scenario: 自分のUnit Zoneの最後の空きへDeployする
    Given 単一のBoard上でAのUnit Zoneには4体、BのUnit Zoneには5体のUnitがいる
    And AのSupport ZoneにはFace-up Supportが3枚ある
    And AのHandのUnit「歩兵」のDeployにはAction指定がなくCostはEnergy 2である
    When Aが「歩兵」をDeployする
    Then 「歩兵」はAのHandからAのUnit Zoneへ移動する
    And AのUnit Zoneは5体になりAのEnergyは1になる
    And AのSupport Zoneは元の3枚、BのUnit Zoneは元の5体のままである
    And DeployのOperationは完了する

  @GR-006 @GR-012 @GR-016 @IR-017 @AC-BOARD-002
  Scenario Outline: SupportとSetが共有する最後のSlotへ配置する
    Given AのUnit Zoneには5体のUnitがいる
    And AのSupport ZoneにはFace-up Supportが<開始Support数>枚とSet Cardが<開始Set数>枚ある
    And AのHandの<種類>「追加Card」の<操作>にはAction指定がなくCostはEnergy 2である
    When Aが「追加Card」の<操作>を選択する
    Then 「追加Card」はAのHandからSupport Zoneへ<配置状態>で移動する
    And AのSupport ZoneにはFace-up Supportが<終了Support数>枚とSet Cardが<終了Set数>枚ある
    And AのSupport Zoneの使用数は3になりUnit Zoneは元の5体のままである
    And AのEnergyは1になりOperationは完了する

    Examples:
      | 開始Support数 | 開始Set数 | 種類            | 操作           | 配置状態 | 終了Support数 | 終了Set数 |
      | 2             | 0         | Support         | Support Deploy | 表向き   | 3             | 0         |
      | 1             | 1         | Support         | Support Deploy | 表向き   | 2             | 1         |
      | 0             | 2         | Support         | Support Deploy | 表向き   | 1             | 2         |
      | 2             | 0         | Set可能なTactic | Set            | 裏向き   | 2             | 1         |
      | 1             | 1         | Set可能なTactic | Set            | 裏向き   | 1             | 2         |
      | 0             | 2         | Set可能なTactic | Set            | 裏向き   | 0             | 3         |

  @GR-007 @GR-010 @GR-016 @AC-BOARD-003
  Scenario: Unit Zoneが満杯なら追加Deployを拒否する
    Given AのUnit Zoneには5体のUnitがいる
    And AのHandのUnit「追加兵」のDeployにはAction指定がなくCostはEnergy 2である
    When Aが「追加兵」のDeployを選択する
    Then DeployはUnit Zone Capacityを超えるため拒否される
    And AのUnit Zoneは元の5体のままで「追加兵」はAのHandに残る
    And AのEnergyは3のままである
    And Reaction Windowは開かずOperationは未完了である
    And Aは同じTurnでOperationを選択し直せる

  @GR-007 @GR-010 @GR-016 @IR-017 @AC-BOARD-004
  Scenario Outline: Support Zoneが満杯なら配置比率によらずDeployとSetを拒否する
    Given AのSupport ZoneにはFace-up Supportが<Support数>枚とSet Cardが<Set数>枚ある
    And AのHandの<種類>「追加Card」の<操作>にはAction指定がなくCostはEnergy 2である
    When Aが「追加Card」の<操作>を選択する
    Then その操作はSupport Zone Capacityを超えるため拒否される
    And AのSupport Zoneは元の3枚のままで「追加Card」はAのHandに残る
    And Face-up Supportは<Support数>枚、Set Cardは<Set数>枚のままである
    And AのEnergyは3のままである
    And Reaction Windowは開かずOperationは未完了である
    And Aは同じTurnでOperationを選択し直せる

    Examples:
      | Support数 | Set数 | 種類            | 操作           |
      | 3         | 0     | Support         | Support Deploy |
      | 2         | 1     | Support         | Support Deploy |
      | 1         | 2     | Support         | Support Deploy |
      | 0         | 3     | Support         | Support Deploy |
      | 3         | 0     | Set可能なTactic | Set            |
      | 2         | 1     | Set可能なTactic | Set            |
      | 1         | 2     | Set可能なTactic | Set            |
      | 0         | 3     | Set可能なTactic | Set            |

  @GR-010 @GR-016 @IR-002 @IR-017 @AC-BOARD-005
  Scenario Outline: Action指定があっても満杯のZoneへの宣言はReaction Windowを開かない
    Given AのUnit Zoneには5体のUnitがいる
    And AのSupport ZoneにはFace-up Supportが2枚とSet Cardが1枚ある
    And AのHandの<種類>「追加Card」の<操作>にはAction指定がありCostはEnergy 2である
    When Aが「追加Card」の<操作>を宣言する
    Then 宣言は<配置先>のCapacityを超えるため拒否される
    And Reaction Windowは開かずOperationは未完了である
    And 「追加Card」はAのHandに残りAのEnergyは3のままである
    And AのUnit ZoneとSupport Zoneは元のCardのままである
    And Aは同じTurnで宣言し直せる

    Examples:
      | 種類            | 操作           | 配置先       |
      | Unit            | Unit Deploy    | Unit Zone    |
      | Support         | Support Deploy | Support Zone |
      | Set可能なTactic | Set            | Support Zone |

  @GR-007 @GR-017 @AC-BOARD-006
  Scenario Outline: 基本ルールによる任意DiscardではBoardに空きを作れない
    Given Aの<Zone>は<Card数>枚のCardで満杯である
    And そのZoneにAの<種類>「対象Card」がある
    When AがCard Effectを使わず基本ルールだけで「対象Card」の任意Discardを選択する
    Then 任意Discardは拒否され「対象Card」は元のZoneに残る
    And Aの<Zone>は元の<Card数>枚のままで空きはできない
    And AのEnergyは3のままでOperationは未完了である
    And Aは同じTurnでOperationを選択し直せる

    Examples:
      | Zone         | Card数 | 種類            |
      | Unit Zone    | 5      | Unit            |
      | Support Zone | 3      | Face-up Support |
      | Support Zone | 3      | Set済みTactic   |

  @GR-013 @GR-017 @AC-BOARD-007
  Scenario Outline: Card Effectによる移動やDestroyは満杯のZoneからでも行える
    Given Aの<Zone>は<開始枚数>枚のCardで満杯である
    And そのZoneにAの<種類>「対象Card」がある
    And AのBoardには「対象Card」とは別のUnit「整理係」がいる
    And 「整理係」のAbility「整理」にはAction指定がなくCostはEnergy 1である
    And 「整理」は合法なTarget「対象Card」に<Effect>だけを行う
    When Aが「対象Card」をTargetとして「整理」を使用する
    Then 「対象Card」はAの<移動先>にある
    And Aの<Zone>のCardは<終了枚数>枚になり空きが1つできる
    And 「整理係」はAのBoardに残りAのEnergyは2になる
    And 「整理」のOperationは完了する

    Examples:
      | Zone         | 開始枚数 | 種類            | Effect         | 移動先  | 終了枚数 |
      | Unit Zone    | 5        | Unit            | Handへの移動   | Hand    | 4        |
      | Support Zone | 3        | Face-up Support | Handへの移動   | Hand    | 2        |
      | Support Zone | 3        | Set済みTactic   | Handへの移動   | Hand    | 2        |
      | Unit Zone    | 5        | Unit            | Destroy        | Discard | 4        |

  @GR-013 @GR-015 @IR-017 @IR-018 @AC-BOARD-008
  Scenario: Setすると存在とSlot使用を公開し内容はHiddenに保つ
    Given AのUnit ZoneにはUnit「守備兵」がいる
    And AのSupport ZoneにはFace-up Support「砲台」だけがある
    And AのHandにはSet可能なTactic「伏せ札」がありその内容はBに公開されていない
    And 「伏せ札」のSetにはAction指定がなくCostはEnergy 1である
    When Aが「伏せ札」をSetする
    Then 「伏せ札」はAのHandからSupport Zoneへ裏向きで移動する
    And AのSupport Zoneの使用数2とSet Cardが1枚存在することは両PlayerにPublicである
    And 「伏せ札」の内容はHiddenのままでBに公開されない
    And 「守備兵」とFace-up Support「砲台」は両PlayerにPublicのままである

  @GR-015 @GR-017 @IR-018 @AC-BOARD-009
  Scenario: 未RevealのSet CardをDiscardしてもOpponentへ内容を公開しない
    Given AのSupport ZoneにはSet済みTactic「未公開の伏せ札」がある
    And 「未公開の伏せ札」はRevealされておらず内容はBに公開されていない
    And AのDiscardには「既存1」「既存2」の2枚がある
    And AのBoardのUnit「回収係」のAbility「回収」にはAction指定がなくCostはEnergy 1である
    And 「回収」はAのSet CardをRevealせずAのDiscardへ移動するEffectだけを持つ
    When Aが「未公開の伏せ札」をTargetとして「回収」を使用する
    Then 「未公開の伏せ札」はRevealされずAのSupport ZoneからDiscardへ移動する
    And AのDiscardは3枚になりその枚数はAとBの両方にPublicである
    And Aは自分のDiscardにある「既存1」「既存2」「未公開の伏せ札」の全内容を確認できる
    And BはAのDiscardについて枚数だけを確認できCardの内容を閲覧できない
    And 「未公開の伏せ札」の内容はBに公開されない

  @GR-015 @GR-020 @AC-BOARD-010
  Scenario: Discardの閲覧制限によって過去に公開されたUnitの観測情報は失われない
    Given AのUnit ZoneにはUnit「公開兵」がありATKは2でMax HPは3である
    And Bは「公開兵」のNameとATK 2とMax HP 3をPublic情報として既に観測している
    And AのDiscardにはBが内容を観測していないCardが2枚ある
    And AのBoardのSupport「処理施設」のAbility「解体」にはAction指定がなくCostはEnergy 1である
    And 「解体」は指定した自分のUnitをDestroyするEffectだけを持つ
    When Aが「公開兵」をTargetとして「解体」を使用する
    Then 「公開兵」はDestroyされAのDiscardへ移動しDiscardは3枚になる
    And BはDiscardの現在の枚数3を確認できるがその内容を自由に閲覧できない
    And Bが以前観測したName「公開兵」とATK 2とMax HP 3の情報は既知のままである
    And Bは公開されていた「公開兵」がDestroyされた事実を観測できる
    And Discardに元からあった2枚のCardの内容は新たにBへ公開されない

  @GR-015 @GR-020 @IR-018 @AC-BOARD-011
  Scenario: 未公開のSet Cardの移動を観測しても内容を既知にしない
    Given AのSupport ZoneにはSet済みTactic「未知の伏せ札」が1枚だけある
    And BはそのSet Cardの存在とSlot使用を観測しているが内容は一度も観測していない
    And AのDiscardは2枚でその内容はBに公開されていない
    And AのBoardのUnit「回収係」のAbility「回収」にはAction指定がなくCostはEnergy 1である
    And 「回収」は指定した自分のSet CardをRevealせず自分のDiscardへ移動するEffectだけを持つ
    When Aが「未知の伏せ札」をTargetとして「回収」を使用する
    Then BはSet CardがSupport ZoneからDiscardへ移動したことを観測できる
    And Support Zoneの使用数0とDiscardの枚数3はBにPublicである
    And Bにとって移動したCardの内容は未観測のままであり今回の移動によって既知にならない
    And BはAのDiscardの内容を自由に閲覧できない
