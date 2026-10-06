# Documentation

ゲームの要求・仕様・設計と受入仕様の索引。プロジェクトの概要と検証コマンドは[ルートREADME](../README.md)を参照する。

## Responsibility

| Layer | Responsibility |
| --- | --- |
| requirements | ゲームが何を満たす必要があるか |
| acceptance | Example Mappingで要求の疑問を解消し、Gherkinで具体的な振る舞いを表す |
| process | 主体間の処理順・制御移譲 |
| rules | 現在有効な規範的ルール |
| model | 概念、関係、状態、データ構造 |
| design | 実現方式の設計空間、仮説、検証軸 |
| schemas | 合意済み概念の機械可読な構造契約。ゲーム動作の意味論はRules / Modelを参照 |

具体例を使って要求と仕様を検討し、合意した内容をrequirements・process・rules・modelへ反映する。処理順の正本はBPMN、規範的ルールはrulesとし、Gherkinから未合意のルールを暗黙に追加しない。

## Change policy

1. 要求・変更案を整理し、対象のCapabilityと既存仕様を確認する。
2. Example MappingでRule・Example・Questionを整理し、正常例・境界例・拒否される例から仕様の疑問を見つける。
3. Questionを解消する。議論はGitHub Issuesで管理し、合意した結論と根拠をExample Mappingへ反映する。
4. 合意した具体例をGherkinにし、要求タグとScenario IDを付ける。
5. 要求・BPMN・process Markdown・Rules・Modelへ合意内容を反映する。数値やCard Pool方式を変える場合はDesignも更新し、関連するルールと整合させる。
6. 具体例と規範文書をレビューし、仕様CIを通す。
7. Card Schemaで静的定義を構造化し、構造検証と静的意味検証を行う。ゲーム実装の段階で同じFeatureをStep DefinitionsによりDomain Engineへ接続する。受入テストを通してからPlaytestで検証する。

現在は仕様検証に加え、手順7の前段として[Card Definition Schema](model/card-definition-schema.md)による構造検証と、参照Scope・ID一意性・型互換性の静的意味検証を行う。Runtimeの状態・支払い・Timing・Visibility・勝敗を扱うDomain Engineとゲーム動作を実行する受入テストは未実装。[受入仕様の作成・検証方法](acceptance/README.md)を参照する。検討履歴・却下案・未決事項の議論は仕様本文へ混ぜず、GitHub Issuesで管理する。

## Process notation

`docs/process/bpmn/*.bpmn` をBPMN 2.0の機械可読なProcess正本とする。

各 `docs/process/*.md` のMermaid図はレビュー用プレビューであり、説明・ルール参照と併用する。

## Requirements

- [Game requirements](requirements/game-requirements.md)
- [Interaction requirements](requirements/interaction-requirements.md)
- [Play-experience requirements](requirements/play-experience-requirements.md)

## Acceptance

- [Acceptance specifications and checks](acceptance/README.md)
- [Example Mapping](acceptance/example-mapping.md)
- [Turn](acceptance/turn.feature)
- [Action / Reaction](acceptance/action-reaction.feature)
- [Attack](acceptance/attack.feature)
- [Setup / Mulligan](acceptance/setup-mulligan.feature)
- [Resource](acceptance/resource.feature)
- [Board / Zone](acceptance/board-zone.feature)
- [Deck / Draw / Hand](acceptance/deck.feature)
- [Effect Resolution](acceptance/effect-resolution.feature)
- [Target Selection](acceptance/target-selection.feature)

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
- [Domain Engine Architecture](model/domain-engine-architecture.md)
- [Card model](model/card-model.md)
- [Card Definition Schema](model/card-definition-schema.md) / [JSON Schema](../schemas/card.schema.json) / [Fixture mapping](../test/fixtures/cards/README.md)
- [State model](model/state-model.md)
- [Effect Resolution model](model/effect-resolution-model.md)
- [Information model](model/information-model.md)

## Design

- [Card-pool architecture](design/card-pool.md)
- [Balance model](design/balance-model.md)

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
│  ├─ domain-engine-architecture.md
│  ├─ card-model.md
│  ├─ card-definition-schema.md
│  ├─ state-model.md
│  ├─ effect-resolution-model.md
│  └─ information-model.md
├─ design/
│  ├─ card-pool.md
│  └─ balance-model.md
└─ acceptance/
   ├─ README.md
   ├─ example-mapping.md
   ├─ turn.feature
   ├─ action-reaction.feature
   ├─ attack.feature
   ├─ setup-mulligan.feature
   ├─ resource.feature
   ├─ board-zone.feature
   ├─ deck.feature
   ├─ effect-resolution.feature
   └─ target-selection.feature
~~~
