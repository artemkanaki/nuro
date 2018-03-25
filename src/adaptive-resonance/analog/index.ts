import { CloneHelper } from '../../helpers/clone';
import { NormalizeHelper } from '../../formulas/normalize';
import { DenormalizeHelper } from '../../formulas/denormalize';
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

  private cloneHelper: CloneHelper = new CloneHelper();
  private normalizeHelper: NormalizeHelper = new NormalizeHelper();
  private denormalizeHelper: DenormalizeHelper = new DenormalizeHelper();

  // public learn(data: InputItem[]) {
  //   const dataClone = data.map(item => this.nor)
  // }
}