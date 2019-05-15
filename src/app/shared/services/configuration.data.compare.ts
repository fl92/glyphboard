import { ComparisonGlyph } from 'app/glyph/glyph.comparison';
import { EventAggregatorService } from '../events/event-aggregator.service';
import { ConfigurationCompare } from './configuration.compare.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs';
import { ComparisonMoveGlyph } from 'app/glyph/glyph.comparison.move';
import { ConfigurationData } from './configuration.data';
import { ConnectionCompareFilter } from '../filter/connection.compare-filter';


export class ConfigurationDataCompare extends ConfigurationData {


   private _comparisonGlyph: ComparisonGlyph = new ComparisonMoveGlyph();
   private _dataA = new BehaviorSubject<any>(null);
   private _dataB = new BehaviorSubject<any>(null);

   private _connectionCompareFilter = new ConnectionCompareFilter();

  private _configuration: ConfigurationCompare;

  private _TRANSPARENCY = 0.7;


  constructor(configuration: ConfigurationCompare, eventAggregator: EventAggregatorService
    ) {
      super(configuration, eventAggregator);
      this._configuration = configuration;
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

   // constants
   public get TRANSPARENCY() {
    return this._TRANSPARENCY;
}
   /////////

   public filterRefresh() {
       // do nothing, filter applied in movementvisualization directly
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
