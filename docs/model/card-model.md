# Card Model

## Definition and runtime responsibility

Card DefinitionはCardそのものの静的な定義である。Runtime Card InstanceとGame Stateの状態を混ぜない。

| 責務 | 内容 |
| --- | --- |
| Card Definition | Name、Card Type、Pool Identity、Tag、基本Parameter、使用可能なOperation、Ability、Cost、Target条件、Resolution |
| Runtime Card Instance | 現在のZone、Ready / Exhausted、Accumulated Damage、Set / Revealed、Deploy直後Attack制限、実際に選択した対象 |
| Game State | Core HP、PlayerのEnergy / Momentum、Zone内の個体、Active Player、Turn、Operation lifecycle |

機械表現は[Card Definition Schema](card-definition-schema.md)と[JSON Schema](../../schemas/card.schema.json)で定める。技術的なCard Definitionの`id`とゲーム上の`name`は別物であり、同名3枚制限はNameに対して適用する。Runtime状態は[State Model](state-model.md)、情報閲覧と観測済みの知識は[Information Model](information-model.md)の責務とする。

## Card structure

~~~text
Card
├─ Name
├─ Card Type
├─ Pool Identity
├─ Tags[]
├─ Parameters
├─ Operations
└─ Abilities[]
~~~

## Card types

### Unit
Unit ZoneへDeployされる戦闘主体。

基本Parameter:
- Energy Cost
- ATK
- Max HP

機械表現ではEnergy CostをDeploy OperationのCostに置き、ATK / Max HPをParametersに置く。Costを両方へ重複定義しない。通常UnitのAttackはCore Ruleから提供されるため、CardへAttack Abilityを記述する必要はない。

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

この意味規約を[Operation単位のAction指定](card-definition-schema.md#operations-and-action)として機械表現する。Card直下にAction属性を設けない。

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

Resolutionは順序付きEffectStepからなり、各Stepは逐次Effectまたは明示されたSimultaneousGroupを表す。共通の解決順・Player order・勝敗判定境界は[Effect Resolution Model](effect-resolution-model.md)に従う。[Schema](card-definition-schema.md#resolution-and-effectstep)はその意味を表す構造を定め、解決意味論を再定義しない。

Condition / Limitは概念として保持する。現在のSchemaではTurn条件だけを構造化し、Limitは未指定だけを扱う。未合意の条件式言語や回数制限を導入しない。

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

この語彙一覧は概念モデルであり、すべての詳細が機械表現として確定したことを意味しない。Schemaが現在受理するPrimitive、Core Procedureとの区別、未対応のEffectは[Primitive Effects and Core Procedures](card-definition-schema.md#primitive-effects-and-core-procedures)を参照する。Attack、Cancel、Turn Start等のCore ProcedureをCardごとに再定義しない。

逐次Effectの適用後、またはSimultaneousGroup全体の適用後に勝敗を確認する。勝敗確定後は残りを解決しない。詳細は[Resolution steps](effect-resolution-model.md#resolution-steps)と[Game end](effect-resolution-model.md#game-end)を参照する。

## Activation categories

- Operationとして使用
- Actionとして使用
- Reactionとして使用
- Triggerによって開始
- Continuousとして適用

ActionはReaction Windowを生成するOperationである。

ReactionはActionに対する応答であり、通常Operationとは区別する。

現在のSchemaはOperation、Reaction、Block Stepを表現し、ActionをOperation / Ability単位の指定として扱う。Trigger / ContinuousのTiming・優先順位・競合処理は未確定のため、SchemaのActivationとしては未対応とする。

## Card Pool classification

~~~text
Pool Identity
→ Deck Construction上のアクセスへ影響

Tag
→ Card間の参照・Affinityへ影響
~~~
