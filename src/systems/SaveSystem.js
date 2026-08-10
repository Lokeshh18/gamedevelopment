const STORAGE_KEY = 'GILLI_DANDA_SAVE_V1';

const DEFAULT_SAVE = {
  highScore: 0,
  bestDistance: 0,
  totalPoints: 0,
  unlockedDandas: ['bamboo'],
  selectedDanda: 'bamboo',
  soundMuted: false
};

export class SaveSystem {
  static load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return { ...DEFAULT_SAVE, ...JSON.parse(data) };
    } catch (e) {
      console.warn('LocalStorage unavailable:', e);
    }
    return { ...DEFAULT_SAVE };
  }

  static save(data) {
    try {
      const current = this.load();
      const updated = { ...current, ...data };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn('LocalStorage write failed:', e);
      return null;
    }
  }

  static getSelectedDanda() {
    return this.load().selectedDanda || 'bamboo';
  }

  static setSelectedDanda(dandaId) {
    const save = this.load();
    save.selectedDanda = dandaId;
    this.save(save);
  }

  static unlockDanda(dandaId, cost) {
    const save = this.load();
    if (!save.unlockedDandas.includes(dandaId) && save.totalPoints >= cost) {
      save.totalPoints -= cost;
      save.unlockedDandas.push(dandaId);
      save.selectedDanda = dandaId;
      this.save(save);
      return true;
    }
    return false;
  }

  static recordScore(score, distance, pointsEarned) {
    const save = this.load();
    if (score > save.highScore) save.highScore = score;
    if (distance > save.bestDistance) save.bestDistance = distance;
    save.totalPoints += pointsEarned;
    this.save(save);
    return save;
  }
}
