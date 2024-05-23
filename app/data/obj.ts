export default class Obj{
    tag:string = '';
    position:vec2 = [0, 0];
    velocity:vec2 = [0, 0];
    size:vec2 = [0, 0];
    scale:vec2 = [1, 1];
    rotation:number = 0;
    alpha:number = 1;
    pivot:vec2 = [0, 0];
    color:vec4 = [0, 0, 0, 1];
    rounded:number = 0;
    glow:number = 0;
    glowIntensity:number = 0;
    glowRadius:number = 0;
    glowOpacity:number = 0;
    constructor(
        position:vec2,
        size:vec2,
        scale:vec2,
        rotation:number,
        alpha:number,
        pivot:vec2,
        color:vec4,
        rounded:number
    ){
        this.position = position;
        this.size = size;
        this.scale = scale;
        this.rotation = rotation;
        this.alpha = alpha;
        this.pivot = pivot;
        this.color = color;
        this.rounded = rounded;
    }

    update(){
        this.position[0] += this.velocity[0]
        this.position[1] += this.velocity[1]
    }
    
    setGlow(glow:number, intensity:number, radius:number, opacity:number){
        this.glow = glow
        this.glowIntensity = intensity
        this.glowRadius = radius
        this.glowOpacity = opacity
    }

    clampColor(value: number): number {
        return Math.max(Math.min(Math.round(value), 255), 0);
    }

    calculateShadows(): [number, vec4][] {
        let shadowDatas: [number, vec4][] = [];
        const rad = this.glow * this.glowIntensity / 2;
        for (let i = 0; i < this.glow; i++) {
            let r = this.clampColor(this.color[0] + rad - (i * this.glowIntensity));
            let g = this.clampColor(this.color[1] + rad - (i * this.glowIntensity));
            let b = this.clampColor(this.color[2] + rad - (i * this.glowIntensity));
            shadowDatas.push([i * this.glowRadius, [r, g, b, this.color[3] - Math.max(i * this.glowOpacity, 0)]]);
        }
        return shadowDatas;
    }

    getStyle(){
        let shadowDatas:[number, vec4][] = this.calculateShadows()
        const startColor:vec4 = shadowDatas[0][1]
        const shadows = shadowDatas.map(data => `0 0 ${data[0]}px rgba(${data[1][0]}, ${data[1][1]}, ${data[1][2]}, ${data[1][3]})`).join(', ')
        return {
            left:`${this.position[0]}px`,
            top:`${this.position[1]}px`,
            width:`${this.size[0]}px`,
            height:`${this.size[1]}px`,
            transform:`translate(${this.pivot[0] * 100}%, ${this.pivot[1] * 100}%) rotate(${this.rotation}deg) scale(${this.scale[0]}, ${this.scale[1]})`,
            backgroundColor:this.glow ? `rgba(${startColor[0]}, ${startColor[1]}, ${startColor[2]}, ${startColor[3]})` : `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.color[3]})`,
            borderRadius:`${this.rounded}px`,
            boxShadow:this.glow ? shadows : 'none'
        }
    }
}