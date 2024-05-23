export const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function convertSetString(inputString: string): string {
  // 'set'으로 시작하는지 확인
  if (inputString.startsWith("set")) {
    // 'set'을 제거하고 남은 문자열을 취득
    let remainingString = inputString.slice(3);

    // 남은 문자열이 비어있지 않고 첫 글자가 대문자인지 확인
    if (remainingString && remainingString[0] === remainingString[0].toUpperCase()) {
      // 첫 글자를 소문자로 변환하고 나머지 부분은 그대로 두어 문자열을 재조합
      return remainingString[0].toLowerCase() + remainingString.slice(1);
    }
  }
  // 'set'으로 시작하지 않거나 조건에 맞지 않는 경우 입력 문자열을 그대로 반환
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
  return shadows.map(shadow => `${shadow.distance[0]}px ${shadow.distance[1]}px ${shadow.blur}px rgba(${shadow.color.join(',')})`).join(',')
}