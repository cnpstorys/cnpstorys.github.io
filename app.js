const CNP_CONTRACT_ADDRESS = '0x138A5C693279b6Cd82F48d4bEf563251Bc15ADcE';
const ALCHEMY_API_KEY = 'gvAPrvagAptflNs0-2UE7';

let pageKey = undefined;
let isLastPage = false;
let currentPage = 1;
let allNfts = [];
let exps = JSON.parse(localStorage.getItem('exps') || '[]');

const output = document.getElementById('output');
const input = document.getElementById('cmdInput');
if (input) {
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const cmd = input.value.trim();
      run(cmd);
      input.value = '';
    }
  });
}

const rankingEl = document.getElementById('ranking');
const prevBtn = document.getElementById('prevBtn');
const myCnpSection = document.getElementById('myCnpSection');
const myCnpGrid = document.getElementById('myCnpGrid');

const nextBtn = document.getElementById('nextBtn');
if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    if (pageKey || currentPage * 12 < allNfts.length) {
      currentPage++;
      if (pageKey) {
        loadAndRender(pageKey);
      } else {
        loadAndRender();
      }
    }
  });
}

const pageInfo = document.getElementById('pageInfo');
const walletBtn = document.getElementById('walletBtn');

let walletAddress = null;

function appendLine(text, cls) {
  const div = document.createElement('div');
  if (cls) div.classList.add(cls);
  div.textContent = text;
  output.appendChild(div);
  output.scrollTop = output.scrollHeight;
}

async function fetchCNPs(pageToken) {
  if (ALCHEMY_API_KEY === 'YOUR_API_KEY') {
    return getMockData(pageToken);
  }
  
  try {
    const url = `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTsForCollection?contractAddress=${CNP_CONTRACT_ADDRESS}&withMetadata=true&limit=100${pageToken ? `&pageKey=${pageToken}` : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('API request failed');
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching CNPs:', error);
    return null;
  }
}

async function fetchUserCNPs(walletAddress) {
  if (ALCHEMY_API_KEY === 'YOUR_API_KEY') {
    return getMockUserData(walletAddress);
  }
  
  try {
    const url = `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTsForOwner?owner=${walletAddress}&contractAddresses[]=${CNP_CONTRACT_ADDRESS}&withMetadata=true&pageSize=100`;
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user CNPs:', error);
    return null;
  }
}

function getMockData(pageToken) {
  const mockNfts = [];
  const startId = pageToken ? parseInt(pageToken) : 1;
  const endId = Math.min(startId + 99, 100);
  
  for (let i = startId; i <= endId; i++) {
    mockNfts.push({
      tokenId: i.toString(),
      name: `[Locked]Narukami #${i.toString().padStart(5, '0')}`,
      description: `The hawk "Narukami" is Hayate's partner in CryptoNinja. They seem to transform into various forms to carry out their missions...!`,
      image: {
        cachedUrl: `https://via.placeholder.com/300x300/333/666?text=CNP%23${i}`,
        originalUrl: `https://via.placeholder.com/300x300/333/666?text=CNP%23${i}`
      },
      raw: {
        metadata: {
          attributes: [
            { trait_type: 'CHARACTER', value: 'Narukami' },
            { trait_type: 'CLAN', value: 'Iga' },
            { trait_type: 'COSPLAY', value: 'CNP Origins' }
          ]
        }
      }
    });
  }
  
  return {
    nfts: mockNfts,
    pageKey: endId < 100 ? (endId + 1).toString() : null
  };
}

function getMockUserData(walletAddress) {
  const mockNfts = [];
  const ownedCount = Math.floor(Math.random() * 5) + 1;
  
  for (let i = 0; i < ownedCount; i++) {
    const tokenId = Math.floor(Math.random() * 100) + 1;
    mockNfts.push({
      tokenId: tokenId.toString(),
      name: `[Locked]Narukami #${tokenId.toString().padStart(5, '0')}`,
      description: `The hawk "Narukami" is Hayate's partner in CryptoNinja.`,
      image: {
        cachedUrl: `https://via.placeholder.com/300x300/333/666?text=CNP%23${tokenId}`,
        originalUrl: `https://via.placeholder.com/300x300/333/666?text=CNP%23${tokenId}`
      },
      raw: {
        metadata: {
          attributes: [
            { trait_type: 'CHARACTER', value: 'Narukami' },
            { trait_type: 'CLAN', value: 'Iga' },
            { trait_type: 'COSPLAY', value: 'CNP Origins' }
          ]
        }
      }
    });
  }
  
  return { ownedNfts: mockNfts };
}

