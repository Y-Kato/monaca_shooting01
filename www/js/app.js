let g_scene = new THREE.Scene();
let g_renderer;
let g_light;
let g_camera;
let g_renderer_width = screen.width; // 600
let g_renderer_height = screen.height; // 380
let g_header_context;
let g_footer_context;
let g_stage_num = 1;
var g_status;
(function (g_status) {
	g_status[g_status["Battle"] = 0] = "Battle";
	g_status[g_status["Boss"] = 1] = "Boss";
	g_status[g_status["GameOver"] = 2] = "GameOver";
})(g_status || (g_status = {}));
let g_game_status = g_status.GameOver;
let g_owns;
let g_owns_bullets = [];
let g_enemies = [];
let g_enemies_bullets = [];
let g_explosions = [];
let g_canvas_back_color = "black";

window.addEventListener("DOMContentLoaded", init);
document.onkeydown = OnKeyDown;
document.onkeyup = OnKeyUp;

function init() {
	let gheader = document.getElementById('gheader');
	gheader.width = g_renderer_width;
	gheader.height = 40;
	g_header_context = gheader.getContext("2d");
	let gfooter = document.getElementById('gfooter');
	gfooter.width = g_renderer_width;
	gfooter.height = 30;
	g_footer_context = gfooter.getContext("2d");
	// レンダラーを作成
	g_renderer = new THREE.WebGLRenderer({
		canvas: document.getElementById('gmain')
	});
	g_renderer.setPixelRatio(window.devicePixelRatio);
	g_renderer.setSize(g_renderer_width, g_renderer_height);
	// カメラを作成
	g_camera = new THREE.PerspectiveCamera(45, g_renderer_width / g_renderer_height, 0.01, 60);
	g_camera.position.set(0, -6, 5);
	g_camera.lookAt(new THREE.Vector3(0, 7, 0));
	// 光源
	g_light = new THREE.AmbientLight(0xFFFFFF, 1.0);
	g_light.position.set(0, -1, 1);
	g_light.intensity = 2;
	g_scene.add(g_light);
	// 縦横の直線を描画して3Dっぽさを演出する
	for (let y = -50; y < 50; y += 2)
		AddLineEW(y);
	for (let x = -50; x < 50; x += 2)
		AddLineNS(x);
	ShowStringGameOver();
	g_scene.remove(GameOverSprite);
	g_owns = new Own();
	tick();
}
// 縦横の直線を描画して3Dっぽさを演出する
// LineEWsは直線の描画位置を変更するときに必要
let LineEWs = [];
function AddLineEW(y) {
	const line_material = new THREE.LineBasicMaterial({ color: 0x008000 });
	//geometryの宣言と生成
	//@ts-ignore
	var line_geometry = new THREE.Geometry();
	//頂点座標の追加
	line_geometry.vertices.push(new THREE.Vector3(-50, y, -2), new THREE.Vector3(50, y, -2));
	//線オブジェクトの生成
	let line = new THREE.Line(line_geometry, line_material);
	//g_sceneにlineを追加
	g_scene.add(line);
	LineEWs.push(line);
}
function AddLineNS(x) {
	const line_material = new THREE.LineBasicMaterial({ color: 0x008000 });
	//geometryの宣言と生成
	//@ts-ignore
	var line_geometry = new THREE.Geometry();
	//頂点座標の追加
	line_geometry.vertices.push(new THREE.Vector3(x, -50, -2), new THREE.Vector3(x, 50, -2));
	//線オブジェクトの生成
	let line = new THREE.Line(line_geometry, line_material);
	//g_sceneにlineを追加
	g_scene.add(line);
}
let tickCount = 0;
function tick() {
	//console.log("g_scene.children.length = " + g_scene.children.length);
	tickCount++;
	requestAnimationFrame(tick);
	// フィールドに描画されている縦横の直線を手前に向かって移動させ自機が前に移動しているように見せかける
	MoveLines();
	if (g_game_status != g_status.GameOver) {
		// 当たり判定（ゲームオーバーになったあとは考えなくてよい）
		// 自機から発射された弾丸は敵に命中したか？
		CheckOwnBurretsHit();
		// 敵機から発射された弾丸は自機に命中したか？
		CheckEnemyBulletsHit();
		// 自機が敵そのものと衝突してしまったか？
		CheckOwnCollidedEnemy();
		// 自機を移動させる
		g_owns.Move();
	}
	// ゲームオーバーになった弾丸の動きが止まってしまわないようにg_game_status == g_status.Noneであっても処理は必要
	// 自機の弾丸を移動させる
	OwnBurretsMove();
	// 敵を移動させる
	EnemiesMove();
	// 敵の弾丸を移動させる
	EnemiesBulletsMove();
	// 爆発を移動させる
	ExplosionsMove();
	// 必要なら新しい敵をつくる
	CreateNewEnemyIfNeed();
	// レンダリング
	g_renderer.render(g_scene, g_camera);
	// 得点やボスのLifeなどを表示する
	ShowEtc();
}
// フィールドに描画されている縦横の直線を手前に向かって移動させ自機が前に移動しているように見せかける
function MoveLines() {
	LineEWs.forEach(x => { x.translateY(-0.1); });
	LineEWs.forEach(x => { if (x.position.y < -2)
		x.translateY(50); });
}
// 自機から発射された弾丸は敵に命中したか？
function CheckOwnBurretsHit() {
	for (let i = 0; i < g_enemies.length; i++) {
		if (g_enemies[i].life <= 0)
			continue;
		for (let j = 0; j < g_owns_bullets.length; j++) {
			if (g_owns_bullets[j].life <= 0)
				continue;
			let a = Math.pow((g_enemies[i].size * 0.5 + g_owns_bullets[j].size * 0.5), 2);
			let distance = Math.pow((g_enemies[i].X - g_owns_bullets[j].X), 2) + Math.pow((g_enemies[i].Y - g_owns_bullets[j].Y), 2);
			if (a > distance) {
				if (g_enemies[i].constructor === Boss && Boss.isLock)
					break;
				g_enemies[i].life--;
				BurretHit(g_enemies[i]);
				g_owns_bullets[j].life = 0;
				break;
			}
		}
	}
}
// 敵機から発射された弾丸は自機に命中したか？
function CheckEnemyBulletsHit() {
	for (let i = 0; i < g_enemies_bullets.length; i++) {
		if (g_enemies_bullets[i].life <= 0)
			continue;
		let radis2 = Math.pow((g_enemies_bullets[i].size * 0.5 + g_owns.size * 0.5), 2);
		let distance2 = Math.pow((g_enemies_bullets[i].X - g_owns.X), 2) + Math.pow((g_enemies_bullets[i].Y - g_owns.Y), 2);
		if (radis2 > distance2) {
			g_enemies_bullets[i].life = 0;
			OwnDamage();
		}
	}
}
// 自機が敵そのものと衝突してしまったか？
function CheckOwnCollidedEnemy() {
	for (let i = 0; i < g_enemies.length; i++) {
		if (g_enemies[i].life <= 0)
			continue;
		let radis2 = Math.pow((g_enemies[i].size * 0.5 + g_owns.size * 0.5), 2);
		let distance2 = Math.pow((g_enemies[i].X - g_owns.X), 2) + Math.pow((g_enemies[i].Y - g_owns.Y), 2);
		if (radis2 > distance2) {
			g_enemies[i].life = 0;
			OwnDamage();
		}
	}
}
// 自機の弾丸を移動させる
function OwnBurretsMove() {
	// 離れた位置まで飛びすぎた弾丸やすでに何かに命中した弾丸は描画対象からはずす
	g_owns_bullets.forEach(x => x.Move());
	let noNeedBurrets = g_owns_bullets.filter(x => !(x.life >= 1 && x.Y < 40));
	g_owns_bullets = g_owns_bullets.filter(x => x.life >= 1 && x.Y < 40);
	noNeedBurrets.forEach(x => x.RemoveScene(g_scene));
}
// 敵を移動させる
function EnemiesMove() {
	// 離れた位置まで移動しすぎた敵や撃墜された敵は描画対象からはずす
	g_enemies.forEach(x => x.Move());
	let noNeedg_enemies = g_enemies.filter(x => !(x.life >= 1 && x.Y > -1 && x.Y < 40));
	g_enemies = g_enemies.filter(x => x.life >= 1 && x.Y > -1 && x.Y < 40);
	noNeedg_enemies.forEach(x => x.RemoveScene(g_scene));
}
// 敵の弾丸を移動させる
function EnemiesBulletsMove() {
	// 離れた位置まで飛びすぎた弾丸やすでに何かに命中した弾丸は描画対象からはずす
	g_enemies_bullets.forEach(x => x.Move());
	let noNeedg_enemies_bullets = g_enemies_bullets.filter(x => !(x.life >= 1 && x.Y > -1 && x.Y < 50 && x.X < 50 && x.X > -50));
	g_enemies_bullets = g_enemies_bullets.filter(x => x.life >= 1 && x.Y > -1 && x.Y < 50 && x.X < 50 && x.X > -50);
	noNeedg_enemies_bullets.forEach(x => x.RemoveScene(g_scene));
}
// 爆発を移動させる
function ExplosionsMove() {
	g_explosions.forEach(x => x.Move());
	let noNeedg_explosions = g_explosions.filter(x => x.life < 1);
	g_explosions = g_explosions.filter(x => !(x.life < 1));
	noNeedg_explosions.forEach(x => x.RemoveScene(g_scene));
}
// 必要なら新しい敵をつくる。ただしisInterval == trueのときは生成しない
let isInterval = false;
function CreateNewEnemyIfNeed() {
	// ステージクリア直後などisInterval=trueになる。
	// このフラグが立っているときは新しい敵はつくらない
	if (isInterval)
		return;
	// 新しいステージがはじまって一定時間するとボス戦がはじまる
	let BeginBossTickCount = 3000; //3000
	if (tickCount < BeginBossTickCount) {
		CreateEnemy1();
		CreateEnemy2();
		if (g_game_status == g_status.Battle)
			PlayBattleBGM.Check();
	}
	else {
		// ゲームオーバー以降はザコ敵が表示されるだけでボス戦ははじまらない
		if (g_game_status == g_status.GameOver) {
			tickCount = 0;
			// 対ボス戦の最中にゲームオーバーになった場合は
			// ボスはフィールド上からいなくなる
			if (boss != null)
				boss.life = 0;
		}
		else {
			// 新しいステージがはじまってtickCount >< BeginBossTickCountとなり、
			// ザコ敵もいなくなったらボス戦がはじまる
			if (g_enemies.length == 0) {
				if (g_game_status == g_status.Battle) {
					PlayBattleBGM.Stop(); // 通常戦闘時のBGMを停止
					isInterval = true; // すぐにボスを出現させずに2秒間の間をもたせる
					setTimeout(BeginBoss, 2000);
				}
			}
		}
		// ボスのLifeが低下してきたらザコ敵も出現させ、ゲームの難易度を上げる
		if (g_game_status == g_status.Boss) {
			PlayBattleBossBGM.Check();
			if (boss.life < Boss.LifeMax / 2) // 50％を切ったらタイプ2の敵を出現させる
				CreateEnemy2();
			if (boss.life < Boss.LifeMax / 4) // 25％を切ったらさらにタイプ2の敵も出現させる
				CreateEnemy1();
		}
	}
}
// 敵を生成して描画されるようにする
function CreateEnemy1() {
	if (tickCount % 100 == 50) {
		let enemy = new Enemy1();
		g_enemies.push(enemy);
		enemy.AddScene(g_scene);
	}
}
function CreateEnemy2() {
	if (tickCount % 100 == 0) {
		let enemy = new Enemy2();
		g_enemies.push(enemy);
		enemy.AddScene(g_scene);
	}
}
// ボス戦を開始する
let boss = null;
function BeginBoss() {
	// ボスを生成、シーンに追加
	boss = new Boss();
	g_enemies.push(boss);
	boss.AddScene(g_scene);
	// eg_statusをg_status.Bossに変えてBGMも変える
	PlayBattleBossBGM.Start();
	g_game_status = g_status.Boss;
	isInterval = false;
}
// 得点やボスのLifeなどを表示する
function ShowEtc() {
	g_header_context.clearRect(0, 0, g_renderer_width, 60);
	g_header_context.fillStyle = g_canvas_back_color;
	g_header_context.fillRect(0, 0, g_renderer_width, 70);
	ShowBossLife();
	ShowScore();
	ShowOwnLife();
}
function ShowOwnLife() {
	g_footer_context.fillStyle = g_canvas_back_color;
	g_footer_context.fillRect(0, 0, g_renderer_width, 40);
	if (g_owns.life > 0 && g_game_status != g_status.GameOver) {
		g_footer_context.fillStyle = "#0f0";
		g_footer_context.fillRect(20, 0, (g_renderer_width - 40) * (g_owns.life / g_owns.LifeMax), 20);
	}
}
function ShowBossLife() {
	g_header_context.fillStyle = g_canvas_back_color;
	g_header_context.fillRect(0, 40, g_renderer_width, 20);
	if (g_game_status == g_status.Boss && boss.life > 0) {
		g_header_context.fillStyle = "yellow";
		g_header_context.fillRect(20, 40, (g_renderer_width - 40) * (boss.life / Boss.LifeMax), 20);
	}
}
let score = 0;
function ShowScore() {
	g_header_context.fillStyle = "white";
	g_header_context.font = "30px 'ＭＳ ゴシック'";
	let scoreText = "" + score;
	g_header_context.fillText(scoreText, 10, 30);
}
// 自機から発射された弾丸が命中した場合の爆発の発生と点数加算の処理
function BurretHit(x) {
	if (x.constructor === Boss) {
		BurretHitBoss(x);
	}
	else {
		if (x.life <= 0) {
			// ザコ敵に命中してlifeを0にした場合は通常の爆発
			Explode(x.X, x.Y);
			score += 50;
		}
		else {
			// ザコ敵に命中したがlifeが残っている場合は小爆発
			SmallExplode(x.X, x.Y);
		}
	}
}
function BurretHitBoss(boss) {
	// ボスに命中してlifeを0にした場合は大爆発
	if (boss.life <= 0) {
		BigExplode(boss.X, boss.Y);
		// ボス戦は終了したのでボス戦のBGMは停止する
		PlayBattleBossBGM.Stop();
		score += boss.score;
		// ボスのまわりにいるザコ敵も爆発させ、点数加算
		g_enemies.forEach(x => {
			x.life = 0;
			Explode(x.X, x.Y);
			score += x.score / 2;
		});
		// 5秒間のインターバルをおき、つぎのステージに
		isInterval = true;
		setTimeout(BeginNextStage, 5000);
	}
	else {
		// ボスに命中したがlifeが残っている場合は小爆発
		SmallExplode(boss.X, boss.Y);
		score += 10;
	}
}
function BeginNextStage() {
	isInterval = false;
	tickCount = 0;
	g_game_status = g_status.Battle;
	g_stage_num++;
	PlayBattleBGM.Start();
}
function Explode(centerX, centerY) {
	let baseSpeed = 0.1;
	for (let i = 0; i < 10; i++) {
		let r = Math.random();
		let vx = r * baseSpeed * 2 - baseSpeed;
		r = Math.random();
		let vy = r * baseSpeed * 2 - baseSpeed;
		r = Math.random();
		let vz = r * baseSpeed * 2 - baseSpeed;
		let enp = new Explosion(centerX, centerY, vx, vy, vz, 1);
		enp.AddScene(g_scene);
		g_explosions.push(enp);
	}
	PlaySoundeffect.Explosion();
}
function SmallExplode(centerX, centerY) {
	let enp = new Explosion(centerX, centerY, 0, 0, 0, 1);
	enp.AddScene(g_scene);
	g_explosions.push(enp);
}
function BigExplode(centerX, centerY) {
	let baseSpeed = 0.3;
	for (let i = 0; i < 30; i++) {
		let r = Math.random();
		let vx = r * baseSpeed * 2 - baseSpeed;
		r = Math.random();
		let vy = r * baseSpeed * 2 - baseSpeed;
		r = Math.random();
		let vz = r * baseSpeed * 2 - baseSpeed;
		let enp = new Explosion(centerX, centerY, vx, vy, vz, 3);
		enp.AddScene(g_scene);
		g_explosions.push(enp);
	}
	PlaySoundeffect.BigExplosion();
}
//　被弾時の処理
// 被弾時に立て続けにやられないように一時的に「無敵状態」にする
let MutekiMode = false;
function OwnDamage() {
	if (!MutekiMode) {
		g_owns.life--;
		PlaySoundeffect.Damage();
		Explode(g_owns.X, g_owns.Y);
		MutekiMode = true;
		setTimeout(EndMutekiMode, 1000);
		// 被弾時は背景を一瞬赤くする
		BackColor("red");
		setTimeout(BackColor, 100, "black");
		// 自機のlifeが0になったらゲームオーバー
		if (g_owns.life <= 0) {
			// 自機が描画されないようにg_sceneから除去
			g_scene.remove(g_owns.Mesh);
			// BGM停止
			PlayBattleBGM.Stop();
			PlayBattleBossBGM.Stop();
			// ゲームオーバーの表示
			g_game_status = g_status.GameOver;
			ShowStringGameOver();
		}
	}
}
function EndMutekiMode() {
	MutekiMode = false;
}
function BackColor(color) {
	g_renderer.setClearColor(color, 1);
	g_canvas_back_color = color;
}
// ゲームオーバー時はその旨表示する
let GameOverSprite = null;
let PressSKeySprite = null;
function ShowStringGameOver() {
	if (GameOverSprite == null) {
		let canvasTexture = new THREE.CanvasTexture(CreateCanvasForTexture(500, 500, 'GAME OVER', 50));
		let scaleMaster = 5;
		GameOverSprite = CreateSprite(canvasTexture, { x: scaleMaster, y: scaleMaster, z: scaleMaster, }, { x: 0, y: 0, z: 4 });
	}
	if (PressSKeySprite == null) {
		let canvasTexture2 = new THREE.CanvasTexture(CreateCanvasForTexture(500, 500, 'START PRESS S KEY', 50));
		let scaleMaster2 = 3;
		PressSKeySprite = CreateSprite(canvasTexture2, { x: scaleMaster2, y: scaleMaster2, z: scaleMaster2, }, { x: 0, y: 0, z: 3 });
	}
	g_scene.add(GameOverSprite);
	g_scene.add(PressSKeySprite);
}
function CreateSprite(texture, scale, position) {
	const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
	const sprite = new THREE.Sprite(spriteMaterial);
	sprite.scale.set(scale.x, scale.y, scale.z);
	sprite.position.set(position.x, position.y, position.z);
	return sprite;
}
;
function CreateCanvasForTexture(canvasWidth, canvasHeight, text, fontSize) {
	// 貼り付けるcanvasを作成。
	const canvasForText = document.createElement('canvas');
	const ctx = canvasForText.getContext('2d');
	ctx.canvas.width = canvasWidth; // 小さいと文字がぼやける
	ctx.canvas.height = canvasHeight; // 小さいと文字がぼやける
	// 透過する背景を描く
	ctx.fillStyle = 'rgba(0, 0, 0, 0.0)';
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.fillStyle = 'white';
	ctx.font = `${fontSize}px 'ＭＳ ゴシック'`;
	ctx.fillText(text,
	// x方向の余白/2をx方向開始時の始点とすることで、横方向の中央揃えをしている。
	(canvasWidth - ctx.measureText(text).width) / 2,
	// y方向のcanvasの中央に文字の高さの半分を加えることで、縦方向の中央揃えをしている。
	canvasHeight / 2 + ctx.measureText(text).actualBoundingBoxAscent / 2);
	return canvasForText;
}
;
// キー操作に関する処理
// 方向キーが押されたらフラグをセットし、離されたらクリアする
// スペースキーは弾丸発射、Sキーはゲームスタート
function OnKeyDown(e) {
	if (e.keyCode == 37) { // ←
		g_owns.MoveLeft = true;
	}
	if (e.keyCode == 38) { // ↑
		g_owns.MoveFront = true;
		event.preventDefault();
	}
	if (e.keyCode == 39) { // →
		g_owns.MoveRight = true;
	}
	if (e.keyCode == 40) { // ↓
		g_owns.MoveBack = true;
		event.preventDefault();
	}
	if (e.keyCode == 32 && g_game_status != g_status.GameOver) { // Space キー
		g_owns.Shot();
		event.preventDefault();
	}
	if (e.keyCode == 83) { // S キー
		GameStart();
	}
}
function OnKeyUp(e) {
	if (e.keyCode == 37) {
		g_owns.MoveLeft = false;
	}
	if (e.keyCode == 38) {
		g_owns.MoveFront = false;
	}
	if (e.keyCode == 39) {
		g_owns.MoveRight = false;
	}
	if (e.keyCode == 40) {
		g_owns.MoveBack = false;
	}
}
function GameStart() {
	g_enemies.forEach(x => x.life = 0);
	g_enemies_bullets.forEach(x => x.life = 0);
	;
	g_owns_bullets.forEach(x => x.life = 0);
	;
	g_explosions.forEach(x => x.life = 0);
	;
	g_owns.AddScene(g_scene);
	g_owns.X = 0;
	g_owns.life = g_owns.LifeMax;
	score = 0;
	g_stage_num = 1;
	g_game_status = g_status.Battle;
	tickCount = 0;
	PlayBattleBGM.Start();
	if (GameOverSprite != null)
		g_scene.remove(GameOverSprite);
	if (PressSKeySprite != null)
		g_scene.remove(PressSKeySprite);
}
