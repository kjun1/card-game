# Deck Rules

## Provisional parameters

| Parameter | Value |
| --- | ---: |
| Deck Size | 30 |
| Opening Hand | 5 |
| Hand Limit | 7 |
| Unit Zone Capacity | 5 |
| Support Zone Capacity | 3 |

## Deck construction

Deckは現在のFormatおよびAccess Ruleを満たすCardから構築する。

Pool Identity、Access Rule、同名Card上限等の具体方式はCard Pool設計で定義する。

参照: ../design/card-pool.md

## Game setup

1. 各PlayerがDeckを準備する。
2. First Playerを決定する。
3. 各PlayerがOpening Handとして5枚Drawする。
4. Mulliganを行う。
5. Core HP、Energy Capacity、Energy、Momentumを初期化する。
6. Gameを開始する。

## Mulligan

各PlayerはGame開始時に1回だけMulliganできる。

1. Opening Handから0〜5枚を選択する。
2. 選択CardをDeck外へ一時退避する。
3. 同数をDeckからDrawする。
4. 両PlayerがMulliganを完了する。
5. 退避Cardを各自のDeckへ戻す。
6. DeckをShuffleする。

交換Cardを同じMulligan中に再び引くことはない。

## Draw and Deck Out

Drawを要求された時点でDeckにCardが存在しない場合、そのPlayerは敗北する。

## Information

Deck内容とHandはHidden情報である。

Set Cardは存在がPublic、内容がHiddenである。
