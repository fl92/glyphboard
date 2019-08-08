import { Logger } from 'app/shared/services/logger.service';
import { Injectable, Injector } from '@angular/core';
import { ConfigurationDataCompare } from './configuration.data.compare';
import { EventAggregatorService } from '../events/event-aggregator.service';
import { Configuration } from './configuration.service';
import { ConfigurationData } from './configuration.data';

@Injectable()
export class ConfigurationCompare extends Configuration {
    private _configurationCompareData: ConfigurationDataCompare;
    private _isDrawPositionA = 0;
    private _isChangeVersion = true;
    private _isComparisonMode = false;
    private comparisonModeChangedHandlers: ((m: boolean) => void)[] = [];


    constructor(logger: Logger, eventAggregator: EventAggregatorService) {
        super(logger, eventAggregator);
        this._configurationCompareData = new ConfigurationDataCompare(this, eventAggregator);
        this._configurations.push(this._configurationCompareData);
    }

    get configurationCompareData(): ConfigurationDataCompare { return this._configurationCompareData; }



    public get isChangeVersion(): boolean {
        return this._isChangeVersion;
    }
    public set isChangeVersion(v : boolean) {
        this._isChangeVersion = v;
    }

    public get versionAnimation(): number {
        return this._isDrawPositionA;
    }
    public set versionAnimation(v: number) {
        this._isDrawPositionA = v;
    }

    public addOnComparisonModeChanged(handler: (m: boolean) => void) {
        this.comparisonModeChangedHandlers.push(handler);
    }

    public get isComparisonMode(): boolean {
        return this._isComparisonMode;
    }
    public set isComparisonMode(v: boolean) {
        this._isComparisonMode = v;
        this.comparisonModeChangedHandlers.forEach(handler => handler(v));
    }

    get configurations(): Array<ConfigurationData> { return [this._configurationCompareData]; }


}
