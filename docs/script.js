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
    
    // 確定済み結果は変更不可
    if (confirmedResults[matchKey]) {
        console.log('確定済みの結果は変更できません:', matchKey);
        return;
    }

    const statusEl = document.getElementById(`${block}-status`);
    if (statusEl.classList.contains('confirmed')) {
        statusEl.classList.remove('confirmed');
        statusEl.textContent = '';
    }
    
    let currentResult = predictedResults[matchKey] || 'none';
    
    switch (currentResult) {
        case 'none': predictedResults[matchKey] = 'win'; predictedResults[reverseKey] = 'lose'; break;
        case 'win': predictedResults[matchKey] = 'draw'; predictedResults[reverseKey] = 'draw'; break;
        case 'draw': predictedResults[matchKey] = 'lose'; predictedResults[reverseKey] = 'win'; break;
        default: delete predictedResults[matchKey]; delete predictedResults[reverseKey]; break;
    }
    
    // matchResultsも更新（互換性のため）
    matchResults[matchKey] = predictedResults[matchKey];
    matchResults[reverseKey] = predictedResults[reverseKey];
    if (!predictedResults[matchKey]) {
        delete matchResults[matchKey];
        delete matchResults[reverseKey];
    }
    
    updateCellDisplay(cell, matchResults[matchKey], 'predicted');
    const opponentCell = document.querySelector(`[data-player1="${player2}"][data-player2="${player1}"][data-block="${block}"]`);
    if (opponentCell) {
        updateCellDisplay(opponentCell, matchResults[reverseKey], 'predicted');
    }
    updatePoints(block);
}

