# Documentation

## Structure

~~~text
docs/
├─ requirements/
│  ├─ game-requirements.md
│  ├─ interaction-requirements.md
│  └─ play-experience-requirements.md
├─ process/
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
└─ design/
   ├─ card-pool.md
   └─ balance-model.md
~~~

## Responsibility

| Layer | Responsibility |
| --- | --- |
| requirements | ゲームが何を満たす必要があるか |
| process | 主体間の処理順・制御移譲 |
| rules | 現在有効な規範的ルール |
| model | 概念、関係、状態、データ構造 |
| design | 実現方式の設計空間、仮説、検証軸 |

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

## Requirements
- [Game requirements](requirements/game-requirements.md)
- [Interaction requirements](requirements/interaction-requirements.md)
- [Play-experience requirements](requirements/play-experience-requirements.md)

## Process
- [Game flow](process/game-flow.md)
- [Turn flow](process/turn-flow.md)
- [Action / Reaction flow](process/action-reaction-flow.md)
- [Attack flow](process/attack-flow.md)

Process文書ではBPMNの考え方に合わせてParticipant / Task / Gateway / Eventを明示し、図はGitHub上で読めるようMermaidで表現する。

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

## Change policy

- 要求変更はrequirementsから反映する。
- 処理順変更はprocessとrulesを整合させる。
- 用語、責任、状態構造変更はmodelを更新する。
- 数値やCard Pool方式など実現方式の変更はdesignからrulesへの影響を確認する。
- 検討経緯や未決事項はGitHub Issuesへ分離する。
