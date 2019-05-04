import { Logger } from 'app/shared/services/logger.service';
import { Injectable } from '@angular/core';
import { ConfigurationDataCompare } from './configuration.data.compare';
import { EventAggregatorService } from '../events/event-aggregator.service';

@Injectable()
export class ConfigurationCompare {
    private _configurationData: ConfigurationDataCompare; // Array<ConfigurationDataCompare>;
    private _isLoadConfigA: boolean;
    constructor(private logger: Logger,
        private eventAggregator: EventAggregatorService) {
        this._configurationData = new ConfigurationDataCompare(this, this.eventAggregator);
    }

    get configurationData(): ConfigurationDataCompare { return this._configurationData; }

    public get isLoadConfigA(): boolean {
        return this._isLoadConfigA;
    }
    public set isLoadConfigA(v: boolean) {
        this._isLoadConfigA = v;
    }
}
