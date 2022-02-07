class GameCharacter {
    constructor() {
        this.life = 1;
        this.size = 1;
        this.sprite = null;
        this.VX = 0;
        this.VY = 0;
        this.VZ = 0;
    }
    GetMaterial(dataURL) {
        let img = new Image();
        img.src = dataURL;
        var texture = new THREE.Texture(img);
        texture.needsUpdate = true;
        return new THREE.SpriteMaterial({ map: texture });
    }
    AddScene(scene) {
        scene.add(this.sprite);
    }
    RemoveScene(scene) {
        scene.remove(this.sprite);
    }
    get X() {
        return this.sprite.position.x;
    }
    get Y() {
        return this.sprite.position.y;
    }
    get Z() {
        return this.sprite.position.z;
    }
    set X(value) {
        this.sprite.position.x = value;
    }
    set Y(value) {
        this.sprite.position.y = value;
    }
    set Z(value) {
        this.sprite.position.z = value;
    }
    Move() {
        this.X += this.VX;
        this.Y += this.VY;
        this.Z += this.VZ;
    }
}
