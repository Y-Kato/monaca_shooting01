class PlaySoundeffect {
	static Explosion() {
		let audioElm = new Audio('./sounds/explosion.mp3');
		audioElm.play();
	}
	static Damage() {
		let audioElm = new Audio('./sounds/damage.mp3');
		audioElm.play();
	}
	static BigExplosion() {
		let audioElm = new Audio('./sounds/big-explosion.mp3');
		audioElm.play();
	}
}
class PlayBattleBGM {
	static Start() {
		PlayBattleBGM.audioElm.currentTime = 0.5;
		PlayBattleBGM.audioElm.play();
	}
	static Stop() {
		PlayBattleBGM.audioElm.pause();
	}
	static Check() {
		if (PlayBattleBGM.audioElm.currentTime >= 21.4) {
			PlayBattleBGM.Start();
		}
	}
}
PlayBattleBGM.audioElm = new Audio('./sounds/battle.mp3');
class PlayBattleBossBGM {
	static Start() {
		PlayBattleBossBGM.audioElm.currentTime = 0;
		PlayBattleBossBGM.audioElm.play();
	}
	static Restart() {
		PlayBattleBossBGM.audioElm.currentTime = 3.5;
		PlayBattleBossBGM.audioElm.play();
	}
	static Stop() {
		PlayBattleBossBGM.audioElm.pause();
	}
	static Check() {
		if (PlayBattleBossBGM.audioElm.currentTime >= 44.5) {
			PlayBattleBossBGM.Restart();
		}
	}
}
PlayBattleBossBGM.audioElm = new Audio('./sounds/boss.mp3');
