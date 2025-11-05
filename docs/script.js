// トーナメントデータ定義
const tournamentData = {
    'red-goddesses': {
        title: 'RED GODDESSES',
        teams: [
            '刀羅ナツコ&琉悪夏',
            'なつぱい&安納サオリ',
            '水森由菜&星来芽依',
            '妃南&八神蘭奈',
            '月山和香&梨杏',
            'ボジラ&鉄アキラ',
            '葉月&コグマ',
            'Sareee&叶ミク'
        ],
        matches: [
            // [team1_index, team2_index, date, venue]
            [0, 1, '11.24', 'いわき'],
            [0, 2, '11.26', '神田明神'],
            [0, 3, '11.7', '後楽園'],
            [0, 4, '11.16', '札幌'],
            [0, 5, '11.23', '郡山'],
            [0, 6, '11.28', '京都'],
            [0, 7, '11.12', '仙台'],
            [1, 2, '11.12', '仙台'],
            [1, 3, '11.8', '群馬'],
            [1, 4, '11.23', '郡山'],
            [1, 5, '11.26', '神田明神'],
            [1, 6, '11.7', '後楽園'],
            [1, 7, '11.28', '京都'],
            [2, 3, '11.16', '札幌'],
            [2, 4, '11.13', '八戸'],
            [2, 5, '11.9', '松本'],
            [2, 6, '11.15', '札幌'],
            [2, 7, '11.7', '後楽園'],
            [3, 4, '11.15', '札幌'],
            [3, 5, '11.24', 'いわき'],
            [3, 6, '11.23', '郡山'],
            [3, 7, '11.9', '松本'],
            [4, 5, '11.28', '京都'],
            [4, 6, '11.9', '松本'],
            [4, 7, '11.8', '群馬'],
            [5, 6, '11.8', '群馬'],
            [5, 7, '11.13', '八戸'],
            [6, 7, '11.26', '神田明神']
        ],
        restDays: [
            // [team_index, date, venue]
        ]
    },
    'blue-goddesses': {
        title: 'BLUE GODDESSES',
        teams: [
            '飯田沙耶&ビー・プレストリー',
            'さくらあや&玖麗さやか',
            '朱里&鹿島沙希',
            '壮麗亜美&レディ・C',
            'HANAKO&X',
            'AZM&天咲光由',
            '鈴季すず&山下りな',
            '小波&吏南'
        ],
        matches: [
            [0, 1, '11.24', 'いわき'],
            [0, 2, '11.8', '群馬'],
            [0, 3, '11.12', '仙台'],
            [0, 4, '11.16', '札幌'],
            [0, 5, '11.7', '後楽園'],
            [0, 6, '11.15', '札幌'],
            [0, 7, '11.23', '郡山'],
            [1, 2, '11.26', '神田明神'],
            [1, 3, '11.15', '札幌'],
            [1, 4, '11.8', '群馬'],
            [1, 5, '11.28', '京都'],
            [1, 6, '11.13', '八戸'],
            [1, 7, '11.7', '後楽園'],
            [2, 3, '11.23', '郡山'],
            [2, 4, '11.28', '京都'],
            [2, 5, '11.9', '松本'],
            [2, 6, '11.7', '後楽園'],
            [2, 7, '11.12', '仙台'],
            [3, 4, '11.9', '松本'],
            [3, 5, '11.26', '神田明神'],
            [3, 6, '11.24', 'いわき'],
            [3, 7, '11.16', '札幌'],
            [4, 5, '11.24', 'いわき'],
            [4, 6, '11.26', '神田明神'],
            [4, 7, '11.15', '札幌'],
            [5, 6, '11.8', '群馬'],
            [5, 7, '11.13', '八戸'],
            [6, 7, '11.28', '京都']
        ],
        restDays: []
    }
};

// グローバルなmatchResultsオブジェクト
let matchResults = {};
let confirmedResults = {}; // 確定済み結果
let predictedResults = {}; // 予想結果（確定データとは別管理）
const blocks = ['red-goddesses', 'blue-goddesses'];

// 選手名の正規化（吏南と更南を同じとして扱う）
function normalizePlayerName(name) {
    // 名前の正規化マッピング
    const nameMapping = {
        '更南': '吏南'
        // 必要に応じて他の選手名のマッピングを追加
    };
    
    return nameMapping[name] || name;
}

// result.jsonの読み込み
async function loadConfirmedResults() {
    try {
        const response = await fetch('result.json');
        if (response.ok) {
            const data = await response.json();
            // データが直接のマッチ結果オブジェクトか、confirmed形式かを判定
            const rawConfirmedResults = data.confirmed || data;
            
            // 選手名を正規化してキーを変換
            confirmedResults = {};
            Object.keys(rawConfirmedResults).forEach(key => {
                const normalizedKey = normalizeMatchKey(key);
                
                // 既存のキーと重複チェック
                if (confirmedResults[normalizedKey] && confirmedResults[normalizedKey] !== rawConfirmedResults[key]) {
                    console.warn(`キーの重複検出: ${normalizedKey}, 既存値: ${confirmedResults[normalizedKey]}, 新値: ${rawConfirmedResults[key]}`);
                }
                
                confirmedResults[normalizedKey] = rawConfirmedResults[key];
                if (key !== normalizedKey) {
                    console.log(`キー正規化: ${key} -> ${normalizedKey}`);
                }
            });
            
            console.log('=== データ読み込み統計 ===');
            console.log('元のデータ件数:', Object.keys(rawConfirmedResults).length + '件');
            console.log('正規化後データ件数:', Object.keys(confirmedResults).length + '件');
            console.log('データ削減率:', ((Object.keys(rawConfirmedResults).length - Object.keys(confirmedResults).length) / Object.keys(rawConfirmedResults).length * 100).toFixed(1) + '%');
            console.log('確定データを読み込みました:', Object.keys(confirmedResults).length + '件');
            // matchResultsは確定データと予想データをマージ（確定データ優先）
            matchResults = { ...predictedResults, ...confirmedResults };
        } else {
            console.log('result.jsonが見つかりません。確定データなしで開始します。');
        }
    } catch (error) {
        console.log('result.jsonの読み込みに失敗しました:', error.message);
    }
}

