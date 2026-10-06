Feature: Card固有Target制約とEffect要件から現在の合法対象を求める
  Playerとして、Cardが指定する範囲内で現在Effectを適用できる対象を選びたい。
  Target selector自体を完全な合法対象集合とは扱わない。

  Background:
    Given AがActive PlayerでTurn Startが完了している
    And Gameは継続中で両PlayerのCore HPは10である
    And AとBのEnergyはそれぞれ3である
    And AのUnit ZoneにはUnit「照明係」がいる
    And 「照明係」のAbility「照明」にはAction指定がなくCostはEnergy 1である
    And 「照明」のTarget Constraintは相手のSupport ZoneだけでCard Typeと配置状態は限定しない
    And 「照明」は選択したCardをRevealする単独Effectだけを持つ

  @GR-015 @GR-020 @GR-022 @AC-TARGET-001
  Scenario: 広いSupport Zone制約でもReveal候補は現在のSet Cardだけになる
    Given BのSupport ZoneにはSet TacticとFace-up SupportとRevealed Tacticが1枚ずつある
    And AはSet Tacticの存在だけを観測しており内容はまだ観測していない
    When Aが「照明」の現在の合法Target候補を確認する
    Then 候補はBのSet Cardの公開されている存在だけである
    And Face-up SupportとRevealed Tacticは候補に含まれない
    And 候補の提示ではSet Tacticの未公開のNameとAbilityをAへ明かさない
    And AとBのEnergyは3のままでCardの状態は変わらない
    When AがそのSet Cardを選択して「照明」を使用する
    Then 選択したCardだけがBのSupport Zoneに残ったままRevealedになる
    And Face-up Supportと既にRevealedだったTacticの状態は変わらない
    And AのEnergyは2になりOperationは完了する

  @GR-007 @GR-010 @GR-022 @AC-TARGET-002
  Scenario Outline: 定義の制約内でもRevealに適合しない選択は拒否する
    Given BのSupport ZoneにはSet TacticとFace-up SupportとRevealed Tacticが1枚ずつある
    When Aが<選択対象>を選択して「照明」を使用しようとする
    Then 「照明」はRevealのTarget要件を満たさないため拒否される
    And Bの3枚のCardは元のZoneと配置状態のままである
    And AのEnergyは3のままでRevealは発生しない
    And Operationは未完了でAは同じTurnでOperationを選択し直せる

    Examples:
      | 選択対象        |
      | Face-up Support |
      | Revealed Tactic |

  @GR-007 @GR-010 @GR-022 @AC-TARGET-003
  Scenario: 静的に適合する定義でも現在の合法対象が空になる
    Given BのSupport ZoneにはFace-up SupportとRevealed Tacticが1枚ずつありSet Cardはない
    When Aが「照明」の現在の合法Target候補を確認する
    Then 合法Target候補は空である
    When AがTargetを選べないまま「照明」を使用しようとする
    Then 「照明」は合法なSelected Targetがないため拒否される
    And BのCardは元のZoneと配置状態のままでAのEnergyは3である
    And Operationは未完了でAは同じTurnでOperationを選択し直せる

  @GR-022 @AC-TARGET-004
  Scenario: Card固有のSet限定制約でも同じReveal可能な対象を求める
    Given 「照明」のTarget Constraintは相手のSupport ZoneかつSet状態を明記している
    And BのSupport ZoneにはSet TacticとFace-up SupportとRevealed Tacticが1枚ずつある
    When Aが「照明」の現在の合法Target候補を確認する
    Then 候補はBのSet Cardだけである
    And Face-up SupportとRevealed Tacticは候補に含まれない

  @GR-022 @AC-TARGET-005
  Scenario: Effect適合性はCard固有の所有者とZone制約を広げない
    Given AのBoardのSupport「破壊設備」のAbility「破壊」にはAction指定がなくCostはEnergy 1である
    And 「破壊」のTarget Constraintは相手のUnit Zoneだけである
    And 「破壊」は選択したCardをDestroyする単独Effectだけを持つ
    And AとBのUnit ZoneにはUnitが1体ずついる
    And BのHandにもUnit Cardが1枚ある
    When Aが「破壊」の現在の合法Target候補を確認する
    Then 候補はBのUnit ZoneのUnitだけである
    And AのUnitとBのHandのUnit Cardは候補に含まれない