function updateCellDisplay(cell, result, type = 'predicted') {
    const player1 = normalizePlayerName(cell.dataset.player1);
    const player2 = normalizePlayerName(cell.dataset.player2);
    const block = cell.dataset.block;
    const matchKey = `${block}-${player1}-${player2}`;
    
    const confirmedResultDiv = cell.querySelector('.confirmed-result');
    const predictedResultDiv = cell.querySelector('.predicted-result');
    
    // 確定データの表示
    if (confirmedResults[matchKey]) {
        const confirmedResult = confirmedResults[matchKey];
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
    const predictedResult = predictedResults[matchKey];
    
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

function getPlayersInBlock(block) {
    const headerCells = document.querySelectorAll(`#${block} .schedule-table thead th`);
    return Array.from(headerCells).map(th => normalizePlayerName(th.textContent.trim())).slice(1, headerCells.length - 2);
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

function updateTournamentBracket(block, rankings) {
    const blockShort = block.split('-')[0]; // red or blue
    const blockSub = block.split('-')[1]; // a or b

    const playerMap = {};
    rankings.forEach(p => {
        playerMap[`${blockShort}-${blockSub}-${p.rank}`] = p.name;
    });

    // 選手名と順位を更新
    const ranks = [1, 2, 3];
    ranks.forEach(rank => {
        const nameElement = document.getElementById(`bracket-${blockShort}-${blockSub}-${rank}-name`);
        const rankElement = document.getElementById(`bracket-${blockShort}-${blockSub}-${rank}-rank`);
        if (nameElement && rankElement) {
            const player = rankings.find(p => p.rank === rank);
            if (player) {
                // ブロック名と選手名を両方表示
                nameElement.textContent = `${blockShort.toUpperCase()} STARS ${blockSub.toUpperCase()}`;
                rankElement.textContent = `${rank}位 ${player.name}`;
            } else {
                nameElement.textContent = `${blockShort.toUpperCase()} STARS ${blockSub.toUpperCase()}`;
                rankElement.textContent = `${rank}位`;
            }
        }
    });
}

function checkCompletionAndRank(block) {
    const statusEl = document.getElementById(`${block}-status`);
    if (isBlockComplete(block)) {
        console.log(`${block}の全試合が完了しました。順位を計算します。`);
        const rankings = determineBlockRankings(block);
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
    const tournamentSlots = {
        '8.20': [
            { type: '予選', p1_id: 'bracket-blue-a-3-name', p2_id: 'bracket-blue-b-2-name', venue: '後楽園', match_id: 'blue-prelim1' },
            { type: '予選', p1_id: 'bracket-blue-a-2-name', p2_id: 'bracket-blue-b-3-name', venue: '後楽園', match_id: 'blue-prelim2' },
            { type: '予選', p1_id: 'bracket-red-a-3-name', p2_id: 'bracket-red-b-2-name', venue: '後楽園', match_id: 'red-prelim1' },
            { type: '予選', p1_id: 'bracket-red-a-2-name', p2_id: 'bracket-red-b-3-name', venue: '後楽園', match_id: 'red-prelim2' },
            { type: '準々決勝', p1_id: 'bracket-blue-a-1-name', p2_id: 'blue-prelim1-winner', venue: '後楽園', match_id: 'blue-qf1' },
            { type: '準々決勝', p1_id: 'bracket-blue-b-1-name', p2_id: 'blue-prelim2-winner', venue: '後楽園', match_id: 'blue-qf2' },
            { type: '準々決勝', p1_id: 'bracket-red-a-1-name', p2_id: 'red-prelim1-winner', venue: '後楽園', match_id: 'red-qf1' },
            { type: '準々決勝', p1_id: 'bracket-red-b-1-name', p2_id: 'red-prelim2-winner', venue: '後楽園', match_id: 'red-qf2' },
        ],
        '8.23': [
            { type: '準決勝', p1_id: 'blue-qf1-winner', p2_id: 'blue-qf2-winner', venue: '大田区', match_id: 'blue-sf' },
            { type: '準決勝', p1_id: 'red-qf1-winner', p2_id: 'red-qf2-winner', venue: '大田区', match_id: 'red-sf' },
            { type: '決勝', p1_id: 'blue-sf-winner', p2_id: 'red-sf-winner', venue: '大田区', match_id: 'final' },
        ]
    };

    const tournamentWinners = {};

    // 予選と準々決勝の勝者を計算
    Object.keys(tournamentSlots).forEach(slotDate => {
        tournamentSlots[slotDate].forEach(slot => {
            if (slot.type === '予選' || slot.type === '準々決勝' || slot.type === '準決勝' || slot.type === '決勝') {
                const p1_name = document.getElementById(slot.p1_id) ? document.getElementById(slot.p1_id).textContent : slot.p1_id;
                const p2_name = document.getElementById(slot.p2_id) ? document.getElementById(slot.p2_id).textContent : slot.p2_id;
                const matchKey = `tournament-${slot.match_id}`;
                const result = matchResults[matchKey];

                if (result) {
                    if (result === 'win') tournamentWinners[slot.match_id + '-winner'] = p1_name;
                    else if (result === 'lose') tournamentWinners[slot.match_id + '-winner'] = p2_name;
                    else tournamentWinners[slot.match_id + '-winner'] = '引き分け';
                }
            }
        });
    });

    if (tournamentSlots[date]) {
        tournamentSlots[date].forEach(slot => {
            if (slot.venue === venueName) {
                let p1_display, p2_display;
                
                // ブラケット要素から表示名を取得
                if (document.getElementById(slot.p1_id)) {
                    const nameElement = document.getElementById(slot.p1_id);
                    const rankElement = document.getElementById(slot.p1_id.replace('-name', '-rank'));
                    
                    if (rankElement && rankElement.textContent.includes(' ')) {
                        // "1位 選手名" の場合：「ブロック名 順位 (選手名)」
                        const playerName = rankElement.textContent.split(' ').slice(1).join(' ');
                        const rank = rankElement.textContent.split(' ')[0];
                        p1_display = `${nameElement.textContent} ${rank} (${playerName})`;
                    } else {
                        // 順位が確定していない場合：「ブロック名 順位」
                        p1_display = `${nameElement.textContent} ${rankElement.textContent}`;
                    }
                } else {
                    // 予選勝者や準々決勝勝者などの場合
                    if (slot.p1_id.includes('winner')) {
                        // 実際の勝者名を取得
                        const actualWinner = getActualTournamentWinner(slot.p1_id);
                        if (actualWinner) {
                            p1_display = actualWinner;
                        } else {
                            // 勝者が未定の場合の表示
                            if (slot.p1_id === 'blue-prelim1-winner') p1_display = 'Blue Stars A 3位 vs Blue Stars B 2位の勝者';
                            else if (slot.p1_id === 'blue-prelim2-winner') p1_display = 'Blue Stars A 2位 vs Blue Stars B 3位の勝者';
                            else if (slot.p1_id === 'red-prelim1-winner') p1_display = 'Red Stars A 3位 vs Red Stars B 2位の勝者';
                            else if (slot.p1_id === 'red-prelim2-winner') p1_display = 'Red Stars A 2位 vs Red Stars B 3位の勝者';
                            else if (slot.p1_id === 'blue-qf1-winner') p1_display = 'Blue側準々決勝1の勝者';
                            else if (slot.p1_id === 'blue-qf2-winner') p1_display = 'Blue側準々決勝2の勝者';
                            else if (slot.p1_id === 'red-qf1-winner') p1_display = 'Red側準々決勝1の勝者';
                            else if (slot.p1_id === 'red-qf2-winner') p1_display = 'Red側準々決勝2の勝者';
                            else if (slot.p1_id === 'blue-sf-winner') p1_display = 'Blue側準決勝の勝者';
                            else if (slot.p1_id === 'red-sf-winner') p1_display = 'Red側準決勝の勝者';
                            else p1_display = slot.p1_id;
                        }
                    } else {
                        p1_display = slot.p1_id;
                    }
                }
                
                if (document.getElementById(slot.p2_id)) {
                    const nameElement = document.getElementById(slot.p2_id);
                    const rankElement = document.getElementById(slot.p2_id.replace('-name', '-rank'));
                    
                    if (rankElement && rankElement.textContent.includes(' ')) {
                        // "1位 選手名" の場合：「ブロック名 順位 (選手名)」
                        const playerName = rankElement.textContent.split(' ').slice(1).join(' ');
                        const rank = rankElement.textContent.split(' ')[0];
                        p2_display = `${nameElement.textContent} ${rank} (${playerName})`;
                    } else {
                        // 順位が確定していない場合：「ブロック名 順位」
                        p2_display = `${nameElement.textContent} ${rankElement.textContent}`;
                    }
                } else {
                    // 予選勝者や準々決勝勝者などの場合
                    if (slot.p2_id.includes('winner')) {
                        // 実際の勝者名を取得
                        const actualWinner = getActualTournamentWinner(slot.p2_id);
                        if (actualWinner) {
                            p2_display = actualWinner;
                        } else {
                            // 勝者が未定の場合の表示
                            if (slot.p2_id === 'blue-prelim1-winner') p2_display = 'Blue Stars A 3位 vs Blue Stars B 2位の勝者';
                            else if (slot.p2_id === 'blue-prelim2-winner') p2_display = 'Blue Stars A 2位 vs Blue Stars B 3位の勝者';
                            else if (slot.p2_id === 'red-prelim1-winner') p2_display = 'Red Stars A 3位 vs Red Stars B 2位の勝者';
                            else if (slot.p2_id === 'red-prelim2-winner') p2_display = 'Red Stars A 2位 vs Red Stars B 3位の勝者';
                            else if (slot.p2_id === 'blue-qf1-winner') p2_display = 'Blue側準々決勝1の勝者';
                            else if (slot.p2_id === 'blue-qf2-winner') p2_display = 'Blue側準々決勝2の勝者';
                            else if (slot.p2_id === 'red-qf1-winner') p2_display = 'Red側準々決勝1の勝者';
                            else if (slot.p2_id === 'red-qf2-winner') p2_display = 'Red側準々決勝2の勝者';
                            else if (slot.p2_id === 'blue-sf-winner') p2_display = 'Blue側準決勝の勝者';
                            else if (slot.p2_id === 'red-sf-winner') p2_display = 'Red側準決勝の勝者';
                            else p2_display = slot.p2_id;
                        }
                    } else {
                        p2_display = slot.p2_id;
                    }
                }

                const matchKey = `tournament-${slot.match_id}`;
                const result = matchResults[matchKey];

                matches.push({ player1: p1_display, player2: p2_display, result: result, date: date, block: 'トーナメント', type: slot.type, match_id: slot.match_id });
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
    
    // 確定データ読み込み後にテーブルを更新
    refreshAllTables();

    // 初期状態で優勝者表示をチェック
    updateChampionDisplay();

    // テーブルを動的生成
    generateTables();

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
                    const isClickable = (i < j); // 上三角のみクリック可能
                    const clickableClass = isClickable ? 'clickable-cell' : '';
                    const dataAttrs = isClickable ?
                        `data-player1="${team1}" data-player2="${team2}" data-block="${blockId}"` : '';

                    html += `<td class="match-info ${clickableClass}" ${dataAttrs}>
                        <div class="date">${date}</div>
                        <div class="venue">${venue}</div>
                        ${isClickable ? `<div class="match-results">
                            <div class="confirmed-result"></div>
                            <div class="predicted-result"></div>
                        </div>` : ''}
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

    // 全ブロックから日付・会場情報を収集
    blocks.forEach(blockId => {
        const blockData = tournamentData[blockId];
        if (!blockData) return;

        blockData.matches.forEach(match => {
            const [t1, t2, date, venue] = match;
            venueMap.set(date, venue);
        });
    });

    // トーナメント試合の日程を追加（決勝トーナメント）
    venueMap.set('8.20', '後楽園');  // 予選・準々決勝
    venueMap.set('8.23', '大田区');  // 準決勝・決勝

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
