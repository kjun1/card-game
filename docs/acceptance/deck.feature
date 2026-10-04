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
