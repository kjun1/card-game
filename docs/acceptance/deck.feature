Feature: Deck構築と1枚ずつのDrawおよびHand Limit
  Playerとして、既存の構築制約を満たすDeckを使い、Drawで得たCardをHand Limitに従って管理したい。
  Deck内容とHandをHiddenに保ち、必要なDrawができなければGameを終了する。

  @GR-005 @AC-DECK-001
  Scenario Outline: Deckはちょうど30枚で構築する
    Given Aが準備したDeckは<Deck枚数>枚である
    And すべてのCardは現在のFormatとAccess Ruleを満たしている
    And どのNameも採用枚数は3枚以下である
    When AがそのDeckを対戦に使用するDeckとして提出する
    Then Deck Sizeの判定は<判定>である

    Examples:
      | Deck枚数 | 判定           |
      | 29       | 不正           |
      | 30       | 合法           |
      | 31       | 不正           |

  @GR-005 @AC-DECK-002
  Scenario Outline: 同一Nameは最大3枚まで採用できる
    Given Aが準備したDeckは30枚である
    And Nameが「歩兵」のCardは<同一Name枚数>枚で残りのCardはすべて互いに異なるNameである
    And すべてのCardは現在のFormatとAccess Ruleを満たしている
    When AがそのDeckを対戦に使用するDeckとして提出する
    Then 同一Nameの枚数制約の判定は<判定>である

    Examples:
      | 同一Name枚数 | 判定 |
      | 1            | 合法 |
      | 2            | 合法 |
      | 3            | 合法 |
      | 4            | 不正 |

  @GR-013 @AC-DECK-003
  Scenario: 複数枚Drawでも1枚ごとにHand Limitを適用する
    Given AがActive PlayerでTurn Startが完了しGameは継続中である
    And 両PlayerのCore HPは10でAのEnergyは3である
    And AのHandは6枚である
    And AのDeckは上から「1枚目」「2枚目」「3枚目」の3枚である
    And AのBoardのSupport「補給所」のAbility「三枚補充」にはAction指定がなくCostはEnergy 1である
    And 「三枚補充」はAに3枚DrawさせるEffectだけを持つ
    When Aが「三枚補充」を使用する
    Then 「1枚目」はAのHandに加わりHandは7枚になる
    And 「2枚目」はDraw直後かつ「3枚目」のDraw前にAのDiscardへ移動する
    And 「3枚目」もDraw直後にAのDiscardへ移動する
    And AのHandは元の6枚と「1枚目」でありDeckは0枚になる
    And Gameは継続する

  @GR-013 @AC-DECK-004
  Scenario: Hand上限では引いたCardだけをDiscardし既存のCardを選び直さない
    Given AがActive PlayerでTurn Startが完了しGameは継続中である
    And 両PlayerのCore HPは10でAのEnergyは3である
    And AのHandは7枚でその中に「保持するCard」がある
    And AのDeckは10枚で一番上のCardは「引いたCard」である
    And AのBoardのSupport「補給所」のAbility「補充」にはAction指定がなくCostはEnergy 1である
    And 「補充」はAに1枚DrawさせるEffectだけを持つ
    When Aが「補充」を使用する
    Then 「引いたCard」は直ちにAのDiscardへ移動する
    And AのHandは「保持するCard」を含む元の7枚のままでDeckは9枚になる
    And Aは「引いたCard」の代わりにHand内の別CardをDiscardする選択を行えない

  @GR-003 @GR-013 @AC-DECK-005
  Scenario: Effectで最後のCardをDrawしてDeckが空になっても敗北しない
    Given AがActive PlayerでTurn Startが完了しGameは継続中である
    And 両PlayerのCore HPは10でAのEnergyは3である
    And AのHandは3枚でDeckには「最後のCard」が1枚だけある
    And AのBoardのSupport「補給所」のAbility「補充」にはAction指定がなくCostはEnergy 1である
    And 「補充」はAに1枚DrawさせるEffectだけを持つ
    When Aが「補充」を使用する
    Then 「最後のCard」はAのHandに加わりHandは4枚になる
    And AのDeckは0枚になる
    And Gameは継続し「補充」のOperationは完了する

  @GR-003 @GR-007 @AC-DECK-006
  Scenario Outline: 必要なDrawでDeckが空ならHand枚数によらず敗北する
    Given AがActive PlayerでTurn Startが完了しGameは継続中である
    And 両PlayerのCore HPは10でAのEnergyは3である
    And AのDeckは0枚でHandは<Hand枚数>枚である
    And AのBoardのSupport「補給所」のAbility「補充」にはAction指定がなくCostはEnergy 1である
    And 「補充」はAに1枚DrawさせるEffectだけを持つ
    When Aが「補充」を使用する
    Then Aは必要なDrawを行えずAの敗北とBの勝利でGameが終了する
    And AのHandは元の<Hand枚数>枚のままである
    And AはOperationを再選択できずBのTurnも開始しない

    Examples:
      | Hand枚数 |
      | 3        |
      | 7        |

  @GR-013 @GR-015 @AC-DECK-007
  Scenario: DrawしてHandへ加えても内容をOpponentへ公開しない
    Given AがActive PlayerでTurn Startが完了しGameは継続中である
    And 両PlayerのCore HPは10でAのEnergyは3である
    And AのHandは3枚でDeckは10枚である
    And AのDeckの一番上は「秘札」でDeck内容とHandはBに公開されていない
    And AのBoardのSupport「補給所」のAbility「補充」にはAction指定がなくCostはEnergy 1である
    And 「補充」はAに1枚DrawさせるEffectだけを持つ
    When Aが「補充」を使用する
    Then 「秘札」はAのHandに加わりHandは4枚でDeckは9枚になる
    And 「秘札」を含むAのHandの内容はBに公開されない
    And Aの残りのDeck内容もBに公開されない

  @GR-003 @GR-007 @GR-013 @AC-DECK-008
  Scenario: 同じEffectの途中でDeckを使い切ったら次の必要なDrawで敗北する
    Given AがActive PlayerでTurn Startが完了しGameは継続中である
    And 両PlayerのCore HPは10でAのEnergyは3である
    And AのHandは6枚でDeckには「最後のCard」が1枚だけある
    And AのBoardのSupport「補給所」のAbility「二枚補充」にはAction指定がなくCostはEnergy 1である
    And 「二枚補充」はAに2枚DrawさせるEffectだけを持つ
    When Aが「二枚補充」を使用して1枚目のDrawが発生する
    Then そのDrawは成功し「最後のCard」はAのHandに加わる
    And AのHandは7枚でDeckは0枚になる
    When 同じEffectの2枚目のDrawが要求される
    Then Aは必要なDrawを行えずAの敗北とBの勝利でGameが終了する
    And AのHandは「最後のCard」を含む7枚のままである
    And AはOperationを再選択できずBのTurnも開始しない

  @GR-002 @GR-003 @GR-007 @GR-018 @AC-DECK-009
  Scenario: 必要なDrawの失敗で勝敗を確定し後続Damageを解決しない
    Given AがActive PlayerでTurn Startが完了しGameは継続中である
    And AのCore HPは10でBのCore HPは2である
    And AのEnergyは3でDeckは0枚、Handは3枚である
    And AのBoardのSupport「補給砲台」のAbility「補充射撃」にはAction指定がなくCostはEnergy 1である
    And 「補充射撃」はAに1枚Drawさせた後にBのCoreへ2 Damageを与えるEffectを持つ
    When Aが「補充射撃」を使用する
    Then Aが必要なDrawを行えない時点でAの敗北とBの勝利が確定しGameは終了する
    And 後続の2 Damageは解決されずBのCore HPは2のままである
    And AのHandは元の3枚のままで支払ったCostによってEnergyは2になる
    And Gameの結果はDrawやAの勝利へ変わらない
    And AはOperationを再選択できずBのTurnも開始しない

  @GR-003 @GR-004 @GR-007 @GR-018 @AC-DECK-010
  Scenario Outline: 両Deckが空でも両者DrawはActive Playerだけの敗北で終了する
    Given <Active Player>がActive PlayerでTurn Startが完了しGameは継続中である
    And 両PlayerのCore HPは10でEnergyはそれぞれ3である
    And 両PlayerのDeckは0枚でHandはそれぞれ3枚である
    And <Active Player>のBoardのSupport「共同補給所」のAbility「共同補給」にはAction指定がなくCostはEnergy 1である
    And 「共同補給」は両Playerにそれぞれ1枚DrawさせるEffectだけを持つ
    When <Active Player>が「共同補給」を使用する
    Then 最初のDrawは<Active Player>に対して行われ必要なDrawに失敗する
    And その時点で<Active Player>の敗北と<Opponent>の勝利が確定しGameは終了する
    And <Opponent>のDrawは実行されずGameの結果はDrawにならない
    And 両PlayerのHandは元の3枚のままである
    And Operationを再選択できず<Opponent>のTurnも開始しない

    Examples:
      | Active Player | Opponent |
      | A             | B        |
      | B             | A        |

  @GR-003 @GR-007 @GR-018 @IR-005 @AC-DECK-011
  Scenario Outline: 非Active PlayerのReactionによる両者DrawもActive Playerから処理する
    Given <Active Player>がActive PlayerでTurn Startが完了しGameは継続中である
    And 両PlayerのCore HPは10でEnergyはそれぞれ3である
    And <Active Player>のDeckは0枚でHandは3枚である
    And <Reaction Player>のDeckには「未DrawのCard」が1枚ありHandは3枚である
    And <Active Player>がEnergy 2でOpponentのCoreに1 Damageを与えるAction Tactic「火矢」を宣言している
    And <Reaction Player>のBoardのFace-up Support「相互補給所」のReaction「相互補給」はCostがEnergy 1である
    And 「相互補給」は両Playerにそれぞれ1枚DrawさせるEffectだけを持つ
    When <Reaction Player>がReaction「相互補給」を使用する
    Then 最初のDrawはSourceの所有者ではなく<Active Player>に対して行われ必要なDrawに失敗する
    And その時点で<Active Player>の敗北と<Reaction Player>の勝利が確定しGameは終了する
    And <Reaction Player>のDrawは実行されずDeckの「未DrawのCard」とHandの3枚はそのままである
    And <Reaction Player>が支払ったCostは保持されEnergyは2になる
    And 元の「火矢」は解決されず<Active Player>のEnergyは3で両PlayerのCore HPは10のままである
    And Operationを再選択できず<Reaction Player>のTurnも開始しない

    Examples:
      | Active Player | Reaction Player |
      | A             | B               |
      | B             | A               |

  @GR-013 @GR-015 @AC-DECK-012
  Scenario: Hand上限で引いたCardをDiscardしてもOpponentへ内容を公開しない
    Given AがActive PlayerでTurn Startが完了しGameは継続中である
    And 両PlayerのCore HPは10でAのEnergyは3である
    And AのHandは7枚でDiscardには「既存1」「既存2」の2枚がある
    And AのDeckは10枚で一番上は「未公開の補給札」でありその内容はBに公開されていない
    And AのBoardのSupport「補給所」のAbility「補充」にはAction指定がなくCostはEnergy 1である
    And 「補充」はAに1枚DrawさせるEffectだけを持つ
    When Aが「補充」を使用する
    Then 「未公開の補給札」はDraw直後にAのDiscardへ移動する
    And AのHandは元の7枚のままでDeckは9枚になる
    And AのDiscardは3枚になりその枚数はAとBの両方にPublicである
    And Aは自分のDiscardにある「既存1」「既存2」「未公開の補給札」の全内容を確認できる
    And BはAのDiscardについて枚数だけを確認できCardの内容を閲覧できない
    And 「未公開の補給札」の内容はBに公開されない

  @GR-003 @GR-007 @GR-013 @GR-018 @AC-DECK-013
  Scenario Outline: 両者DrawでActive Playerが成功した後にOpponentのDraw失敗で勝敗を確定する
    Given <Active Player>がActive PlayerでTurn Startが完了しGameは継続中である
    And 両PlayerのCore HPは10でEnergyはそれぞれ3である
    And <Active Player>のDeckには「最後のCard」が1枚ありHandは3枚である
    And <Opponent>のDeckは0枚でHandは3枚である
    And <Active Player>のBoardのSupport「共同補給所」のAbility「共同補給」にはAction指定がなくCostはEnergy 1である
    And 「共同補給」は両Playerにそれぞれ1枚DrawさせるEffectだけを持つ
    When <Active Player>が「共同補給」を使用する
    Then <Active Player>が先に「最後のCard」をDrawしHandは4枚でDeckは0枚になる
    And 続く<Opponent>の必要なDrawは失敗する
    And その時点で<Opponent>の敗北と<Active Player>の勝利が確定しGameは終了する
    And 成功済みのDrawは巻き戻さず「最後のCard」は<Active Player>のHandに残る
    And <Opponent>のHandは元の3枚のままである
    And Operationを再選択できず<Opponent>のTurnも開始しない

    Examples:
      | Active Player | Opponent |
      | A             | B        |
      | B             | A        |
