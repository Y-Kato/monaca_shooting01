class Enemy extends GameCharacter {
    constructor() {
        super(...arguments);
        this.score = 40;
    }
}
class Enemy1 extends Enemy {
    constructor() {
        super();
        this.moveCount = 0;
        this.moveRight = false;
        if (Enemy1.enemyMaterial10 == null)
            Enemy1.enemyMaterial10 = this.GetMaterial(DataURL.dataURL_Enemy10);
        if (Enemy1.enemyMaterial11 == null)
            Enemy1.enemyMaterial11 = this.GetMaterial(DataURL.dataURL_Enemy11);
        if (Enemy1.enemyMaterial12 == null)
            Enemy1.enemyMaterial12 = this.GetMaterial(DataURL.dataURL_Enemy12);
        if (Enemy1.enemyMaterial13 == null)
            Enemy1.enemyMaterial13 = this.GetMaterial(DataURL.dataURL_Enemy13);
        this.sprite = new THREE.Sprite(Enemy1.enemyMaterial10);
        this.life = 3;
        this.score = 40;
        this.X = Math.random() * 12 - 6;
        this.Y = 30;
        this.Z = 0;
        if (Math.random() > 0.5)
            this.moveRight = true;
    }
    Move() {
        this.moveCount++;
        let additions = Stage;
        if (GameStatus == Status.GameOver)
            additions = 0;
        this.VY = -0.1 - 0.01 * additions;
        if (this.moveRight && this.X > 8)
            this.moveRight = false;
        else if (!this.moveRight && this.X < -8)
            this.moveRight = true;
        this.VX = 0.1 + 0.02 * additions;
        if (!this.moveRight)
            this.VX *= -1;
        let a = 60 - 5 * additions;
        if (a < 20)
            a = 20;
        if (this.moveCount % a == 0 && Math.random() > 0.5 && this.Y > 2)
            this.Shot();
        let i = this.moveCount % 32;
        if (i < 8)
            this.sprite.material = Enemy1.enemyMaterial10;
        else if (i < 16)
            this.sprite.material = Enemy1.enemyMaterial11;
        else if (i < 24)
            this.sprite.material = Enemy1.enemyMaterial12;
        else
            this.sprite.material = Enemy1.enemyMaterial13;
        super.Move();
    }
    Shot() {
        if (GameStatus == Status.GameOver)
            return;
        let x = jiki.X - this.X;
        let y = jiki.Y - this.Y;
        let angle1 = Math.atan2(y, x);
        let speed = 0.15 + 0.01 * Stage;
        let burret = new EnemyBurret(this.X, this.Y, this.Z, Math.cos(angle1) * speed, Math.sin(angle1) * speed, 0);
        EnemyBurrets.push(burret);
        burret.AddScene(scene);
    }
}
Enemy1.enemyMaterial10 = null;
Enemy1.enemyMaterial11 = null;
Enemy1.enemyMaterial12 = null;
Enemy1.enemyMaterial13 = null;
class Enemy2 extends Enemy {
    constructor() {
        super();
        this.away = false;
        this.moveRight = false;
        this.moveCount = 0;
        if (Enemy2.enemyMaterial20 == null)
            Enemy2.enemyMaterial20 = this.GetMaterial(DataURL.dataURL_Enemy20);
        if (Enemy2.enemyMaterial21 == null)
            Enemy2.enemyMaterial21 = this.GetMaterial(DataURL.dataURL_Enemy21);
        if (Enemy2.enemyMaterial22 == null)
            Enemy2.enemyMaterial22 = this.GetMaterial(DataURL.dataURL_Enemy22);
        if (Enemy2.enemyMaterial23 == null)
            Enemy2.enemyMaterial23 = this.GetMaterial(DataURL.dataURL_Enemy23);
        this.sprite = new THREE.Sprite(Enemy2.enemyMaterial20);
        this.life = 1;
        this.score = 40;
        this.X = Math.random() * 12 - 6;
        this.Y = 30;
        this.Z = 0;
        if (Math.random() > 0.5)
            this.moveRight = true;
    }
    Move() {
        this.moveCount++;
        if (this.Y < 8) {
            this.away = true;
            this.Shot();
        }
        if (this.away)
            this.VY = 0.3;
        else
            this.VY = -0.3;
        let additions = Stage;
        if (GameStatus == Status.GameOver)
            additions = 0;
        if (this.moveRight && this.X > 8)
            this.moveRight = false;
        else if (!this.moveRight && this.X < -8)
            this.moveRight = true;
        this.VX = 0.1 + 0.02 * additions;
        if (!this.moveRight)
            this.VX *= -1;
        let i = this.moveCount % 32;
        if (i < 8)
            this.sprite.material = Enemy2.enemyMaterial20;
        else if (i < 16)
            this.sprite.material = Enemy2.enemyMaterial21;
        else if (i < 24)
            this.sprite.material = Enemy2.enemyMaterial22;
        else
            this.sprite.material = Enemy2.enemyMaterial23;
        super.Move();
    }
    Shot() {
        if (GameStatus == Status.GameOver)
            return;
        let x = jiki.X - this.X;
        let y = jiki.Y - this.Y;
        let angle1 = Math.atan2(y, x);
        let angle2 = angle1 + 0.3;
        let angle3 = angle1 - 0.3;
        let speed = 0.1 + 0.01 * Stage;
        let burret1 = new EnemyBurret(this.X, this.Y, this.Z, Math.cos(angle1) * speed, Math.sin(angle1) * speed, 0);
        EnemyBurrets.push(burret1);
        burret1.AddScene(scene);
        let burret2 = new EnemyBurret(this.X, this.Y, this.Z, Math.cos(angle2) * speed, Math.sin(angle2) * speed, 0);
        EnemyBurrets.push(burret2);
        burret2.AddScene(scene);
        let burret3 = new EnemyBurret(this.X, this.Y, this.Z, Math.cos(angle3) * speed, Math.sin(angle3) * speed, 0);
        EnemyBurrets.push(burret3);
        burret3.AddScene(scene);
    }
}
Enemy2.enemyMaterial20 = null;
Enemy2.enemyMaterial21 = null;
Enemy2.enemyMaterial22 = null;
Enemy2.enemyMaterial23 = null;
class EnemyBurret extends GameCharacter {
    constructor(x, y, z, vx, vy, vz) {
        super();
        this.moveCount = 0;
        if (EnemyBurret.enemyBurretMaterial0 == null)
            EnemyBurret.enemyBurretMaterial0 = this.GetMaterial(DataURL.dataURL_EnemyBurret0);
        if (EnemyBurret.enemyBurretMaterial1 == null)
            EnemyBurret.enemyBurretMaterial1 = this.GetMaterial(DataURL.dataURL_EnemyBurret1);
        this.sprite = new THREE.Sprite(EnemyBurret.enemyBurretMaterial0);
        this.life = 1;
        this.size = 0.3;
        this.X = x;
        this.Y = y;
        this.Z = z;
        this.VX = vx;
        this.VY = vy;
        this.VZ = vz;
    }
    Move() {
        this.moveCount++;
        super.Move();
        let i = this.moveCount % 16;
        if (i < 8) {
            this.sprite.material = EnemyBurret.enemyBurretMaterial0;
            this.sprite.scale.set(this.size, this.size, this.size);
        }
        else {
            this.sprite.material = EnemyBurret.enemyBurretMaterial1;
            this.sprite.scale.set(this.size * 1.5, this.size * 1.5, this.size * 1.5);
        }
    }
}
EnemyBurret.enemyBurretMaterial0 = null;
EnemyBurret.enemyBurretMaterial1 = null;
class Boss extends Enemy {
    constructor() {
        super();
        this.moveCount = 0;
        this.moveRight = false;
        if (Boss.bossSplite == null) {
            let img = new Image();
            img.src = DataURL.dataURL_Boss;
            var texture = new THREE.Texture(img);
            texture.needsUpdate = true;
            const material = new THREE.SpriteMaterial({ map: texture });
            Boss.bossSplite = new THREE.Sprite(material);
        }
        this.size = 8.0;
        this.sprite = Boss.bossSplite;
        this.sprite.scale.set(this.size, this.size, this.size);
        this.life = Boss.LifeMax;
        this.score = 5000;
        this.X = 0;
        this.Y = 25;
        this.Z = 10; // 2
        if (Math.random() > 0.5)
            this.moveRight = true;
        Boss.isLock = true;
        setTimeout(this.UnLock, 3000);
    }
    UnLock() {
        Boss.isLock = false;
    }
    Move() {
        if (this.Z > 2)
            this.Z -= 0.05;
        else
            this.Z = 2;
        if (Boss.isLock)
            return;
        this.moveCount++;
        this.VY = 0;
        if (this.moveRight && this.X > 8)
            this.moveRight = false;
        else if (!this.moveRight && this.X < -8)
            this.moveRight = true;
        this.VX = 0.1 + 0.02 * Stage;
        if (!this.moveRight)
            this.VX *= -1;
        if (this.moveCount % 40 == 0)
            this.Shot();
        super.Move();
    }
    Shot() {
        let speed = 0.15 + 0.01 * Stage;
        for (let i = 0; i < 48; i++) {
            let angle = 2 * Math.PI * i * 7.5 / 360;
            let startX = this.X + 8 * Math.cos(angle);
            let startY = this.Y + 8 * Math.sin(angle);
            let burret1 = new EnemyBurret(startX, startY, 0, Math.cos(angle) * speed, Math.sin(angle) * speed, 0);
            EnemyBurrets.push(burret1);
            burret1.AddScene(scene);
        }
    }
}
Boss.bossSplite = null;
Boss.isLock = true;
Boss.LifeMax = 100;
