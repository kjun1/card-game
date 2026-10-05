# Combat Rules

## Unit state

Unit ZoneにあるUnitは少なくともReady / Exhausted、Deploy直後Attack制限、Accumulated Damageを持つ。通常Deployは初回・再DeployともReady、Accumulated Damage 0、Deploy直後Attack制限ありで開始する。Unit ZoneからHand / Discardへ移動したらこれらの配置状態を破棄する。[Zone transitions](core-rules.md#zone-transitions)に従う。

### Ready / Exhausted

Ready UnitはAttack等の能動行為を行える。

Attack Commit時にAttackerをExhaustする。

Turn Startに自分のUnitをReadyにする。

Ready化だけではAccumulated Damageを取り除かない。

### Deploy restriction

DeployしたUnitは、そのPlayerの次のTurn StartまでAttackできない。

Block AbilityはDeploy直後でも使用できる。

## Attack

AttackはActionである。

ReadyかつAttack可能なUnitをAttackerとして選び、Enemy CoreまたはEnemy UnitをTargetにする。

Enemy Unitが存在していてもCoreを直接Targetにできる。

Attack Declaration時点ではAttackerをExhaustしない。

## Reaction

Attack Declaration後にReaction Windowを開く。

Reactionが使用された場合、Reactionを解決しAttackをCancelする。Game終了を先に評価し、Gameが継続する場合だけOperation選択へ戻る。Block・Attack Commit・Combatには進まない。

Reactionがない場合のみBlock Stepへ進む。

## Block

BlockはAttack Procedure内でUnitが使用するAbilityである。

例:

~~~text
Momentum 2: Block
~~~

Block Abilityを持たないUnitはBlockできない。

- 1 Attackにつき最大1 Unit
- CoreへのAttackをBlock可能
- UnitへのAttackをBlock可能
- BlockするとFinal TargetをBlocking Unitへ変更
- Ready / Exhaustedを問わない
- Deploy直後でも使用可能
- BlockしてもUnitはExhaustしない
- BlockはActionではなくReaction Windowを発生させない

## Attack Commit

ReactionがなくBlock Stepが完了したらAttackをCommitし、AttackerをExhaustする。

## Combat resolution

### Unit vs Core
Attacker ATK分のDamageをCoreへ与える。

Core HPが0以下になった時点で勝敗を確定する。残りのEffectは解決せず、確定済みの結果を変更しない。

### Unit vs Unit
AttackerとDefenderは互いのATK分のDamageを同時に与える。

この相互Damageは[Effect Resolution Model](../model/effect-resolution-model.md#resolution-steps)のSimultaneousGroupとして扱い、Active Playerからの逐次適用には分割しない。

## Damage and Destroy

Unit Damageは蓄積する。

~~~text
Current HP = Max HP - Accumulated Damage
~~~

Current HPが0以下になったUnitをDestroyし、Discardへ移動する。

双方が同時に0以下なら双方Destroyする。

致死DamageとCurrent HPはDiscardへ移動する前のDestroy判定に使う。移動時にその配置のAccumulated Damageを破棄し、DiscardにあるCardにはCurrent HPを適用しない。双方Destroyの場合も、双方へDamageを適用してDestroy対象を決めてから、それぞれの移動と状態の破棄を扱う。

## Overkill

通常のCombatではUnitのHPを超えたDamageをCoreや別Unitへ移動させない。

余剰Damageを移動させる能力はCard Abilityとして定義する。
