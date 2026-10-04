# Combat Rules

## Unit state

Unitは少なくともReady / Exhausted、Deploy直後Attack制限、Accumulated Damageを持つ。

### Ready / Exhausted

Ready UnitはAttack等の能動行為を行える。

Attack Commit時にAttackerをExhaustする。

Turn Startに自分のUnitをReadyにする。

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

Reactionが使用された場合、Reactionを解決しAttackをCancelしてOperation選択へ戻る。

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

### Unit vs Unit
AttackerとDefenderは互いのATK分のDamageを同時に与える。

## Damage and Destroy

Unit Damageは蓄積する。

~~~text
Current HP = Max HP - Accumulated Damage
~~~

Current HPが0以下になったUnitをDestroyし、Discardへ移動する。

双方が同時に0以下なら双方Destroyする。

## Overkill

通常のCombatではUnitのHPを超えたDamageをCoreや別Unitへ移動させない。

余剰Damageを移動させる能力はCard Abilityとして定義する。
