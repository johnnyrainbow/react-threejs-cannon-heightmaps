import { CombinedPerlinNoiseData } from './noise_data.js';

export default class TerrainData {
  width: any;
  seed: any;
  zoom: any;
  persistance: any;
  noiseData: any;
  lacunarity: any;
  octaves: any;
  static get defaultOptions() {
    return {
      seed: 1,
      offsetX: 0,
      offsetY: 0,
      width: 600,
      height: 600,
      zoom: 0.1,
      lacunarity: 0.5,
      persistance: 0.5,
      octaves: 3
    }
  }

  constructor(options: any) {
    Object.assign(this, TerrainData.defaultOptions);
    Object.assign(this, options);

    var noiseOptions: any = {
      width: this.width,
      height: this.width,
      seed: this.seed,
      zoom: this.zoom
    }

    Object.assign(noiseOptions, options);

    delete noiseOptions.lacunarity;
    delete noiseOptions.persistance;
    delete noiseOptions.octaves;

    var amplitude = 1;
    var frequency = 1;
    noiseOptions.noises = [];

    for (var i = 0; i < this.octaves; i++) {
      noiseOptions.noises.push({
        amplitude: amplitude,
        frequency: frequency
      });

      amplitude *= this.persistance;
      frequency /= this.lacunarity;
    }

    this.noiseData = new CombinedPerlinNoiseData(noiseOptions);
  }

  valueAt(index: any) { return this.noiseData.valueAt(index); }
  valueAtCoord(x: any, y: any) { return this.noiseData.valueAtCoord(x, y); }
}
