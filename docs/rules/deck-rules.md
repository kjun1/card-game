# Deck Rules

## Parameters

| Parameter | Value |
| --- | ---: |
| Deck Size | 30 |
| Copies per Card Name | 3 |
| Opening Hand | 5 |
| Hand Limit | 7 |
| Unit Zone Capacity | 5 |
| Support Zone Capacity | 3 |

## Deck construction

Deckは現在のFormatおよびAccess Ruleを満たすCardから構築する。

同一NameのCardは1 Deckにつき最大3枚まで採用できる。

Pool Identity、Access Rule等の具体方式はCard Pool設計で定義する。

参照: ../design/card-pool.md

## First Player

First Playerはコイントスで決定する。

先攻・後攻に対する追加補正は設けない。

## Game setup

1. 各PlayerがDeckを準備する。
2. コイントスでFirst Playerを決定する。
3. 各Playerが自分のDeckをShuffleしてCardの順序をランダムにし、そのDeckからOpening Handとして5枚Drawする。
4. Mulliganを行う。
5. Core HPを初期化する。
6. Energy CapacityとEnergyを2に初期化する。
7. Momentumを各Player 3に初期化する。
8. Gameを開始する。

通常Setupでは各PlayerのUnit ZoneとSupport Zoneは空であり、Reaction Sourceを事前配置しない。

## Mulligan

各PlayerはGame開始時に1回だけMulliganできる。

1. Opening Handから0〜5枚を選択する。
2. 選択CardをDeck外へ一時退避する。
3. 同数をDeckからDrawする。
4. 両PlayerがMulliganを完了する。
5. 退避Cardを各自のDeckへ戻す。
6. DeckをShuffleする。

交換Cardを同じMulligan中に再び引くことはない。

Opponentへ知らせるのは交換枚数のみとする。選択したCardと退避中のCardの内容は公開しない。

## Draw and Hand Limit

Drawは1枚ずつ処理する。

Drawを要求された時点でDeckにCardが存在しない場合、そのPlayerの敗北を直ちに確定する。同じEffectに残りのDrawや別の処理があっても実行しない。既に成功したDrawや適用済みのCost・Effectは保持する。

同じEffectで両PlayerにDrawを要求する場合は、複数Playerへの逐次適用に共通する[Player order](../model/effect-resolution-model.md#player-order)に従い、Active Playerから処理する。ReactionのEffectでもSourceの所有Playerを優先しない。両Deckが空の状態で両者に1枚Drawを要求した場合、Active PlayerのDraw失敗で敗北が確定し、OpponentのDrawには進まない。

CardをDrawした結果Hand Limit 7を超えた場合、**そのDrawで得たCardを直ちにDiscardする**。

Hand内の別Cardを選択してDiscardすることはできない。

## Zone Capacity

Unit ZoneがCapacity 5に達している場合、追加のUnit Deployはできない。

Support ZoneがCapacity 3に達している場合、追加のSupport DeployおよびSetはできない。

Playerは基本ルールによって自分のBoard Card（Unit / Face-up Support / Set Card）を任意にDiscardしてZoneを空けることはできない。

Card Effect等による移動・Destroyは可能である。

## Information

Deck内容とHandはHidden情報である。

Set Cardは存在がPublic、内容がHiddenである。

Mulliganでは交換枚数だけをOpponentへ公開し、交換・退避Cardの内容は公開しない。

DiscardはOpponentへ枚数だけを公開する。所有Playerは自分のDiscardにある全Cardの内容を確認できる。未RevealのSet CardやHand超過によって移動したCardも同じ扱いとする。

これは現在の閲覧権限であり、以前公開されたCardについてPlayerが観測した情報を消すものではない。[Information Model](../model/information-model.md)に従って、現在の閲覧範囲と観測済みの知識を区別する。
