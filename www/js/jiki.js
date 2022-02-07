class Jiki {
    constructor() {
        this.LifeMax = 10;
        this.life = 0;
        this.size = 1.0;
        this.MoveLeft = false;
        this.MoveRight = false;
        this.MoveFront = false;
        this.MoveBack = false;
        let img = new Image();
        img.src = DataURL.dataURL_Jiki;
        let texture = new THREE.Texture(img);
        texture.needsUpdate = true;
        const material = new THREE.MeshStandardMaterial({ map: texture, transparent: true });
        let geometry = new THREE.PlaneGeometry(this.size, this.size);
        this.Mesh = new THREE.Mesh(geometry, material);
        this.life = this.LifeMax;
    }
    Move() {
        if (this.MoveLeft) {
            if (this.X > -4) {
                this.X += -0.1;
                this.Mesh.rotation.set(0, -Math.PI * 2 * 20 / 360, 0);
                return;
            }
        }
        if (this.MoveFront) {
            if (this.Y < 4) {
                this.Y += 0.1;
            }
        }
        if (this.MoveRight) {
            if (this.X < 4) {
                this.X += 0.1;
                this.Mesh.rotation.set(0, Math.PI * 2 * 20 / 360, 0);
                return;
            }
        }
        if (this.MoveBack) {
            if (this.Y > 0) {
                this.Y += -0.1;
            }
        }
        this.Mesh.rotation.set(0, 0, 0);
    }
    Shot() {
        if (JikiBurrets.length > 0) {
            let last = JikiBurrets.length - 1;
            if (JikiBurrets[last].Y < jiki.Y + 4)
                return;
        }
        let burret1 = new JikiBurret(this.X, this.Y, this.Z, 0, 0.3, 0);
        JikiBurrets.push(burret1);
        burret1.AddScene(scene);
        let burret2 = new JikiBurret(this.X, this.Y, this.Z, 0.02, 0.3, 0);
        JikiBurrets.push(burret2);
        burret2.AddScene(scene);
        let burret3 = new JikiBurret(this.X, this.Y, this.Z, -0.02, 0.3, 0);
        JikiBurrets.push(burret3);
        burret3.AddScene(scene);
    }
    AddScene(scene) {
        scene.add(this.Mesh);
    }
    RemoveScene(scene) {
        scene.remove(this.Mesh);
    }
    get X() {
        return this.Mesh.position.x;
    }
    get Y() {
        return this.Mesh.position.y;
    }
    get Z() {
        return this.Mesh.position.z;
    }
    set X(value) {
        this.Mesh.position.x = value;
    }
    set Y(value) {
        this.Mesh.position.y = value;
    }
    set Z(value) {
        this.Mesh.position.z = value;
    }
}
class JikiBurret extends GameCharacter {
    constructor(x, y, z, vx, vy, vz) {
        super();
        if (JikiBurret.BurretMaterial == null) {
            JikiBurret.BurretMaterial = this.GetMaterial(DataURL.dataURL_JikiBurret);
        }
        this.sprite = new THREE.Sprite(JikiBurret.BurretMaterial);
        this.size = 0.3;
        this.sprite.scale.set(this.size, this.size, this.size);
        this.life = 1;
        this.sprite.position.set(x, y, z);
        this.VX = vx;
        this.VY = vy;
        this.VZ = vz;
    }
}
JikiBurret.BurretMaterial = null;
