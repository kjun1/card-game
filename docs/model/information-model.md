# Information Model

## Purpose

現在閲覧できる情報と、Playerが過去の観測から知っている情報を区別する。[GR-015・GR-020](../requirements/game-requirements.md#requirements)と[Information visibility](../rules/core-rules.md#information-visibility)に基づく。

| Concept | Responsibility |
| --- | --- |
| Current visibility | 現在のGame State・Zone・閲覧するPlayerに基づき、今確認できる内容を定める |
| Observed history | そのPlayerが公開情報や許可された閲覧から実際に観測した事実を表す |
| Player Knowledge | 観測して得た情報を扱う。現在の閲覧権限とは独立する |

## Current visibility

公開範囲は閲覧者ごとに判定する。Discardでは所有Playerが全Cardの内容を確認でき、Opponentへは枚数だけを公開する。OpponentはDiscard Zoneの内容を自由に閲覧できない。

未RevealのSet CardやHand超過で引いたCardも、Discardへの移動だけではOpponentへ内容を公開しない。これらのCardがGame内部で特定されていても、その情報をOpponentの観測情報に含めない。

## Player knowledge

Current visibilityが変わっても、過去に観測した事実は失われない。例えばBがAの公開UnitのNameやParameterを観測し、そのUnitのDestroyも観測した場合、Discardへの移動後も「そのUnitが公開されていた」「そのUnitがDestroyされた」という情報を持つ。

過去の観測は現在の閲覧権限を増やさない。Bが1枚の正体を知っていても、AのDiscard全体を閲覧したり、他の未観測Cardの内容を取得したりできるわけではない。一方、観測した事実からPlayerが推測することを、現在Hiddenであるという理由だけで否定しない。

観測したのがSet Cardの存在・移動・Discard枚数の変化だけなら、そのCardの未公開の内容をPlayer Knowledgeへ加えない。公開された情報と、そのPlayerに閲覧が許可された情報だけを観測の根拠とする。

## Example

| 状態 / 出来事 | Bの現在の閲覧範囲 | Bの観測済みの情報 |
| --- | --- | --- |
| AのUnitがPublic | そのUnitの公開情報を確認できる | 公開時のName・Parameterを観測する |
| そのUnitがDestroyされAのDiscardへ移動 | AのDiscardは枚数だけを確認できる | 公開時の情報と観測したDestroyの事実は残る |
| 未RevealのSet CardがAのDiscardへ移動 | Set Cardの移動とDiscard枚数の変化を確認できる | そのCardの内容は未観測のまま |

このモデルは観測履歴の保存方式、閲覧UI、知識の推論アルゴリズムを指定しない。過去の観測から、Hidden領域内の現在の個体・位置・順序を自動的に追跡できるという保証も追加しない。

対応する具体例は[Example Mapping](../acceptance/example-mapping.md)と[Board / Zone](../acceptance/board-zone.feature)を参照する。