function calculateScore(cnp) {
  const experiences = exps.filter(exp => exp.token_id === cnp.tokenId);
  const totalPoints = experiences.reduce((sum, exp) => sum + exp.points, 0);
  const totalLikes = experiences.reduce((sum, exp) => sum + (exp.likes || 0), 0);
  return totalPoints * (totalLikes + 1);
}

function renderCNPCard(cnp) {
  const card = document.createElement('div');
  card.className = 'cnp-card';
  
  const score = calculateScore(cnp);
  const experiences = exps.filter(exp => exp.token_id === cnp.tokenId);
  
  const imageUrl = cnp.image?.cachedUrl || cnp.image?.originalUrl || 'https://via.placeholder.com/200x200/333/666?text=CNP';
  
  card.innerHTML = `
    <img src="${imageUrl}" alt="CNP #${cnp.tokenId}" class="cnp-image" onerror="this.src='https://via.placeholder.com/200x200/333/666?text=CNP'">
    <div class="cnp-info">
      <span class="cnp-id">ランキング${cnp.tokenId}位</span>
      <span class="cnp-score">Score: ${score}</span>
    </div>
    <div class="cnp-name">${cnp.name || `CNP #${cnp.tokenId}`}</div>
    <div class="cnp-stats">
      <span>経験: ${experiences.length}</span>
      <span>いいね: ${experiences.reduce((sum, exp) => sum + (exp.likes || 0), 0)}</span>
    </div>
  `;
  
  card.onclick = () => window.location.href = `cnp.html?token_id=${cnp.tokenId}`;
  return card;
}

function renderMyCNPCard(cnp) {
  const card = document.createElement('div');
  card.className = 'my-cnp-card';
  
  const score = calculateScore(cnp);
  const experiences = exps.filter(exp => exp.token_id === cnp.tokenId);
  
  const imageUrl = cnp.image?.cachedUrl || cnp.image?.originalUrl || 'https://via.placeholder.com/200x200/333/666?text=CNP';
  
  card.innerHTML = `
    <img src="${imageUrl}" alt="CNP #${cnp.tokenId}" class="my-cnp-image" onerror="this.src='https://via.placeholder.com/200x200/333/666?text=CNP'">
    <div class="my-cnp-info">
      <span class="my-cnp-id">CNP #${cnp.tokenId}</span>
      <span class="my-cnp-score">Score: ${score}</span>
    </div>
    <div class="my-cnp-name">${cnp.name || `CNP #${cnp.tokenId}`}</div>
    <div class="my-cnp-stats">
      <span>経験: ${experiences.length}</span>
      <span>いいね: ${experiences.reduce((sum, exp) => sum + (exp.likes || 0), 0)}</span>
    </div>
  `;
  
  card.onclick = () => window.location.href = `cnp.html?token_id=${cnp.tokenId}`;
  return card;
}

function updateMyCNPSection(userCNPs) {
  if (!myCnpSection || !myCnpGrid) return;
  
  if (userCNPs && userCNPs.length > 0) {
    myCnpSection.style.display = 'block';
    myCnpGrid.innerHTML = '';
    userCNPs.forEach(cnp => {
      myCnpGrid.appendChild(renderMyCNPCard(cnp));
    });
  } else {
    myCnpSection.style.display = 'none';
  }
}

async function loadAndRender(nextToken) {
  if (rankingEl) rankingEl.innerHTML = '<div class="loading">CNPデータを読み込み中...</div>';
  const data = await fetchCNPs(nextToken);
  if (!data) {
    if (rankingEl) rankingEl.innerHTML = '<div class="error">データの取得に失敗しました</div>';
    return;
  }
  const nfts = data.nfts || [];
  allNfts = [...allNfts, ...nfts];
  if (rankingEl) rankingEl.innerHTML = '';
  const sortedNfts = allNfts.sort((a, b) => calculateScore(b) - calculateScore(a));
  const startIndex = (currentPage - 1) * 12;
  const endIndex = startIndex + 12;
  const pageNfts = sortedNfts.slice(startIndex, endIndex);
  if (rankingEl) {
    pageNfts.forEach(cnp => {
      rankingEl.appendChild(renderCNPCard(cnp));
    });
  }
  if (prevBtn) prevBtn.disabled = currentPage === 1;
  if (nextBtn) nextBtn.disabled = !data.pageKey && endIndex >= sortedNfts.length;
  pageKey = data.pageKey;
  if (pageInfo) pageInfo.textContent = `ページ ${currentPage} (${startIndex + 1}-${Math.min(endIndex, sortedNfts.length)} / ${sortedNfts.length})`;
}

function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    walletAddress = null;
    walletBtn.textContent = 'ウォレット接続';
    walletBtn.classList.remove('connected');
    appendLine('ウォレットが切断されました', 'warning');
    updateMyCNPSection([]);
  } else if (accounts[0] !== walletAddress) {
    walletAddress = accounts[0];
    walletBtn.textContent = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
    walletBtn.classList.add('connected');
    appendLine(`ウォレットアカウントが変更されました: ${walletAddress}`, 'info');
    
    appendLine('新しいアカウントのCNPを取得中...', 'info');
    fetchUserCNPs(walletAddress).then(userData => {
      if (userData && userData.ownedNfts && userData.ownedNfts.length > 0) {
        appendLine(`保有CNP数: ${userData.ownedNfts.length}`, 'success');
        userData.ownedNfts.forEach(cnp => {
          appendLine(`- CNP #${cnp.tokenId}: ${cnp.name}`, 'info');
        });
        updateMyCNPSection(userData.ownedNfts);
      } else if (userData && userData.nfts && userData.nfts.length > 0) {
        appendLine(`保有CNP数: ${userData.nfts.length}`, 'success');
        userData.nfts.forEach(cnp => {
          appendLine(`- CNP #${cnp.tokenId}: ${cnp.name}`, 'info');
        });
        updateMyCNPSection(userData.nfts);
      } else {
        appendLine('保有CNPはありません', 'warning');
        updateMyCNPSection([]);
      }
    });
  }
}

