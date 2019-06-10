import { ComparisonGlyph } from 'app/glyph/glyph.comparison';
import { EventAggregatorService } from '../events/event-aggregator.service';
import { ConfigurationCompare } from './configuration.compare.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs';
import { ComparisonMoveGlyph } from 'app/glyph/glyph.comparison.move';
import { ConfigurationData } from './configuration.data';
import { ConnectionCompareFilter } from '../filter/connection.compare-filter';
import { ComparisonHoleGlyph } from 'app/glyph/glyph.comparison.hole';
import { ColorComputation } from 'app/glyph/glyph.comparison.move.colorComputation';


export class ConfigurationDataCompare extends ConfigurationData {



   private _selectedFeature: any;

   private allGlyphCompTypes: ComparisonGlyph[]
        = [new ComparisonMoveGlyph(), new ComparisonHoleGlyph()];
   private _comparisonGlyph: ComparisonGlyph = this.allGlyphCompTypes[0];
   private iCompGlyph = 0;

   private _dataA = new BehaviorSubject<any>(null);
   private _dataB = new BehaviorSubject<any>(null);

   private _connectionCompareFilter = new ConnectionCompareFilter();

  private _configurationCompare: ConfigurationCompare;
  private _heatMapComputation = new ColorComputation();


  private _TRANSPARENCY = 0.4;

  constructor(configuration: ConfigurationCompare, eventAggregator: EventAggregatorService
    ) {
      super(configuration, eventAggregator);
      this._configurationCompare = configuration;
      this.selectedFeature = null;
      this.globalFeatureContext = 1;
  }


  public toggleComparisonGlyphs () {
      this.iCompGlyph++;
      this.iCompGlyph %= this.allGlyphCompTypes.length;
      this.comparisonGlyph = this.allGlyphCompTypes[this.iCompGlyph];
  }

   public get comparisonGlyph(): ComparisonGlyph {
       return this._comparisonGlyph;
   }
   public set comparisonGlyph(v: ComparisonGlyph) {
       this._comparisonGlyph = v;
   }
   public getDataA(): Observable<any> {
       return this._dataA.asObservable();
   }
   public setDataA(v: any) {
       this._dataA.next(v);
   }
   public getDataB(): Observable<any> {
       return this._dataB.asObservable();
   }
   public setDataB(v: any) {
       this._dataB.next(v);
   }

   public get connectionFilter(): ConnectionCompareFilter {
       return this._connectionCompareFilter;
   }
   public set connectionFilter(v: ConnectionCompareFilter) {
       this._connectionCompareFilter = v;
   }

   public get configurationCompare() {
       return this._configurationCompare;
   }
   public get selectedFeature(): any {
    return this._selectedFeature;
}
    public set selectedFeature(v: any) {
        this._selectedFeature = v;
        this.allGlyphCompTypes.forEach(glyph => {
            glyph.selectedFeature = v;
        });
    }

   // constants
   public get TRANSPARENCY() {
    return this._TRANSPARENCY;
}

   /////////

   public filterRefresh() {
       // do nothing, filter applied in movementvisualization directly
   }

   public get heatMapComputation() {
       return this._heatMapComputation;
   }

  // public get configuration(): ConfigurationCompare {
  //   return this._configuration;
  // }

  // Deprecated Properties and Methods /////////////////////////////////////////////////////////////////////////

  // get glyph(): any { throw new Error('property not available for this class'); }
  // set glyph(value: any) { throw new Error('property not available for this class'); }

  // get useColorRange(): boolean { throw new Error('property not available for this class'); }
  // set useColorRange(flag: boolean) { throw new Error('property not available for this class'); }

  // get currentLayout(): any { throw new Error('property not available for this class'); }
  // set currentLayout(layout: any) { throw new Error('property not available for this class'); }

}
