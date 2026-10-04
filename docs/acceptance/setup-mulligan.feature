Feature: Opening HandとMulliganによるGameの準備
  各Playerとして、コイントスで決まった順番で対戦を始め、Opening Handを一度だけ交換したい。
  交換Cardを引き直さず、両Playerの交換が完了してから退避CardをDeckへ戻す。

  Background:
    Given Player AとPlayer BがGame開始前の準備中である

  @GR-001 @GR-014 @AC-SETUP-001
  Scenario Outline: コイントスで先攻を決め両Playerへ同じ枚数のOpening Handを配る
    Given 両Playerがそれぞれ合法な30枚のDeckを用意している
    And 両PlayerのHandは0枚である
    When First Playerを決めるコイントスの結果が<先攻>になる
    Then First Playerは<先攻>になる
    And Mulligan選択前の両PlayerのOpening Handはそれぞれ5枚になる
    And 両PlayerのDeckはそれぞれ25枚になる
    And 先攻・後攻への追加のCard配布はない
    When 両Playerが0枚交換のMulliganを完了する
    Then 準備完了後に最初のTurnを開始するPlayerは<先攻>である
    And そのTurn Start前の両PlayerのHandは5枚でDeckは25枚である

    Examples:
      | 先攻 |
      | A    |
      | B    |

  @GR-014 @AC-SETUP-002
  Scenario Outline: Opening Handから0枚から5枚を交換し選んだCardを退避する
    Given 両PlayerはこのGameでまだMulliganを行っていない
    And AのOpening Handは「先遣隊」「補給」「防壁」「突撃」「連絡」の5枚である
    And AのDeckは25枚である
    And AのDeckの上から5枚は順に「交代1」「交代2」「交代3」「交代4」「交代5」である
    And BはまだMulliganの選択をしていない
    When Aが<交換Card>を選んで<交換枚数>枚のMulliganを行う
    Then AのHandは5枚になる
    And 選択しなかったOpening HandのCardはAのHandに残る
    And AはDeckの上から<交換枚数>枚をDrawしてHandへ加えている
    And 選択した<交換枚数>枚のCardはDeck外に退避されHandにもDeckにも含まれない
    And AのDeckは<残Deck>枚になる
    And AのMulliganは完了し同じ交換Card自体を引き直していない
    And BのMulligan完了前には退避Cardの返却とShuffleを行わない

    Examples:
      | 交換Card                             | 交換枚数 | 残Deck |
      | 交換なし                             | 0        | 25     |
      | 「先遣隊」                           | 1        | 24     |
      | 「先遣隊」「補給」「防壁」「突撃」「連絡」 | 5        | 20     |

  @GR-014 @AC-SETUP-003
  Scenario Outline: 両Playerの交換完了を待って各自の退避Cardを戻しShuffleする
    Given 両PlayerのOpening Handはそれぞれ5枚でDeckはそれぞれ25枚である
    And 両PlayerはこのGameでまだMulliganを行っていない
    And <先に交換するPlayer>のOpening HandにCard「先の交換1」「先の交換2」がある
    And <後に交換するPlayer>のOpening HandにCard「後の交換1」「後の交換2」「後の交換3」がある
    When <先に交換するPlayer>が「先の交換1」「先の交換2」を選んでMulliganを行う
    Then <先に交換するPlayer>のHandは5枚でDeckは23枚になる
    And 「先の交換1」「先の交換2」はDeck外に退避されたままである
    And <後に交換するPlayer>のHandは5枚でDeckは25枚のままである
    And どちらのDeckもMulligan後のShuffleをまだ行っていない
    When <後に交換するPlayer>が「後の交換1」「後の交換2」「後の交換3」を選んでMulliganを行う
    Then どちらのPlayerも自分が交換に出したCardを引き直していない
    And 「先の交換1」「先の交換2」は<先に交換するPlayer>のDeckへ戻る
    And 「後の交換1」「後の交換2」「後の交換3」は<後に交換するPlayer>のDeckへ戻る
    And 両PlayerのDeckはそれぞれ25枚になり退避Cardの返却後にShuffleされる
    And 退避されたままのCardは残らない
    And 最初のTurn Start前の両PlayerのHandはそれぞれ5枚である

    Examples:
      | 先に交換するPlayer | 後に交換するPlayer |
      | A                  | B                  |
      | B                  | A                  |

  @GR-014 @AC-SETUP-004
  Scenario: 交換Cardと同じNameの別個体はDeckからDrawできる
    Given 両PlayerはこのGameでまだMulliganを行っていない
    And AのOpening Handは5枚でNameが「斥候」のCard個体Xを含む
    And AのDeckは25枚で一番上はNameが「斥候」の別Card個体Yである
    And BはまだMulliganの選択をしていない
    When AがCard個体Xだけを選んでMulliganを行う
    Then AのHandは5枚でCard個体Yを含む
    And Card個体XはDeck外に退避されAのHandにもDeckにも含まれない
    And AのOpening Handの他の4枚はHandに残る
    And AのDeckは24枚になる

  @GR-014 @AC-SETUP-005
  Scenario Outline: 0枚交換を含めMulligan完了後に2回目の交換はできない
    Given Aは<交換枚数>枚を選んだMulliganを既に完了している
    And BはまだMulliganを完了していない
    And AのHandは5枚で「保持するCard」を含む
    And AのDeckは<残Deck>枚で<交換枚数>枚のCardが退避されている
    When Aが「保持するCard」を選んで2回目のMulliganを行おうとする
    Then 2回目の交換は認められない
    And AのHandの5枚とDeckの<残Deck>枚は変わらない
    And 退避Cardは最初のMulliganの<交換枚数>枚のままである

    Examples:
      | 交換枚数 | 残Deck |
      | 0        | 25     |
      | 2        | 23     |

  @GR-014 @AC-SETUP-006
  Scenario: Opening HandにないCardをMulliganの交換対象にできない
    Given AはこのGameでまだMulliganを行っていない
    And AのOpening Handは「手札1」「手札2」「手札3」「手札4」「手札5」の5枚である
    And AのDeckは25枚で「Deck内のCard」を含む
    When Aが「手札1」「手札2」「手札3」「手札4」「Deck内のCard」をMulliganの交換対象に選ぼうとする
    Then Opening Handにない「Deck内のCard」を含めた交換は認められない

  @GR-014 @GR-015 @AC-SETUP-007
  Scenario Outline: Mulliganの交換枚数だけをOpponentへ公開する
    Given 両PlayerのOpening Handはそれぞれ5枚でDeckはそれぞれ25枚である
    And 両PlayerはこのGameでまだMulliganを行っていない
    And AのOpening Handは「手札1」「手札2」「手札3」「手札4」「手札5」で内容はBに公開されていない
    And BはまだMulliganの選択をしていない
    When Aが<交換Card>を選んで<交換枚数>枚のMulliganを行う
    Then Aの交換枚数が<交換枚数>枚であることはAとBの両方にPublicである
    And Aが選択したCardの内容はBに公開されない
    And 退避中のCardの内容もBに公開されない
    And Aの交換後のHandの内容はBに公開されない

    Examples:
      | 交換Card                                | 交換枚数 |
      | 交換なし                                | 0        |
      | 「手札1」「手札2」                       | 2        |
      | 「手札1」「手札2」「手札3」「手札4」「手札5」 | 5        |

  @GR-014 @AC-SETUP-008
  Scenario: Opening Drawより前に両PlayerのDeckを必ずShuffleする
    Given 両Playerがそれぞれ合法な30枚のDeckを用意している
    And 両Deckは提出時の順序でまだShuffleされていない
    And 両PlayerのHandは0枚でコイントスによるFirst Playerの決定が完了している
    When Game開始の準備を進めOpening Handを配る
    Then 各PlayerのDeckはそのPlayerの最初のOpening Drawより前にShuffleされ順序がランダムになる
    And 両PlayerのOpening HandはそれぞれShuffle後のDeckからDrawした5枚である
    And Mulligan選択前の両PlayerのDeckはそれぞれ25枚である
