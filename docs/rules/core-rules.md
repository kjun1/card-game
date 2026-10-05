# Core Rules

この文書はGame全体に共通する規範的ルールを定義する。Resource、Combat、Deck固有ルールは各文書へ分離する。

## Game objective

2人のPlayerが対戦する。

以下のいずれかで相手を敗北させたPlayerが勝利する。

- 相手Core HPを0以下にする。
- 相手が必要なDrawを実行できない。

同一のEffect、Combat Resolution、State Check等によって両Playerの敗北条件が同時に成立した場合、GameはDrawとして終了する。

勝敗条件が成立した時点で結果を確定し、残りのEffectを打ち切る。既に支払ったCostと適用済みのEffectは保持する。確定した結果を後続処理で変更しない。

同時に適用することが定義された処理では、その同時適用の結果を判定する。一方、同じEffect内でも順番に処理する部分は別であり、先の処理で勝敗が確定したら後の処理を実行してDrawへ変えることはない。

## Effect resolution

Resolutionは順序付きのEffectStepで表す。逐次的なEffectは適用ごとに、明示された同時適用はSimultaneousGroup全体の適用後に、勝敗条件を確認する。Gameが継続する場合だけ次のStepへ進む。共通の概念と境界は[Effect Resolution Model](../model/effect-resolution-model.md)を参照する。

同じEffectを複数Playerへ逐次適用する場合は、対象のActive Playerから処理し、Gameが継続する場合にOpponentへ進む。Draw・Discard・Card移動・Damage等で共通のPlayer orderとし、ReactionでもSource所有者を先にしない。対象外のPlayerを追加したり、別々のEffectStepに明示された順序を並べ替えたりする規則ではない。

明示された同時適用はこのPlayer orderで分割しない。両Playerが対象であること自体は同時適用を意味しない。

## Board

各Playerは以下のZoneを持つ。

- Deck
- Hand
- Unit Zone
- Support Zone
- Discard

Unit ZoneとSupport Zoneは単一盤面上に存在する。

Zone Capacityを超えるDeploy / Setは実行できない。

Playerは基本ルールによって自分のBoard Card（Unit / Face-up Support / Set Card）を任意にDiscardして空きを作ることはできない。Card Effect等による移動・Destroyはこの制約の対象外である。

## Zone transitions

