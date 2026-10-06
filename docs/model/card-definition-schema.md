# Card Definition Schema

## Purpose and responsibility

[Card Schema](../../schemas/card.schema.json)は、現在合意しているCard / Ability / EffectをJSONで記述する構造契約である。Domain Engine、Game State、ゲーム動作の受入テストは実装しない。新しいMechanicには先にRequirements / Rules / Modelの合意が必要であり、JSONへ新しいEffect名を追加するだけではゲームルールにならない。

| 責務 | 内容 | 正本 |
| --- | --- | --- |
| Card Definition | Name、Card Type、静的Parameter、Operation、Ability、Cost、Target条件、Resolution | [Card Model](card-model.md)、本書、Schema |
| Runtime Card Instance | 所在Zone、Ready / Exhausted、Accumulated Damage、Set / Revealed、Deploy直後Attack制限 | [State Model](state-model.md#zone-transition-state)と将来のEngine |
| Game State | Core HP、各PlayerのResource、Zone内の個体、Active Player、Turn、Operation lifecycleと選択した対象の束縛 | [Domain Model](domain-model.md)、[Core Rules](../rules/core-rules.md)と将来のEngine |

`id`は定義を参照する技術識別子、`name`はゲーム上のCard Nameである。[同名3枚制限](../rules/deck-rules.md#deck-construction)は`name`に適用する。同名でも異なる技術IDを付ければ枚数制限を回避できる、という意味にはならない。Abilityの`id`とTarget選択のキーも定義内の参照名であり、対戦中の個体IDではない。

Schemaはsyntax / structural contractを定める。Effectの順序・同時適用・Player order・勝敗判定境界・適用済み結果の保持・終了後の打ち切りは[Effect Resolution Model](effect-resolution-model.md)を正本とする。現在の閲覧権、観測履歴、Player Knowledgeは[Information Model](information-model.md)の責務であり、Card Definitionへ保存しない。

## Examples before syntax

最初に代表Cardが必要とする差分を整理し、その差分から構造を決める。A〜JはSchema設計用のfixtureであり、製品CardやBalanceの決定ではない。Gherkinの既存数値と異なる設計例を同じCardの完全な対応例として扱わない。

| 例 | 表現するCard | 抽出した構造上の要求 |
| --- | --- | --- |
| A | Energy 2、ATK 2、Max HP 3、AbilityなしのUnit | Deploy CostとUnit Parameterを分離し、Ability配列を空にできる。Attack Abilityを要求しない |
| B | Energy 1で相手Coreへ2 Damageを与える非Action Tactic | PlayのCostとResolutionを持ち、Action指定を省略できる。解決後のDiscardはCoreに任せる |
| C | Energy 2、Action、対象を指定して2 Damage | Play固有のAction指定、対象の条件と選択結果の参照を分離する |
| D | PlayはAction / Energy 2、Setは非Action / Energy 1のTactic | 同じCardの操作ごとにCostとAction指定を独立させる |
| E | Face-up Supportが提供するReaction | AbilityのActivationと合法なSourceの種類を明示する |
| F | 事前にSetしたTacticからのReaction | Set操作とSet Card由来のReactionを別々に記述する |
| G | `Momentum 2: Block`を持つUnit | Block StepのActivation、Momentum Cost、SourceへのFinal Target変更を組み合わせる |
| H | EnergyとMomentumの両方を必要とするAbility | 複合Costを1つの支払い要件として記述し、Resourceごとの逐次Effectにしない |
| I | Card移動 → Damage → Draw | 順序付きEffectStep配列で逐次処理を表す |
| J | 両Coreへの同時Damage → Draw | 明示されたSimultaneousGroupを1つのStepとして保持する |

さらに、Actionという分類Tag、同じCardの複数Ability、宣言されたTacticの移動、両Playerへの逐次Damage / Draw / Card移動をfixtureで確認する。各ファイル、数値、Scenario IDと対応の範囲は[Fixture mapping](../../test/fixtures/card-definitions/README.md)を参照する。

## Card structure

Schemaは[JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12)を使用し、1ファイルの`$defs`で責務を分ける。`cardType`や`type`を識別子にしたunion、`required`、`enum` / `const`、数値と配列の制約、`additionalProperties: false`で受理する形を限定する。

~~~text
Card
├─ id / name / cardType / poolIdentity / tags
├─ parameters
├─ operations
│  ├─ deploy: Cost / Action
│  ├─ play: Cost / Action / Targets / Resolution
│  └─ set: Cost / Action
└─ abilities[]
   ├─ id / name / activation
   ├─ action / condition / cost / limit
   ├─ targets
   └─ resolution: EffectStep[]
      ├─ effect: Effect
      └─ simultaneous: Effect[]
~~~

| Field | 内容 |
| --- | --- |
| `id` | 技術的なCard Definition識別子 |
| `name` | ゲーム上のName。技術IDと別に保持する |
| `cardType` | `unit` / `support` / `tactic` |
| `poolIdentity` | 現版では`null`のみ。分類方式とAccess Ruleの合意前の未設定を表す |
| `tags` | 重複のない文字列配列。空配列も可。分類は動作を持たない |
| `parameters` | Unitは`atk` / `maxHp`、Support / Tacticは空object |
| `operations` | Card Typeに適合する`deploy` / `play` / `set`のmap |
| `abilities` | Card固有のAbility配列。空配列も可 |

上記8 Fieldはすべて必須とする。Card / Abilityの技術IDとTarget選択キーは、小文字英字で始まる英小文字・数字・ハイフン区切りの識別子とする。表示名とTagには日本語等の文字列を利用でき、空文字や空白だけの文字列を受け付けない。

`poolIdentity: null`は全Cardが同じFactionに属する宣言でも、すべてのDeckへ採用可能という許可でもない。[Card-pool Architecture](../design/card-pool.md)の具体方式を決めるまで、非nullのIdentityをこの版のSchemaでは受け付けない。

Unitの`atk`と`maxHp`は0以上の整数とする。Costも0以上の整数で表し、Balance上の上限は設けない。Max HP 0等の値を構造上受理しても、ゲーム中に生存・利用できることを保証しない。Current HPやAccumulated DamageをParameterへ入れない。Energy Costは`operations.deploy.cost`へ置き、Parameterとの二重定義を避ける。

| Card Type | Operation | AbilityのSource |
| --- | --- | --- |
| Unit | `deploy`必須 | `unit`。Block Stepも使用可能 |
| Support | `deploy`必須 | `face_up_support` |
| Tactic | `play` / `set`の少なくとも1つ | `set_card`からのReaction |

TacticがAbilityを持つ場合は`set`も必須とする。Set後のReaction専用Tacticは`play`を省略できる。これは現在のSchemaが表す範囲である。Card Typeへ未合意の操作を追加する規則ではない。

## Operations and Action

`operations`をmapにすることで、同じCardに同名の操作を重複定義しない。Deploy / Setは`cost`と任意の`action`だけを記述し、Playはそれらに`targets`と`resolution`を組み合わせる。

~~~json
{
  "play": {
    "cost": { "energy": 2 },
    "action": true,
    "resolution": [
      {
        "type": "effect",
        "effect": {
          "type": "damage",
          "target": { "type": "core", "player": "opponent" },
          "amount": 2
        }
      }
    ]
  },
  "set": { "cost": { "energy": 1 } }
}
~~~

`action: true`はその操作だけへのAction指定であり、省略または`false`は明示的なAction指定がないことを表す。別操作や別Abilityへ波及しない。Card直下の`action`は不正であり、`tags: ["Action"]`は動作指定として解釈しない。根拠は[IR-019](../requirements/interaction-requirements.md#requirements)、[Action keyword](card-model.md#action-keyword)、AC-AR-004〜006である。

Attack、Reaction Windowの開閉、Attack CommitのExhaust、Block後のCombat、Turn Start、Cancel、通常のTactic解決後のDiscardはCore Procedureである。Cardへ`attack` Ability、`cancel` Effect、Energy Refresh等を書かない。Set Tacticの使用によるRevealと解決後のDiscardも[Set state](state-model.md#set-state)に従う。終了判定を含む実行順はCoreとEffect Resolution Modelの責務であり、JSONの省略で変更されない。

## Ability, Condition and Limit

Abilityは`id`、`name`、`activation`、`cost`、`resolution`を持ち、必要な場合だけ`targets`、`action`、`condition`、`limit`を記述する。

| Activation | 用途 | `action` |
| --- | --- | --- |
| `{ "type": "operation", "source": "unit" }` | Board上のUnitが提供するOperation Ability | 任意 |
| `{ "type": "operation", "source": "face_up_support" }` | Face-up SupportのOperation Ability | 任意 |
| `{ "type": "reaction", "source": "unit" }` | Unit AbilityからのReaction | 禁止 |
| `{ "type": "reaction", "source": "face_up_support" }` | Face-up SupportからのReaction | 禁止 |
| `{ "type": "reaction", "source": "set_card" }` | Set可能なTacticをSetした後のReaction | 禁止 |
| `{ "type": "block_step" }` | UnitがAttack ProcedureのBlock Stepで使うAbility | 禁止 |

Source指定は利用条件であり、現在の個体がBoardにいることやFace-upであることを保存する欄ではない。実際の所在・状態・Timingの検証はEngineが行う。[Reaction Source](../rules/core-rules.md#reaction-source)に従い、HandをReaction Sourceとする定義は受け付けない。

Operation / Reaction Abilityの`condition`は省略 / `null`、または`{ "type": "turn", "player": "self" }` / `"opponent"`だけを受け付ける。後者はAC-AR-010の自分Turn / 相手TurnというTiming条件を表す。CoreのReaction Windowを拡張せず、条件とCoreの両方を満たす必要がある。Block Abilityの`condition`は省略 / `null`のみとする。自由文、任意の論理式やスクリプトは受け付けない。

`limit`は省略または`null`のみで、Card固有の回数制限がこの定義にないことを表す。基本ルールの1 Attackにつき1 Blocking Unit等の制限を解除する意味ではない。Limitの種類やreset Timingは未対応とする。

Block AbilityのResolutionは`change_final_target`で`source`を指す単独Stepとする。`block`という複合Effectや`blocker`属性は追加しない。Ready / Exhausted、Deploy直後、Block後にExhaustしないこと、最大1体という扱いは[Combat Rules](../rules/combat-rules.md#block)に従い、Abilityへ繰り返し書かない。

## Cost

~~~json
{ "energy": 2, "momentum": 1 }
~~~

Costは`energy` / `momentum`の少なくとも1つを持つclosed objectである。値は0以上の整数で、省略したResourceに支払い要求はない。Costなしは`{ "energy": 0 }`等で明示し、空objectは受け付けない。

2つのResourceは両方を満たす1つのCostであり、順番に成功・失敗するEffect列ではない。[Cost timing](../rules/resource-rules.md#cost-timing)、[Operation](../rules/core-rules.md#operation)、AC-RESOURCE-008〜009に従い、Engineが合法性と全Costの支払い可能性を先に検証する。Energy消費とMomentum移転、支払う時点、取消時の未払いCost保持もCoreの責務である。

## Target definitions and references

`self`はSourceの所有Player、`opponent`はその相手を表す。Reactionでもこの基準はActive Playerへ置き換わらない。`source`は現在そのAbility / Operationを提供するRuntime CardをEngineが束縛する参照であり、JSONへ個体IDは入れない。

### Selection definitions

`targets`は選択名からDefinition Target Constraintへのmapであり、完全な合法対象集合ではない。[Target semantics](card-model.md#target-semantics)に従い、Effect Target RequirementとRuntime Eligibilityを合成して現在の合法対象を求める。選択がなければFieldを省略し、指定するときは1つ以上の選択を定義する。例えば次の定義は、`victim`という選択が相手Coreを対象とすることを表す。

~~~json
{
  "targets": {
    "victim": { "type": "core", "player": "opponent" }
  },
  "resolution": [
    {
      "type": "effect",
      "effect": {
        "type": "damage",
        "target": { "type": "selected", "selection": "victim" },
        "amount": 2
      }
    }
  ]
}
~~~

Coreの選択条件は`type: core`と`player: self | opponent`。Cardの選択条件は`type: card`、`player: self | opponent | each`、`zone: hand | unit_zone | support_zone`に、必要なら`cardType`と`state: face_up | set`を付ける。これらは対象条件であり、Runtime状態の埋め込みではない。

通常のCard選択は条件に合う1枚、`each`は各Playerの条件に合う1枚ずつを表す。[Action / Reaction Flow](../process/action-reaction-flow.md#selection-and-validation)に従い、操作するPlayerが対象を選び、Engineが現在存在する個体・閲覧権・選択の合法性を検証する。AC-RESOLUTION-004の`each`は指定済みの対象を表し、相手のHidden Cardをどう選ばせるかという未確定の仕組みは追加しない。Source・Target・Costの検証後に支払う既存手順に接続し、Hidden Cardの内容を自由に検索できる権利は追加しない。

例えば`{ "type": "card", "player": "opponent", "zone": "support_zone" }`と`reveal`の組合せは、Set Tacticが存在し得るので静的にvalidである。Runtimeでは相手の現在のSet Cardだけを候補とし、Face-up SupportとRevealed Tacticを除く。`state: set`を明記して制約を狭めてもよいが、Revealの対象要件を全Cardで重複記述する義務はない。候補が空の状態や不適合な選択では、現在のOperation / Action / Reactionの検証失敗経路へ戻る。

UI向けの候補は[EngineのTarget Evaluation](domain-engine-architecture.md#target-evaluation)から得る。Selected TargetはRuntime文脈の束縛であり、Card DefinitionやSchemaには実個体IDを保存しない。候補の識別・説明も[Information Model](information-model.md)の閲覧権限を超えない。

### Effect references

| Target参照 | 内容 |
| --- | --- |
| `{ "type": "core", "player": "self" }` / `"opponent"` / `"both"` | 対応するCore。`both`は両PlayerのCore |
| `{ "type": "player", "player": "self" }` / `"opponent"` / `"both"` | Drawを適用するPlayer |
| `{ "type": "selected", "selection": "victim" }` | 同じOperation / Abilityの`targets`で定義した選択の結果 |
| `{ "type": "source" }` | このOperation / Abilityを提供するCard |
| `{ "type": "declared_action_source", "cardType": "tactic", "zone": "hand" }` | 宣言されたActionのSourceであるHandのTactic。AC-AR-013の没収を表す |

`both`や`each`は同時適用の指定ではない。複数Playerへの1つのEffectは[Player order](effect-resolution-model.md#player-order)に従う。AC-RESOLUTION-004では、`each`で事前に選択したCardを1つの`move_card`で各所有者のHand / Discardへ移動する。Source所有者向けと相手向けの2 Stepへ分解すると明示順序が変わるため、その代用にはしない。

`declared_action_source`はCard固有の移動Effectを記述するための参照であり、元Actionの取消Effectではない。Reaction Ability内であることは静的に検証する。該当するAction / Tacticが存在するか、TimingやHand条件を満たすかはEngineで検証する。

## Resolution and EffectStep

`resolution`は1つ以上のEffectStepを記載順に持つ配列である。通常Stepは`{ "type": "effect", "effect": ... }`、同時Stepは`{ "type": "simultaneous", "effects": [...] }`。1つのStepに両方を混在させず、Groupの入れ子も許可しない。

この版のSimultaneousGroupは、`self`と`opponent`のCoreへそれぞれ直接Damageを与える2 Effectに限定する。両CoreにDamageを適用した結果を1つの境界で判定する既存例を表すための構造上の対応範囲であり、同時Effect一般のゲームルールを限定・追加するものではない。Unit間Combatの同時Damageは[Attack Flow](../process/attack-flow.md#combat)が実行するCore Procedureなので、Cardへ書かない。

Draw、`both`を持つEffect、選択対象へのDamage、未知の競合を含むGroupはこの版では受け付けない。逐次DrawをGroupへ入れて順序や判定境界を変えることは[Resolution steps](effect-resolution-model.md#resolution-steps)で認められていない。`draw.count`が複数でも、1枚ずつのDraw、直後のHand Limit処理、失敗時の停止は同じ正本と[Deck Rules](../rules/deck-rules.md#draw-and-hand-limit)に従う。

SchemaにはPlayerの処理順、Game終了後の処理継続、勝敗判定を飛ばす設定を設けない。

## Primitive Effects and Core Procedures

| 表現 | 分類と対応範囲 |
| --- | --- |
| `damage` | Primitive。正の整数`amount`、直接Core参照または選択対象へのDamage |
| `draw` | Primitive。正の整数`count`、Player参照へのDraw |
| `move_card` | Primitive。Source / 選択Card / 宣言されたTacticを`destination: { player: target_owner, zone: hand \| discard }`へ移動 |
| `destroy` | Primitive。Source / 選択されたBoard UnitのDestroy。定義上の対象適合性はstatic、実際の種類・所在はruntime validationで確認 |
| `ready` / `exhaust` | Primitive。Source / 選択Board Unitの活動状態変更。定義上の対象適合性はstatic、実際の状態はruntime validationで確認 |
| `reveal` | Primitive。Source / 選択Set CardのReveal。現在のSet状態からの公開に限定し、任意Zoneの情報閲覧を定義しない |
| `change_final_target` | Primitive。Block StepでFinal TargetをSource Unitへ変更する単独Stepのみ |
| Card移動 → Damage → Draw | 複数Primitiveを順序付きStepにしたResolution |
| 両Coreへの同時Damage | 明示された2つのPrimitiveのSimultaneousGroup |
| Attack / Combat / Cancel / Turn Start | Core Procedure。CardのEffect typeにしない |
| Unit / Support Deploy、Tactic Play、Set | OperationからCore Procedureを利用。CardはCost・Action指定とPlay固有Effectを記述 |
| EffectによるDeploy / Set、ATK / HP / Damage変更 | 語彙はCard Modelに存在するが詳細不足のため現版は未対応 |

`move_card`はDiscard移動によるRevealや知識消去を行わない。[Current visibility](information-model.md#current-visibility)と[Player knowledge](information-model.md#player-knowledge)をそのまま利用する。Destroyや通常のTactic解決後のDiscardを記述するために、追加の公開設定は要らない。

移動・Destroy時の盤面用状態の終了と、Core ProcedureによるDeploy / Set時の初期化は[Zone transition state](state-model.md#zone-transition-state)に従う。これらのRuntime状態や初期化設定をCard Definitionへ追加しない。

## Structural validation and semantic validation

~~~text
Card Definition collection
  → Structural validation
  → Static semantic validation
  → Runtime semantic validation / Domain Engine（未実装）
~~~

| 層 | 確認する内容 | 実装 |
| --- | --- | --- |
| Structural | Schemaの自己検証・strict compilation、既知のType・Effect・参照形式、必須Field、数値、操作・Activationの形、Runtime情報の混入禁止 | [Schema](../../schemas/card.schema.json)、[check-cards.mjs](../../scripts/check-cards.mjs)の`createCardValidator` |
| Static semantic | 同じOperation / Ability内の選択名解決、Card内のAbility IDと入力定義集合内の技術IDの一意性、Effect参照ごとの互換候補種別の存在、参照Scope、成立しないTarget条件 | [card-static-semantics.mjs](../../scripts/card-static-semantics.mjs)。構造検証後だけ実行 |
| Runtime semantic | 実際のSource・Target・Zone・状態・Timing・Visibility、Effective Ruleによる合法集合、Zone Capacity、全Costの支払い可能性 | 将来の[Domain Engine](domain-engine-architecture.md#validation-layers)。Effect実行・Player order・終了判定は検証とは別の実行責任 |

`createCardDefinitionValidator`は`{ file, card, instancePath? }`の配列を1つの定義集合として検証する入口である。全件の構造検証が成功した場合だけ静的意味検証へ進む。入力を変更せず、ファイル名・JSON Pointer・診断種別を返す。技術IDの一意性は渡された集合内で判定し、別CardでのAbility ID再利用や異なる技術IDでの同じNameを禁止しない。Deckの同名枚数制限はこの検証の範囲外である。

選択名はそのOperation / Abilityの`targets`だけから解決する。別のOperation、隣のAbility、別CardやJavaScriptのprototypeへScopeを広げない。同じ選択名を別Scopeで独立して使うことや、未使用の有効な選択条件は認める。

型互換性は各Effect参照について、Definition Target ConstraintとEffect Target Requirementに合う候補種別が存在し得るかで判定する。selectorの全候補への適合は要求しない。この意味は[Q-TARGET-001〜003](../acceptance/example-mapping.md#target-decisions)の具体例から決定し、現在の実装を根拠にはしない。`damage`はCoreまたはBoard Unit、`destroy` / `ready` / `exhaust`はBoard Unit、`move_card`はCard、`reveal`はSet Cardに適合する。例えばCore選択へのCard移動、HandのUnitへのDestroy、Face-up限定選択へのRevealは拒否する。`unit_zone`のSupport / Tactic / Set、`support_zone`のUnit、Handの配置状態、Set状態のSupportといった条件同士の矛盾も拒否する。これらは現版のCard Type / OperationとState Modelから導く。

`cardType`や`state`の省略だけでは拒否しない。`unit_zone`だけの選択はUnit Effectに、`support_zone`だけの選択はRevealに適合する候補を持つ。Support ZoneのFace-up TacticはReveal済みCardを表せるため、選択条件として有効である。実際に合法な対象を選べるかはRuntimeで確認する。

`source`の型はCard TypeとActivation / Operationから判断するが、先行Effectによる移動や状態変更を実行しない。`set_card`由来のReactionに`reveal(source)`があっても、静的検証の成功は現在Setであることを保証しない。使用時の自動RevealやEffect適用時の現在状態はEngineの責務である。`declared_action_source`もReaction内というScopeだけを確認し、実際の宣言対象やTimingを推測しない。静的検証の成功は、利用可能なCardや合法な対戦操作であることの証明ではない。

同じ選択名を複数Effectで参照しても、各参照の型適合性だけを検証する。Resolution全体の合同充足性、対象寿命、先行Effect後の再検証や不適合時の処理は保証しない。[Q-ENGINE-001](domain-engine-architecture.md#open-questions)とQ-SCHEMA-004を参照する。Rule Interferenceによる将来のTarget条件変更も、現版の未合意DSLやEffectの対象型変更を静的に受理する理由にはしない。

## Local validation and CI

Node.js 24系を使用する。

~~~sh
npm ci
npm run check:markdown
npm test
npm run check:spec
npm run check:cards
~~~

`check:spec`は既存Gherkinの構文と参照を確認する。`check:cards`は`test/fixtures/card-definitions/structural/`の構造fixtureを検証した後、その`valid/`全件を1つの定義集合として静的に検証する。さらに`static-semantic/valid/`と`static-semantic/invalid/`の各JSON配列を独立した集合として検証する。配列はfixture用の容器であり、Card Schemaの変更ではない。Static Semanticの負例も構造検証には成功し、manifestの診断種別・JSON Pointerに一致する必要がある。JSON破損、fixture不足、構造エラーをStatic Semantic Checkの成功として扱わない。`npm test`は`test/tooling/`にあるこれらの検証器のTooling testsを実行する。

任意のCard JSONファイルも`--cards`を繰り返して1つの集合として検証できる。

~~~sh
npm run check:cards -- --cards path/to/first-card.json --cards path/to/second-card.json
~~~

`--fixtures PATH`は構造・静的意味の両fixture階層を含むルートを指定する。`--cards`との併用はできない。`--schema PATH`は構造fixtureに使用するSchemaを指定するが、静的意味検証へ渡す定義は常に現版Card Schemaも満たす必要がある。カスタムSchemaで現在の契約を緩めたり、静的意味検証を省略したりしない。

デフォルトのfixtureルートは`test/fixtures/card-definitions/`であり、`--fixtures test/fixtures/card-definitions`でも同じ階層を検証する。任意ルートを指定する既存CLIとの互換性のため、従来の`valid/`・`invalid/`・`invalid-expectations.json`と`semantic/`を持つ配置も引き続き受け付ける。新配置に`structural/`がある場合は、その構造fixtureと`static-semantic/`を使用する。診断keywordの`semantic/`はStatic Semanticを表す既存契約として維持する。

構造検証は[AjvのDraft 2020-12対応](https://ajv.js.org/json-schema.html#draft-2020-12)と[strict mode](https://ajv.js.org/strict-mode.html)を用いる。依存はlockfileで固定し、Specification CIの`check:cards`で構造と静的意味の両方を確認する。CI成功はこれらの契約をfixtureが満たすことを示し、ゲーム挙動は検証しない。

Acceptance fixture → Card Definition fixture → Schema validationの対応は[Fixture mapping](../../test/fixtures/card-definitions/README.md)で追跡する。同じNameでもScenarioごとの指定値が異なる場合は別定義として示す。Schemaへ合わせるための既存Gherkin変更や、Runner / Step Definitionsの追加は行わない。

## Unsupported concepts and open questions

以下は現在のSchemaで未対応の領域と、拡張前に必要な仕様上のQuestionである。現在の代表fixtureを表すための判断には用いない。新しいMechanicが必要になった時点で既存の[Change policy](../README.md#change-policy)に従って合意し、必要な議論をGitHub Issueで扱う。

| ID | 未解決Question / 対応境界 | 現在の扱いと根拠 |
| --- | --- | --- |
| Q-SCHEMA-001 | Trigger / ContinuousのTiming、優先順位、依存・競合、無限処理をどう扱うか | Activation自体を未対応とする。[Card Model](card-model.md#activation-categories)は概念だけを挙げ、[Effect Resolution Model](effect-resolution-model.md#examples-and-boundaries)も詳細を定めない |
| Q-SCHEMA-002 | ATK / HP / Damage変更の対象値、持続期間、重ね合わせ、下限をどう定めるか | 語彙の存在だけで実行意味を補わず、変更Effectを未対応とする |
| Q-SCHEMA-003 | EffectによるDeploy / Setの支払い、配置時の初期化や失敗をどう扱うか。Deck移動では挿入位置をどう定めるか | 通常Operationと区別して保留する。Card移動は既存例が必要とするHand / Discard宛てに限る |
| Q-SCHEMA-004 | 任意ZoneからのRevealの範囲・期間、Hidden個体の追跡、先行Effect後のTarget再検証をどう定めるか | Set CardのRevealと既存の対象選択・文脈参照だけを構造化する。[Information Model](information-model.md)へ新しい閲覧権や追跡保証を追加しない |
| Q-SCHEMA-005 | 同時Effectが同じ個体や値へ依存・競合する場合の結果をどう決めるか | 両Core各1回のDamageだけをGroupとして受理する。一般の依存・競合解消は[Effect Resolution Model](effect-resolution-model.md#examples-and-boundaries)で未定義 |
| Q-SCHEMA-006 | Card固有Limitの種類、回数のScope、reset Timingをどう定めるか | `limit`は省略 / `null`のみ。Coreの制限は引き続き適用する |
| Q-SCHEMA-007 | Pool IdentityとAccess Ruleをどの方式で具体化するか | `poolIdentity: null`のみ。[Card-pool Architecture](../design/card-pool.md)の候補から方式を選ばない |

Priority / Stack、Replacement Effect、任意スクリプト、汎用Target DSL、UI、Network、DB、製品Card Pool、Balance設計は今回の範囲に含めない。