function handleChainChanged() {
  appendLine('ネットワークが変更されました。ページを再読み込みしてください', 'warning');
  setTimeout(() => {
    window.location.reload();
  }, 3000);
}

function setupMetaMaskListeners() {
  if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
  }
}

if (walletBtn) {
  walletBtn.addEventListener('click', async () => {
    if (walletAddress) {
      // ウォレットが接続済みの場合、即座に切断する
      appendLine('ウォレットを切断中...', 'info');
      
      walletAddress = null;
      walletBtn.textContent = 'ウォレット接続';
      walletBtn.classList.remove('connected');
      appendLine('ウォレットが切断されました', 'warning');
      updateMyCNPSection([]);
      return;
    }
    
    if (typeof window.ethereum !== 'undefined') {
      try {
        appendLine('MetaMaskに接続リクエストを送信中...', 'info');
        
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts',
          params: []
        });
        
        if (!accounts || accounts.length === 0) {
          appendLine('ウォレット接続がキャンセルされました', 'warning');
          return;
        }
        
        walletAddress = accounts[0];
        walletBtn.textContent = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
        walletBtn.classList.add('connected');
        appendLine(`ウォレット接続完了: ${walletAddress}`, 'success');
        
        appendLine('保有CNPを取得中...', 'info');
        const userData = await fetchUserCNPs(walletAddress);
        if (userData && userData.ownedNfts && userData.ownedNfts.length > 0) {
          appendLine(`保有CNP数: ${userData.ownedNfts.length}`, 'success');
          userData.ownedNfts.forEach(cnp => {
            appendLine(`- CNP #${cnp.tokenId}: ${cnp.name}`, 'info');
          });
          updateMyCNPSection(userData.ownedNfts);
        } else if (userData && userData.nfts && userData.nfts.length > 0) {
          appendLine(`保有CNP数: ${userData.nfts.length}`, 'success');
          userData.nfts.forEach(cnp => {
            appendLine(`- CNP #${cnp.tokenId}: ${cnp.name}`, 'info');
          });
          updateMyCNPSection(userData.nfts);
        } else {
          appendLine('保有CNPはありません', 'warning');
          updateMyCNPSection([]);
        }
      } catch (error) {
        console.error('Wallet connection error:', error);
        
        if (error.code === 4001) {
          appendLine('ウォレット接続がユーザーによって拒否されました', 'warning');
        } else if (error.code === -32002) {
          appendLine('MetaMaskが既に処理中です。MetaMaskを確認してください', 'warning');
        } else if (error.message && error.message.includes('timeout')) {
          appendLine('接続がタイムアウトしました。再度お試しください', 'error');
        } else if (error.message && error.message.includes('User rejected')) {
          appendLine('ウォレット接続がキャンセルされました', 'warning');
        } else {
          appendLine(`ウォレット接続エラー: ${error.message || '不明なエラー'}`, 'error');
        }
      }
    } else {
      appendLine('MetaMaskがインストールされていません。MetaMaskをインストールしてください', 'error');
      appendLine('https://metamask.io/download/', 'info');
    }
  });
}

