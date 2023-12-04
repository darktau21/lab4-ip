// Модель Эллиота (обобщенная модель Гилберта)
// Последовательность ошибок {Ei} - определяется функцией распределения P(l)
// В схеме восстановления предполагаются, что есть хорошие и плохие состояния каналов
// В "хорошем"  состоянии вероятность  искажения символов кода Е = 0, а в "плохом" Е>0
// В лабораторной работе генерация помеховой обстановка в канале просходит по следующей схеме:
// 1. Определяется дистанция до очередной помехи по функции распределения F(d)
// 2. Определяется длительность помехи по функции распределения F(b)
// 3. Амплитуда помехи определяется по формуле F(a)
// 4. Полярность помехи - вероятностью Pn(+) положительного напряжения помехи
// Если напряжение помехи Uп больше порогового уровня сигнала Uпор, то она внесет искажения
// (если имеет разную полярность с сигналом)
// Елси на интервале D ошибок нет, то число неискаженныъ бит NB и длительность интервала
// до ошибки L увеличивается на величину D. Затем проверяется условие A<Up - внесет ли помеха искажение?
// если ампилтуда помехи меньше уровня порогового напряжения UP, то к величинам
// NB и L прибавляется длительность помехи и осуществляется переход к STATIB, в которой величина счетчиека C2(1) увеличивается на единицу
// Счетчик накапливает частоту событий, состяощих в том, что на всей длине помехи не было ошибок.
// Если  A> Uп, то происходит моделирования процессов налодения помехи на полезный сигнал

export interface Model {
  U: number;
  N: number;
  numGoodBits: number;
  numBadBits: number;
  numGoodMsgs: number;
  numBadMsgs: number;
  PErr: number;
  PErrT: number;
  PGN: number;
  ErrMean: number;
  PSd: number;
  PNd: number;
}

function exp(lambda = 1) {
  return -Math.log(1 - Math.random()) / lambda;
}

function factorialize(num: number) {
  let result = num;

  if (num === 0 || num === 1) return 1;

  while (num > 1) {
    num--;
    result = result * num;
  }

  return result;
}

function rayleigh(sigma = 4) {
  return sigma * Math.sqrt(-2 * Math.log(1 - Math.random()));
}

function randomBinary() {
  return Math.random() < 0.5 ? 1 : -1;
}

function gaussianRandom(mean: number, sigma: number, size: number): number[] {
  const randomArray = new Array(size);

  for (let i = 0; i < size; i++) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    randomArray[i] = Math.round(mean + z0 * sigma);
  }

  return randomArray;
}

function randomC(prob: number, size: number) {
  const res: number[] = [];

  for (let i = 0; i < size; i++) {
    res.push(Math.random() < prob ? 1 : 0);
  }

  return res;
}

function compareArr(arr1: unknown[], arr2: unknown[]) {
  if (arr1.length !== arr2.length) return false;

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }

  return true;
}

export type DistFunctions = "exp" | "p";

