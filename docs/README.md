# Documentation

このディレクトリは、**現在の仕様**と**設計上の概念モデル**を分離して管理する。

## Structure

### `rules/`

プレイヤーまたは実装が従う規範的なルール。

- [core-rules.md](rules/core-rules.md) — ゲーム開始から終了までのコアルール

ここには検討履歴、比較調査、却下案を書かない。

### `design/`

ルールを成立させる概念・責任・データモデル。

- [system-model.md](design/system-model.md) — 用語階層、責任、相互作用モデル
- [card-pool.md](design/card-pool.md) — Card Pool / Deck Constructionの概念設計

## Change policy

- ルール変更時は、まず `rules/` の整合性を更新する。
- 概念や責任境界が変わる場合のみ `design/` も更新する。
- 未決事項、代替案、調査結果、意思決定の経緯はGitHub Issuesへ分離する。
- 仕様本文では「以前は〜」「検討中に〜」などの履歴説明を行わない。
