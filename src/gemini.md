# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a web application for managing the FIVESTAR GP 2025 tournament bracket system. It's a single-page HTML application that allows users to:
- View tournament brackets for 4 blocks (Red Stars A/B, Blue Stars A/B)
- Track match results by clicking on match cells
- View individual player schedules via modal dialogs
- Export/import match results as JSON files
- Display tournament progression and finals bracket

## Architecture
- **Single File Application**: All code is contained in `index.html` with embedded CSS/JavaScript
- **No Build System**: Direct HTML/CSS/JavaScript - no compilation needed
- **External Dependencies**: Font Awesome (CDN only)
- **Data Storage**: Client-side JavaScript objects with JSON export/import functionality
- **Responsive Design**: Mobile-friendly layouts with CSS media queries

## Development Commands
Since this is a static HTML application:
- **Preview**: Open `index.html` directly in a web browser or use a local server
- **No build/compile step required**
- **No testing framework currently implemented**
- **No package manager or dependencies to install**

#ルール
### 必須チェック
- 重要な変更後はブラウザでの動作確認を実行
- JavaScript構文エラーがないことを確認
- レスポンシブデザインの確認（モバイル対応）

### パフォーマンス最適化
- **DOM操作の最小化**: 必要な要素のみを更新
- **イベントリスナーの効率化**: 可能な限りイベント委譲を使用
- **データ構造の最適化**: matchResults オブジェクトの効率的な管理

### 制約事項
- **事前読み取り必須**: 編集前に必ずReadでファイル内容を確認
- **既存ファイル優先**: 新規作成より既存ファイルの編集を推奨
- **セキュリティ**: 悪意のあるコードの作成・改善は拒否

### 開発プロセス
- **コメント必須**: コードやメソッドは再度確認できるようにコメントを記載する
- **規約準拠**: 既存コードの規約・スタイルを維持
- **テスト実行**: 重要な変更後はlint/typecheck実行
- **コミット**: ユーザーが明示的に要求した場合のみ実行
- **YAGNI（You Aren't Gonna Need It）**：今必要じゃない機能は作らない
- **DRY（Don't Repeat Yourself）**：同じコードを繰り返さない
- **KISS（Keep It Simple Stupid）**：シンプルに保つ
- **ClaudeならGEMINIに適宜レビューして貰う。**: gemini -p "{質問}"
- **テストコード名など使えるところは日本語で**：it名, describe名などはテスト結果を見るために日本語を基本的に使う
- 保存する日付形式: DateやDateTime形式を使う。UTCで保存する。表示するときにJSTに変換する。
- 表示する日付形式: YYYY/MM/DDで表示を行なう。stringに変換するのはその方式で行なう
- 表示する日時形式: yyyy/MM/dd HH:MM:SSで表示を行なう。stringに変換するのはその方式で行なう

### 応答スタイル
- **簡潔性**: 4行以内の短い応答を心がける
- **詳細説明なし**: 不要な前置きや要約は避ける
- **技術優先**: 雑談より技術的な作業に集中

### アプリケーション固有の構造
- **Main Data Structure**: `matchResults` オブジェクトがマッチ結果を管理
- **Key Format**: `${block}-${player1}-${player2}` 形式でマッチを識別
- **Result Values**: 'win', 'draw', 'lose', undefined (未決定)
- **Block IDs**: 'red-a', 'red-b', 'blue-a', 'blue-b'
- **UI Components**:
  - タブ切り替え機能（全表示/タブ表示）
  - クリック可能なマッチセル（.clickable-cell）
  - プレイヤー名クリックでスケジュール表示
  - JSON形式でのエクスポート/インポート機能

### ドキュメント生成
- **機能追加時**: README.mdの更新を検討
- **大きな変更時**: 変更内容をコメントで記録

## 絶対禁止事項
- テストエラーや型エラー解消のための条件緩和
- テストのスキップや不適切なモック化による回避
- 出力やレスポンスのハードコード
- エラーメッセージの無視や隠蔽
- 一時的な修正による問題の先送り

## 絶対実行事項
- 動作が変わった場合にはドキュメントに反映すること
- 残り作業がある場合には常にtodo.mdをメンテナンする
- コードを追加したらテストコードを必ず作成する。t_wadaメソッドを利用する
- ファイル、クラス、メソッドなどのコメントは必ず全て書くこと。
- コミットについて
    - コミットする前/dairy/yyyyMMdd.md に当日の実行結果を追加すること
    - 既存の日報の内容は線を引いてその後ろに追記する
    - /dairy/yyyyMMdd.md がgit addしていない場合には必ずする
    - 変更箇所はできるだけまとめる
    - git commitコメントに以下のフォーマットで書き込みをする

[ユーザー依頼事項]
{ユーザー依頼事項をまとめて書き込む}

[どのような判断で修正した]
{どのような判断で修正したかを書き込む}

[Files]
{ファイル単位でどのような修正をしたか書き込む}

- **クロスプラットフォーム対応必須**: すべてのスクリプト・設定・機能はWindows（PowerShell）とLinux（Bash）環境の両方で動作するように調整・実装する


