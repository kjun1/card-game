# Card Model

## Definition and runtime responsibility

Card DefinitionはCardそのものの静的な定義である。Runtime Card InstanceとGame Stateの状態を混ぜない。

| 責務 | 内容 |
| --- | --- |
| Card Definition | Name、Card Type、Pool Identity、Tag、基本Parameter、使用可能なOperation、Ability、Cost、Target条件、Resolution |
| Runtime Card Instance | 現在のZone、Ready / Exhausted、Accumulated Damage、Set / Revealed、Deploy直後Attack制限 |
| Game State | Core HP、PlayerのEnergy / Momentum、Zone内の個体、Active Player、Turn、Operation lifecycleと選択した対象の束縛 |

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

## Target semantics

[GR-022](../requirements/game-requirements.md#requirements)のTarget selectorはCard固有の制約であり、それ自体をPlayerへ提示する完全な合法対象集合とはしない。[Issue #16の具体例と判断](../acceptance/example-mapping.md#capability-targetの制約から現在の合法対象を求める)を根拠とする。

| Concept | Responsibility |
| --- | --- |
| Target Constraint | Card Definitionの`targets`が追加する所有Player、Zone、Card Type、配置状態等の制約 |
| Effect Target Requirement | Effectが適用可能な対象種別・状態。例えばDestroyはBoard Unit、RevealはSet Cardを要求する |
| Runtime Eligibility | 現在の対象の存在・所在・状態、選択可能性、VisibilityとEffective Ruleに基づく資格 |
| Selected Target | 合法集合からPlayerが選択し、そのOperation / Abilityの選択名へ束縛したRuntime参照。Card Definitionの条件や技術IDではない |

~~~text
Legal Target Set
  = Definition Target Constraint
  ∩ Effect Target Requirement
  ∩ Runtime Eligibility
~~~

例えば`support_zone`だけの制約とRevealを組み合わせれば、現在のSet Cardだけが合法対象になる。Face-up SupportとRevealed Tacticは選べない。現在Set Cardが0枚なら合法集合は空であり、定義の静的なvalidとは両立する。`opponent`・`unit_zone`の制約とDestroyを組み合わせても、自Unitや相手のHand Unitは加わらない。

Static Validatorは各Effect参照に互換候補種別が存在し得るかを確認し、すべてのselector候補がそのEffectに適合することや、現在の合法集合が非空であることは保証しない。Engineが現在の合法集合を評価し、Selected Targetの所属を検証する。UIは同じ評価結果を閲覧者に許可された情報で受け取り、selectorから独自に合法性を推測しない。Hiddenな内容とPublicな存在を区別する。

この式は評価する対象文脈での責任を示す。共通の選択参照を複数Stepで使う場合に、先行Effectが所在・状態を変えた後の再検証時点や不適合処理を定めるものではない。[Q-ENGINE-001](domain-engine-architecture.md#open-questions)を先に解決する。

## Rule Interference

[GR-023〜026](../requirements/game-requirements.md#requirements)により、Card固有のルール干渉を通常のState変更Effectと区別する。具体例と分類判断は[Issue #13のExample Mapping](../acceptance/example-mapping.md#capability-card固有のrule-interferenceを追加可能にする)を参照する。

値のModifier、可否・例外のPermission / Prohibition、適用前の予定処理へ介入するReplacementは、異なる評価責任として扱う。例えばCost支払いによるEnergy残量の変更とCost +1、ExhaustとAttack禁止、Destroy後の移動とDestroyの代替は同じではない。「最初のDamageを0にする」の分類は個別Mechanicの検討まで保留する。

干渉はSubject / 対象Rule / Scope / Durationを識別できる必要がある。一時的なGame中の干渉はCore Ruleや静的Card Definitionの永続的な書き換えではない。`Base Rule → Rule Evaluation → Effective Rule`の境界を[Engine Architecture](domain-engine-architecture.md#rule-evaluation)へ接続する。

これは将来の表現可能性の要求であり、現版SchemaへActivation、Modifier、Replacementや新しいPrimitiveを追加しない。HandからのReactionやReaction不可Action等を現ルールで許可する決定でもない。競合・持続期間の具体規則・Layer・Trigger・Priority / Stackは未確定とする。

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
