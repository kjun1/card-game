# Verification Strategy

## Purpose

開発フェーズ、静的ArtifactのCheck、実行可能なSoftwareのTest、ゲーム設計のValidationの責任を定める。[Issue #19](https://github.com/kjun1/card-game/issues/19)以降の開発・CI・命名・自動化状態の共通基準とする。

本書は検証活動の正本である。ゲームの要求は[Requirements](README.md#requirements)、規範的ルールは[Rules](README.md#rules)、処理順・制御移譲は[BPMN](process/bpmn/README.md)、概念・状態・構造は[Model](README.md#model)を正本とする。Cardの静的保証の詳細は[Card Definition Schema](model/card-definition-schema.md#structural-validation-and-semantic-validation)、実行責任は[Domain Engine Architecture](model/domain-engine-architecture.md)を参照し、本書でゲーム仕様を追加しない。

## Development phases

成果物と保証が変わる境界として、次の3フェーズを採用する。

~~~text
Specification & Formalization
  → Automation & Executable Verification
  → Game Design / Optimization
~~~

5段階のDomain Definition → Domain Formalization → Domain Automation → Executable Verification → Game Design / Optimizationも、責任の細分化には有用である。ただし、このrepoでは要求・具体例・規範文書を照合して繰り返し更新し、将来のEngineもVertical Sliceごとに実装と実行検証を進める。そこで前2段階を第1フェーズ、次の2段階を第2フェーズにまとめ、内部の成果物と完了条件は区別する。

以下のExit criteriaは、選んだCapability / Sliceと合意済み仕様の範囲に適用する。全ゲームの形式化や自動化を一括で完了させる必要はない。各フェーズは一度だけ通る工程ではなく、実行検証やPlaytestで疑問が見つかれば[Change policy](README.md#change-policy)へ戻る。Tooling testは全フェーズの検証基盤を支える。

| Internal stage | Output / completion boundary |
| --- | --- |
| Domain Definition | 要求と具体例の合意。対象の期待結果を決められ、その結果に依存するQuestionを解消している |
| Domain Formalization | 同じ合意を規範・Process・Model・Acceptance Specificationと必要な静的契約へ反映し、対応のレビューと対象Checkが成功している |
| Domain Automation | 対象の判断・処理を実Engineで実行できる。実装の存在だけではAcceptanceへの接続完了としない |
| Executable Verification | 対象のDomain testsと既存Scenarioを実Engineへ接続したExecutable Acceptanceが成功し、観測結果を仕様へ追跡できる |

### Specification & Formalization

| Item | Responsibility |
| --- | --- |
| Purpose | ゲームが満たす要求と振る舞いを合意し、規範・Process・Model・機械可読な契約へ具体化する |
| Inputs | 要求・変更案、既存Requirements / Rules / Process / Model、未解決Question |
| Main activities | Domain DefinitionとしてRequirementsとExample Mappingを整理し、Questionを解消する。Domain Formalizationとして同じ合意をGherkin、Rules、BPMN、Model、必要なCard Definition / Schemaへ反映し、Structural / Static Semantic Checkを行う |
| Outputs | 追跡可能なRequirements、合意済み具体例とAcceptance Specification、規範文書、BPMN、Model、Schema、代表Card DefinitionとCheck結果 |
| Verification | 具体例と正本文書のレビュー、Markdown / Specification / Cardの静的Check、Checker自身のTooling test |
| Exit criteria | 対象範囲の要求・例・規範・Modelが対応し、期待結果を左右するQuestionを解消している。必要な静的契約とfixtureがあり、既存Check / Tooling testが成功し、未対応領域と残るQuestionを明示している |

未解決Mechanicは対象範囲を広げる前に合意する。SchemaやGherkinの受理だけで、自然言語の意味や規範文書同士の整合性が確認済みとは扱わない。

### Automation & Executable Verification

| Item | Responsibility |
| --- | --- |
| Purpose | 合意済み仕様をDomain Automationへ変換し、実際の振る舞いを実行して確認する |
| Inputs | 第1フェーズの対象仕様、検証済みCard Definitions、Engine Architecture、対象Scenarioと観測境界 |
| Main activities | Domain AutomationとしてState / Command / Rule Evaluation / Runtime Validation / Resolution / Event / Resultを対象Sliceに実装する。Executable VerificationとしてDomain unit testと、同じFeatureを使うRunner / Step Definitions / Assertionsを接続する |
| Outputs | 対象CapabilityのDomain Engine実装、Domain tests、接続済みExecutable Acceptance、実行結果と仕様への対応 |
| Verification | 合法・境界・拒否入力に対するDomain tests、既存Acceptanceの実行、既存Check / Tooling testによる回帰確認 |
| Exit criteria | 対象処理が実Engineで動き、規定のState / Events / Resultと拒否時の副作用を観測できる。対象のDomain testsとExecutable Acceptanceが成功し、未接続Scenarioを区別して報告できる。既存Check / Tooling testも成功する |

Engineの実装がある状態と、合意済みScenarioをEngineへ接続して確認した状態は別である。1 Sliceの成功を全ゲームのExecutable Verificationへ拡大しない。

### Game Design / Optimization

| Item | Responsibility |
| --- | --- |
| Purpose | 正しく実装されたゲームが、意図した意思決定・テンポ・公平性を提供するか評価し、設計を改善する |
| Inputs | 対戦可能な対象範囲、実行検証の結果、Card Pool / Balanceの仮説、Play-experience Requirements、評価対象と条件 |
| Main activities | Playtest、Balance evaluation、先攻優位・Card Pool・判断時間等の評価、仮説と数値・構成の改善 |
| Outputs | 評価条件と観測結果、要求に対する評価、設計上の採否・改善案と次の検証課題 |
| Verification | 評価に使う実装・定義のCheck / Test、測定・集計の確認。設計目的への適合はValidationとして別途評価する |
| Exit criteria | 対象仮説の評価条件・判断基準を明示し、観測結果を根拠に採否または改善を決め、残る不確実性を記録する。仕様変更があれば第1・第2フェーズの対応する検証を更新する |

[Card-pool architecture](design/card-pool.md)や[Balance model](design/balance-model.md)の設計仮説は既にある。仮説の記述と、実際のPlaytest / Balance Validationの完了は区別する。本書では新しいCard Pool方式、Balance目標、評価閾値を決めない。

## Verification taxonomy

Verificationは、成果物や実装が合意した契約・仕様に適合することを確認する活動の総称とする。このrepoではCheckとTestをその手段として分け、Validationはゲーム設計が目的へ適合するかの評価に用いる。

| Term | Subject and question | Evidence |
| --- | --- | --- |
| Check | 静的Artifactが定めた契約・規約へ適合するか | Artifact → static conformance。Markdown書式、Gherkin構造・参照、Cardの構造・静的意味の診断 |
| Test | 実行可能なSoftware / Toolが入力に対して仕様どおり振る舞うか | Executable subject → input → observed output → assertion。Tooling / Domain / Acceptanceの実行結果 |
| Validation | ゲーム設計が意図した体験・公平性・設計目的へ適合するか | PlaytestやBalance評価の条件・観測・判断 |

分類は検証対象と保証で決める。Checkerがコードを実行していても、Card JSONやGherkinへの適合判定はCheckであり、Checker自身の入力・診断・終了コードをassertする活動はTooling testである。

既存文書・APIのStructural Validation / Static Semantic Validation / Runtime Validationという語は、データや操作の適合判定を指す。本書のゲーム設計Validationとは対象が異なる。Structural / Static Semantic ValidationはCheck、Engine内のRuntime Semantic Validationの振る舞いの確認はTestに分類する。一般に広く使われる「validation」を一律にゲーム設計の意味へ読み替えず、対象と層を併記する。

~~~text
Correct implementation ≠ Good game design
~~~

Check / Testの成功は、面白さや良いBalanceの評価を代替しない。Playtest結果も、要求された全処理が正しく実装された証明にはならない。

## Current verification assets

[package.json](../package.json)と現行ファイルの対応は次のとおり。ファイルが`test/`内にあることだけではDomain testやExecutable Acceptanceとは分類しない。

| Asset | Classification | Current responsibility |
| --- | --- | --- |
| `npm run check:markdown` / [check-markdown.mjs](../scripts/check-markdown.mjs) | Check: Markdown conformance | `.git` / `node_modules`を除くrepo内Markdownを共通の[設定](../.markdownlint.json)でlintする |
| `npm run check:spec` / [check-spec.mjs](../scripts/check-spec.mjs) | Check: Acceptance Specification conformance | Gherkinの解析・例への展開、Feature / Scenario / Outline構造、要求表・要求タグ・Scenario IDの規約を確認する。ゲーム処理を実行しない |
| `npm run check:cards` / [check-cards.mjs](../scripts/check-cards.mjs) | Check: Structural / Static Semantic | Schema自己検証・strict compilation、構造fixtureと静的意味fixtureの適合・期待診断を確認する。`--cards`では渡したCard定義集合を検証する |
| [card-semantics.mjs](../scripts/card-semantics.mjs) | Static Semantic Checkの実装 | 構造検証後の定義集合に対してID一意性、symbol Scope、Target条件とEffect参照の静的互換性を確認する |
| `npm test` | Test: Tooling testsの現行aggregate | `node --test`で現在の3 testファイルを実行する。EngineやAcceptance Runnerは含まない |
| [check-spec.test.mjs](../test/check-spec.test.mjs) | Tooling test | Specification checkerの正常・異常入力、診断、CLIの振る舞いをassertする |
| [check-cards.test.mjs](../test/check-cards.test.mjs) | Tooling test | Schema checkerの自己検証、受理・拒否、入力不変、fixture manifest判定、CLIをassertする |
| [check-card-semantics.test.mjs](../test/check-card-semantics.test.mjs) | Tooling test | Static Semantic checkerのScope・一意性・型互換性、構造検証との境界、診断・CLIをassertする |
| `docs/acceptance/*.feature` | Acceptance Specification | 合意済みの振る舞いを具体例で記述した静的Artifact。現時点ではExecutable Acceptance Testではない |
| [schemas/card.schema.json](../schemas/card.schema.json) | Structural contract | Card Definitionの受理する形を定義する。Schema自体はゲーム動作のTestではない |
| `test/fixtures/cards/valid/` / `invalid/` / `invalid-expectations.json` | Structural Check用の入力と期待診断 | 代表Cardの構造、受理・拒否境界を記録する |
| `test/fixtures/cards/semantic/` | Static Semantic Check用の入力と期待診断 | 各JSON配列を独立した定義集合として確認する。`semantic`という現行名はRuntime意味を含まない |

Card fixtureの対応範囲は[Fixture mapping](../test/fixtures/cards/README.md)を参照する。fixtureとmanifestの照合はCheck基盤の回帰確認も支えるが、対戦Stateの構成やEffect実行ではない。

### Checks

静的CheckはArtifactの契約違反を実装・対戦前に見つける。Markdownの書式成功から日本語の正しさを、要求タグの存在から要件網羅を、Card定義の適合から操作の合法性を推定しない。Requirements、Example Mapping、Gherkin、Rules、BPMN、Modelの意味の照合はレビューを併用する。

### Tooling tests

Tooling testsはCheckを行うSoftwareを検証する。正例・負例、意図した診断、入力を変更しないこと、CLIの読み込み・出力・終了コードなどを対象にする。現在の`npm test`の成功は、これらのテストケースでCheckerの期待する振る舞いが確認できたことを示す。

Markdown checkerのunit testは未実装であり、[Issue #17](https://github.com/kjun1/card-game/issues/17)でTooling testとして追加する。valid / invalid Markdown、設定不正、対象0件、診断、探索除外の確認を、[Issue #20](https://github.com/kjun1/card-game/issues/20)の構造整理後に進める。`check:markdown`がCIで成功することと、Checkerの失敗条件をunit testで確認していることは区別する。

### Domain tests

Domain testsは将来のEngineの判断・状態遷移・処理境界を実行して確認する。現在状態とCommandを入力し、合法性、有効Cost / Target / Capacity、支払い、Zone移動、配置状態、Operation完了、Event / Resultを対象範囲ごとにassertする。正常例に加えて拒否・境界例を持ち、不正入力で規定外の支払い・移動等が起きないことも確認する。

Domain unit testは判断や遷移を局所的に確認し、Executable Acceptanceは複数のEngine責任を合意済みの業務例として接続する。どちらもUI / Network / DBを前提にしない。対象の詳細は[Engine責任](model/domain-engine-architecture.md#engine-responsibility)に従い、未合意Mechanicの期待結果をテストで暗黙に確定しない。現在Domain testsは存在しない。

## Acceptance Specification and Executable Acceptance

~~~text
Acceptance Specification ≠ Executable Acceptance
~~~

現在の`docs/acceptance/*.feature`は、合意済みの振る舞いを具体例で表したAcceptance Specificationである。`check:spec`はGherkinを解析し、Scenario Outlineを例へ展開するが、Stepを実行しない。Runner、Step Definitions、Engineに対するAssertionがないため、ゲーム動作の受入テストが成功したとは扱わない。

将来は同じ`.feature`とScenario IDを維持し、対象Scenarioを次の経路へ接続する。

~~~text
Gherkin
  → Runner / Step Definitions
  → Given: validated Card Definitions + fixture GameState
  → When: Command / query → Domain Engine
  → State / Events / Result
  → Then: Assertion
~~~

この経路で実Engineを動かし、観測結果を期待結果と比較できるようになった例をExecutable Acceptanceと呼ぶ。Step Definitionsは入力・観測への翻訳を担い、ゲームルールはEngineへ実装する。接続後もFeatureはAcceptance Specificationとしての役割を持ち、`check:spec`を継続する。実行用に別の仕様を複製しない。

初期State、Scenarioごとの指定値、解決直後と次のTurn Startの区別は[Authoring / Observation points](acceptance/README.md#observation-points)、State / Event / Resultの接続は[Acceptance integration](model/domain-engine-architecture.md#acceptance-integration)に従う。外側のUI・通信・永続化の正しさは、この経路だけでは保証しない。

Runner接続はSliceごとに進める。選択したScenarioの未定義Step・pending・Assertion失敗・対象0件を成功として扱わず、未接続Scenarioは未実行と報告する。接続した例の成功と全Featureの実行成功を区別する。

## Structural, Static Semantic and Runtime Semantic

3層は入力と責任で分ける。静的2層の成功を前提としても、実際の対戦操作にはRuntimeの判定が必要である。

| Layer | Input and responsibility | Verification method | Boundary |
| --- | --- | --- | --- |
| Structural Validation | Card JSONの形、`required`、`enum` / `const`、`type`、数値・配列制約、closed object、Runtime情報の混入禁止 | SchemaによるStructural Check。Checker自身はTooling testsで確認 | 定義内参照の意味や、ゲーム内での使用可否を保証しない |
| Static Semantic Validation | 構造検証済み定義集合の技術ID一意性、Ability ID、symbol Scope、成立しないTarget条件、各Effect参照の互換候補種別の存在 | Static Semantic Check。Checker自身はTooling testsで確認 | selector全候補の適合、現在の合法集合、Resolution全体の合同充足性、先行Effect後の状態を保証しない |
| Runtime Semantic Validation | Command / Selected Targetと現在のGameState・文脈を束縛し、actor、Source / Targetの現在Zone・状態、Resource、Timing、Legal Target、Effective Rule、Capacity、Visibilityを判定 | 将来のEngine内で判定し、Domain tests / Executable Acceptanceでその振る舞いを確認 | 対象Sliceと合意済みルールの範囲に限る。Effect実行・処理順・勝敗伝播は別のEngine責任であり、併せてTestする |

例えば相手`support_zone`へのReveal定義は、Set Tacticという互換候補種別が存在し得るため静的に受理される。現在Set Cardが0枚ならRuntimeの合法集合は空であり、Face-up Support / Revealed Tacticも選べない。静的なvalidと実際の操作の拒否は両立する。

Structural → Static Semanticは定義集合に適用する順序であり、Runtimeでは検証済み定義と変化するStateを参照する。CommandごとにSchemaが現在の盤面を判定する仕組みではない。参照寿命や先行Effect後の再検証などの未決事項は[EngineのOpen questions](model/domain-engine-architecture.md#open-questions)に従う。Static Semantic CheckとRuntime Semantic Validationを一括して「semantic test」と呼ばない。

## Shift-left model

~~~text
Requirement
  → Example Mapping
  → Acceptance Specification
  → Rules / BPMN / Model
  → Card Definition
  → Structural Check
  → Static Semantic Check
  → Domain Unit Test
  → Executable Acceptance
  → Playtest / Balance Validation
~~~

この流れは、不明確な要求を具体例で早く発見し、記述・構造・静的意味の問題をDomain Automationへ渡す前に取り除くshift-leftのモデルである。実際の変更はレビューや実行結果から前段へ戻る。Tooling testsは静的Checkの信頼性を支える横断活動であり、Domain Unit Testとは区別する。

左側ほど一般に安価・高速・局所的なフィードバックを得やすく、右側ほど統合度と実際の対戦への近さが高くなる。左側が優れているという順位ではなく、異なる問題を見つける補完関係である。静的CheckではResource支払い・Targetの現在状態を確認できず、Domain testsだけでは合意済みの業務例全体やゲーム体験を評価できない。

## CI responsibilities

### Current Specification CI

[Specification workflow](../.github/workflows/specification.yml)はpush / pull_requestで、`.nvmrc`のNode.js 24系とlockfileを使い、次の順序で実行する。

| Command | Success establishes | Does not establish |
| --- | --- | --- |
| `npm ci` | lockfileに基づく依存のインストール成功 | Artifactやゲーム動作の正しさ |
| `npm run check:markdown` | 探索対象Markdownが共通lint規約に適合する | 日本語の意味、文書リンク、ゲームルールの整合性 |
| `npm test` | 現行Tooling testの入力に対するCheckerの受理・拒否・診断・CLIの期待が満たされる | Markdown checkerの未実装unit test、Domain Engineの正しさ、ゲーム動作 |
| `npm run check:spec` | 対象Gherkinと要求定義がCheckerの構造・参照・ID規約に適合する | Step実行、計算結果、自然言語の意味、全要求の網羅 |
| `npm run check:cards` | Schema自己検証・strict compilation、構造fixtureの受理・期待診断、定義集合の静的意味と意味fixtureの期待診断の照合が成功する | 全製品Cardの適合、現在の対戦での合法性、Cost・Timing・Effect実行 |

通常の`check:cards`が対象とするのはrepoのfixtureである。構造validの集合と、`semantic/`内の各集合を検証する。任意の定義集合は`--cards`で明示的に渡す必要があり、CIがすべてのCard JSONを探索して検証するとは扱わない。

CI成功の保証は、実装済みCheckerの規約と実行したテストケース・入力範囲に限る。**Game behavior、Domain Engine、Acceptance ScenarioのRuntime成功、良いBalanceは現行CIの保証に含まれない。** Rules / Model / BPMN / Gherkinの意味の整合はレビューで確認する。BPMNの構文・意味や文書リンクの自動検証は現行workflowにない。

### Future CI

既存CheckとTooling testsを維持し、対象SliceのDomain testsとExecutable Acceptanceを追加する。各検証の対象と結果を区別して表示し、実行したScenario ID / 範囲を追跡できるようにする。

Domain testsの成功は対象の判断・遷移・境界、Executable Acceptanceの成功は接続済みの合意済み例が実EngineのState / Events / Resultとして確認できたことを示す。未接続例、未合意Mechanic、UI / Network / DB、未評価Card PoolやBalanceへ保証を広げない。Playtest / Balance Validationの根拠は別途記録し、CIのgreenだけで設計目的への適合と判定しない。

## Naming conventions

| Name | Responsibility | Availability |
| --- | --- | --- |
| `check:*` | 静的Artifactのconformance。`check:markdown` / `check:spec` / `check:cards` | 現在の名称を継続 |
| `test:tooling` | Checker / 開発Toolの振る舞いの確認 | 将来の分類名。現在は未定義 |
| `test:domain` | Domain Engineの判断・遷移・境界の確認 | 将来の分類名。現在は未定義 |
| `test:acceptance` | Runner / Step DefinitionsからEngineへ接続したScenarioの確認 | 将来の分類名。現在は未定義 |
| `test` | 実装済みTest suiteのaggregate | 現在は`node --test`でTooling testsのみ。将来はTooling / Domain / Acceptanceの実装済みsuiteをまとめる |

CheckをTest aggregateへ混ぜず、CIでは両方を実行する。将来のsuite選択・runner・aggregateの具体的な配線は構造整理と実装時に決め、未実装suiteを実行成功として数えない。ゲーム設計のValidationに、実装の`test:*`成功をそのまま流用しない。

Tooling / Domain / Fixtureを責任別に分け、Card fixtureはStructural / Static Semanticと明記する方針とする。配置やvalidator名の変更、`semantic` → `static-semantic`等の具体的なrenameは#20で行う。現行`card-semantics.mjs`・`check-card-semantics.test.mjs`・`fixtures/cards/semantic/`の責任はStatic Semanticに限り、本Issueではファイル名・script名・配置を変更しない。

## Current state and future state

現在は**Specification & Formalizationから、対象SliceのAutomation & Executable Verificationへ移る境界**にある。Requirements、Example Mapping、Acceptance Specification、Rules / BPMN / Model、Card Schema、Structural / Static Semantic Check、Tooling testsがある。Engine Architectureは合意済み責任の設計であり、実行可能なEngineではない。

Domain Engine、Runtime Semantic Validation、Domain tests、Runner / Step Definitions / Executable Acceptanceは未実装である。全要求・Mechanicの形式化完了や、Playtest / Balance Validationの完了も宣言しない。

後続Catalog / Coverageで使う語彙は、対象範囲と根拠を伴って次のように読む。これは共通の意味の基準であり、網羅的なStatus modelやCoverage matrixの設計ではない。

| Term | Minimum evidence for the stated scope |
| --- | --- |
| Defined | 要求・目的・振る舞いの範囲と具体例が合意され、Questionや規範への参照を追跡できる |
| Formalized | 合意がAcceptance Specification、Rules / Process / Model、必要な機械可読契約へ具体化され、対応をレビューできる |
| Statically Verified | 対象Artifactへ適用できるCheckが成功している。Check名・入力範囲を伴い、自然言語の意味の証明とは扱わない |
| Automated | 対象の判断・処理を実行するDomain Engine実装がある。Toolingの自動実行だけではこの状態にしない |
| Executable Verified | 対象のDomain testsと接続済みExecutable Acceptanceが成功し、実Engineの観測結果を仕様へ追跡できる |

Featureの存在だけでExecutable Verifiedとはしない。部分実装や未接続例の表し方、個別Capabilityの判定・更新方法は#23で具体化し、repo全体へ一括の状態を付けない。

| Follow-up | Uses this strategy for |
| --- | --- |
| [#20 Test / Fixture structure](https://github.com/kjun1/card-game/issues/20) | Tooling / Domainの分離、Structural / Static Semantic fixtureの分類、validator・参照・CLI / CIの命名整合。検証意味は維持する |
| [#17 Markdown checker tests](https://github.com/kjun1/card-game/issues/17) | #20後にMarkdown checkerのTooling testsを追加。書式CheckとCheckerの振る舞いの確認を区別する |
| [#21 Decision Catalog](https://github.com/kjun1/card-game/issues/21) | Rule Evaluation / Runtime Validationで使う判断のInputs / Outputs、規範・BPMN・Acceptance参照と自動化状態を整理する |
| [#22 Capability / Process Catalog](https://github.com/kjun1/card-game/issues/22) | ゲーム上の仕事のActor / Trigger / OutcomeをProcess・要求・Acceptanceへ対応付け、対象範囲を定める |
| [#23 Automation Coverage](https://github.com/kjun1/card-game/issues/23) | #21 / #22を基に、Requirement → Decision / Rule → Process → Scenario → Engine → Executable Verificationを追跡し、仕様済み・未実装と実装済み・未接続を区別する |
| [#24 First Domain Automation Slice](https://github.com/kjun1/card-game/issues/24) | #19〜#23を踏まえ、[AC-BOARD-013の非Action Unit Deploy](model/domain-engine-architecture.md#first-vertical-slice)を最初に実Engineへ接続する。Cost・Zone・配置State・Operation完了・Event / Resultを観測し、対象範囲のCoverageを更新する |

今回の成果物は本Strategyと既存READMEの導線・用語整合である。Engine、Runner、Step Definitions、Executable Acceptance、Markdown checkerのunit test、Catalog / Coverageは後続で実装・作成する。`test/`・`scripts/`・fixtureの移動やrename、Card Pool / Balance / Playtest、Rule Interferenceの詳細設計は行わない。
