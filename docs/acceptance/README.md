# Acceptance specifications

要求・変更案を具体例で検討し、実装前に仕様の疑問を解消するためのExample MappingとGherkinを管理する。現在はGherkinの構文・要求参照・Scenario IDを検証する。ゲーム動作を実行する受入テストはまだない。

## Files

| File | 内容 |
| --- | --- |
| [Example Mapping](example-mapping.md) | Capability → Rule → Example、要求・根拠・Scenario IDの対応、解決済み・未解決のQuestion |
| [Turn](turn.feature) | Turn Start、Operation完了・再選択、Game終了優先 |
| [Action / Reaction](action-reaction.feature) | 操作別Action指定、検証、Cost、取消と再宣言 |
| [Attack](attack.feature) | 攻撃資格、Reaction、Block、Commit、Damage・Destroy |
| [Setup / Mulligan](setup-mulligan.feature) | 先攻決定、Opening前のShuffle、交換対象の退避、両者完了後の返却・Shuffle、交換枚数の公開 |
| [Resource](resource.feature) | SetupとTurn StartのEnergy、Operation / Reactionの共通予算、Momentum移転とCost不足 |
| [Board / Zone](board-zone.feature) | Zone Capacity、SupportとSetの共有、任意Discard禁止、公開範囲と観測済みの情報 |
| [Deck / Draw / Hand](deck.feature) | Deck構築の枚数制限、逐次Draw、Hand超過、Deck切れでの即時終了、両者Drawの先後、Hidden情報 |
| [Effect Resolution](effect-resolution.feature) | 順序付きEffectStep、SimultaneousGroup、勝敗確定後の停止、複数Playerへの共通の逐次適用順 |

要求定義は[Game](../requirements/game-requirements.md)、[Interaction](../requirements/interaction-requirements.md)、[Play-experience](../requirements/play-experience-requirements.md)を参照する。Gherkinは規範文書を具体例で表すものであり、新しいルールやCard Poolを独立して定義しない。

## Authoring

1. 要求・変更案から対象のCapabilityを選び、既存のRules・Process・Modelを確認する。
2. Example MappingにRule・Example・Questionを整理する。具体的なResource値・Zone・Unit状態を使い、正常例・境界例・拒否される例から疑問を見つける。
3. Questionを既存仕様と照合し、解決した結論と根拠をExample Mappingへ反映する。一意に解決できないQuestionも同Mappingへ明示し、その結論に依存する期待結果はGherkin化しない。議論・合意はGitHub Issuesで管理する。
4. 合意した具体例をScenario / Scenario Outlineにし、要求タグと一意なScenario IDを直接付ける。
5. 要求・BPMN・Rules・Modelなどの規範文書へ合意内容を反映し、Featureと照合して仕様検証を行う。

