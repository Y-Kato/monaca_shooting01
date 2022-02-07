let scene = new THREE.Scene();
let renderer;
let light;
let camera;
const RendererWidth = 600;
const RendererHeight = 380;
let HeaderContext;
let FooterContext;
let Stage = 1;
var Status;
(function (Status) {
    Status[Status["Battle"] = 0] = "Battle";
    Status[Status["Boss"] = 1] = "Boss";
    Status[Status["GameOver"] = 2] = "GameOver";
})(Status || (Status = {}));
let GameStatus = Status.GameOver;
let jiki;
let JikiBurrets = [];
let Enemies = [];
let EnemyBurrets = [];
let Explosions = [];
let CanvasBackColor = "black";
window.addEventListener("DOMContentLoaded", init);
document.onkeydown = OnKeyDown;
document.onkeyup = OnKeyUp;
function init() {
    let HeaderCanvas = document.getElementById('HeaderCanvas');
    HeaderCanvas.width = RendererWidth;
    HeaderCanvas.height = 40;
    HeaderContext = HeaderCanvas.getContext("2d");
    let FooterCanvas = document.getElementById('FooterCanvas');
    FooterCanvas.width = RendererWidth;
    FooterCanvas.height = 30;
    FooterContext = FooterCanvas.getContext("2d");
    // レンダラーを作成
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('MainCanvas')
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(RendererWidth, RendererHeight);
    // カメラを作成
    camera = new THREE.PerspectiveCamera(45, RendererWidth / RendererHeight, 0.01, 60);
    camera.position.set(0, -6, 5);
    camera.lookAt(new THREE.Vector3(0, 7, 0));
    // 光源
    light = new THREE.AmbientLight(0xFFFFFF, 1.0);
    light.position.set(0, -1, 1);
    light.intensity = 2;
    scene.add(light);
    // 縦横の直線を描画して3Dっぽさを演出する
    for (let y = -50; y < 50; y += 2)
        AddLineEW(y);
    for (let x = -50; x < 50; x += 2)
        AddLineNS(x);
    ShowStringGameOver();
    scene.remove(GameOverSprite);
    jiki = new Jiki();
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
    //sceneにlineを追加
    scene.add(line);
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
    //sceneにlineを追加
    scene.add(line);
}
let tickCount = 0;
function tick() {
    //console.log("scene.children.length = " + scene.children.length);
    tickCount++;
    requestAnimationFrame(tick);
    // フィールドに描画されている縦横の直線を手前に向かって移動させ自機が前に移動しているように見せかける
    MoveLines();
    if (GameStatus != Status.GameOver) {
        // 当たり判定（ゲームオーバーになったあとは考えなくてよい）
        // 自機から発射された弾丸は敵に命中したか？
        CheckMyBurretsHit();
        // 敵機から発射された弾丸は自機に命中したか？
        CheckEnemyBurretsHit();
        // 自機が敵そのものと衝突してしまったか？
        CheckJikiCollidedEnemis();
        // 自機を移動させる
        jiki.Move();
    }
    // ゲームオーバーになった弾丸の動きが止まってしまわないようにGameStatus == Status.Noneであっても処理は必要
    // 自機の弾丸を移動させる
    JikiBurretsMove();
    // 敵を移動させる
    EnemieMove();
    // 敵の弾丸を移動させる
    EnemyBurretsMove();
    // 爆発を移動させる
    ExplosionsMove();
    // 必要なら新しい敵をつくる
    CreateNewEnemyIfNeed();
    // レンダリング
    renderer.render(scene, camera);
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
function CheckMyBurretsHit() {
    for (let i = 0; i < Enemies.length; i++) {
        if (Enemies[i].life <= 0)
            continue;
        for (let j = 0; j < JikiBurrets.length; j++) {
            if (JikiBurrets[j].life <= 0)
                continue;
            let a = Math.pow((Enemies[i].size * 0.5 + JikiBurrets[j].size * 0.5), 2);
            let distance = Math.pow((Enemies[i].X - JikiBurrets[j].X), 2) + Math.pow((Enemies[i].Y - JikiBurrets[j].Y), 2);
            if (a > distance) {
                if (Enemies[i].constructor === Boss && Boss.isLock)
                    break;
                Enemies[i].life--;
                BurretHit(Enemies[i]);
                JikiBurrets[j].life = 0;
                break;
            }
        }
    }
}
// 敵機から発射された弾丸は自機に命中したか？
function CheckEnemyBurretsHit() {
    for (let i = 0; i < EnemyBurrets.length; i++) {
        if (EnemyBurrets[i].life <= 0)
            continue;
        let radis2 = Math.pow((EnemyBurrets[i].size * 0.5 + jiki.size * 0.5), 2);
        let distance2 = Math.pow((EnemyBurrets[i].X - jiki.X), 2) + Math.pow((EnemyBurrets[i].Y - jiki.Y), 2);
        if (radis2 > distance2) {
            EnemyBurrets[i].life = 0;
            JikiDamage();
        }
    }
}
// 自機が敵そのものと衝突してしまったか？
function CheckJikiCollidedEnemis() {
    for (let i = 0; i < Enemies.length; i++) {
        if (Enemies[i].life <= 0)
            continue;
        let radis2 = Math.pow((Enemies[i].size * 0.5 + jiki.size * 0.5), 2);
        let distance2 = Math.pow((Enemies[i].X - jiki.X), 2) + Math.pow((Enemies[i].Y - jiki.Y), 2);
        if (radis2 > distance2) {
            Enemies[i].life = 0;
            JikiDamage();
        }
    }
}
// 自機の弾丸を移動させる
function JikiBurretsMove() {
    // 離れた位置まで飛びすぎた弾丸やすでに何かに命中した弾丸は描画対象からはずす
    JikiBurrets.forEach(x => x.Move());
    let noNeedBurrets = JikiBurrets.filter(x => !(x.life >= 1 && x.Y < 40));
    JikiBurrets = JikiBurrets.filter(x => x.life >= 1 && x.Y < 40);
    noNeedBurrets.forEach(x => x.RemoveScene(scene));
}
// 敵を移動させる
function EnemieMove() {
    // 離れた位置まで移動しすぎた敵や撃墜された敵は描画対象からはずす
    Enemies.forEach(x => x.Move());
    let noNeedEnemies = Enemies.filter(x => !(x.life >= 1 && x.Y > -1 && x.Y < 40));
    Enemies = Enemies.filter(x => x.life >= 1 && x.Y > -1 && x.Y < 40);
    noNeedEnemies.forEach(x => x.RemoveScene(scene));
}
// 敵の弾丸を移動させる
function EnemyBurretsMove() {
    // 離れた位置まで飛びすぎた弾丸やすでに何かに命中した弾丸は描画対象からはずす
    EnemyBurrets.forEach(x => x.Move());
    let noNeedEnemyBurrets = EnemyBurrets.filter(x => !(x.life >= 1 && x.Y > -1 && x.Y < 50 && x.X < 50 && x.X > -50));
    EnemyBurrets = EnemyBurrets.filter(x => x.life >= 1 && x.Y > -1 && x.Y < 50 && x.X < 50 && x.X > -50);
    noNeedEnemyBurrets.forEach(x => x.RemoveScene(scene));
}
// 爆発を移動させる
function ExplosionsMove() {
    Explosions.forEach(x => x.Move());
    let noNeedExplosions = Explosions.filter(x => x.life < 1);
    Explosions = Explosions.filter(x => !(x.life < 1));
    noNeedExplosions.forEach(x => x.RemoveScene(scene));
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
        if (GameStatus == Status.Battle)
            PlayBattleBGM.Check();
    }
    else {
        // ゲームオーバー以降はザコ敵が表示されるだけでボス戦ははじまらない
        if (GameStatus == Status.GameOver) {
            tickCount = 0;
            // 対ボス戦の最中にゲームオーバーになった場合は
            // ボスはフィールド上からいなくなる
            if (boss != null)
                boss.life = 0;
        }
        else {
            // 新しいステージがはじまってtickCount >< BeginBossTickCountとなり、
            // ザコ敵もいなくなったらボス戦がはじまる
            if (Enemies.length == 0) {
                if (GameStatus == Status.Battle) {
                    PlayBattleBGM.Stop(); // 通常戦闘時のBGMを停止
                    isInterval = true; // すぐにボスを出現させずに2秒間の間をもたせる
                    setTimeout(BeginBoss, 2000);
                }
            }
        }
        // ボスのLifeが低下してきたらザコ敵も出現させ、ゲームの難易度を上げる
        if (GameStatus == Status.Boss) {
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
        Enemies.push(enemy);
        enemy.AddScene(scene);
    }
}
function CreateEnemy2() {
    if (tickCount % 100 == 0) {
        let enemy = new Enemy2();
        Enemies.push(enemy);
        enemy.AddScene(scene);
    }
}
// ボス戦を開始する
let boss = null;
function BeginBoss() {
    // ボスを生成、シーンに追加
    boss = new Boss();
    Enemies.push(boss);
    boss.AddScene(scene);
    // eStatusをStatus.Bossに変えてBGMも変える
    PlayBattleBossBGM.Start();
    GameStatus = Status.Boss;
    isInterval = false;
}
// 得点やボスのLifeなどを表示する
function ShowEtc() {
    HeaderContext.clearRect(0, 0, RendererWidth, 60);
    HeaderContext.fillStyle = CanvasBackColor;
    HeaderContext.fillRect(0, 0, RendererWidth, 70);
    ShowBossLife();
    ShowScore();
    ShowJikiLife();
}
function ShowJikiLife() {
    FooterContext.fillStyle = CanvasBackColor;
    FooterContext.fillRect(0, 0, RendererWidth, 40);
    if (jiki.life > 0 && GameStatus != Status.GameOver) {
        FooterContext.fillStyle = "#0f0";
        FooterContext.fillRect(20, 0, (RendererWidth - 40) * (jiki.life / jiki.LifeMax), 20);
    }
}
function ShowBossLife() {
    HeaderContext.fillStyle = CanvasBackColor;
    HeaderContext.fillRect(0, 40, RendererWidth, 20);
    if (GameStatus == Status.Boss && boss.life > 0) {
        HeaderContext.fillStyle = "yellow";
        HeaderContext.fillRect(20, 40, (RendererWidth - 40) * (boss.life / Boss.LifeMax), 20);
    }
}
let score = 0;
function ShowScore() {
    HeaderContext.fillStyle = "white";
    HeaderContext.font = "30px 'ＭＳ ゴシック'";
    let scoreText = "" + score;
    HeaderContext.fillText(scoreText, 10, 30);
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
        Enemies.forEach(x => {
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
    GameStatus = Status.Battle;
    Stage++;
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
        enp.AddScene(scene);
        Explosions.push(enp);
    }
    PlaySoundeffect.Explosion();
}
function SmallExplode(centerX, centerY) {
    let enp = new Explosion(centerX, centerY, 0, 0, 0, 1);
    enp.AddScene(scene);
    Explosions.push(enp);
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
        enp.AddScene(scene);
        Explosions.push(enp);
    }
    PlaySoundeffect.BigExplosion();
}
//　被弾時の処理
// 被弾時に立て続けにやられないように一時的に「無敵状態」にする
let MutekiMode = false;
function JikiDamage() {
    if (!MutekiMode) {
        jiki.life--;
        PlaySoundeffect.Damage();
        Explode(jiki.X, jiki.Y);
        MutekiMode = true;
        setTimeout(EndMutekiMode, 1000);
        // 被弾時は背景を一瞬赤くする
        BackColor("red");
        setTimeout(BackColor, 100, "black");
        // 自機のlifeが0になったらゲームオーバー
        if (jiki.life <= 0) {
            // 自機が描画されないようにSceneから除去
            scene.remove(jiki.Mesh);
            // BGM停止
            PlayBattleBGM.Stop();
            PlayBattleBossBGM.Stop();
            // ゲームオーバーの表示
            GameStatus = Status.GameOver;
            ShowStringGameOver();
        }
    }
}
function EndMutekiMode() {
    MutekiMode = false;
}
function BackColor(color) {
    renderer.setClearColor(color, 1);
    CanvasBackColor = color;
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
    scene.add(GameOverSprite);
    scene.add(PressSKeySprite);
    SaveData();

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
        jiki.MoveLeft = true;
    }
    if (e.keyCode == 38) { // ↑
        jiki.MoveFront = true;
        event.preventDefault();
    }
    if (e.keyCode == 39) { // →
        jiki.MoveRight = true;
    }
    if (e.keyCode == 40) { // ↓
        jiki.MoveBack = true;
        event.preventDefault();
    }
    if (e.keyCode == 32 && GameStatus != Status.GameOver) { // Space キー
        jiki.Shot();
        event.preventDefault();
    }
    if (e.keyCode == 83) { // S キー
        GameStart();
    }
}
function OnKeyUp(e) {
    if (e.keyCode == 37) {
        jiki.MoveLeft = false;
    }
    if (e.keyCode == 38) {
        jiki.MoveFront = false;
    }
    if (e.keyCode == 39) {
        jiki.MoveRight = false;
    }
    if (e.keyCode == 40) {
        jiki.MoveBack = false;
    }
}
function GameStart() {
    Enemies.forEach(x => x.life = 0);
    EnemyBurrets.forEach(x => x.life = 0);
    ;
    JikiBurrets.forEach(x => x.life = 0);
    ;
    Explosions.forEach(x => x.life = 0);
    ;
    jiki.AddScene(scene);
    jiki.X = 0;
    jiki.life = jiki.LifeMax;
    score = 0;
    Stage = 1;
    GameStatus = Status.Battle;
    tickCount = 0;
    PlayBattleBGM.Start();
    if (GameOverSprite != null)
        scene.remove(GameOverSprite);
    if (PressSKeySprite != null)
        scene.remove(PressSKeySprite);
}

function SaveData(){
    const textbox1 = document.getElementById("name");

    let phpurl = "save-data.php";
    let url = location.href;
    let name = textbox1.value;
    if(name == "")
        name = "名無しさん";

    $.post(phpurl, {
        url:url,
        name:name,
        score:Math.round(score),
    });
}
