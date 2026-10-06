Feature: BoardのZone Capacityと配置状態と公開情報
  Playerとして、自分のZoneの空きと公開されたBoard情報から合法なDeploy / Setを判断したい。
  基本ルールによる任意DiscardとCard Effectによる移動を区別する。
  Zoneを離れた配置の状態と新しい配置の初期状態を区別する。

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

  @GR-006 @GR-012 @GR-016 @GR-021 @IR-017 @AC-BOARD-002
  Scenario Outline: SupportとSetが共有する最後のSlotへ配置する
    Given AのUnit Zoneには5体のUnitがいる
    And AのSupport ZoneにはFace-up Supportが<開始Support数>枚とSet Cardが<開始Set数>枚ある
    And AのHandの<種類>「追加Card」の<操作>にはAction指定がなくCostはEnergy 2である
    And 「追加Card」は一度もBoardへ配置されていない
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

  @GR-013 @GR-015 @GR-021 @IR-017 @IR-018 @AC-BOARD-008
  Scenario: Setすると存在とSlot使用を公開し内容はHiddenに保つ
    Given AのUnit ZoneにはUnit「守備兵」がいる
    And AのSupport ZoneにはFace-up Support「砲台」だけがある
    And AのHandにはSet可能なTactic「伏せ札」がありその内容はBに公開されていない
    And 「伏せ札」のSetにはAction指定がなくCostはEnergy 1である
    When Aが「伏せ札」をSetする
    Then 「伏せ札」はAのHandからSupport Zoneへ裏向きのSet状態で移動する
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

  @GR-013 @GR-017 @GR-021 @AC-BOARD-012
  Scenario Outline: Unit Zoneを離れたUnitはその配置の状態を破棄する
    Given AのUnit ZoneにはMax HP 5でDamage 2のUnit「帰還兵」がいる
    And 「帰還兵」は<活動状態>でDeploy直後のAttack制限が<制限>である
    And AのBoardのSupport「帰還設備」のAbility「回収」にはAction指定がなくCostはEnergy 1である
    And 「回収」は指定した自分のUnitに<Effect>だけを行う
    When Aが「帰還兵」をTargetとして「回収」を使用する
    Then 「帰還兵」はAの<移動先>にある
    And 「帰還兵」の以前の配置のDamageとReady / ExhaustedとDeploy直後のAttack制限は破棄される
    And <移動先>の「帰還兵」にこれらのUnit Zoneの状態は適用されない
    And <移動先>の「帰還兵」のCurrent HPは計算しない
    And 「帰還兵」のCard DefinitionのMax HPは5のままである
    And AのEnergyは2になり「回収」のOperationは完了する

    Examples:
      | 活動状態  | 制限 | Effect        | 移動先  |
      | Exhausted | なし | Handへの移動  | Hand    |
      | Ready     | あり | Handへの移動  | Hand    |
      | Exhausted | あり | Discardへ移動 | Discard |
      | Ready     | なし | Discardへ移動 | Discard |
      | Exhausted | なし | Destroy       | Discard |
      | Ready     | あり | Destroy       | Discard |

  @GR-013 @GR-021 @AC-BOARD-013
  Scenario: 初めてDeployするUnitの配置状態を生成する
    Given AのHandには一度もDeployしていないMax HP 5のUnit「新兵」がある
    And AのUnit Zoneには空きがある
    And 「新兵」のDeployにはAction指定がなくCostはEnergy 2である
    When Aが「新兵」をDeployする
    Then 「新兵」はAのUnit ZoneにDamage 0でReadyかつDeploy直後のAttack制限ありで配置される
    And 「新兵」のCurrent HPは5でありこの時点ではAttackできない
    And AのEnergyは1になりDeployのOperationは完了する

  @GR-013 @GR-021 @AC-BOARD-014
  Scenario: 手札へ戻ったUnitを再Deployすると以前の配置の状態を引き継がない
    Given AのUnit ZoneにはMax HP 5でDamage 2かつExhaustedでAttack制限のないUnit「帰還兵」がいる
    And 「帰還兵」のDeployにはAction指定がなくCostはEnergy 2である
    And AのBoardのSupport「帰還設備」のAbility「回収」にはAction指定がなくCostはEnergy 1である
    And 「回収」は指定した自分のUnitを自分のHandへ戻すEffectだけを持つ
    And 両PlayerのDeckは10枚、Handは2枚でEnergy Capacityは3である
    When Aが「帰還兵」をTargetとして「回収」を使用する
    Then 「帰還兵」はAのHandにあり以前の配置のDamageとReady / ExhaustedとAttack制限は破棄される
    When BのTurnが開始しBが「何もしない」を選択して次のAのTurn Startが完了する
    And Aが「帰還兵」を再Deployする
    Then 「帰還兵」はAのUnit ZoneにDamage 0でReadyかつDeploy直後のAttack制限ありで配置される
    And 「帰還兵」のCard DefinitionのMax HPとCurrent HPはともに5である
    And AのEnergyは2になりDeployのOperationは完了する

  @GR-013 @GR-015 @GR-020 @GR-021 @IR-018 @AC-BOARD-015
  Scenario Outline: SetまたはRevealedのCardがSupport Zoneを離れるとその配置状態を破棄する
    Given AのSupport Zoneには<開始状態>状態のTactic「伏せ札」が1枚だけある
    And Bにとって「伏せ札」の内容は<観測状態>である
    And AのBoardのUnit「回収係」のAbility「回収」にはAction指定がなくCostはEnergy 1である
    And 「回収」は指定した自分のSupport ZoneのCardを追加のRevealなしで自分の<移動先>へ移すEffectだけを持つ
    When Aが「伏せ札」をTargetとして「回収」を使用する
    Then 「伏せ札」はAの<移動先>にあり以前の配置のSet / Revealed状態は破棄される
    And AのSupport Zoneの使用数は0になる
    And Bは<移動先>の「伏せ札」の内容を現在の閲覧権限では確認できない
    And Bにとって「伏せ札」の内容は<観測状態>のままである
    And AのEnergyは2になり「回収」のOperationは完了する

    Examples:
      | 開始状態 | 観測状態 | 移動先  |
      | Set      | 未観測   | Hand    |
      | Set      | 未観測   | Discard |
      | Revealed | 観測済み | Hand    |
      | Revealed | 観測済み | Discard |

  @GR-013 @GR-015 @GR-020 @GR-021 @IR-018 @AC-BOARD-016
  Scenario Outline: 手札へ戻ったCardを再Setすると裏向きで新しい配置を開始する
    Given AのSupport Zoneには<開始状態>状態のTactic「伏せ札」が1枚だけある
    And Bにとって「伏せ札」の内容は<観測状態>である
    And 「伏せ札」のSetにはAction指定がなくCostはEnergy 1である
    And AのBoardのUnit「回収係」のAbility「回収」にはAction指定がなくCostはEnergy 1である
    And 「回収」は指定した自分のSupport ZoneのCardを追加のRevealなしで自分のHandへ戻すEffectだけを持つ
    And 両PlayerのDeckは10枚、Handは2枚でEnergy Capacityは3である
    When Aが「伏せ札」をTargetとして「回収」を使用する
    Then 「伏せ札」はAのHandにあり以前の配置のSet / Revealed状態は破棄される
    When BのTurnが開始しBが「何もしない」を選択して次のAのTurn Startが完了する
    And Aが「伏せ札」を再Setする
    Then 「伏せ札」はAのSupport Zoneに裏向きのSet状態で配置される
    And AのSupport Zoneの使用数は1になりSet Cardの存在とSlot使用は両PlayerにPublicである
    And 「伏せ札」の現在の内容はHiddenでありBは自由に閲覧できない
    And Bにとって以前の配置で得た「伏せ札」の内容の知識は<観測状態>のままである
    And AのEnergyは3になりSetのOperationは完了する

    Examples:
      | 開始状態 | 観測状態 |
      | Set      | 未観測   |
      | Revealed | 観測済み |

  @GR-007 @GR-010 @GR-021 @AC-BOARD-017
  Scenario: 不正な移動操作ではUnitの配置状態を破棄しない
    Given AのEnergyは0である
    And AのUnit ZoneにはMax HP 5でDamage 2かつExhaustedでAttack制限のないUnit「帰還兵」がいる
    And AのBoardのSupport「帰還設備」のAbility「回収」にはAction指定がなくCostはEnergy 1である
    And 「回収」は指定した自分のUnitを自分のHandへ戻すEffectだけを持つ
    When Aが「帰還兵」をTargetとして「回収」を使用しようとする
    Then 「回収」はEnergy不足のため拒否される
    And 「帰還兵」はAのUnit ZoneにDamage 2かつExhaustedでAttack制限なしのまま残る
    And AのEnergyは0でOperationは未完了のままである
    And Aは同じTurnでOperationを選択し直せる

  @GR-021 @IR-005 @IR-006 @IR-007 @IR-008 @AC-BOARD-018
  Scenario: 移動ActionがCancelされ実際に移動しなければ配置状態を保持する
    Given AのUnit ZoneにはMax HP 5でDamage 2かつExhaustedでAttack制限のないUnit「帰還兵」がいる
    And AのBoardのSupport「帰還設備」のAbility「回収」にはAction指定がありCostはEnergy 1である
    And 「回収」は指定した自分のUnitを自分のHandへ戻すEffectだけを持つ
    And BのBoardのSupport「砲台」のReaction「牽制」はCostがEnergy 1でAのCoreに1 Damageだけを与える
    When Aが「帰還兵」をTargetとして「回収」を宣言しBが「牽制」でReactionする
    Then 「回収」はCancelされ「帰還兵」はAのUnit Zoneに残る
    And 「帰還兵」はDamage 2かつExhaustedでAttack制限なしのままである
    And AのEnergyは3のままでBのEnergyは2になりAのCore HPは9になる
    And Operationは未完了でAは同じTurnでOperationを選択し直せる

  @GR-013 @GR-021 @IR-005 @IR-007 @IR-008 @IR-012 @AC-BOARD-019
  Scenario: ReactionによるUnitの離脱と状態破棄をAttack取消で巻き戻さない
    Given AのUnit ZoneにはMax HP 5でDamage 2かつReadyでAttack制限のないUnit「帰還兵」がいる
    And 「帰還兵」のDeployにはAction指定がなくCostはEnergy 2である
    And BのBoardのSupport「送還設備」のReaction「送還」はCostがEnergy 1で指定した敵Unitを所有PlayerのHandへ戻すEffectだけを持つ
    When Aが「帰還兵」でBのCoreへのAttackを宣言しBが「帰還兵」をTargetに「送還」でReactionする
    Then AttackはCancelされ「帰還兵」はAのHandにある
    And 「帰還兵」の以前の配置のDamageとReady / ExhaustedとAttack制限は破棄されたままである
    And BのEnergyは2になり両PlayerのCore HPは10のままである
    And Operationは未完了でAは同じTurnでOperationを選択し直せる
    When Aが同じTurnで「帰還兵」を再Deployする
    Then 「帰還兵」はAのUnit ZoneにDamage 0でReadyかつDeploy直後のAttack制限ありで配置される
    And AのEnergyは1になりDeployのOperationは完了する

  @GR-015 @GR-020 @GR-021 @IR-018 @AC-BOARD-020
  Scenario: Support Zoneに残るCardのRevealは配置の離脱として扱わない
    Given AのSupport ZoneにはSet状態のTactic「伏せ札」が1枚だけある
    And Bは「伏せ札」の内容をまだ観測していない
    And AのBoardのUnit「照明係」のAbility「照明」にはAction指定がなくCostはEnergy 1である
    And 「照明」は指定した自分のSet Cardをその場でRevealするEffectだけを持つ
    When Aが「伏せ札」をTargetとして「照明」を使用する
    Then 「伏せ札」はAのSupport Zoneに残ったままSetからRevealed状態になる
    And AのSupport Zoneの使用数は1のままである
    And 「伏せ札」の内容は両Playerに公開されBはその内容を観測できる
    And 「伏せ札」はHandやDiscardへ移動せず裏向きのSet状態へ初期化されない
    And AのEnergyは2になり「照明」のOperationは完了する

  @GR-013 @GR-015 @GR-021 @AC-BOARD-021
  Scenario: 手札へ戻ったSupportを再Deployすると表向きで配置する
    Given AのSupport ZoneにはFace-up Support「砲台」が1枚だけある
    And 「砲台」のDeployにはAction指定がなくCostはEnergy 2である
    And AのBoardのUnit「回収係」のAbility「回収」にはAction指定がなくCostはEnergy 1である
    And 「回収」は指定した自分のSupportを自分のHandへ戻すEffectだけを持つ
    And 両PlayerのDeckは10枚、Handは2枚でEnergy Capacityは3である
    When Aが「砲台」をTargetとして「回収」を使用する
    Then 「砲台」はAのHandにありAのSupport Zoneの使用数は0になる
    When BのTurnが開始しBが「何もしない」を選択して次のAのTurn Startが完了する
    And Aが「砲台」を再Deployする
    Then 「砲台」はAのSupport ZoneにFace-up Supportとして配置される
    And 「砲台」の内容は両PlayerにPublicである
    And 「砲台」にUnitのDamageとReady / ExhaustedとAttack制限およびTacticのSet / Revealed状態は適用されない
    And AのEnergyは2になりDeployのOperationは完了する