全体の開発手順は[Change policy](../README.md#change-policy)を参照する。

### Gherkin conventions

Gherkinのキーワードは英語、説明・本文は日本語とする。`Given`は初期状態、`When`はPlayerの選択やゲームイベント、`Then`は外部から確かめられる結果を表す。BPMN内部のTask名やUIのクリック手順をStepにしない。宣言・応答・解決の途中を確認する例では、`When` / `Then`を複数回使う。

各FeatureのBackgroundは共通の対戦状態だけを記述する。この受入仕様では、ScenarioのGivenで指定した値をfixtureの最終値とする。Card名やAbilityは例のためのfixtureであり、製品Cardの追加やCard Schemaの決定ではない。各例で挙げたCost・Effect以外の追加能力・Triggerは持たず、省略した前提は合法で当該結果へ影響しないものとする。

「Action Tactic」は**Play操作にAction指定があるTactic**の略称であり、Card全体をActionに分類する語ではない。Setなど他の操作への指定は含まない。「Action Ability」も当該AbilityにAction指定があることだけを表す。

### Observation points

観測時点は宣言後・選択待ち・解決直後の各段階で区切る。Operation解決後のCost・Unit状態・Damageは、**次のPlayerのTurn Start更新が入る前**の結果として確認する。Game終了判定・Operation完了・制御権移転もそれぞれの記述に従って確認し、次のTurn StartによるReady化・Attack制限解除・Energy回復・Drawへは、Scenarioでその開始を明示した場合に進む。これは例が観測する境界の約束であり、ゲームに新しい停止操作やPassを追加するものではない。

複数部分からなるEffectでは中間結果も観測する。勝敗条件が成立した時点で結果を固定し、残りのEffectへ進まない。真に同時の処理によるDrawと、逐次処理の途中での勝敗確定を区別する。既存例の解決済みOperationの完了・Reactionによる取消の記録は、その後のEffect実行を意味しない。

`Scenario Outline`の各行は独立した初期状態から実行する例として読む。例えばAction分類の表では、選んだCard Typeと操作に適合したSource・Zone・Targetを用意する。まだStep Definitionsはなく、文言は実装言語やゲームAPIを規定しない。

## Tags and traceability

~~~gherkin
@IR-005 @IR-006 @IR-007 @IR-008 @IR-020 @AC-AR-012
Scenario: Cancel後の手札保持を確認する
  Given AのTurnで両PlayerのCore HPは10、Energyは3である
  And AがHandのEnergy 2のAction Tactic「火矢」を宣言している
  And BのBoardのReaction「迎撃」はEnergy 1でAのCoreに1 Damageを与える
  When Bが「迎撃」を使用する
  Then 「火矢」はCancelされOperationは未完了になる
  And 「火矢」はAのHandに残りAのEnergyは3のままである
  And BのEnergyは2になりAのCore HPは9になる
  And Gameは継続しAは同じTurnでOperationを選び直せる
~~~

- 要求タグは`@GR-001`、`@IR-001`、`@PER-001`形式で、要求定義表に存在するIDを1つ以上付ける。
- Scenario IDは`@AC-<CAPABILITY>-NNN`形式とする。Capability名は英大文字で始め、以降は英大文字・数字・ハイフンを使用できる。番号は001〜999の3桁とする。既存の`@AC-TURN-001`、`@AC-AR-001`、`@AC-ATK-001`に加え、`@AC-DECK-001`、`@AC-MULLIGAN-001`、`@AC-RESOURCE-001`などを検証器の変更なしで追加できる。
- 全Featureで一意なScenario IDをちょうど1つ付け、既存例の意味を保つ変更ではIDを維持する。同じ番号でもCapability名が異なれば別のIDになる。
- 要求タグとScenario IDは各Scenario / Scenario Outlineの直前に直接付ける。Feature・Rule・Examplesからの継承では代用しない。
- Outlineの行ごとにはScenario IDを付けない。複数のExamples表・行は同じScenario IDの例に属する。
- 各Scenario / Outline自身に`Then`を含める。OutlineのExamplesには見出しと1行以上のデータが必要で、本文の置換変数を列で定義する。
- 要求タグは追跡の入口である。例えば`IR-011`自体はAttackのAction分類を要求し、Damage計算などの細則は[Combat Rules](../rules/combat-rules.md)にある。細則の根拠はExample MappingのRule参照で示す。

要求変更時は要求定義・Rules・Model・Processと対応する例を合わせて更新する。全要求の網羅を合格条件にせず、各Capabilityの合意済みの範囲を例にする。未解決QuestionやCard Poolの具体方式を、Featureの追加によって暗黙に確定しない。複数Capabilityに関わる既存例はExample Mappingから参照し、意味を保つ限り既存IDを維持する。

## Local validation and CI

リポジトリのルートでNode.js 24系とnpmを使用する。`.nvmrc`と`package.json`の`engines.node`がバージョン指定の根拠であり、GitHub Actionsも`.nvmrc`を参照する。

~~~sh
nvm install
nvm use
npm ci
npm test
npm run check:spec
npm run check:cards
~~~

`nvm`以外のバージョン管理を使う場合もNode.js 24系へ切り替えてからnpmのコマンドを実行する。

`npm test`はNode標準テスト機能による**仕様・Card検証器のテスト**。`npm run check:spec`は公式の`@cucumber/gherkin`と`@cucumber/messages`で全Featureを解析・展開し、構文、空のFeature、Thenの有無、Outlineの実例、要求タグの形式・存在・欠落、Scenario IDの形式・欠落・重複、要求定義の重複を検証する。違反はファイルと行番号付きで報告し非ゼロで終了する。

`npm run check:cards`は[Card Definition Schema](../model/card-definition-schema.md)の自己検証、valid fixtureの成功、invalid fixtureの想定した拒否を確認する。既存AcceptanceのCardを静的定義として表す範囲は[Fixture mapping](../../test/fixtures/cards/README.md)で追跡する。Gherkinの初期状態や結果をSchemaへ埋め込まず、Scenarioごとの指定値を保つ。

GitHub Actionsはpush / pull_requestで`npm ci`、`npm test`、`npm run check:spec`、`npm run check:cards`を実行する。依存は`package-lock.json`で固定する。

**CI成功は仕様検証の成功を意味する。** 日本語の意味、計算結果、ルール同士の整合性は自動判定しない。Example Mappingと規範文書を照合するレビューを併用する。BPMN・文書リンクの継続的CI、要求対応表の自動生成は今回の範囲に含めない。

## Future execution

ゲーム実装時にCucumber RunnerとStep Definitionsを追加し、同じFeatureをDomain Engineへ直接接続する。`Given`でfixture Stateを構成し、`When`でドメイン操作を渡し、`Then`でState・利用可能な選択・発生イベントを検証する。UI操作を経由せずにルールを検証できる形にする。

静的なCard Definitionは[JSON Schema](../../schemas/card.schema.json)で先に構造化する。実装のAPI、定義内の参照解決、Stateへの束縛と意味検証は後続で定義する。現段階ではRunner・Step Definitions・ゲーム実装を追加せず、仕様とCardの構造検証を、将来のゲーム動作の受入テストとコマンド・出力上も区別する。
