import Clone from '../../helpers/clone';
import Normalize from '../../formulas/normalize';
import Denormalize from '../../formulas/denormalize';
import { IAdaptiveResonance, Cluster, InputItem } from '../interfaces/adaptive-resonance';

export class AnalogAdaptiveResonance {
  private clusters: Cluster[];
  private _range: number = .6;

  public get range() {
    return this._range;
  }
  public set range(val) {
    this._range = val;
  }

  private cloneHelper: Clone = new Clone();
  private normalizeHelper: Normalize = new Normalize();
  private denormalizeHelper: Denormalize = new Denormalize();

  // public learn(data: InputItem[]) {
  //   const dataClone = data.map(item => this.nor)
  // }
}