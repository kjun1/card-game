Feature: Attackの宣言とBlockを経たCombatの解決
  Playerとして、攻撃資格、防御の選択、Commit時点、Damageの結果を予測したい。

  Background:
    Given AがActive PlayerでTurn Startが完了している
    And Gameは継続中で両PlayerのCore HPは10である
    And AとBのMomentumはそれぞれ3である

  @IR-011 @IR-002 @AC-ATK-001
  Scenario Outline: ReadyかつAttack制限のない自分のUnitから敵Coreまたは敵Unitを狙える
    Given AのUnit「剣士」はReadyでAttack制限がない
    And BのUnit ZoneにはUnit「標的」がいる
    When Aが「剣士」から<Target>へのAttackを宣言する
    Then 宣言は合法でBのReaction Windowが開く
    And 「剣士」はReadyのままである

    Examples:
      | Target       |
      | BのCore      |
      | BのUnit「標的」 |

  @IR-002 @IR-011 @AC-ATK-002
  Scenario Outline: 攻撃資格またはTargetが不正なら副作用なしで宣言をやり直す
    Given AのUnit「剣士」は<活動状態>でDeploy直後のAttack制限が<制限>である
    When Aが「剣士」から<Target>へのAttackを宣言する
    Then 宣言は<理由>のため拒否され再宣言を求められる
    And Reaction Windowは開かず「剣士」は<活動状態>のままである
    And 両PlayerのCore HPは10でMomentumはそれぞれ3のままである
    And Operationは未完了である

    Examples:
      | 活動状態  | 制限 | Target  | 理由                 |
      | Exhausted | なし | BのCore | AttackerがExhausted   |
      | Ready     | あり | BのCore | Deploy直後のAttack制限 |
      | Ready     | なし | AのCore | 自分のCoreは不正Target |

  @IR-011 @IR-012 @AC-ATK-003
  Scenario: 宣言とBlock選択中はReadyを保ちAttack Commit時にExhaustする
    Given AのUnit「剣士」はATK 3でReadyかつAttack制限がない
    When Aが「剣士」からBのCoreへのAttackを宣言する
    Then 「剣士」はReadyでBのCore HPは10のままである
    When BがReactionを辞退する
    Then BはBlockするか選択でき「剣士」はまだReadyである
    When BがBlockしないことを選択する
    Then AttackがCommitされ「剣士」はExhaustedになる
    And BのCore HPは7になりAttackのOperationは完了する

  @IR-005 @IR-008 @IR-012 @AC-ATK-004
  Scenario: ReactionでAttackがCancelされたらBlockとCombatを行わない
    Given AのUnit「剣士」はATK 3でReadyかつAttack制限がない
    And BのBoardのReaction「牽制」はEnergy 1でAのCoreに1 Damageを与える
    And BのEnergyは2でBlock Abilityを持つUnit「護衛」がいる
    And Aが「剣士」からBのCoreへのAttackを宣言している
    When Bが「牽制」を使用する
    Then AttackはCancelされOperationは未完了である
    And Aは同じTurn内でOperationを選び直せる
    And 「剣士」はReadyのままである
    And BにBlockの選択は求められず両PlayerのMomentumはそれぞれ3のままである
    And BのEnergyは1でAのCore HPは9になる
    And Combatは発生せずBのCore HPは10のままである

  @IR-013 @IR-015 @GR-011 @AC-ATK-005
  Scenario Outline: CoreへのAttackもUnitへのAttackもBlocking Unitへ向け直す
    Given AのUnit「剣士」はATK 3でMax HP 6かつDamage 0でReadyかつAttack制限がない
    And BのUnit「標的」はMax HP 5でDamage 0である
    And BのUnit「護衛」はATK 1でMax HP 5かつDamage 0で「Momentum 2: Block」を持つ
    And Aが「剣士」から<宣言Target>へのAttackを宣言しBがReactionを辞退している
    When Bが「護衛」でBlockする
    Then Final Targetは「護衛」になる
    And 「護衛」のDamageは3で「剣士」のDamageは1になる
    And 「標的」のDamageは0でBのCore HPは10のままである
    And AのMomentumは5でBのMomentumは1になる
    And Blockに対するReaction Windowは開かない
    And 「剣士」はExhaustedになりAttackのOperationは完了する

    Examples:
      | 宣言Target     |
      | BのCore        |
      | BのUnit「標的」 |

  @IR-013 @IR-014 @AC-ATK-006
  Scenario: 1回のAttackに2体のBlockを指定できない
    Given AのUnit「剣士」はATK 3でReadyかつAttack制限がない
    And BのUnit「護衛1」と「護衛2」はそれぞれ「Momentum 1: Block」を持つ
    And Aが「剣士」からBのCoreへのAttackを宣言しBがReactionを辞退している
    When Bが「護衛1」と「護衛2」を同じAttackのBlocking Unitとして選ぶ
    Then Blockは拒否されBはBlockの選択をやり直せる
    And Final TargetはBのCoreのままである
    And 両PlayerのMomentumはそれぞれ3のままである
    And 「剣士」はReadyでBのCore HPは10のままである

  @IR-013 @IR-016 @AC-ATK-007
  Scenario Outline: BlockはReadyとDeploy直後のAttack制限に依存しない
    Given AのUnit「剣士」はATK 1でMax HP 5かつDamage 0でReadyかつAttack制限がない
    And BのUnit「護衛」はATK 1でMax HP 5かつDamage 0で「Momentum 2: Block」を持つ
    And 「護衛」は<活動状態>でDeploy直後のAttack制限が<制限>である
    And Aが「剣士」からBのCoreへのAttackを宣言しBがReactionを辞退している
    When Bが「護衛」でBlockする
    Then Blockは合法でFinal Targetは「護衛」になる
    And Combat解決直後で次のTurn Start前の「護衛」は<活動状態>のままでAttack制限も<制限>のままである
    And 「護衛」のDamageは1でBのCore HPは10のままである
    And AのMomentumは5でBのMomentumは1になる
    And Blockに対するReaction Windowは開かない

    Examples:
      | 活動状態  | 制限 |
      | Ready     | なし |
      | Exhausted | なし |
      | Ready     | あり |
      | Exhausted | あり |

  @GR-011 @IR-013 @PER-005 @AC-ATK-008
  Scenario: BlockのMomentum Costは攻撃側へ移転する
    Given AのUnit「剣士」はATK 1でMax HP 5かつDamage 0でReadyかつAttack制限がない
    And BのUnit「護衛」はATK 1でMax HP 5かつDamage 0で「Momentum 2: Block」を持つ
    And AのEnergyは3でBのEnergyは2である
    And Aが「剣士」からBのCoreへのAttackを宣言しBがReactionを辞退している
    When Bが「護衛」でBlockする
    Then Block Cost支払い直後のBのMomentumは1でAのMomentumは5になる
    And 両PlayerのMomentumの合計は6のままである
    And 次のTurn Start前のAのEnergyは3でBのEnergyは2のままである

  @GR-011 @IR-013 @AC-ATK-009
  Scenario Outline: 不正なBlockではCostもTargetも変更せず辞退を選び直せる
    Given AのUnit「剣士」はATK 3でReadyかつAttack制限がない
    And BのUnit「護衛」のAbilityは<Ability>である
    And BのMomentumは<BのMomentum>でAのMomentumは<AのMomentum>である
    And Aが「剣士」からBのCoreへのAttackを宣言しBがReactionを辞退している
    When Bが「護衛」でBlockを試みる
    Then Blockは<理由>のため拒否されBはBlockの選択をやり直せる
    And BのMomentumは<BのMomentum>でAのMomentumは<AのMomentum>のままである
    And Final TargetはBのCoreで「剣士」はReadyのままである
    And BのCore HPは10のままである
    When BがBlockしないことを選択する
    Then 「剣士」はExhaustedになりBのCore HPは7になる
    And AttackのOperationは完了する

    Examples:
      | Ability           | BのMomentum | AのMomentum | 理由           |
      | Block Abilityなし | 3           | 3           | Ability不足    |
      | Momentum 2: Block | 1           | 5           | Cost支払い不能 |

  @IR-013 @AC-ATK-010
  Scenario: 不正なBlocking Unitの後に別の合法なUnitを選び直せる
    Given AのUnit「剣士」はATK 3でMax HP 6かつDamage 0でReadyかつAttack制限がない
    And BのUnit「一般兵」はBlock Abilityを持たない
    And BのUnit「護衛」はATK 1でMax HP 5かつDamage 0で「Momentum 2: Block」を持つ
    And Aが「剣士」からBのCoreへのAttackを宣言しBがReactionを辞退している
    When Bが「一般兵」でBlockを試みる
    Then Blockは拒否され両PlayerのMomentumはそれぞれ3のままである
    When Bが選び直して「護衛」でBlockする
    Then Final Targetは「護衛」になり「護衛」のDamageは3になる
    And AのMomentumは5でBのMomentumは1になる
    And BのCore HPは10のままでAttackのOperationは完了する

  @IR-011 @AC-ATK-011
  Scenario: Unit同士は互いのATK分のDamageを同時に与える
    Given AのUnit「剣士」はATK 3でMax HP 5かつDamage 0でReadyかつAttack制限がない
    And BのUnit「標的」はATK 2でMax HP 4かつDamage 0である
    When Aが「剣士」から「標的」へAttackしBがReactionとBlockを辞退する
    Then 同じCombatで「剣士」のDamageは2でCurrent HPは3になる
    And 同じCombatで「標的」のDamageは3でCurrent HPは1になる
    And 両UnitはUnit Zoneに残る
    And 「剣士」はExhaustedになりAttackのOperationは完了する

  @IR-011 @AC-ATK-012
  Scenario: UnitのDamageは既存のDamageに加算する
    Given AのUnit「剣士」はATK 2でMax HP 6かつDamage 1でReadyかつAttack制限がない
    And BのUnit「標的」はATK 2でMax HP 6かつDamage 2である
    When Aが「剣士」から「標的」へAttackしBがReactionとBlockを辞退する
    Then 「剣士」のDamageは3でCurrent HPは3になる
    And 「標的」のDamageは4でCurrent HPは2になる
    And 両UnitはUnit Zoneに残る

  @GR-021 @IR-011 @AC-ATK-013
  Scenario: 双方が致死Damageを受けても同時にDamageを与えて双方Destroyする
    Given AのUnit「剣士」はATK 4でMax HP 3かつDamage 0でReadyかつAttack制限がない
    And BのUnit「標的」はATK 3でMax HP 4かつDamage 0である
    When Aが「剣士」から「標的」へAttackしBがReactionとBlockを辞退する
    Then 同時Damage適用後、Discardへの移動前の「剣士」のDamageは3でCurrent HPは0である
    And 同時Damage適用後、Discardへの移動前の「標的」のDamageは4でCurrent HPは0である
    And 両UnitはDestroyされ「剣士」はAのDiscardへ「標的」はBのDiscardへ移動する
    And Discardへの移動後は両Unitの以前の配置のDamageとReady / ExhaustedとAttack制限を保持しない
    And 両PlayerのCore HPは10のままである
    And AttackのOperationは完了する

  @GR-021 @IR-011 @AC-ATK-014
  Scenario: UnitへのOverkillをCoreや別Unitへ移動しない
    Given AのUnit「大剣士」はATK 7でMax HP 6かつDamage 0でReadyかつAttack制限がない
    And BのUnit「標的」はATK 1でMax HP 3かつDamage 1である
    And Bの別Unit「予備兵」はMax HP 4でDamage 0である
    And 「大剣士」は余剰Damageを移動させるAbilityを持たない
    When Aが「大剣士」から「標的」へAttackしBがReactionとBlockを辞退する
    Then Damage適用後、Discardへの移動前の「標的」のDamageは8でCurrent HPは-5である
    And 「標的」はDestroyされBのDiscardへ移動する
    And Discardへの移動後の「標的」は以前の配置のDamageとReady / ExhaustedとAttack制限を保持しない
    And 「大剣士」のDamageは1になる
    And BのCore HPは10で「予備兵」のDamageは0のままである
    And AttackのOperationは完了する

  @GR-002 @GR-007 @IR-011 @AC-ATK-015
  Scenario: Core HPが負になるAttackでGameを終了し次のTurnを開始しない
    Given AのUnit「剣士」はATK 3でReadyかつAttack制限がない
    And BのCore HPは2である
    When Aが「剣士」からBのCoreへAttackしBがReactionとBlockを辞退する
    Then Attack解決直後の「剣士」はExhaustedでBのCore HPは-1である
    And AttackのOperationは完了する
    And Aの勝利とBの敗北でGameが終了する
    And BのTurnは開始しない
