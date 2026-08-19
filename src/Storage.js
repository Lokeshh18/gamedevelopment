// Storage.js - LocalStorage & Player State Manager

const STORAGE_KEYS = {
  HIGH_SCORES: 'gilli_danda_high_scores',
  EQUIPPED_DANDA: 'gilli_danda_equipped',
  UNLOCKED_DANDAS: 'gilli_danda_unlocked',
  TOTAL_DISTANCE: 'gilli_danda_total_distance'
};

export const DANDA_TYPES = {
  BAMBOO: {
    id: 'bamboo',
    name: 'Classic Bamboo (மூங்கில்)',
    icon: '🎋',
    desc: 'Lightweight village bamboo stick. Great for beginners.',
    powerMultiplier: 1.0,
    cost: 0,
    color: '#88ab52'
  },
  TEAK: {
    id: 'teak',
    name: 'Polished Teak (தேக்கு)',
    icon: '🪵',
    desc: 'Heavy polished teak wood giving +20% strike impulse power.',
    powerMultiplier: 1.2,
    cost: 150, // 150 meters total distance needed
    color: '#a0522d'
  },
  CARVED_TEMPLE: {
    id: 'carved_temple',
    name: 'Temple Carved Wood (சிற்பக் மரக்கட்டை)',
    icon: '🏛️',
    desc: 'Intricately carved sacred wood granting +40% distance power!',
    powerMultiplier: 1.4,
    cost: 400,
    color: '#d4af37'
  },
  GOLDEN_DANDA: {
    id: 'golden_danda',
    name: 'Royal Golden Pul (தங்க புல்)',
    icon: '👑',
    desc: 'Legendary golden stick of Tamil Kings! Massive +70% power booster.',
    powerMultiplier: 1.7,
    cost: 1000,
    color: '#ffd700'
  }
};

export class StorageManager {
  static getEquippedDanda() {
    const id = localStorage.getItem(STORAGE_KEYS.EQUIPPED_DANDA) || 'bamboo';
    return DANDA_TYPES[id.toUpperCase()] || DANDA_TYPES.BAMBOO;
  }

  static setEquippedDanda(id) {
    localStorage.setItem(STORAGE_KEYS.EQUIPPED_DANDA, id);
  }

  static getUnlockedDandas() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.UNLOCKED_DANDAS);
      return data ? JSON.parse(data) : ['bamboo'];
    } catch (e) {
      return ['bamboo'];
    }
  }

  static unlockDanda(id) {
    const unlocked = this.getUnlockedDandas();
    if (!unlocked.includes(id)) {
      unlocked.push(id);
      localStorage.setItem(STORAGE_KEYS.UNLOCKED_DANDAS, JSON.stringify(unlocked));
    }
  }

  static getTotalDistance() {
    return parseFloat(localStorage.getItem(STORAGE_KEYS.TOTAL_DISTANCE) || '0');
  }

  static addDistance(meters) {
    const current = this.getTotalDistance();
    const next = current + meters;
    localStorage.setItem(STORAGE_KEYS.TOTAL_DISTANCE, next.toFixed(1));
    return next;
  }

  static getHighScores() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HIGH_SCORES);
      if (data) return JSON.parse(data);
    } catch (e) {}

    // Default sample Tamil village leaderboard
    return [
      { rank: 1, playerName: 'Striker 1', title: 'Oor Thalaiver (ஊர் தலைவர்)', mode: 'Far Launch', score: '385.4 m', date: '2026-07-20' },
      { rank: 2, playerName: 'Striker 2', title: 'Kitti Master (கிட்டி மாஸ்டர்)', mode: 'Far Launch', score: '290.1 m', date: '2026-07-22' },
      { rank: 3, playerName: 'Maran', title: 'Uri Smasher (உறி வீரன்)', mode: 'Uri Smash', score: '5 Pots', date: '2026-07-24' }
    ];
  }

  static saveHighScore(playerName, modeName, scoreVal, scoreText) {
    const scores = this.getHighScores();

    // Assign cultural rank title based on score
    let title = 'Village Striker';
    if (parseFloat(scoreVal) > 300 || scoreVal >= 5) title = 'Oor Thalaiver (ஊர் தலைவர்)';
    else if (parseFloat(scoreVal) > 180 || scoreVal >= 3) title = 'Kitti Master (கிட்டி மாஸ்டர்)';
    else if (parseFloat(scoreVal) > 90) title = 'Uri Smasher (உறி வீரன்)';

    scores.push({
      rank: 0,
      playerName: playerName || 'Striker',
      title: title,
      mode: modeName,
      score: scoreText,
      date: new Date().toISOString().split('T')[0]
    });

    // Sort descending
    scores.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));

    // Re-assign ranks 1..5
    const top5 = scores.slice(0, 8).map((item, idx) => ({ ...item, rank: idx + 1 }));
    localStorage.setItem(STORAGE_KEYS.HIGH_SCORES, JSON.stringify(top5));
    return title;
  }
}
