Feature: Effectの逐次解決と明示的な同時適用
  Playerとして、ResolutionのEffectStepの順序に従って結果を確認したい。
  勝敗確定時は後続Stepを停止し、明示されたSimultaneousGroupは全体を適用してから勝敗を判定する。
  複数Playerへの逐次適用では、Sourceの所有者によらずActive Playerから処理する。

  @GR-002 @GR-018 @AC-RESOLUTION-001
  Scenario: 先のStepを保持し勝敗が成立した後のStepを実行しない
    Given AがActive PlayerでTurn Startが完了しGameは継続中である
    And AのCore HPは10でBのCore HPは2である
    And AのEnergyは3でDeckは0枚、Handには「材料Card」がある
    And AのBoardのSupport「組立砲台」のAbility「組立射撃」にはAction指定がなくCostはEnergy 1である
    And 「組立射撃」は以下のEffectStepを記載順に逐次解決する
      | 順序 | 内容                                   |
      | 1    | AのHandの「材料Card」をAのDiscardへ移動 |
      | 2    | BのCoreへ2 Damage                      |
      | 3    | Aが1枚Draw                             |
    When Aが「組立射撃」を使用する
    Then 「材料Card」はAのDiscardへ移動する
    And 次のStepでBのCore HPが0になりAの勝利とBの敗北が確定する
    And 後続のAのDrawは実行されずGameの結果は変わらない
    And 「材料Card」の移動と支払ったCostは保持されAのEnergyは2になる
    And Gameは終了しOperation再選択やBのTurn開始は行わない

  @GR-002 @GR-004 @GR-018 @AC-RESOLUTION-002
  Scenario: SimultaneousGroup全体を適用してから勝敗を判定する
    Given AがActive PlayerでTurn Startが完了しGameは継続中である
    And 両PlayerのCore HPは2である
    And AのEnergyは3でDeckは0枚である
    And AのBoardのSupport「共振装置」のAbility「共振補給」にはAction指定がなくCostはEnergy 1である
    And 「共振補給」の最初のEffectStepは両Coreへそれぞれ2 Damageを同時適用すると明記されたSimultaneousGroupである
    And その後のEffectStepはAに1枚Drawさせる
    When Aが「共振補給」を使用する
    Then SimultaneousGroupの両方のDamageが適用され両PlayerのCore HPは0になる
    And Group全体の適用結果から双方の敗北が同時に成立しGameはDrawとして終了する
    And Active Playerの敗北だけを先に確定することはない
    And 後続のAのDrawは実行されずGameの結果は変わらない
    And 支払ったCostは保持されAのEnergyは2になる

  @GR-002 @GR-018 @GR-019 @IR-005 @AC-RESOLUTION-003
  Scenario Outline: 非Active PlayerのReactionも逐次DamageはActive Playerから適用する
    Given <Active Player>がActive PlayerでTurn Startが完了しGameは継続中である
    And 両PlayerのCore HPは2でEnergyはそれぞれ3である
    And <Active Player>がEnergy 2でOpponentのCoreに1 Damageを与えるAction Tactic「火矢」を宣言している
    And <Reaction Player>のBoardのFace-up Support「両刃装置」のReaction「両刃」はCostがEnergy 1である
    And 「両刃」は両PlayerのCoreへそれぞれ2 DamageをPlayerごとに逐次適用し同時適用の指定はない
    When <Reaction Player>がReaction「両刃」を使用する
    Then 最初の2 Damageは<Active Player>のCoreへ適用されCore HPは0になる
    And その時点で<Active Player>の敗北と<Reaction Player>の勝利が確定しGameは終了する
    And <Reaction Player>へのDamageは適用されずCore HPは2のままである
    And <Reaction Player>の支払ったCostは保持されEnergyは2になる
    And 元の「火矢」は解決されず<Active Player>のEnergyは3のままである
    And Gameの結果はDrawにならずOperation再選択や次のTurn開始は行わない

    Examples:
      | Active Player | Reaction Player |
      | A             | B               |
      | B             | A               |

  @GR-019 @IR-005 @AC-RESOLUTION-004
  Scenario Outline: 逐次DiscardやCard移動はActive Playerの後にOpponentへ適用する
    Given <Active Player>がActive PlayerでTurn Startが完了しGameは継続中である
    And 両PlayerのCore HPは10でEnergyはそれぞれ3である
    And AのUnit Card「Aの対象」とBのUnit Card「Bの対象」はそれぞれ自分の<移動元>にある
    And 両Playerの<移動先>にはそれぞれ既存Cardが1枚ある
    And <Active Player>がEnergy 2でOpponentのCoreに1 Damageを与えるAction Tactic「火矢」を宣言している
    And <Reaction Player>のBoardのFace-up Support「整理装置」のReaction「双方整理」はCostがEnergy 1である
    And 「双方整理」は指定済みの「Aの対象」と「Bの対象」に<処理>だけをPlayerごとに逐次適用し同時適用の指定はない
    When <Reaction Player>がReaction「双方整理」を使用し最初のPlayerへのCard移動が適用される
    Then 「<先の対象>」は<Active Player>の<移動先>にある
    And 「<後の対象>」は<Reaction Player>の<移動元>に残る
    And Gameは継続し両PlayerのCore HPは10のままである
    When 続くPlayerへのCard移動が適用される
    Then 「<後の対象>」は<Reaction Player>の<移動先>に移動する
    And 「<先の対象>」は<Active Player>の<移動先>に残る
    And 「整理装置」は<Reaction Player>のBoardに残る
    And Reaction Costは1回だけ支払われ<Reaction Player>のEnergyは2になる
    And 元の「火矢」はCancelされ<Active Player>のEnergyは3のままである
    And <Active Player>は同じTurnでOperationを選び直せる

    Examples:
      | Active Player | Reaction Player | 先の対象 | 後の対象 | 移動元    | 移動先  | 処理                           |
      | A             | B               | Aの対象  | Bの対象  | Hand      | Discard | 所有PlayerのDiscardへの移動     |
      | B             | A               | Bの対象  | Aの対象  | Hand      | Discard | 所有PlayerのDiscardへの移動     |
      | A             | B               | Aの対象  | Bの対象  | Unit Zone | Hand    | 所有PlayerのHandへの移動        |
      | B             | A               | Bの対象  | Aの対象  | Unit Zone | Hand    | 所有PlayerのHandへの移動        |
