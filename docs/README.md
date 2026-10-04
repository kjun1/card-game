# Documentation

## Structure

~~~text
docs/
├─ requirements/
│  ├─ game-requirements.md
│  ├─ interaction-requirements.md
│  └─ play-experience-requirements.md
├─ process/
│  ├─ bpmn/
│  │  ├─ game-flow.bpmn
│  │  ├─ turn-flow.bpmn
│  │  ├─ action-reaction-flow.bpmn
│  │  └─ attack-flow.bpmn
│  ├─ game-flow.md
│  ├─ turn-flow.md
│  ├─ action-reaction-flow.md
│  └─ attack-flow.md
├─ rules/
│  ├─ core-rules.md
│  ├─ resource-rules.md
│  ├─ combat-rules.md
│  └─ deck-rules.md
├─ model/
│  ├─ domain-model.md
│  ├─ card-model.md
│  └─ state-model.md
├─ design/
│  ├─ card-pool.md
│  └─ balance-model.md
└─ acceptance/
   ├─ README.md
   ├─ example-mapping.md
   ├─ turn.feature
   ├─ action-reaction.feature
   └─ attack.feature
~~~

## Responsibility

| Layer | Responsibility |
| --- | --- |
| requirements | ゲームが何を満たす必要があるか |
| process | 主体間の処理順・制御移譲 |
| rules | 現在有効な規範的ルール |
| model | 概念、関係、状態、データ構造 |
| design | 実現方式の設計空間、仮説、検証軸 |
| acceptance | 要求・ルールを具体例で表すExample MappingとGherkin |

依存方向は原則として次を保つ。

~~~text
Requirements
    ↓
Process / Rules
    ↓
Model
    ↓
Card / Balance Design
~~~

acceptanceは各層の仕様を具体例で照合する。処理順の正本はBPMN、規範的ルールはrulesとし、Gherkinから未定義のルールを暗黙に追加しない。

## Process notation

`docs/process/bpmn/*.bpmn` をBPMN 2.0の機械可読なProcess正本とする。

各 `docs/process/*.md` のMermaid図はレビュー用プレビューであり、説明・ルール参照と併用する。

## Requirements
- [Game requirements](requirements/game-requirements.md)
- [Interaction requirements](requirements/interaction-requirements.md)
- [Play-experience requirements](requirements/play-experience-requirements.md)

## Process
- [Game flow](process/game-flow.md)
- [Turn flow](process/turn-flow.md)
- [Action / Reaction flow](process/action-reaction-flow.md)
- [Attack flow](process/attack-flow.md)
- [BPMN 2.0 models](process/bpmn/README.md)

## Rules
- [Core rules](rules/core-rules.md)
- [Resource rules](rules/resource-rules.md)
- [Combat rules](rules/combat-rules.md)
- [Deck rules](rules/deck-rules.md)

## Model
- [Domain model](model/domain-model.md)
- [Card model](model/card-model.md)
- [State model](model/state-model.md)

## Design
- [Card-pool architecture](design/card-pool.md)
- [Balance model](design/balance-model.md)

## Acceptance

- [Acceptance specifications and checks](acceptance/README.md)
- [Example Mapping](acceptance/example-mapping.md)
- [Turn](acceptance/turn.feature)
- [Action / Reaction](acceptance/action-reaction.feature)
- [Attack](acceptance/attack.feature)

## Change policy

- 要求変更はrequirementsから反映する。
- Example MappingでRule・Example・Questionを整理し、Questionを解消してからGherkinを作成する。解決済みの結論と根拠をExample Mappingへ反映する。
- 処理順変更はBPMNとprocess Markdownを更新し、rulesとの整合性を確認する。
- 用語、責任、状態構造変更はmodelを更新する。
- 数値やCard Pool方式など実現方式の変更はdesignからrulesへの影響を確認する。
- 変更に対応する受入仕様を更新し、仕様CIを通してからCard Schema・ゲーム実装へ進む。将来は同じFeatureをDomain Engineに接続し、受入テストとPlaytestで検証する。
- 検討経緯や未決事項はGitHub Issuesへ分離する。
