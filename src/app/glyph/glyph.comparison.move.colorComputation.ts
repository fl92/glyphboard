export class HeatMapComputation {
  private mean: number = null;
  private max: number = null;
  private exp: number = null;

  private diverg = [
    '#a50026',
    '#d73027',
    '#f46d43',
    '#fdae61',

    '#fee090',

    '#abd9e9',
    '#74add1',
    '#4575b4',
    '#313695'
    ];

 /**
  * {param max: highest absolute value}
  * {param mean: mean value}
  */
  public init(mean: number, max: number) {
    this.mean = mean;
    this.max = max;
    this.exp = Math.log(0.5) / Math.log(mean / max);
  }

 /**
  * computes heat from value considering mean and max and maps this to a color.
  */
  public computeColor( value: number): [number, number, number] {
    let heat = 0;
    const sig = Math.sign(value);
    value = Math.abs(value);
    heat = sig * Math.pow((value / this.max), this.exp);
    heat = (heat + 1) / 2;
    const [r, g, b] = this.map(heat);
    return [r, g, b];
  }

  public map( heat: number): [number, number, number] {
    const map = this.diverg;
    const idx = (heat === 1.0) ? map.length - 1
        : Math.floor(heat * map.length);
    const code = map[idx];
    const r = parseInt(code.slice(1, 3), 16);
    const g = parseInt(code.slice(3, 5), 16);
    const b = parseInt(code.slice(5, 7), 16);
    return [r, g, b ];
  }
}