CardのZone依存Runtime Stateは、そのBoard上の配置に属する。合法な移動によってBoardを離れる際に以前の配置の状態を破棄し、移動先のZoneに従って現在の閲覧権限を判定する。[GR-021](../requirements/game-requirements.md#requirements)の状態別の対応は[Zone transition state](../model/state-model.md#zone-transition-state)を参照する。

- UnitがUnit ZoneからHand / Discardへ移動したら、Accumulated Damage、Ready / Exhausted、Deploy直後Attack制限を破棄する。DestroyによるDiscard移動にも同じ規則を適用する。盤面外ではこれらの状態とCurrent HPを適用せず、Damage 0やReadyのUnitとして扱わない。
- Unitの通常Deployでは、初回・再DeployともAccumulated Damage 0、Ready、Deploy直後Attack制限ありでUnit Zoneへ配置する。以前のDamageや活動状態・攻撃資格を引き継がず、Attack制限はその所有Playerの次のTurn Startで解除する。
- Supportの通常DeployではFace-up Supportとして配置する。Set可能なTacticの通常Setでは、初回・再Setとも裏向きのSetとして配置する。
- Set / RevealedのTacticがSupport ZoneからHand / Discardへ移動したら、その配置のSet / Revealed状態を破棄する。未RevealのCardを移動すること自体では内容を公開しない。以前Revealされていても、再Setは新しい裏向きの配置になる。

状態の破棄・初期化は実際に成立した移動・配置に伴って行う。不正な操作やCancelそのものでは移動も初期化も行わない。Reactionが実際に行ったCard移動と状態の破棄は、元ActionのCancelによって巻き戻さない。

同じZone内でのReady / Exhaust、Turn Startの更新、Set CardのRevealはZone離脱ではない。各処理が指定する状態だけを変更し、配置全体を初期化しない。特にTurn StartのReady化とAttack制限解除ではAccumulated Damageを保持する。

Card Definitionはこれらの移動・初期化では変更しない。過去の配置でPlayerが観測した事実は知識として残るが、現在のCardの状態や閲覧権限を復元するものではない。[Information Model](../model/information-model.md)に従い、未観測の内容の公開やHidden領域内の個体追跡を追加しない。

この規則は通常のDeploy / Setと、現在定義済みのBoardからHand / Discardへの移動を扱う。EffectによるDeploy / Set、BoardのZone間の移動、Runtime個体IDの採番・再利用、将来のModifier / Limitの持続期間はここで定めない。

## Card types

- Unit
- Support
- Tactic

詳細は ../model/card-model.md を参照する。

## Turn

Turnは、**Active Playerがゲーム進行の制御権を持つ区間**である。

Turn Startから始まり、Gameが継続する場合は、そのTurnで選択された1つのOperationが完了した時点で終了する。Turn終了後、Opponentが新しいActive Playerとなる。

ActionがReactionによってCancelされた場合、そのActionを含むOperationは完了していない。Gameが継続する場合、Turnは終了せず、同じActive PlayerがOperationを選択し直す。

したがって、1 Turn中に複数回のOperation選択やAction Declarationが発生することはあるが、Gameが継続する通常のTurn終了ではcompleted Operationは1つだけである。

Game終了はOperation完了判定より優先する。Turn StartのDraw不能や致死Reaction等で、Operationが一度も完了せずGameが終了する場合もある。Game終了時はOperation再選択・Player切替を行わない。

### Turn Start order

1. 自分のUnitをReadyにする。
2. Deploy直後によるAttack制限を解除する。
3. Energy Capacityを1増加する。最大7。
4. EnergyをCapacityまで回復する。
5. 1枚Drawする。
6. DrawによってHand Limitを超えた場合、そのDrawで得たCardを直ちにDiscardする。

Draw不能なら即座に敗北する。

Turn Start処理はTurn中に一度だけ実行し、ReactionによるOperation再選択では再実行しない。

## Operation

Operationは、**Active PlayerがTurn中に選択する主操作**である。

Operation例:

- Unit Deploy
- Support Deploy
- Set
- Tactic Play
- Ability使用
- Attack
- 何もしない

Operationは、解決または「何もしない」の選択によって完了する。

Operation / Reactionの解決中に勝敗条件が成立した場合も、その時点で結果を確定して残りのEffectを打ち切る。解決済みOperationの完了記録やReactionによる元Actionの取消記録は、追加Effectの実行やGameの継続を意味しない。

Actionかどうかにかかわらず、Game SystemはSource・Target・Zone Capacity等の合法性とCost支払い可能性を支払い前に検証する。非ActionのOperationは、合法な場合にCostを支払って解決し、Operation Completeとする。不正な非ActionはCost消費・Card移動・Effect解決等の副作用なしでOperation未完了として返し、Gameが継続する場合はOperation Selectionへ戻る。

Actionに分類されるOperationがReactionでCancelされた場合、そのOperationは完了せず、Gameが継続する場合は同じTurn内でOperation Selectionへ戻る。

何もしない場合、その時点でOperation Completeとする。

独立したPassルールは設けない。

## Action

ActionはReaction可能なOperationである。

基本ルールでActionとなるOperationはAttackだけである。その他のOperationは、Cardの当該操作・Abilityに`Action`と明記された場合だけActionとなり、未指定なら非Actionとする。

`Action`は意味分類用のTagとは異なる動作キーワードであり、指定は操作・Ability単位で適用する。同じCardのPlayに`Action`があっても、Setや別Abilityへは波及しない。

合法なAction Declaration後、必ずReaction Windowを開く。不正な宣言はCostを消費せず、Reaction Windowを開かずに宣言へ戻る。

ActionではないOperationにはReaction Windowを開かない。

### Reactionなし

Action Costを支払い、Action固有処理を解決し、Operation Completeとする。

### Reactionあり

1. Reaction Costを支払う。
2. Reactionを解決する。
3. 宣言済みActionをCancelする。
4. Action側の未払いEnergy Costは消費しない。
5. Cancelそのものでは、Actionに使用しようとしたHandのCardを移動させない。
6. ReactionによるCost・Card移動・状態変更は巻き戻さない。
7. Operationは未完了として扱い、Gameが継続する場合だけ同じActive PlayerへOperation選択権を戻す。

Gameが継続し合法であれば、保持した同じCardを再宣言できる。Reaction EffectによってCardがHandから移動した場合は、Cancelを理由にHandへ戻さない。

Reactionに対するReactionは行わない。

再宣言されたActionには新しいReaction Windowを開く。

## Reaction Source

Reaction Sourceは原則Board上に存在する。

- Unit Ability
- Face-up Support Ability
- Set Card

Handから直接Reactionすることは基本ルールでは認めない。

通常のGame SetupではBoardにCardを配置せず、最初の自Turn前に使用できるReaction Sourceはない。Setup Energy 2を持っていても、この時点ではReactionできない。

## Information visibility

この節は現在の情報閲覧権限を定める。Playerが過去の観測から得た知識とは区別する。概念の責務は[Information Model](../model/information-model.md)を参照する。

### Public
- Core HP
- Energy
- Momentum
- Unit
- Face-up Support
- Ready / Exhausted
- Accumulated Damage
- Zone使用数
- Set Cardの存在
- Mulliganの交換枚数
- Discard枚数

### Hidden
- Deck内容
- Hand
- Set Cardの内容
- Mulliganの交換・退避Cardの内容（Opponentには非公開）
- Discard内容（Opponentには非公開。所有Playerはすべて確認できる）

Discardへ移動したことによってCard内容をOpponentへ公開しない。未RevealのSet CardやHand超過でDraw直後にDiscardするCardにも同じ公開範囲を適用する。

以前PublicだったUnit等がDiscardへ移動しても、Opponentが公開時に観測した情報や観測した移動の事実は失われない。ただし、その知識によってDiscard Zoneの現在の内容を自由に閲覧したり、未観測Cardの内容を取得したりすることはできない。

## Core invariants

- TurnはActive Playerが制御権を持つ区間である。
- Turn Start処理は各Turnにつき1回だけ行う。
- Game終了をOperation完了判定より優先し、終了時は再選択・制御権移転を行わない。
- 勝敗条件成立時に結果を固定し、残りのEffectを解決しない。適用済みのCost・Effectは保持する。
- Gameが継続する場合、completed Operationが1つ発生するとTurnが終了し、Opponentへ制御権が移る。
- Game終了時にはcompleted Operationが0のTurnもあり得る。
- CancelされたActionはOperation Completeを発生させない。
- ActionのみReaction可能。
- Attackは常にAction。他のOperationは当該操作・Abilityの明示的なAction指定がある場合だけAction。
- ReactionされたActionは成立しない。
- Reaction後もGameが継続する場合は同じActive PlayerのTurnを継続する。
- CancelそのものではHandのCardを移動せず、ReactionのCost・Effectは巻き戻さない。
- Handからの直接Reactionなし。
- Momentumは原則として両Player間で保存される。

## Related rules

- Resource: resource-rules.md
- Combat: combat-rules.md
- Deck / Setup / Mulligan: deck-rules.md
