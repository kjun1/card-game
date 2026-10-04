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
3. 各PlayerがOpening Handとして5枚Drawする。
4. Mulliganを行う。
5. Core HPを初期化する。
6. Energy CapacityとEnergyを2に初期化する。
7. Momentumを各Player 3に初期化する。
8. Gameを開始する。

## Mulligan

各PlayerはGame開始時に1回だけMulliganできる。

1. Opening Handから0〜5枚を選択する。
2. 選択CardをDeck外へ一時退避する。
3. 同数をDeckからDrawする。
4. 両PlayerがMulliganを完了する。
5. 退避Cardを各自のDeckへ戻す。
6. DeckをShuffleする。

交換Cardを同じMulligan中に再び引くことはない。

## Draw and Hand Limit

Drawは1枚ずつ処理する。

Drawを要求された時点でDeckにCardが存在しない場合、そのPlayerは敗北する。

CardをDrawした結果Hand Limit 7を超えた場合、**そのDrawで得たCardを直ちにDiscardする**。

Hand内の別Cardを選択してDiscardすることはできない。

## Zone Capacity

Unit ZoneがCapacity 5に達している場合、追加のUnit Deployはできない。

Support ZoneがCapacity 3に達している場合、追加のSupport DeployおよびSetはできない。

Playerは基本ルールによって自分のUnit / Supportを任意にDiscardしてZoneを空けることはできない。

Card Effect等による移動・Destroyは可能である。

## Information

Deck内容とHandはHidden情報である。

Set Cardは存在がPublic、内容がHiddenである。