export function calc(
  N: number,
  codeLength: number,
  reg: number,
  U: number[],
  fd: DistFunctions,
  fb: DistFunctions,
  fa: DistFunctions,
  mode: "s" | "r",
  uProb: number
) {
  const res: Model[] = [];

  const fdFunc = fd === "exp" ? exp : rayleigh;
  const fbFunc = fb === "exp" ? exp : rayleigh;
  const faFunc = fa === "exp" ? exp : rayleigh;

  for (const u of U) {
    for (let i = 0; i < 2; i++) {
      let numGoodBits = 0;
      let numBadBits = 0;
      let numGoodMsgs = 0;
      let numBadMsgs = 0;
      const e = gaussianRandom(0.4, 0.1, N);
      const PErr = [];
      const PSd = [];
      const PNd = [];
      const c = randomC(uProb, N);
      const cMod: number[] = Array.from<number>({ length: N }).fill(0);
      const errorInterval: number[] = [];
      const errorInsInterference: number[] = [];
      const errorInsMsg = [];
      const interference: number[] = Array.from<number>({ length: N }).fill(0);
      let x = 0;
      let y = 0;

      while (x < N) {
        const d = fdFunc();
        const b = fbFunc();
        const p = randomBinary();
        const a = p * faFunc();

        while (x < y + d && x < N) {
          interference[x] = 0;
          x++;
        }
        y = x;
        while (y < x + b && y < N) {
          interference[y] = a;
          y++;
        }
        x = y;
      }

      let k = 0;

      for (let x = 0; x < N; x++) {
        if (e[x] === 0) {
          k++;
        } else {
          if (k > 0) {
            errorInterval.push(k);
          }
          k = 0;
        }
      }

      let n = 0;
      for (let x = 0; x < N; x++) {
        if (interference[x] !== 0) {
          if (e[x] === 1) {
            n++;
          }
        } else {
          if (n > 0) {
            errorInsInterference.push(n);
          }
          n = 0;
        }
      }

      for (let x = 0; x < N; x++) {
        if (e[x] > 0 && (interference[x] > u || interference[x] < -u)) {
          if (interference[x] > u && c[x] < 1) {
            cMod[x] = Math.abs(c[x] - 1);
            numBadBits++;
            continue;
          } else if (interference[x] < u && c[x] > 1) {
            cMod[x] = Math.abs(c[x] - 1);
            numBadBits++;
            continue;
          }
        } else {
          cMod[x] = c[x];
        }
      }
      for (let x = 0; x < N; x++) {
        if (cMod[x] !== 0 && cMod[x] !== 1) {
          cMod[x] = 0;
        }
      }
      numGoodBits = N - numBadBits;

      // let i = 0;
      for (let x = 0; x < N; x += codeLength) {
        if (
          compareArr(c.slice(x, x + codeLength), cMod.slice(x, x + codeLength))
          // JSON.stringify(c.slice(x, x + codeLength)) ===
          // JSON.stringify(cMod.slice(x, x + codeLength))
        ) {
          // i++;
          // console.log(i);
          numGoodMsgs++;
        } else {
          let m = 0;
          for (let k = 0; k < x + codeLength - 1; k++) {
            if (c[k] !== cMod[k]) {
              m++;
            }
          }
          errorInsMsg.push(m);
          numBadMsgs++;
        }
      }
      PErr.push(numBadBits / (numBadBits + numGoodBits));
      const PErrT =
        PErr.at(-1)! ** reg * (1 - PErr.at(-1)!) ** (codeLength - reg);
      const PGN =
        (factorialize(codeLength) /
          (factorialize(codeLength - reg) * factorialize(reg))) *
        PErr.at(-1)! ** reg *
        (1 - PErr.at(-1)!) ** (codeLength - reg);
      let ErrMean = 0;
      for (let g = 1; g < codeLength; g++) {
        ErrMean +=
          g *
          ((factorialize(codeLength) /
            (factorialize(codeLength - g) * factorialize(reg))) *
            PErr.at(-1)! ** g *
            (1 - PErr.at(-1)!) ** (codeLength - g));
      }

      if (mode === "r") {
        PSd.push(codeLength * PErr.at(-1)!);
        PNd.push(
          (factorialize(codeLength) /
            (factorialize(codeLength - reg + 1) * factorialize(reg + 1))) *
            PErr.at(-1)! ** (reg + 1)
        );
      }

      if (mode === "s") {
        PSd.push(codeLength * PErr.at(-1)!);
        for (let g = 1; g < codeLength; g++) {
          PNd.push(
            g *
              ((factorialize(codeLength) /
                (factorialize(codeLength - g) * factorialize(reg))) *
                PErr.at(-1)! ** g *
                (1 - PErr.at(-1)!) ** (codeLength - g))
          );
        }
      }

      res.push({
        U: u,
        N,
        numGoodBits,
        numBadBits,
        numGoodMsgs,
        numBadMsgs,
        PErr: PErr.at(-1)!,
        PErrT,
        PGN,
        ErrMean,
        PNd: PNd.at(-1)!,
        PSd: PSd.at(-1)!,
      });
    }
  }
  return res;
}
