import { ComparisonGlyph } from "app/glyph/glyph.comparison";
import { EventAggregatorService } from "../events/event-aggregator.service";
import { ConfigurationCompare } from "./configuration.compare.service";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { Observable } from "rxjs";


export class ConfigurationDataCompare {

   private _glyph: ComparisonGlyph;
   private _dataA = new BehaviorSubject<any>(null);
   private _dataB = new BehaviorSubject<any>(null);
   private _selectedDataSetInfo = {
    name: '',
    version: '',
    positionAlgorithm: ''
  };


  private _configuration: ConfigurationCompare;
  private _eventAggregator: EventAggregatorService;

  constructor(configuration: ConfigurationCompare, eventAggregator: EventAggregatorService
    ) {
      this._configuration = configuration;
      this._eventAggregator = eventAggregator;
  }

   public get glyph(): ComparisonGlyph {
       return this._glyph;
   }
   public set glyph(v: ComparisonGlyph) {
       this._glyph = v;
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

   get selectedDataSetInfo(): {
    name: string;
    version: string;
    positionAlgorithm: string;
  } {
    return this._selectedDataSetInfo;
  }
  set selectedDataSetInfo(value: {
    name: string;
    version: string;
    positionAlgorithm: string;
  }) {
    this._selectedDataSetInfo = value;
  }

  public get configuration(): ConfigurationCompare {
    return this._configuration;
  }
  public get eventAggregator(): EventAggregatorService {
      return this._eventAggregator;
  }

}
