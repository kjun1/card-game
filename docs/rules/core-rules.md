# Core Rules

## 1. Objective

2人のPlayerが対戦する。

相手の **Core HPを0以下** にしたPlayerが勝利する。

必要なDrawを行う際にDeckにCardが存在しない場合、そのPlayerは敗北する。

## 2. Provisional game values

| Item | Value |
| --- | ---: |
| Core HP | 20 |
| Deck Size | 30 |
| Opening Hand | 5 |
| Hand Limit | 7 |
| Unit Zone Capacity | 5 |
| Support Zone Capacity | 3 |
| Initial Energy Capacity | 3 |
| Maximum Energy Capacity | 7 |
| Total Momentum | 6 |
| Initial Momentum | 3 : 3 |

これらの数値はプレイテストにより調整可能である。

## 3. Zones

各Playerは以下のZoneを持つ。

- Deck
- Hand
- Unit Zone
- Support Zone
- Discard

### Hand

Handは非公開・未コミットのCardを保持する。

### Unit Zone

Unitを配置する公開Zone。Capacityは5。

### Support Zone

Face-up SupportとSet Cardを配置する。両者は同じCapacity 3を共有する。

Set Cardは存在と使用Slotのみ公開し、Card内容は非公開とする。

## 4. Card types

### Unit

Unit ZoneへDeployされる戦闘主体。

基本Parameterとして以下を持つ。

- Energy Cost
- ATK
- Max HP

### Support

Support ZoneへDeployされ、継続Effect、Ability、Reaction等を提供する。

### Tactic

一時的にEffectを解決するCard。通常は解決後Discardへ移動する。

Set可能なTacticはSupport ZoneへSetし、対応するReactionでRevealして使用できる。

## 5. Resources

### Energy

基本的なCard利用・Ability利用のCostとして使用する。

各Playerが独立して保持し、相手へ移転しない。

### Momentum

追加Abilityおよび一部の特殊処理に使用する。

初期状態では両Playerが3ずつ保持し、総量は6。

Momentumを使用した場合、その使用量を相手Playerへ移転する。

```text
A: 3   B: 3
AがMomentum 1を使用
A: 2   B: 4
```

原則として次を維持する。

```text
Momentum(A) + Momentum(B) = 6
```

## 6. Game setup

1. 各PlayerがDeckを準備する。
2. 先攻Playerを決定する。
3. 各PlayerはOpening Handとして5枚Drawする。
4. Mulliganを行う。
5. Core HP、Energy Capacity、Energy、Momentumを初期化する。
6. Gameを開始する。

先攻決定方法は別途定義する。

## 7. Mulligan

各Playerはゲーム開始時に1回だけMulliganできる。

1. Opening Handから0〜5枚を選ぶ。
2. 選んだCardをDeck外へ一時退避する。
3. 同じ枚数をDeckからDrawする。
4. 両PlayerがMulliganを完了する。
5. 退避したCardを各自のDeckへ戻す。
6. DeckをShuffleする。

交換したCardを同じMulligan中に再び引くことはない。

## 8. Turn

Turnは、Turn Start処理の後、そのPlayerが **1回のOperationを完了するまで** の区間である。

Operation完了時点で相手PlayerのTurnへ移る。

### Turn Start

以下を順に処理する。

1. 自分のUnitをReadyにする。
2. Deploy直後によるAttack制限を解除する。
3. 必要な場合、Energy Capacityを1増加する。最大7。
4. Energyを現在のEnergy Capacityまで回復する。
5. Cardを1枚Drawする。

各Playerの最初のTurnではEnergy Capacity 3を使用し、2回目以降の自分Turn開始時に1ずつ増加する。

## 9. Operation

OperationはTurn中にPlayerが選択する主要な操作である。

例:

- Unit Deploy
- Support Deploy
- Set
- Tactic Play
- Ability使用
- Attack
- 何もしない

1 Turnにつき1 Operationを完了する。

何もしないことを選択した場合も、その時点でOperation Completeとし、相手Turnへ移る。

独立したPassというルール用語は設けない。

## 10. Action

Actionは **Reaction可能なOperation** である。

Actionを宣言した場合、必ずReaction Windowが発生する。

Actionと定義されていないOperationには、原則Reaction Windowは発生しない。

### Action Declaration

Action解決に必要なTarget等を宣言する。

宣言時点ではAction本体のEnergy Costを消費しない。

### No Reaction

Reactionが使用されなかった場合、Action Costを支払い、Action固有の処理を解決する。

### Reaction received

Reactionが使用された場合:

1. Reaction Costを支払う。
2. Reactionを解決する。
3. 宣言されていたActionをCancelする。
4. Action側の未払いEnergy Costは消費しない。
5. Reactionによる状態変更・Costは巻き戻さない。
6. Operationはまだ完了していないため、Action側PlayerへOperation選択権を戻す。

再選択されたOperationがActionなら、新しいReaction Windowが発生する。

