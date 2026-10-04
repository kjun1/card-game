# Card Model

## Card structure

~~~text
Card
├─ Name
├─ Card Type
├─ Pool Identity
├─ Tags[]
├─ Parameters
└─ Abilities[]
~~~

## Card types

### Unit
Unit ZoneへDeployされる戦闘主体。

基本Parameter:
- Energy Cost
- ATK
- Max HP

### Support
Support ZoneへDeployされ、継続Effect、Ability、Reaction等を提供する。

### Tactic
一時的なEffectを解決するCard。通常は解決後Discardへ移動する。Set可能なTacticはSupport Zoneへ事前配置できる。

## Tag

TagはCardの意味分類である。

例:
- Machine
- Human
- Soldier
- Fire
- Magic

Tag自体には原則動作を持たせず、Affinity、Condition、Target等から参照する。

## Action keyword

`Action`はReaction Windowを発生させる動作キーワードであり、意味分類用のTagとは区別する。

基本ルールではAttackだけが常にActionである。その他のOperationは、Cardの当該操作・Abilityに`Action`を明記した場合だけActionとなる。未指定なら非Actionとする。

指定はCard全体ではなく操作・Ability単位に適用する。たとえば、同じTacticのPlayだけに`Action`を指定しても、Setや別AbilityはActionにならない。複数のAbilityもそれぞれ独立して指定する。

これはCard記述の意味規約であり、詳細なCard Schemaは別途定義する。

## Ability

~~~text
Ability
├─ Activation
├─ Condition
├─ Cost
├─ Limit
└─ Resolution
~~~

例:

~~~text
Momentum 2: Block
~~~

概念的には:

~~~text
Activation = Block Step
Cost       = Momentum 2
Resolution = Change Attack Target to this Unit
~~~

Block可能性を表す別のBlocker属性は設けない。

Resolutionは順序付きEffectStepからなり、各Stepは逐次Effectまたは明示されたSimultaneousGroupを表す。共通の解決順・Player order・勝敗判定境界は[Effect Resolution Model](effect-resolution-model.md)に従う。この概念構造は詳細なCard Schemaや記法を指定しない。

## Effect

EffectはGame Stateへ実際に発生させる変更である。

現在の基本語彙:
- Damage
- Draw
- Destroy
- Ready
- Exhaust
- Deploy
- Set
- Reveal
- ATK変更
- HP / Damage変更
- Card移動

AbilityはEffectを利用する機能であり、Effectそのものとは区別する。

逐次Effectの適用後、またはSimultaneousGroup全体の適用後に勝敗を確認する。勝敗確定後は残りを解決しない。詳細は[Resolution steps](effect-resolution-model.md#resolution-steps)と[Game end](effect-resolution-model.md#game-end)を参照する。

## Activation categories

- Operationとして使用
- Actionとして使用
- Reactionとして使用
- Triggerによって開始
- Continuousとして適用

ActionはReaction Windowを生成するOperationである。

ReactionはActionに対する応答であり、通常Operationとは区別する。

## Card Pool classification

~~~text
Pool Identity
→ Deck Construction上のアクセスへ影響

Tag
→ Card間の参照・Affinityへ影響
~~~
