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
| GR-006 | TurnはActive Playerが制御権を持つ区間であり、Turn Start後に選択されたOperationが完了した時点でOpponentへ制御権を移さなければならない。 |
| GR-007 | Reaction等で選択中のOperationがCancelされた場合、そのTurnを終了せずActive PlayerへOperation選択権を戻さなければならない。 |
| GR-008 | Turn開始時にUnit状態、Energy、Drawを更新しなければならない。 |
| GR-009 | EnergyはCard / Abilityの基本利用量を制約するResourceとして機能しなければならない。 |
| GR-010 | Momentumは使用すると相手へ移転するResourceとして機能しなければならない。 |
| GR-011 | Cardは少なくともUnit、Support、Tacticの役割を表現できなければならない。 |
| GR-012 | HandとBoardは未コミット情報とコミット済み情報として区別されなければならない。 |
| GR-013 | Game開始時にOpening Handを配布し、各Playerが1回のMulliganを行えなければならない。 |
| GR-014 | Public情報とHidden情報をルール上区別できなければならない。 |

## Traceability

| Requirement | Primary downstream specification |
| --- | --- |
| GR-001〜003 | ../rules/core-rules.md |
| GR-004 | ../design/card-pool.md, ../rules/deck-rules.md |
| GR-005 | ../model/domain-model.md |
| GR-006〜008 | ../process/turn-flow.md |
| GR-009〜010 | ../rules/resource-rules.md |
| GR-011〜012 | ../model/card-model.md |
| GR-013 | ../rules/deck-rules.md |
| GR-014 | ../rules/core-rules.md |
