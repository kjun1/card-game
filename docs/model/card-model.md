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
