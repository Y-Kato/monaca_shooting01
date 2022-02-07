class Explosion extends GameCharacter {
    constructor(x, y, vx, vy, vz, size) {
        super();
        this.moveCount = 0;
        if (Explosion.explosionMaterial0 == null)
            Explosion.explosionMaterial0 = this.GetMaterial(DataURL.dataURL_Explosion0);
        if (Explosion.explosionMaterial1 == null)
            Explosion.explosionMaterial1 = this.GetMaterial(DataURL.dataURL_Explosion1);
        if (Explosion.explosionMaterial2 == null)
            Explosion.explosionMaterial2 = this.GetMaterial(DataURL.dataURL_Explosion2);
        if (Explosion.explosionMaterial3 == null)
            Explosion.explosionMaterial3 = this.GetMaterial(DataURL.dataURL_Explosion3);
        if (Explosion.explosionMaterial4 == null)
            Explosion.explosionMaterial4 = this.GetMaterial(DataURL.dataURL_Explosion4);
        if (Explosion.explosionMaterial5 == null)
            Explosion.explosionMaterial5 = this.GetMaterial(DataURL.dataURL_Explosion5);
        this.sprite = new THREE.Sprite(Explosion.explosionMaterial0);
        if (typeof size !== 'undefined')
            this.sprite.scale.set(size, size, size);
        this.life = 1;
        this.X = x;
        this.Y = y;
        this.Z = 0;
        this.VX = vx;
        this.VY = vy;
        this.VZ = vz;
    }
    Move() {
        this.moveCount++;
        let i = this.moveCount % 60;
        if (i < 4)
            this.sprite.material = Explosion.explosionMaterial0;
        else if (i < 8)
            this.sprite.material = Explosion.explosionMaterial1;
        else if (i < 12)
            this.sprite.material = Explosion.explosionMaterial2;
        else if (i < 16)
            this.sprite.material = Explosion.explosionMaterial3;
        else if (i < 20)
            this.sprite.material = Explosion.explosionMaterial4;
        else if (i < 24)
            this.sprite.material = Explosion.explosionMaterial5;
        else
            this.life = 0;
        super.Move();
    }
}
Explosion.explosionMaterial0 = null;
Explosion.explosionMaterial1 = null;
Explosion.explosionMaterial2 = null;
Explosion.explosionMaterial3 = null;
Explosion.explosionMaterial4 = null;
Explosion.explosionMaterial5 = null;
