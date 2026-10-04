# System Model

この文書は、ルール用語の階層と責任境界を定義する。プレイヤー向けの規範的な進行手順は [Core Rules](../rules/core-rules.md) を参照する。

## 1. Model layers

```text
Game Model
│
├─ Construction
├─ Runtime Object
├─ Value
│   ├─ Resource
│   ├─ Stat
│   └─ Capacity
├─ Zone
├─ Card Definition
├─ Runtime State
├─ Interaction
├─ Procedure
└─ Event
```

異なる階層の概念を同じ語で表現しない。

## 2. Construction

### Card Pool

Deck Constructionの候補となるCard全体。

### Pool Identity

Card Poolを大きく分類する上位属性。

### Access Rule

特定DeckがCard Poolのどこへアクセスできるかを定める。

### Affinity

Card同士を一緒に採用する価値を形成する関係。

### Format

現在使用可能なCard集合。

### Deck

Constructionの結果としてGameへ持ち込むCard集合。

## 3. Runtime Object

### Player

意思決定主体。

### Core

Playerに対応する勝敗対象。

### Card

Zone間を移動し、ParameterとAbilityを持つObject。

## 4. Value

### Resource

Playerが保持し、Costとして支払いまたは移転するゲーム通貨。

- Energy
- Momentum

### Stat

Objectの性能・耐久等を表す値。

- Core HP
- Unit ATK
- Unit Max HP
- Accumulated Damage

### Capacity

Zone等が保持可能なObject数を制限する値。

- Unit Zone Capacity
- Support Zone Capacity
- Hand Limit

HPやZone CapacityをResourceとは呼ばない。

## 5. Zone

Cardの論理的な所在。

- Deck
- Hand
- Unit Zone
- Support Zone
- Discard

ZoneはCardが利用できるルールと情報公開範囲を規定する。

## 6. Card Definition

```text
Card
├─ Name
├─ Card Type
├─ Pool Identity
├─ Tags[]
├─ Parameters
└─ Abilities[]
```

### Card Type

Cardの基本的なゲーム上の役割。

- Unit
- Support
- Tactic

### Tag

Cardの意味分類。AffinityやCondition、Target選択から参照する。

Tag自体には原則として動作を持たせない。

### Parameter

Cardに直接定義される基本値。

例:

- Energy Cost
- ATK
- Max HP

### Ability

Cardが提供する利用可能な機能。

```text
Ability
├─ Activation
├─ Condition
├─ Cost
├─ Limit
└─ Resolution
```

例:

```text
Momentum 2: Block
```

はBlock Stepで使用可能なAbilityであり、CostがMomentum 2、ResolutionがBlockである。

### Effect

Game Stateに実際に起きる変更。

例:

- Damage
- Draw
- Destroy
- Ready
- Exhaust
- ATK変更
- Card移動

```text
Ability = Effectを利用する機能
Effect  = 実際の状態変更
```

## 7. Runtime State

Cardに付随し、Game中に変化する状態。

例:

- Ready / Exhausted
- Set / Revealed
- Accumulated Damage
- Deploy直後によるAttack制限

Card Definitionとは分離する。

## 8. Interaction

### Operation

Turn中にPlayerが選択する主要操作の総称。

### Action

Reaction可能なOperation。

```text
Operation
├─ ActionではないOperation
└─ Action
    ↓
  Reaction Window
```

Actionであるなら必ずReaction可能である。

### Reaction Window

Action Declarationを確認した相手に与える応答機会。

### Reaction

Reaction Window内で使用する応答。

ReactionはOperationではなく、Actionに従属するInteractionである。

ReactionのEffect解決後、宣言済みActionをCancelし、Action側PlayerへOperation選択権を戻す。

## 9. Activation

Ability / Effectがどの契機で有効になるかを表す。

### Trigger

Eventの発生を契機としてEffectを開始する。

### Continuous

条件成立中、継続してGame Stateへ適用される。

TriggerやContinuousはOperationやReactionではない。

## 10. Event

Game中に発生した事実。

例:

- Card was Drawn
- Unit was Deployed
- Action was Declared
- Attack was Committed
- Damage was Dealt
- Unit was Destroyed

主としてTriggerやConditionから参照する。

## 11. Combat procedure

### Attack

Combatを開始するAction。

### Block Step

Reactionが行われなかったAttackで、防御側がBlock Abilityを使用できるProcedure。

### Block

Block StepでUnitが使用するAbility。Attack TargetをそのUnitへ変更する。

BlockはActionではなく、新しいReaction Windowを作らない。

### Combat

Attack Commit後、AttackerとFinal Targetから戦闘結果を解決するProcedure。

### Damage

CombatまたはEffectによって発生する状態変更。

### Destroy

Cardを盤面からDiscardへ移す状態遷移。

Destroy自体はActionではない。Destroyを発生させるAbilityがActionであることは可能。

## 12. Terminology responsibilities

| Term | Layer | Responsibility |
| --- | --- | --- |
| Card Pool | Construction | Card候補集合 |
| Pool Identity | Construction | Card Poolの上位分類 |
| Access Rule | Construction | Deckへの採用可否 |
| Affinity | Construction | Card間の組み合わせ価値 |
| Format | Construction | 使用可能Card集合 |
| Player | Object | 意思決定主体 |
| Core | Object | 勝敗対象 |
| Card | Object | Parameter / Ability保持主体 |
| Energy | Resource | 基本Card利用 |
| Momentum | Resource | 追加能力・特殊処理 |
| ATK / HP | Stat | 性能・耐久 |
| Capacity | Constraint | 最大保持数 |
| Zone | Location | Cardの所在 |
| Card Type | Definition | Cardの基本役割 |
| Tag | Definition | 意味分類 |
| Ability | Definition | Cardが提供する機能 |
| Effect | State Change | 実際の状態変更 |
| Runtime State | State | 現在のObject状態 |
| Turn | Progression | 1 Operationを行う区間 |
| Operation | Interaction | Turn中の主要操作 |
| Action | Interaction | Reaction可能なOperation |
| Reaction | Interaction | Actionへの応答 |
| Trigger | Activation | EventからEffectを開始 |
| Continuous | Activation | 継続Effect |
| Attack | Action | Combat開始 |
| Block | Ability | Attack Target変更 |
| Combat | Procedure | 戦闘結果解決 |
| Event | Runtime Fact | 発生済みの事実 |

## 13. Core distinction

```text
Object
≠ State
≠ Resource
≠ Zone
≠ Operation
≠ Ability
≠ Effect
≠ Event
```

特に以下を維持する。

```text
Action   = Reaction可能なOperation
Reaction = Actionへの応答
Ability  = Cardが提供する利用可能な機能
Effect   = 実際のGame State変更
Block    = Block Stepで使用するAbility
Combat   = Attack Commit後のProcedure
```
