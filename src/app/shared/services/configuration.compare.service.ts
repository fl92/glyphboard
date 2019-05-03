import { Logger } from 'app/shared/services/logger.service';
import { Injectable } from '@angular/core';
import { ConfigurationDataCompare } from './configuration.data.compare';
import { EventAggregatorService } from '../events/event-aggregator.service';

@Injectable()
export class ConfigurationCompare {
    private _configurationData: ConfigurationDataCompare; // Array<ConfigurationDataCompare>;
    private _loadConfigA: boolean;
    constructor(private logger: Logger,
        private eventAggregator: EventAggregatorService) {
        this._configurationData = new ConfigurationDataCompare(this, this.eventAggregator);
    }

    get configurationData(): ConfigurationDataCompare { return this._configurationData; }

    public get loadConfigA(): boolean {
        return this._loadConfigA;
    }
    public set loadConfigA(v: boolean) {
        this._loadConfigA = v;
    }
}
