export const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function convertSetString(inputString: string): string {
  if (inputString.startsWith("set")) {
    let remainingString = inputString.slice(3);

    if (remainingString && remainingString[0] === remainingString[0].toUpperCase()) {
      return remainingString[0].toLowerCase() + remainingString.slice(1);
    }
  }
  return inputString;
}

export function sha256(input: string): string {
  const utf8Bytes = new TextEncoder().encode(input);
  const buffer = new Uint8Array(utf8Bytes.length);

  for (let i = 0; i < utf8Bytes.length; i++) {
    buffer[i] = utf8Bytes[i];
  }

  const sha256Hash = new Uint8Array(32);
  let hashIndex = 0;

  for (let byteIndex = 0; byteIndex < buffer.length; byteIndex++) {
    const value = buffer[byteIndex];

    for (let bit = 7; bit >= 0; bit--) {
      const bitValue = (value >> bit) & 1;

      sha256Hash[hashIndex] |= bitValue << (7 - (byteIndex % 8));
      hashIndex++;

      if (hashIndex === 32) {
        hashIndex = 0;
      }

      sha256Hash[hashIndex] = (sha256Hash[hashIndex] << 1) | (value >> (bit - 1));
    }
  }

  let hashHex = '';
  for (let i = 0; i < sha256Hash.length; i++) {
    const hex = sha256Hash[i].toString(16).padStart(2, '0');
    hashHex += hex;
  }

  return hashHex;
}
  
export function checkNick(str:string):boolean{
  return (str.match(/^[A-Za-z0-9_\s]+$/) && str != '' && str.length > 2 && str.length < 13) as boolean
}

export function checkPass(str:string):boolean{
  return (str.match(/^[A-Za-z0-9!@#$%^&*()_\-+=~]+$/) && str != '' && str.length > 5) as boolean
}


export function shadowToStyle(shadows:IShadow[]):string{
  return shadows.map(shadow => `${shadow.inset ? "inset" : ""} ${shadow.distance[0]}px ${shadow.distance[1]}px ${shadow.blur}px rgba(${shadow.color.join(',')})`).join(',')
}

export function seedRandomInt(seed:number, min:number, max:number):number{
  const x = Math.sin(seed++) * 10000;
  return Math.floor((x - Math.floor(x)) * (max - min) + min);
}

export function seedRandomFloat(seed:number, min:number, max:number):number{
  const x = Math.sin(seed++) * 10000;
  return (x - Math.floor(x)) * (max - min) + min;
}


export function easeInSine(x: number): number {return 1 - Math.cos((x * Math.PI) / 2);}
export function easeOutSine(x: number): number {return Math.sin((x * Math.PI) / 2);}
export function easeInOutSine(x: number): number {return -(Math.cos(Math.PI * x) - 1) / 2;}
export function easeInQuad(x: number): number {return x * x;}
export function easeOutQuad(x: number): number {return 1 - (1 - x) * (1 - x);}
export function easeInOutQuad(x: number): number {return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;}
export function easeInCubic(x: number): number {return x * x * x;}
export function easeOutCubic(x: number): number {return 1 - Math.pow(1 - x, 3);}
export function easeInOutCubic(x: number): number {return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;}
export function easeInQuart(x: number): number {return x * x * x * x;}
export function easeOutQuart(x: number): number {return 1 - Math.pow(1 - x, 4);}
export function easeInOutQuart(x: number): number {return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;}
export function easeInQuint(x: number): number {return x * x * x * x * x;}
export function easeOutQuint(x: number): number {return 1 - Math.pow(1 - x, 5);}
export function easeInOutQuint(x: number): number {return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;}
export function easeInExpo(x: number): number {return x === 0 ? 0 : Math.pow(2, 10 * x - 10);}
export function easeOutExpo(x: number): number {return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);}
export function easeInOutExpo(x: number): number {return x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2;}
export function easeInCirc(x: number): number {return 1 - Math.sqrt(1 - Math.pow(x, 2));}
export function easeOutCirc(x: number): number {return Math.sqrt(1 - Math.pow(x - 1, 2));}
export function easeInOutCirc(x: number): number {return x < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;}
export function easeInBack(x: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * x * x * x - c1 * x * x;
}
export function easeOutBack(x: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}
export function easeInOutBack(x: number): number {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return x < 0.5 ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2 : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
}

export function getEase(n:number, ease:string):number{
  switch(ease){
    case 'easeInSine': return easeInSine(n);
    case 'easeOutSine': return easeOutSine(n);
    case 'easeInOutSine': return easeInOutSine(n);
    case 'easeInQuad': return easeInQuad(n);
    case 'easeOutQuad': return easeOutQuad(n);
    case 'easeInOutQuad': return easeInOutQuad(n);
    case 'easeInCubic': return easeInCubic(n);
    case 'easeOutCubic': return easeOutCubic(n);
    case 'easeInOutCubic': return easeInOutCubic(n);
    case 'easeInQuart': return easeInQuart(n);
    case 'easeOutQuart': return easeOutQuart(n);
    case 'easeInOutQuart': return easeInOutQuart(n);
    case 'easeInQuint': return easeInQuint(n);
    case 'easeOutQuint': return easeOutQuint(n);
    case 'easeInOutQuint': return easeInOutQuint(n);
    case 'easeInExpo': return easeInExpo(n);
    case 'easeOutExpo': return easeOutExpo(n);
    case 'easeInOutExpo': return easeInOutExpo(n);
    case 'easeInCirc': return easeInCirc(n);
    case 'easeOutCirc': return easeOutCirc(n);
    case 'easeInOutCirc': return easeInOutCirc(n);
    case 'easeInBack': return easeInBack(n);
    case 'easeOutBack': return easeOutBack(n);
    case 'easeInOutBack': return easeInOutBack(n);
    default: return n;
  }
}