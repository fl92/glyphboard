import { Logger } from 'app/shared/services/logger.service';
import { Injectable, Injector } from '@angular/core';
import { ConfigurationDataCompare } from './configuration.data.compare';
import { EventAggregatorService } from '../events/event-aggregator.service';
import { Configuration } from './configuration.service';
import { ConfigurationData } from './configuration.data';

@Injectable()
export class ConfigurationCompare extends Configuration {

    private _configurationData: ConfigurationDataCompare; // Array<ConfigurationDataCompare>;
    private _isDrawPositionA = false;

    constructor(logger: Logger, eventAggregator: EventAggregatorService) {
        super(logger, eventAggregator);
        this._configurationData = new ConfigurationDataCompare(this, eventAggregator);
    }

    get configurationData(): ConfigurationDataCompare { return this._configurationData; }


    public get isDrawPositionA(): boolean {
        return this._isDrawPositionA;
    }
    public set isDrawPositionA(v: boolean) {
        this._isDrawPositionA = v;
    }

    get configurations(): Array<ConfigurationData> { return [this._configurationData]; }

    // deprecated properties ////////////////////////////////

    // public addConfiguration(): ConfigurationData {
    //     throw new Error('method not available for this class');
    // }

    // get dataSetRequest(): number { throw new Error('property not available for this class'); }
    // set dataSetRequest(value: number) { throw new Error('property not available for this class'); }

    // get splitScreenActive() {  throw new Error('property not available for this class'); ; }
    // set splitScreenActive(value: boolean) {  throw new Error('property not available for this class'); ; }

    // get flowerConfigs() { throw new Error('property not available for this class'); }
    // set flowerConfigs(value: any) { throw new Error('property not available for this class'); }

    // get starConfigs() { throw new Error('property not available for this class'); }
    // set starConfigs(value: any) { throw new Error('property not available for this class'); }

    // get activeGlyphType() { throw new Error('property not available for this class'); }
    // set activeGlyphType(value: any) { throw new Error('property not available for this class'); }

    // get smallGlyphRadius() { throw new Error('property not available for this class'); }
    // set smallGlyphRadius(value: number) {  throw new Error('property not available for this class'); }

    // get largeGlyphRadius() { throw new Error('property not available for this class'); }
    // set largeGlyphRadius(value: number) { throw new Error('property not available for this class'); }

    // get legendGlyphRadius(): number { throw new Error('property not available for this class'); }
    // set legendGlyphRadius(value: number) { throw new Error('property not available for this class'); }

    // public activeGlyphConfig(): any{
    //     throw new Error('method not available for this class');
    // }

}