function run(cmd) {
  appendLine(`[cnpstorys]$ ${cmd}`, 'prompt-prefix');
  const [c, ...args] = cmd.split(' ');
  
  switch (c) {
    case 'connect-wallet':
      walletBtn.click();
      break;
    case 'check-cnp':
      if (!walletAddress) {
        appendLine('先にウォレットを接続してください');
        return;
      }
      const tokenId = args[0];
      const hasCNP = allNfts.some(nft => nft.tokenId === tokenId);
      appendLine(`CNP ${tokenId} 所有状況: ${hasCNP ? '保有中' : '未保有'}`);
      break;
    case 'show-cnp':
      const cnp = allNfts.find(nft => nft.tokenId === args[0]);
      if (cnp) {
        appendLine(`CNP #${cnp.tokenId}: ${cnp.name}`);
        appendLine(`画像: ${cnp.image?.cachedUrl || cnp.image?.originalUrl}`);
      } else {
        appendLine(`CNP #${args[0]} が見つかりません`);
      }
      break;
    case 'show-ranking':
      const topNfts = allNfts.sort((a, b) => calculateScore(b) - calculateScore(a)).slice(0, 10);
      topNfts.forEach((nft, index) => {
        const score = calculateScore(nft);
        appendLine(`${index + 1}. CNP #${nft.tokenId} - Score: ${score}`);
      });
      break;
    case 'register-exp':
      if (!walletAddress) {
        appendLine('先にウォレットを接続してください');
        return;
      }
      const [id, title, url, type] = args;
      const points = type === 'SNS' ? 10 : type === 'Site' ? 20 : 5;
      exps.push({ token_id: id, title, url, type, points, wallet: walletAddress });
      localStorage.setItem('exps', JSON.stringify(exps));
      appendLine(`CNP #${id} に経験を登録しました: ${title}`);
      loadAndRender();
      break;
    case 'edit-cnp':
      window.location.href = `cnp.html?token_id=${args[0]}`;
      break;
    case 'help':
      appendLine('コマンド一覧:');
      appendLine('  connect-wallet - ウォレット接続');
      appendLine('  check-cnp <id> - CNP所有状況確認');
      appendLine('  show-cnp <id> - CNP詳細表示');
      appendLine('  show-ranking - ランキング表示');
      appendLine('  register-exp <id> <title> <url> <type> - 経験登録');
      appendLine('  edit-cnp <id> - CNP編集ページへ');
      appendLine('  help - このヘルプを表示');
      break;
    default:
      appendLine(`不明なコマンド: ${c}`);
  }
}

appendLine('CNP STORY へようこそ');
if (ALCHEMY_API_KEY === 'YOUR_API_KEY') {
  appendLine('$26A0$FE0F モックデータモード: Alchemy APIキーを設定してください', 'warning');
}

appendLine('Type "help" for commands.');

setupMetaMaskListeners();

if (prevBtn) {
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      loadAndRender();
    }
  });
}

loadAndRender();