Reaction回数には一律のシステム上限を設けない。利用可能性は各AbilityのCost、Limit、Card消費、Game Stateによって制御する。

## 11. Reaction

Reactionは、Action Declarationを確認した相手PlayerがAction成立前に使用する応答である。

Reaction Sourceは原則としてBoardへ事前にコミットされている必要がある。

主なSource:

- Unit Ability
- Face-up Support Ability
- Set Card

Handから直接Reactionすることは基本ルールでは認めない。

Reactionに対するReactionは発生させない。

## 12. Unit state

### Ready

Attack等の能動的な行為を行える。

### Exhausted

能動的な行為を使用済みの状態。

AttackがCommitされるとAttackerはExhaustedになる。

### Deploy restriction

DeployしたUnitは、そのPlayerの次のTurn開始までAttackできない。

Block AbilityはDeploy直後でも使用できる。

## 13. Attack

AttackはActionである。

Attack可能なReady UnitをAttackerとして選び、Targetを宣言する。

Targetには常に以下を選択できる。

- Enemy Core
- Enemy Unit

Enemy Unitが存在していてもCoreを直接Targetにできる。

### Attack Declaration

AttackerとTargetを宣言し、Reaction Windowを発生させる。

この時点ではAttackerをExhaustしない。

### Reaction

Reactionが使用された場合、そのReactionを解決してAttackをCancelし、Operation選択へ戻る。

### Block Step

Reactionが使用されなかった場合、Block Stepへ進む。

## 14. Block

BlockはAttack Procedure中にUnitが使用できるAbilityである。

Cardには例えば次のように記述する。

```text
Momentum 2: Block
```

これはBlock StepにMomentum 2を支払い、このUnitでBlockできることを意味する。

Momentum Cost 0のBlockも定義できる。

Block Abilityを持たないUnitはBlockできない。

### Block rules

- 1回のAttackにつき最大1体でBlockできる。
- CoreへのAttackとUnitへのAttackの両方をBlockできる。
- BlockするとAttack TargetをBlocking Unitへ変更する。
- Ready / Exhaustedに関係なくBlockできる。
- Deploy直後でもBlockできる。
- BlockしてもUnitはExhaustしない。
- Momentumを支払った場合、そのMomentumは攻撃側Playerへ移転する。
- BlockはActionではないため、新しいReaction Windowを発生させない。

## 15. Attack Commit

Reactionがなく、Block Stepが完了するとAttackをCommitする。

Attack Commit時にAttackerをExhaustする。

その後Combatを解決する。

## 16. Combat

### Unit vs Core

AttackerのATK分のDamageをCoreへ与える。

### Unit vs Unit

AttackerとDefenderは互いのATK分のDamageを同時に与える。

## 17. Unit damage

Unitが受けたDamageは蓄積し、Combat終了時には回復しない。

```text
Current HP = Max HP - Accumulated Damage
```

Current HPが0以下になったUnitはDestroyされる。

双方が同時に0以下になった場合は双方をDestroyする。

DestroyされたUnitはDiscardへ移動する。

## 18. Overkill

通常のCombatでは、UnitのHPを超えたDamageをCoreや別Unitへ移動させない。

余剰Damageを通す処理はCard固有Abilityとして定義できる。

## 19. Attack procedure

```text
ATTACK ACTION
│
├─ Attack Declaration
│   ├─ Attacker
│   └─ Target
│
├─ Reaction Window
│   │
│   ├─ Reaction
│   │   ↓
│   │ Reaction Resolve
│   │   ↓
│   │ Attack Cancel
│   │   ↓
│   │ Operation Selectionへ戻る
│   │
│   └─ No Reaction
│       ↓
│
├─ Block Step
│   │
│   ├─ No Block
│   └─ Block
│       ├─ Unit選択
│       ├─ Cost支払い
│       └─ Target変更
│
├─ Attack Commit
│   └─ Attacker Exhaust
│
├─ Combat
├─ Damage
├─ Destroy Check
│
└─ Operation Complete
    ↓
Opponent Turn
```

## 20. Information visibility

### Public

- Core HP
- Energy
- Momentum
- Unit
- Face-up Support
- Ready / Exhausted
- Accumulated Damage
- 各Zoneの使用数
- Set Cardの存在

### Hidden

- Deck内容
- Hand
- Set Cardの内容

## 21. Core invariants

- 1 Turnにつき1 Operationを完了する。
- Operation完了時に相手Turnへ移る。
- ActionだけがReaction Windowを発生させる。
- ReactionされたActionは成立しない。
- ReactionされたActionの未払いEnergy Costは消費しない。
- Reaction解決後も同じPlayerのTurnを継続する。
- Handからの直接Reactionは原則認めない。
- BlockはReactionではなくAttack Procedure内のAbilityである。
- Unit Damageは蓄積する。
- 必要なDrawを行えないPlayerは敗北する。
- Momentumは原則として両Player間で保存される。
