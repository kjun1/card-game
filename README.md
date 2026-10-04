# card-game

1対1の対戦型カードゲームの要求・ルール・モデル・設計・受入仕様を管理するリポジトリ。

現在は仕様とその検証環境を整備している。ゲーム実装と、ゲーム動作を実行する受入テストは未実装。

## Core concept

- 単一盤面で Unit / Support / Tactic を運用する。
- Turn は Active Player が制御権を持つ区間であり、Turn Startから1つのOperationが完了するか、Gameが終了するまで続く。
- Operation は Active Player がTurn中に選択する主操作であり、完了後もGameが継続する場合は相手へ制御権が移る。
- Action と定義された Operation だけが Reaction Window を発生させる。
- Attack は常にActionであり、その他はCardの当該操作・AbilityにAction指定がある場合だけActionとなる。
- Reaction は原則として事前に Board へコミットされた Card / Ability から行う。
- ReactionでActionがCancelされた場合、そのOperationは完了していないため、Gameが継続する場合は同じTurnでOperationを選択し直す。
- Cancelそのものでは手札Cardを移動させず、未払いEnergyを消費しない。Reactionによる状態変更は保持する。
- Attack はReactionが使用されなかった場合だけBlock StepとCombatへ進む。
- Energy は自分のTurn Startで回復し、次の自分Turn StartまでCard / Abilityの基本Costに使用する。
- Momentum は追加能力や Block に使用し、使用した分が相手へ移転する。

## Documentation

文書の役割と全体の索引は[Documentation index](docs/README.md)を参照する。

| 読む目的 | 入口 |
| --- | --- |
| ゲームが満たす要求を知る | [Game requirements](docs/requirements/game-requirements.md) |
| 現在のルールを読む | [Core rules](docs/rules/core-rules.md) |
| 処理順と制御権の移動を確認する | [BPMN processes](docs/process/bpmn/README.md) |
| 用語と概念の関係を確認する | [Domain model](docs/model/domain-model.md) |
| Cardの機械可読な静的定義を記述する | [Card Definition Schema](docs/model/card-definition-schema.md) |
| 具体例から仕様を検討する | [Acceptance specifications](docs/acceptance/README.md) |
| Card Poolの設計を検討する | [Card-pool architecture](docs/design/card-pool.md) |

## Documentation policy

仕様変更は、要求・変更案を起点にExample Mappingで疑問を解消し、Gherkinへ具体化してから要求・BPMN・Rules・Modelへ合意内容を反映する。[変更手順](docs/README.md#change-policy)に従って仕様を揃え、仕様CIを通してから実装へ進む。

検討履歴、却下案、未決事項の議論はGitHub Issuesで管理する。

## Specification checks

リポジトリのルートでNode.js 24系とnpmを使用する。nvmを使う場合は、初回に`nvm install`、作業開始時に`nvm use`で`.nvmrc`のバージョンへ切り替える。

~~~sh
npm ci
npm test
npm run check:spec
npm run check:cards
~~~

`npm test`は仕様・Card検証器をテストする。`check:spec`はGherkin構文・要求参照・Scenario IDを、`check:cards`はJSON Schema自体とvalid / invalid fixtureの構造契約を検証する。ゲーム動作を実行する受入テストは後続で接続する。

## License

Copyright (c) 2026 kjun1. All rights reserved.

本リポジトリに含まれるkjun1が著作権を有する文書・図・コードなどについて、営利・非営利を問わず、利用・複製・改変・再配布を許可するライセンスは付与していません。[LICENSE](LICENSE)には定型の著作権表示を記載しています。これはGitHubが案内する[No License（利用許諾なし）](https://choosealicense.com/no-permission/)の方針です。

法令上認められる利用、既存の個別許諾、第三者ライセンスに基づく利用、および[GitHub利用規約](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service#d-user-generated-content)上の権利は別途認められます。Publicとして公開した場合、GitHub上での閲覧・forkは制限できず、著作権表示はコピーを技術的に防止するものではありません。