// マッチキーの正規化（選手名を正規化）
function normalizeMatchKey(key) {
    // トーナメントキーの場合はそのまま処理
    if (key.startsWith('tournament-')) {
        return key;
    }
    
    // ブロック名を取得（red-a, red-b, blue-a, blue-b）
    let remainingKey = key;
    let block = '';
    
    for (const blockName of blocks) {
        if (remainingKey.startsWith(blockName + '-')) {
            block = blockName;
            remainingKey = remainingKey.substring(blockName.length + 1);
            break;
        }
    }
    
    if (!block) {
        console.warn('不明なブロック名:', key);
        return key;
    }
    
    // 残りの部分から選手名を抽出（最後の-で分割）
    const lastDashIndex = remainingKey.lastIndexOf('-');
    if (lastDashIndex === -1) {
        console.warn('選手名の分割に失敗:', key);
        return key;
    }
    
    const player1 = normalizePlayerName(remainingKey.substring(0, lastDashIndex));
    const player2 = normalizePlayerName(remainingKey.substring(lastDashIndex + 1));
    
    return `${block}-${player1}-${player2}`;
}

function showAllContent() {
    document.querySelectorAll('.content').forEach(content => content.classList.remove('hidden'));
    document.getElementById('tabs').style.display = 'none';
    document.querySelectorAll('.toggle-button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

function showTabView() {
    document.getElementById('tabs').style.display = 'flex';
    document.querySelectorAll('.content').forEach(content => content.classList.add('hidden'));
    document.getElementById('red-a').classList.remove('hidden');
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector('.tab').classList.add('active');
    document.querySelectorAll('.toggle-button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

function showContent(contentId) {
    document.querySelectorAll('.content').forEach(content => content.classList.add('hidden'));
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(contentId).classList.remove('hidden');
    event.target.classList.add('active');
}

function toggleMatchResult(cell) {
    const predictedResultDiv = cell.querySelector('.predicted-result');
    const confirmedResultDiv = cell.querySelector('.confirmed-result');
    const player1 = normalizePlayerName(cell.dataset.player1);
    const player2 = normalizePlayerName(cell.dataset.player2);
    const block = cell.dataset.block;
    const matchKey = `${block}-${player1}-${player2}`;
    const reverseKey = `${block}-${player2}-${player1}`;

    console.log('=== toggleMatchResult ===');
    console.log('クリックされたセル:', { player1, player2, block });
    console.log('matchKey:', matchKey);
    console.log('reverseKey:', reverseKey);
    console.log('predictedResults[matchKey]:', predictedResults[matchKey]);
    console.log('predictedResults[reverseKey]:', predictedResults[reverseKey]);

    // 確定済み結果は変更不可（両方のキーをチェック）
    if (confirmedResults[matchKey] || confirmedResults[reverseKey]) {
        console.log('確定済みの結果は変更できません:', matchKey);
        return;
    }

    const statusEl = document.getElementById(`${block}-status`);
    if (statusEl.classList.contains('confirmed')) {
        statusEl.classList.remove('confirmed');
        statusEl.textContent = '';
    }

    // 既存の結果を取得
    const isReverse = cell.dataset.reverse === 'true';
    let currentResult = 'none';

    if (predictedResults[matchKey]) {
        currentResult = predictedResults[matchKey];
        // 下三角のセルでは結果を反転して取得
        if (isReverse) {
            if (currentResult === 'win') currentResult = 'lose';
            else if (currentResult === 'lose') currentResult = 'win';
            // draw は そのまま
        }
        console.log('matchKeyから取得:', predictedResults[matchKey], isReverse ? '(反転)' : '', '->', currentResult);
    } else if (predictedResults[reverseKey]) {
        // reverseKeyに結果がある場合（後方互換性のため）
        const reverseResult = predictedResults[reverseKey];
        if (reverseResult === 'win') currentResult = 'lose';
        else if (reverseResult === 'lose') currentResult = 'win';
        else currentResult = reverseResult; // draw
        console.log('reverseKeyから取得して反転:', reverseResult, '->', currentResult);
    } else {
        console.log('既存結果なし');
    }

    // 次の状態に遷移
    let newResult;
    switch (currentResult) {
        case 'none': newResult = 'win'; break;
        case 'win': newResult = 'draw'; break;
        case 'draw': newResult = 'lose'; break;
        default: newResult = null; break;
    }
    console.log('新しい結果（セル視点）:', currentResult, '->', newResult);

    // 結果を保存（下三角の場合は反転して保存）
    let resultToSave = newResult;
    if (isReverse && resultToSave) {
        if (resultToSave === 'win') resultToSave = 'lose';
        else if (resultToSave === 'lose') resultToSave = 'win';
        // draw は そのまま
        console.log('下三角なので保存時に反転:', newResult, '->', resultToSave);
    }

    if (resultToSave) {
        predictedResults[matchKey] = resultToSave;
        matchResults[matchKey] = resultToSave;

        // 逆の結果も保存（後方互換性のため）
        let oppositeResult;
        if (resultToSave === 'win') oppositeResult = 'lose';
        else if (resultToSave === 'lose') oppositeResult = 'win';
        else oppositeResult = 'draw'; // draw

        predictedResults[reverseKey] = oppositeResult;
        matchResults[reverseKey] = oppositeResult;
        console.log('保存:', matchKey, '=', resultToSave, ',', reverseKey, '=', oppositeResult);
    } else {
        // 結果を削除
        delete predictedResults[matchKey];
        delete predictedResults[reverseKey];
        delete matchResults[matchKey];
        delete matchResults[reverseKey];
        console.log('結果を削除');
    }

    console.log('セルを更新:', matchKey, matchResults[matchKey]);
    updateCellDisplay(cell, matchResults[matchKey], 'predicted');

    // すべてのセルを更新（同じmatchKeyを持つセルをすべて更新）
    console.log('同じ対戦の全セルを更新:', matchKey);
    const allCells = document.querySelectorAll(`#${block} .clickable-cell`);
    console.log('検索対象セル数:', allCells.length);

    for (const testCell of allCells) {
        const testP1 = normalizePlayerName(testCell.dataset.player1);
        const testP2 = normalizePlayerName(testCell.dataset.player2);
        const testBlock = testCell.dataset.block;
        const testMatchKey = `${testBlock}-${testP1}-${testP2}`;

        // 同じmatchKeyを持つセル（クリックしたセル以外）を更新
        if (testMatchKey === matchKey && testCell !== cell) {
            console.log('対応するセルを発見して更新:', testP1, testP2);
            updateCellDisplay(testCell, matchResults[matchKey], 'predicted');
        }
    }

    updatePoints(block);
    console.log('======================');
}

function updateCellDisplay(cell, result, type = 'predicted') {
    const player1 = normalizePlayerName(cell.dataset.player1);
    const player2 = normalizePlayerName(cell.dataset.player2);
    const block = cell.dataset.block;
    const matchKey = `${block}-${player1}-${player2}`;
    const isReverse = cell.dataset.reverse === 'true';

    // 下三角のセルでは結果を反転して表示
    const reverseResult = (res) => {
        if (!isReverse || !res) return res;
        if (res === 'win') return 'lose';
        if (res === 'lose') return 'win';
        return res; // draw
    };

    const confirmedResultDiv = cell.querySelector('.confirmed-result');
    const predictedResultDiv = cell.querySelector('.predicted-result');

    // 確定データの表示
    if (confirmedResults[matchKey]) {
        const confirmedResult = reverseResult(confirmedResults[matchKey]);
        confirmedResultDiv.innerHTML = getResultIcon(confirmedResult);
        confirmedResultDiv.className = 'confirmed-result';
        if(confirmedResult) confirmedResultDiv.classList.add(confirmedResult);

        // セルを確定済みにする（クリック不可）
        cell.classList.add('confirmed-cell');
        cell.classList.remove('clickable-cell');
    } else {
        confirmedResultDiv.innerHTML = '';
        confirmedResultDiv.className = 'confirmed-result';

        // セルをクリック可能にする
        cell.classList.remove('confirmed-cell');
        if (!cell.classList.contains('clickable-cell')) {
            cell.classList.add('clickable-cell');
        }
    }

    // 予想データの表示（predictedResultsから取得）
    const predictedResult = reverseResult(predictedResults[matchKey]);

    if (predictedResult) {
        predictedResultDiv.innerHTML = getResultIcon(predictedResult);
        predictedResultDiv.className = 'predicted-result';
        predictedResultDiv.classList.add(predictedResult);
    } else {
        predictedResultDiv.innerHTML = '';
        predictedResultDiv.className = 'predicted-result';
    }
}

function getResultIcon(result) {
    switch (result) {
        case 'win': return '<i class="fa-regular fa-circle"></i>';
        case 'draw': return '<i class="fa-solid fa-caret-up"></i>';
        case 'lose': return '<i class="fa-solid fa-xmark"></i>';
        default: return '';
    }
}

function updatePoints(block) {
    const pointCells = document.querySelectorAll(`#${block} .point-column`);
    pointCells.forEach(pointCell => {
        const player = pointCell.dataset.player ? normalizePlayerName(pointCell.dataset.player) : null;
        
        if (!player) return; // data-playerがない場合はスキップ
        
        // 確定ポイントの計算
        let confirmedPoints = 0;
        Object.keys(confirmedResults).forEach(key => {
            if (key.startsWith(`${block}-${player}-`)) {
                const result = confirmedResults[key];
                if (result === 'win') confirmedPoints += 2;
                if (result === 'draw') confirmedPoints += 1;
            }
        });
        
        // 予想ポイントの計算（確定ポイント + 予想データのポイント）
        let predictedPoints = confirmedPoints;
        Object.keys(predictedResults).forEach(key => {
            if (key.startsWith(`${block}-${player}-`) && !confirmedResults[key]) {
                const result = predictedResults[key];
                if (result === 'win') predictedPoints += 2;
                if (result === 'draw') predictedPoints += 1;
            }
        });
        
        // 点数表示を更新
        const confirmedPointsSpan = pointCell.querySelector('.confirmed-points');
        const predictedPointsSpan = pointCell.querySelector('.predicted-points');
        
        if (confirmedPointsSpan) confirmedPointsSpan.textContent = confirmedPoints;
        if (predictedPointsSpan) predictedPointsSpan.textContent = predictedPoints;
    });
    checkCompletionAndRank(block);
}

function isBlockComplete(block) {
    const players = getPlayersInBlock(block);
    const totalMatches = players.length * (players.length - 1) / 2;
    let completedMatches = 0;
    const checkedMatches = new Set();

    players.forEach(p1 => {
        players.forEach(p2 => {
            if (p1 === p2) return;
            const matchKey = [p1, p2].sort().join('-');
            if (checkedMatches.has(matchKey)) return;

            const key = `${block}-${p1}-${p2}`;
            if (matchResults[key]) {
                completedMatches++;
            }
            checkedMatches.add(matchKey);
        });
    });

    return completedMatches >= totalMatches;
}

/**
 * ブロック内の全選手を取得
 * @param {string} block - ブロックID（red-goddesses / blue-goddesses）
 * @returns {Array<string>} 選手名の配列
 */
function getPlayersInBlock(block) {
    // tournamentDataから直接取得（DOMに依存しない）
    const blockData = tournamentData[block];
    if (!blockData || !blockData.teams) {
        console.error(`ブロックデータが見つかりません: ${block}`);
        return [];
    }
    return blockData.teams.map(team => normalizePlayerName(team));
}

function determineBlockRankings(block) {
    const players = getPlayersInBlock(block);
    const playerStats = players.map(player => ({
        name: player,
        points: 0,
        opponents: {}
    }));

    playerStats.forEach(stat => {
        let points = 0;
        Object.keys(matchResults).forEach(key => {
            if (key.startsWith(`${block}-${stat.name}-`)) {
                const result = matchResults[key];
                if (result === 'win') points += 2;
                if (result === 'draw') points += 1;
                const opponent = normalizePlayerName(key.split('-')[2]);
                stat.opponents[opponent] = result;
            }
        });
        stat.points = points;
    });

    playerStats.sort((a, b) => {
        if (b.points !== a.points) {
            return b.points - a.points;
        }
        const directResult = a.opponents[b.name];
        if (directResult === 'win') return -1;
        if (directResult === 'lose') return 1;
        return 0;
    });

    // 順位を付与
    playerStats.forEach((stat, index) => {
        stat.rank = index + 1;
    });

    return playerStats;
}

/**
 * トーナメントブラケットの選手情報を更新
 * @param {string} block - ブロックID（red-goddesses / blue-goddesses）
 * @param {Array<Object>} rankings - 順位データ（上位3チーム）
 */
function updateTournamentBracket(block, rankings) {
    const blockShort = block.replace('-goddesses', ''); // 'red' or 'blue'

    // 上位3チームのみトーナメントに反映
    const topThree = rankings.slice(0, 3);

    topThree.forEach((player, index) => {
        const rank = index + 1; // 1, 2, 3
        const rankElement = document.getElementById(`bracket-${blockShort}-${rank}-rank`);

        if (rankElement) {
            rankElement.textContent = `${rank}位 ${player.name}`;
        } else {
            console.warn(`トーナメント要素が見つかりません: bracket-${blockShort}-${rank}-rank`);
        }
    });

    console.log(`${blockShort.toUpperCase()} GODDESSES の順位をトーナメントに反映しました:`, topThree);
}

/**
 * ブロック完了時に順位を計算してトーナメントに反映
 * @param {string} block - ブロックID（red-goddesses / blue-goddesses）
 */
function checkCompletionAndRank(block) {
    const statusEl = document.getElementById(`${block}-status`);

    // status要素が存在しない場合は処理をスキップ（テーブル生成前の呼び出しを防ぐ）
    if (!statusEl) {
        console.warn(`status要素が見つかりません: ${block}-status`);
        return;
    }

    // 8チーム全体で全試合が完了しているか確認
    if (isBlockComplete(block)) {
        console.log(`${block}の全試合が完了しました。順位を計算します。`);
        const rankings = determineBlockRankings(block);

        // トーナメントブラケットに反映（上位3チーム）
        updateTournamentBracket(block, rankings);

        statusEl.textContent = 'ブロック順位確定';
        statusEl.classList.add('confirmed');
    } else {
        statusEl.textContent = '';
        statusEl.classList.remove('confirmed');
    }
}

function showPlayerSchedule(playerName) {
    const normalizedPlayerName = normalizePlayerName(playerName);
    const modal = document.getElementById('schedule-modal');
    const modalPlayerName = document.getElementById('modal-player-name');
    const modalScheduleBody = document.getElementById('modal-schedule-body');
    const matches = [];

    document.querySelectorAll(`[data-player1="${playerName}"]`).forEach(cell => {
        if (!cell.classList.contains('clickable-cell') && !cell.classList.contains('confirmed-cell')) return;

        const opponent = normalizePlayerName(cell.dataset.player2);
        const dateEl = cell.querySelector('.date');
        const venueEl = cell.querySelector('.venue');
        const block = cell.dataset.block;
        const matchKey = `${block}-${normalizedPlayerName}-${opponent}`;
        const result = matchResults[matchKey];

        if (dateEl && venueEl) {
            const dateText = dateEl.textContent;
            const [month, day] = dateText.split('.').map(Number);
            matches.push({
                date: new Date(2025, month - 1, day),
                dateText: dateText,
                opponent: opponent,
                venue: venueEl.textContent,
                result: result,
                block: block  // ブロック情報を追加
            });
        }
    });

    matches.sort((a, b) => a.date - b.date);

    modalPlayerName.textContent = `${playerName} - 対戦スケジュール`;
    let scheduleHtml = '<table><thead><tr><th>日付</th><th>対戦相手</th><th>会場</th><th>確定勝敗</th><th>予想勝敗</th></tr></thead><tbody>';
    if (matches.length > 0) {
        matches.forEach(match => {
            const matchKey = `${match.block}-${normalizedPlayerName}-${match.opponent}`;
            const confirmedResult = confirmedResults[matchKey];
            const predictedResult = predictedResults[matchKey];
            
            const confirmedIcon = getResultIcon(confirmedResult);
            const predictedIcon = getResultIcon(predictedResult);
            
            scheduleHtml += `<tr>
                <td>${match.dateText}</td>
                <td>${match.opponent}</td>
                <td>${match.venue}</td>
                <td class="result-cell ${confirmedResult || ''}">${confirmedIcon}</td>
                <td class="result-cell ${predictedResult || ''}">${predictedIcon}</td>
            </tr>`;
        });
    } else {
        scheduleHtml += '<tr><td colspan="5">対戦予定はありません。</td></tr>';
    }
    scheduleHtml += '</tbody></table>';
    modalScheduleBody.innerHTML = scheduleHtml;
    modal.style.display = 'flex';
}

// トーナメント勝者の実際の選手名を取得
function getActualTournamentWinner(winnerId) {
    // winnerIdから対応する試合IDを取得
    const matchId = winnerId.replace('-winner', '');
    const matchKey = `tournament-${matchId}`;
    const result = matchResults[matchKey];
    
    if (!result) return null;
    
    // 試合結果から勝者を特定
    if (result === 'win') {
        return getTournamentPlayer1(matchId);
    } else if (result === 'lose') {
        return getTournamentPlayer2(matchId);
    }
    
    return null;
}

function showVenueSchedule(venueName, date) {
    const modal = document.getElementById('venue-modal');
    const modalVenueName = document.getElementById('modal-venue-name');
    const modalVenueBody = document.getElementById('modal-venue-body');
    const matches = [];

    // リーグ戦の試合を収集
    document.querySelectorAll('.clickable-cell, .confirmed-cell').forEach(cell => {
        const venueEl = cell.querySelector('.venue');
        const dateEl = cell.querySelector('.date');
        if (venueEl && venueEl.textContent === venueName && dateEl && dateEl.textContent === date) {
            const player1 = cell.dataset.player1;
            const player2 = cell.dataset.player2;
            const block = cell.dataset.block;
            const matchKey = `${block}-${normalizePlayerName(player1)}-${normalizePlayerName(player2)}`;
            const result = matchResults[matchKey];

            matches.push({
                player1: player1,
                player2: player2,
                result: result,
                date: date,
                block: block,
                type: 'リーグ戦'
            });
        }
    });

    // トーナメントの試合を収集
    // トーナメント試合の日程と会場
    const tournamentSlots = {
        '11.29': [
            // 2位/3位決定戦
            { type: '2位/3位決定戦', p1_rank: 2, p2_rank: 3, block: 'blue', venue: '大阪', match_id: 'blue-semifinal' },
            { type: '2位/3位決定戦', p1_rank: 2, p2_rank: 3, block: 'red', venue: '大阪', match_id: 'red-semifinal' },
            // 1位決定戦
            { type: '1位決定戦', p1_rank: 1, p2_id: 'blue-semifinal-winner', block: 'blue', venue: '大阪', match_id: 'blue-final' },
            { type: '1位決定戦', p1_rank: 1, p2_id: 'red-semifinal-winner', block: 'red', venue: '大阪', match_id: 'red-final' },
        ],
        '11.30': [
            // 優勝決定戦
            { type: '優勝決定戦', p1_id: 'blue-final-winner', p2_id: 'red-final-winner', venue: '浜松', match_id: 'championship' },
        ]
    };

    // トーナメント試合の表示用ヘルパー関数
    const getTournamentPlayerDisplay = (slot, isPlayer1) => {
        const block = slot.block;
        const rankKey = isPlayer1 ? 'p1_rank' : 'p2_rank';
        const idKey = isPlayer1 ? 'p1_id' : 'p2_id';

        // ランク指定の場合
        if (slot[rankKey]) {
            const rank = slot[rankKey];
            const rankElement = document.getElementById(`bracket-${block}-${rank}-rank`);
            if (rankElement && rankElement.textContent) {
                return `${block.toUpperCase()} ${rankElement.textContent}`;
            }
            return `${block.toUpperCase()} ${rank}位`;
        }

        // 勝者ID指定の場合
        if (slot[idKey]) {
            const winnerId = slot[idKey];
            const matchKey = `tournament-${winnerId.replace('-winner', '')}`;
            const result = matchResults[matchKey];

            if (result) {
                // 前の試合の勝者を取得
                const prevSlots = Object.values(tournamentSlots).flat();
                const prevSlot = prevSlots.find(s => s.match_id === winnerId.replace('-winner', ''));
                if (prevSlot) {
                    if (result === 'win') {
                        return getTournamentPlayerDisplay(prevSlot, true);
                    } else if (result === 'lose') {
                        return getTournamentPlayerDisplay(prevSlot, false);
                    }
                }
            }

            // 勝者未定の場合
            if (winnerId === 'blue-semifinal-winner') return 'BLUE 2位/3位決定戦の勝者';
            if (winnerId === 'red-semifinal-winner') return 'RED 2位/3位決定戦の勝者';
            if (winnerId === 'blue-final-winner') return 'BLUE 最終1位';
            if (winnerId === 'red-final-winner') return 'RED 最終1位';
            return winnerId;
        }

        return '未定';
    };

    if (tournamentSlots[date]) {
        tournamentSlots[date].forEach(slot => {
            if (slot.venue === venueName) {
                const p1_display = getTournamentPlayerDisplay(slot, true);
                const p2_display = getTournamentPlayerDisplay(slot, false);
                const matchKey = `tournament-${slot.match_id}`;
                const result = matchResults[matchKey];

                matches.push({
                    player1: p1_display,
                    player2: p2_display,
                    result: result,
                    date: date,
                    block: 'トーナメント',
                    type: slot.type,
                    match_id: slot.match_id
                });
            }
        });
    }

    modalVenueName.textContent = `${venueName} (${date}) - 試合一覧`;
    let scheduleHtml = '<table><thead><tr><th>試合形式</th><th>ブロック</th><th>選手1</th><th>vs</th><th>選手2</th><th>確定勝敗</th><th>予想勝敗</th></tr></thead><tbody>';
    if (matches.length > 0) {
        const uniqueMatches = [];
        const seenMatchKeys = new Set();

        matches.forEach(match => {
            const keyPrefix = match.type === 'リーグ戦' ? match.block : match.type;
            const key1 = `${keyPrefix}-${match.player1}-${match.player2}`;
            const key2 = `${keyPrefix}-${match.player2}-${match.player1}`;

            if (!seenMatchKeys.has(key1) && !seenMatchKeys.has(key2)) {
                uniqueMatches.push(match);
                seenMatchKeys.add(key1);
            }
        });

        uniqueMatches.forEach(match => {
            let confirmedResult = null;
            let predictedResult = null;
            
            if (match.type === 'リーグ戦') {
                // リーグ戦の場合、matchKeyを使って確定・予想結果を取得
                const matchKey = `${match.block}-${normalizePlayerName(match.player1)}-${normalizePlayerName(match.player2)}`;
                confirmedResult = confirmedResults[matchKey];
                predictedResult = predictedResults[matchKey];
            } else {
                // トーナメントの場合
                const tournamentKey = `tournament-${match.match_id || ''}`;
                confirmedResult = confirmedResults[tournamentKey];
                predictedResult = predictedResults[tournamentKey];
            }
            
            const confirmedIcon = getResultIcon(confirmedResult);
            const predictedIcon = getResultIcon(predictedResult);
            
            scheduleHtml += `<tr>
                <td>${match.type}</td>
                <td>${match.block}</td>
                <td>${match.player1}</td>
                <td>vs</td>
                <td>${match.player2}</td>
                <td class="result-cell ${confirmedResult || ''}">${confirmedIcon}</td>
                <td class="result-cell ${predictedResult || ''}">${predictedIcon}</td>
            </tr>`;
        });
    } else {
        scheduleHtml += '<tr><td colspan="7">この日の試合予定はありません。</td></tr>';
    }
    scheduleHtml += '</tbody></table>';
    modalVenueBody.innerHTML = scheduleHtml;
    modal.style.display = 'flex';
}

function refreshAllTables() {
    blocks.forEach(blockId => {
        const table = document.querySelector(`#${blockId} .schedule-table`);
        if (!table) return;

        table.querySelectorAll('.clickable-cell, .confirmed-cell').forEach(cell => {
            const player1 = normalizePlayerName(cell.dataset.player1);
            const player2 = normalizePlayerName(cell.dataset.player2);
            const block = cell.dataset.block;
            const matchKey = `${block}-${player1}-${player2}`;
            const result = predictedResults[matchKey];
            updateCellDisplay(cell, result, 'predicted');
        });

        updatePoints(blockId);
    });
    
    // トーナメント結果も復元
    refreshTournamentResults();
}

// トーナメント結果の復元機能
function refreshTournamentResults() {
    const tournamentMatches = [
        'blue-prelim1', 'blue-prelim2', 'red-prelim1', 'red-prelim2',
        'blue-qf1', 'blue-qf2', 'red-qf1', 'red-qf2',
        'blue-sf', 'red-sf', 'final'
    ];
    
    tournamentMatches.forEach(matchId => {
        const matchKey = `tournament-${matchId}`;
        const result = matchResults[matchKey];
        
        if (result) {
            updateTournamentResultDisplay(matchId, result);
        } else {
            updateTournamentResultDisplay(matchId, null);
        }
    });
}

// 元のトーナメントブラケット表示を使用（ライブラリなし）
function initializeTournamentBracket() {
    // 既にHTMLで定義されているため、特別な初期化は不要
}

// トーナメント試合結果の管理機能
function toggleTournamentMatchResult(matchId) {
    const matchKey = `tournament-${matchId}`;
    const resultElement = document.getElementById(`${matchId}-result`);
    
    let currentResult = matchResults[matchKey] || 'none';
    
    switch (currentResult) {
        case 'none': 
            matchResults[matchKey] = 'win';
            updateTournamentResultDisplay(matchId, 'win');
            break;
        case 'win': 
            matchResults[matchKey] = 'lose';
            updateTournamentResultDisplay(matchId, 'lose');
            break;
        default: 
            delete matchResults[matchKey];
            updateTournamentResultDisplay(matchId, null);
            break;
    }
    
    // トーナメント勝者を更新
    updateTournamentWinners();
}

// トーナメント結果表示の更新
function updateTournamentResultDisplay(matchId, result) {
    const resultElement = document.getElementById(`${matchId}-result`);
    if (!resultElement) return;

    if (!result) {
        resultElement.textContent = '';
        return;
    }

    // 各試合の勝者名を取得して表示
    let winnerName = '';
    
    if (result === 'win') {
        winnerName = getTournamentPlayer1(matchId);
    } else if (result === 'lose') {
        winnerName = getTournamentPlayer2(matchId);
    }

    if (winnerName && winnerName !== '未定') {
        // 勝者名を表示（長い場合は短縮）
        const displayName = winnerName.length > 8 ? winnerName.substring(0, 7) + '…' : winnerName;
        resultElement.textContent = displayName;
    } else {
        resultElement.textContent = result === 'win' ? '○' : '×';
    }
}

// トーナメント試合の選手1を取得
function getTournamentPlayer1(matchId) {
    const matchConfig = {
        // 予選
        'blue-prelim1': 'bracket-blue-a-3-name',
        'blue-prelim2': 'bracket-blue-a-2-name', 
        'red-prelim1': 'bracket-red-a-3-name',
        'red-prelim2': 'bracket-red-a-2-name',
        // 準々決勝
        'blue-qf1': 'bracket-blue-a-1-name',
        'blue-qf2': 'bracket-blue-b-1-name',
        'red-qf1': 'bracket-red-a-1-name',
        'red-qf2': 'bracket-red-b-1-name'
    };
    
    const elementId = matchConfig[matchId];
    if (elementId) {
        const rankElement = document.getElementById(elementId.replace('-name', '-rank'));
        if (rankElement && rankElement.textContent.includes(' ')) {
            return rankElement.textContent.split(' ').slice(1).join(' ');
        }
    }
    
    // 準決勝と決勝の場合は前の試合の勝者
    if (matchId === 'blue-sf') {
        const qf1Winner = getMatchWinner('blue-qf1');
        const qf2Winner = getMatchWinner('blue-qf2');
        return qf1Winner || '準々決勝1勝者';
    } else if (matchId === 'red-sf') {
        const qf1Winner = getMatchWinner('red-qf1');
        const qf2Winner = getMatchWinner('red-qf2');
        return qf1Winner || '準々決勝1勝者';
    } else if (matchId === 'final') {
        const blueWinner = getMatchWinner('blue-sf');
        return blueWinner || 'Blue側勝者';
    }
    
    return '未定';
}

// トーナメント試合の選手2を取得
function getTournamentPlayer2(matchId) {
    const matchConfig = {
        // 予選
        'blue-prelim1': 'bracket-blue-b-2-name',
        'blue-prelim2': 'bracket-blue-b-3-name',
        'red-prelim1': 'bracket-red-b-2-name', 
        'red-prelim2': 'bracket-red-b-3-name',
        // 準々決勝
        'blue-qf1': null, // 予選1勝者
        'blue-qf2': null, // 予選2勝者
        'red-qf1': null,  // 予選1勝者
        'red-qf2': null   // 予選2勝者
    };
    
    const elementId = matchConfig[matchId];
    if (elementId) {
        const rankElement = document.getElementById(elementId.replace('-name', '-rank'));
        if (rankElement && rankElement.textContent.includes(' ')) {
            return rankElement.textContent.split(' ').slice(1).join(' ');
        }
    }
    
    // 準々決勝の場合は予選勝者
    if (matchId === 'blue-qf1') {
        return getMatchWinner('blue-prelim1') || '予選1勝者';
    } else if (matchId === 'blue-qf2') {
        return getMatchWinner('blue-prelim2') || '予選2勝者';
    } else if (matchId === 'red-qf1') {
        return getMatchWinner('red-prelim1') || '予選1勝者';
    } else if (matchId === 'red-qf2') {
        return getMatchWinner('red-prelim2') || '予選2勝者';
    }
    
    // 準決勝の場合
    if (matchId === 'blue-sf') {
        return getMatchWinner('blue-qf2') || '準々決勝2勝者';
    } else if (matchId === 'red-sf') {
        return getMatchWinner('red-qf2') || '準々決勝2勝者';
    } else if (matchId === 'final') {
        return getMatchWinner('red-sf') || 'Red側勝者';
    }
    
    return '未定';
}

// 試合の勝者を取得
function getMatchWinner(matchId) {
    const matchKey = `tournament-${matchId}`;
    const result = matchResults[matchKey];
    
    if (result === 'win') {
        return getTournamentPlayer1(matchId);
    } else if (result === 'lose') {
        return getTournamentPlayer2(matchId);
    }
    
    return null;
}

// トーナメント勝者の自動反映機能
function updateTournamentWinners() {
    // 既存のshowVenueSchedule関数で使用されているロジックを再利用
    // 予選と準々決勝の勝者を計算
    const tournamentWinners = {};
    
    // 予選の勝者を決定
    ['blue-prelim1', 'blue-prelim2', 'red-prelim1', 'red-prelim2'].forEach(matchId => {
        const matchKey = `tournament-${matchId}`;
        const result = matchResults[matchKey];
        if (result === 'win') {
            // player1が勝利
            tournamentWinners[matchId + '-winner'] = getTournamentPlayer1(matchId);
        } else if (result === 'lose') {
            // player2が勝利
            tournamentWinners[matchId + '-winner'] = getTournamentPlayer2(matchId);
        }
    });
    
    // 準々決勝の勝者を決定
    ['blue-qf1', 'blue-qf2', 'red-qf1', 'red-qf2'].forEach(matchId => {
        const matchKey = `tournament-${matchId}`;
        const result = matchResults[matchKey];
        if (result === 'win') {
            tournamentWinners[matchId + '-winner'] = getTournamentPlayer1(matchId);
        } else if (result === 'lose') {
            tournamentWinners[matchId + '-winner'] = getTournamentPlayer2(matchId);
        }
    });
    
    // 準決勝の勝者を決定
    ['blue-sf', 'red-sf'].forEach(matchId => {
        const matchKey = `tournament-${matchId}`;
        const result = matchResults[matchKey];
        if (result === 'win') {
            tournamentWinners[matchId + '-winner'] = tournamentWinners['blue-qf1-winner'] || tournamentWinners['red-qf1-winner'];
        } else if (result === 'lose') {
            tournamentWinners[matchId + '-winner'] = tournamentWinners['blue-qf2-winner'] || tournamentWinners['red-qf2-winner'];
        }
    });
    
    // 依存関係のある試合の表示を更新
    updateDependentMatches();
    
    // 決勝の勝者をチェックして優勝者を表示
    updateChampionDisplay();
    
    console.log('Tournament winners updated:', tournamentWinners);
}

// 依存関係のある試合の表示を更新
function updateDependentMatches() {
    // 予選結果が変わった時は準々決勝を更新
    const prelims = ['blue-prelim1', 'blue-prelim2', 'red-prelim1', 'red-prelim2'];
    const quarterFinals = ['blue-qf1', 'blue-qf2', 'red-qf1', 'red-qf2'];
    
    prelims.forEach(prelimId => {
        // 対応する準々決勝を見つけて更新
        let dependentQF = null;
        if (prelimId === 'blue-prelim1') dependentQF = 'blue-qf1';
        else if (prelimId === 'blue-prelim2') dependentQF = 'blue-qf2';
        else if (prelimId === 'red-prelim1') dependentQF = 'red-qf1';
        else if (prelimId === 'red-prelim2') dependentQF = 'red-qf2';
        
        if (dependentQF) {
            const qfResult = matchResults[`tournament-${dependentQF}`];
            if (qfResult) {
                updateTournamentResultDisplay(dependentQF, qfResult);
            }
        }
    });
    
    // 準々決勝結果が変わった時は準決勝を更新
    quarterFinals.forEach(qfId => {
        let dependentSF = null;
        if (qfId.startsWith('blue-')) dependentSF = 'blue-sf';
        else if (qfId.startsWith('red-')) dependentSF = 'red-sf';
        
        if (dependentSF) {
            const sfResult = matchResults[`tournament-${dependentSF}`];
            if (sfResult) {
                updateTournamentResultDisplay(dependentSF, sfResult);
            }
        }
    });
    
    // 準決勝結果が変わった時は決勝を更新
    const finalResult = matchResults['tournament-final'];
    if (finalResult) {
        updateTournamentResultDisplay('final', finalResult);
    }
}

// 優勝者表示の更新
function updateChampionDisplay() {
    const finalResult = matchResults['tournament-final'];
    const championDisplay = document.getElementById('champion-display');
    const championText = document.getElementById('champion-text');
    
    if (finalResult) {
        // 決勝の勝者を取得
        let champion = null;
        if (finalResult === 'win') {
            champion = getTournamentPlayer1('final');
        } else if (finalResult === 'lose') {
            champion = getTournamentPlayer2('final');
        }
        
        if (champion && champion !== '未定') {
            // 優勝者を表示
            championText.textContent = `${champion}優勝！`;
            championDisplay.style.display = 'block';
            
            // 勝利の効果音やアニメーションを追加（将来的な拡張用）
            triggerChampionCelebration();
        } else {
            // 決勝は設定されているが勝者が未定
            championDisplay.style.display = 'none';
        }
    } else {
        // 決勝の結果がまだ設定されていない
        championDisplay.style.display = 'none';
    }
}

// 優勝者決定時の演出
function triggerChampionCelebration() {
    const championDisplay = document.getElementById('champion-display');
    
    // 一時的にさらに大きなアニメーションを追加
    championDisplay.style.animation = 'championReveal 1s ease-out';
    
    // 数秒後に通常のアニメーションに戻す
    setTimeout(() => {
        championDisplay.style.animation = '';
    }, 1000);
}

// 優勝者表示用の追加CSS（動的に追加）
function addChampionStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes championReveal {
            0% { 
                transform: scale(0.5) rotate(-10deg); 
                opacity: 0;
            }
            50% { 
                transform: scale(1.2) rotate(5deg); 
                opacity: 1;
            }
            100% { 
                transform: scale(1) rotate(0deg); 
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', async function() {
    // 確定データを読み込み
    await loadConfirmedResults();
    
    // 優勝者表示用のCSSを追加
    addChampionStyles();
    
    // トーナメントブラケットを初期化（jQueryが読み込まれた後）
    setTimeout(initializeTournamentBracket, 500);
    
    // トーナメントボックスにクリックイベントを追加
    setTimeout(() => {
        document.querySelectorAll('.tournament-match-box').forEach(box => {
            box.style.cursor = 'pointer';
            box.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const matchId = this.getAttribute('data-match');
                console.log('Tournament box clicked:', matchId);
                toggleTournamentMatchResult(matchId);
            });
        });
        console.log('Tournament boxes initialized:', document.querySelectorAll('.tournament-match-box').length);
    }, 1000);
    

    const scheduleModal = document.getElementById('schedule-modal');
    const scheduleModalClose = scheduleModal.querySelector('.modal-close');
    scheduleModalClose.addEventListener('click', () => { scheduleModal.style.display = 'none'; });
    scheduleModal.addEventListener('click', (e) => { if (e.target === scheduleModal) scheduleModal.style.display = 'none'; });

    const venueModal = document.getElementById('venue-modal');
    const venueModalClose = venueModal.querySelector('.modal-close');
    venueModalClose.addEventListener('click', () => { venueModal.style.display = 'none'; });
    venueModal.addEventListener('click', (e) => { if (e.target === venueModal) venueModal.style.display = 'none'; });

    // ヘルプモーダルの設定
    const helpModal = document.getElementById('help-modal');
    const helpBtn = document.getElementById('help-btn');
    const helpModalClose = helpModal.querySelector('.modal-close');
    
    helpBtn.addEventListener('click', () => { helpModal.style.display = 'flex'; });
    helpModalClose.addEventListener('click', () => { helpModal.style.display = 'none'; });
    helpModal.addEventListener('click', (e) => { if (e.target === helpModal) helpModal.style.display = 'none'; });

    // Download/Upload functionality
    const downloadBtn = document.getElementById('download-btn');
    const downloadConfirmedBtn = document.getElementById('download-confirmed-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadInput = document.getElementById('upload-input');

    downloadBtn.addEventListener('click', () => {
        const dataStr = JSON.stringify(predictedResults, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'predicted-results.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // 確定データダウンロード機能
    downloadConfirmedBtn.addEventListener('click', () => {
        const confirmedData = {
            confirmed: matchResults, // 現在の結果を確定データとして保存
            version: "1.0",
            lastUpdate: new Date().toISOString(),
            totalMatches: Object.keys(matchResults).length
        };
        const dataStr = JSON.stringify(confirmedData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'result.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log('確定データをダウンロードしました:', Object.keys(matchResults).length + '件');
    });

    uploadBtn.addEventListener('click', () => uploadInput.click());

    uploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                // Basic validation
                if (typeof data === 'object' && data !== null) {
                    // データが直接のマッチ結果オブジェクトか、confirmed形式かを判定
                    const rawLoadedResults = data.confirmed || data;
                    
                    // アップロードされたデータの選手名を正規化
                    const loadedResults = {};
                    Object.keys(rawLoadedResults).forEach(key => {
                        const normalizedKey = normalizeMatchKey(key);
                        
                        // 既存のキーと重複チェック
                        if (loadedResults[normalizedKey] && loadedResults[normalizedKey] !== rawLoadedResults[key]) {
                            console.warn(`アップロード時キーの重複検出: ${normalizedKey}, 既存値: ${loadedResults[normalizedKey]}, 新値: ${rawLoadedResults[key]}`);
                        }
                        
                        loadedResults[normalizedKey] = rawLoadedResults[key];
                        if (key !== normalizedKey) {
                            console.log(`アップロード時キー正規化: ${key} -> ${normalizedKey}`);
                        }
                    });
                    
                    console.log('=== アップロード統計 ===');
                    console.log('元のデータ件数:', Object.keys(rawLoadedResults).length + '件');
                    console.log('正規化後データ件数:', Object.keys(loadedResults).length + '件');
                    console.log('データ削減率:', ((Object.keys(rawLoadedResults).length - Object.keys(loadedResults).length) / Object.keys(rawLoadedResults).length * 100).toFixed(1) + '%');
                    
                    // アップロードされたデータを予想データとして保存
                    predictedResults = { ...loadedResults };
                    // matchResultsは確定データと予想データをマージ（確定データ優先）
                    matchResults = { ...predictedResults, ...confirmedResults };
                    
                    const confirmedCount = Object.keys(confirmedResults).length;
                    const uploadedCount = Object.keys(loadedResults).length;
                    const totalCount = Object.keys(matchResults).length;
                    
                    refreshAllTables();
                    updateChampionDisplay(); // 優勝者表示も更新
                    alert(`結果を正常に読み込みました。\n確定済み: ${confirmedCount}件\nアップロード: ${uploadedCount}件\n合計: ${totalCount}件`);
                    console.log('マージ完了 - 確定:', confirmedCount, 'アップロード:', uploadedCount, '合計:', totalCount);
                } else {
                    alert('無効なファイル形式です。');
                }
            } catch (error) {
                alert('ファイルの読み込み中にエラーが発生しました。');
                console.error("Error parsing JSON:", error);
            }
        };
        reader.readAsText(file);
        uploadInput.value = ''; // Reset input
    });
    
    // テーブルを動的生成（status要素を含むDOMを先に生成）
    generateTables();

    // 確定データ読み込み後にテーブルを更新
    refreshAllTables();

    // 初期状態で優勝者表示をチェック
    updateChampionDisplay();

    // 初期状態でトーナメントブラケットを更新（確定データがある場合）
    // generateTables()の後に呼び出す必要がある（status要素が生成されている必要があるため）
    blocks.forEach(block => {
        checkCompletionAndRank(block);
    });

    // 日付・会場対応表を動的生成
    generateVenueScheduleTable();
});

// テーブル動的生成関数
function generateTables() {
    blocks.forEach(blockId => {
        const blockData = tournamentData[blockId];
        if (!blockData) return;

        const container = document.getElementById(blockId);
        if (!container) return;

        // テーブルHTMLを生成
        const tableHTML = generateBlockTable(blockId, blockData);
        container.innerHTML = tableHTML;
    });

    // 動的生成されたセルにイベントリスナーを追加
    document.querySelectorAll('.clickable-cell').forEach(cell => {
        cell.addEventListener('click', function() { toggleMatchResult(this); });
    });

    // チーム名クリックでスケジュール表示
    document.querySelectorAll('.player-name, thead th').forEach(cell => {
        const playerName = cell.textContent.trim();
        if (playerName && !cell.classList.contains('rest-column') && !cell.classList.contains('point-column')) {
            cell.style.cursor = 'pointer';
            cell.addEventListener('click', (e) => {
                e.stopPropagation();
                showPlayerSchedule(playerName);
            });
        }
    });
}

function generateBlockTable(blockId, blockData) {
    const { title, teams, matches } = blockData;
    const colorClass = blockId.includes('red') ? 'red' : 'blue';

    // ヘッダー生成
    let html = `
        <div class="block-title ${colorClass}-title">${title}</div>
        <div id="${blockId}-status" class="block-status"></div>
        <table class="schedule-table">
            <thead>
                <tr>
                    <th class="${colorClass}-header"></th>`;

    teams.forEach(team => {
        html += `<th class="${colorClass}-header">${team}</th>`;
    });

    html += `
                    <th class="${colorClass}-header rest-column">休み</th>
                    <th class="${colorClass}-header point-column">勝ち点（予想）</th>
                </tr>
            </thead>
            <tbody>`;

    // 対戦マトリックス生成
    teams.forEach((team1, i) => {
        html += `<tr><td class="player-name ${colorClass}-player">${team1}</td>`;

        teams.forEach((team2, j) => {
            if (i === j) {
                html += `<td class="diagonal"></td>`;
            } else {
                const match = findMatch(matches, i, j);
                if (match) {
                    const [t1, t2, date, venue] = match;
                    // 総当たり戦なので全セルをクリック可能にする
                    // ただし、data属性は常にマッチデータの順序（t1, t2）で統一
                    const player1 = teams[t1];
                    const player2 = teams[t2];
                    // 下三角のセルには data-reverse="true" を設定（結果を反転表示するため）
                    const isLowerTriangle = (i > j);
                    const reverseAttr = isLowerTriangle ? 'data-reverse="true"' : '';
                    const dataAttrs = `data-player1="${player1}" data-player2="${player2}" data-block="${blockId}" ${reverseAttr}`;

                    html += `<td class="match-info clickable-cell" ${dataAttrs}>
                        <div class="date">${date}</div>
                        <div class="venue">${venue}</div>
                        <div class="match-results">
                            <div class="confirmed-result"></div>
                            <div class="predicted-result"></div>
                        </div>
                    </td>`;
                } else {
                    html += `<td class="match-info"></td>`;
                }
            }
        });

        html += `
            <td class="rest-column match-info"></td>
            <td class="point-column" data-player="${team1}">
                <span class="confirmed-points">0</span>(<span class="predicted-points">0</span>)
            </td>
        </tr>`;
    });

    html += `
            </tbody>
        </table>`;

    return html;
}

function findMatch(matches, i, j) {
    // マッチデータから該当する対戦を検索
    return matches.find(m =>
        (m[0] === i && m[1] === j) || (m[0] === j && m[1] === i)
    );
}
// 日付・会場対応表を動的生成する関数
function generateVenueScheduleTable() {
    const venueMap = new Map(); // {date: venue} のマップ

    // 全ブロックから日付・会場情報を収集（リーグ戦）
    blocks.forEach(blockId => {
        const blockData = tournamentData[blockId];
        if (!blockData) return;

        blockData.matches.forEach(match => {
            const [t1, t2, date, venue] = match;
            venueMap.set(date, venue);
        });
    });

    // トーナメント日程を追加
    venueMap.set('11.29', '大阪');
    venueMap.set('11.30', '浜松');

    // 日付でソート
    const sortedDates = Array.from(venueMap.keys()).sort((a, b) => {
        const [monthA, dayA] = a.split('.').map(Number);
        const [monthB, dayB] = b.split('.').map(Number);
        return monthA === monthB ? dayA - dayB : monthA - monthB;
    });

    // テーブルHTML生成
    let html = '';
    sortedDates.forEach(date => {
        const venue = venueMap.get(date);
        html += `<tr>
            <td>${date}</td>
            <td onclick="showVenueSchedule('${venue}', '${date}')" style="cursor: pointer;">${venue}</td>
        </tr>`;
    });

    // DOMに挿入
    const tbody = document.querySelector('.venue-list-section tbody');
    if (tbody) {
        tbody.innerHTML = html;
    }
}
