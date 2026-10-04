# Game Requirements

## Purpose

本作は、2人のPlayerが構築したDeckを用いて対戦し、Card・Resource・Board状態を管理しながら相手Coreを攻略するゲームを提供する。

## Scope

~~~text
Deck Construction
    ↓
Game Setup
    ↓
Mulligan
    ↓
Alternating Turns
    ↓
Operation / Interaction / Combat
    ↓
Victory / Defeat
~~~

## Requirements

| ID | Requirement |
| --- | --- |
| GR-001 | Gameは2人のPlayerによる1対1対戦として成立しなければならない。 |
| GR-002 | 相手Core HPを0以下にしたPlayerが勝利しなければならない。 |
| GR-003 | 必要なDrawを行えないPlayerは敗北しなければならない。 |
| GR-004 | PlayerはGame開始前にCard Poolの制約下でDeckを構築できなければならない。 |
| GR-005 | Gameは単一のBoardを使用し、Unit ZoneとSupport Zoneを区別しなければならない。 |
| GR-006 | Playerは交互にTurnを取得し、1 Turnにつき1 Operationを完了しなければならない。 |
| GR-007 | Turn開始時にUnit状態、Energy、Drawを更新しなければならない。 |
| GR-008 | Energyは通常のCard利用量を制約するResourceとして機能しなければならない。 |
| GR-009 | Momentumは使用すると相手へ移転するResourceとして機能しなければならない。 |
| GR-010 | Cardは少なくともUnit、Support、Tacticの役割を表現できなければならない。 |
| GR-011 | HandとBoardは未コミット情報とコミット済み情報として区別されなければならない。 |
| GR-012 | Game開始時にOpening Handを配布し、各Playerが1回のMulliganを行えなければならない。 |
| GR-013 | Public情報とHidden情報をルール上区別できなければならない。 |

## Traceability

| Requirement | Primary downstream specification |
| --- | --- |
| GR-001〜003 | ../rules/core-rules.md |
| GR-004 | ../design/card-pool.md, ../rules/deck-rules.md |
| GR-005 | ../model/domain-model.md |
| GR-006〜007 | ../process/turn-flow.md |
| GR-008〜009 | ../rules/resource-rules.md |
| GR-010〜011 | ../model/card-model.md |
| GR-012 | ../rules/deck-rules.md |
| GR-013 | ../rules/core-rules.md |
