# CNPSTORYS

CNPの経験を共有・評価するプラットフォーム

## 機能

- CNPの独自性価値を創造する
- ウォレット接続機能
- 経験登録・編集機能
- ページネーション機能
- リアルタイムスコア計算

## 使用方法

### コマンド一覧

- `connect-wallet` - MetaMaskウォレットを接続
- `check-cnp <id>` - 指定したCNPの所有状況を確認
- `show-cnp <id>` - CNPの詳細情報を表示
- `show-ranking` - トップ10のランキングを表示
- `register-exp <id> <title> <url> <type>` - 経験を登録
- `edit-cnp <id>` - CNP編集ページに移動
- `help` - コマンド一覧を表示

## 技術仕様

- **フロントエンド**: Vanilla JavaScript, HTML5, CSS3
- **API**: Alchemy NFT API
- **ウォレット**: MetaMask
- **データ保存**: localStorage（開発版）

## 今後の予定

- [ ] サーバーレスDB連携
- [ ] ランキングを決める採決機能実装
- [ ] SNS認証機能
- [ ] いいね機能の実装
- [ ] 多言語対応
- [ ] コミュニケーション機能

## ライセンス

CNPSTORYS
