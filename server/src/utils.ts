
export function seedRandomInt(seed:number, min:number, max:number):number{
    const x = Math.sin(seed++) * 10000;
    return Math.floor((x - Math.floor(x)) * (max - min) + min);
}
  
export function seedRandomFloat(seed:number, min:number, max:number):number{
    const x = Math.sin(seed++) * 10000;
    return (x - Math.floor(x)) * (max - min) + min;
}
