// import { GlyphplotEventController } from './glyphplot.event.controller';
// import { GlyphplotComparisonComponent } from './glyphplot.comparison.component';
// import { ConfigurationDataCompare } from 'app/shared/services/configuration.data.compare';
// import { LenseCursor } from 'app/lense/cursor.service';
// import { Logger } from 'app/shared/services/logger.service';
// import { ConfigurationCompare } from 'app/shared/services/configuration.compare.service';
// import { EventAggregatorService } from 'app/shared/events/event-aggregator.service';

// export class GlyphplotComparisonEventController extends GlyphplotEventController{

//     constructor(private _component: GlyphplotComparisonComponent,
//         private _configuration: ConfigurationDataCompare,
//         private _cursor: LenseCursor,
//         private _logger: Logger,
//         private _configurationService: ConfigurationCompare,
//         private _eventAggregator: EventAggregatorService
//       ) {
//         super (_component, _configuration, _cursor, _logger,
//              _configurationService, _eventAggregator);
//       }

//       private onRefreshPlot = (payload: boolean) => {
//         if (this._component.data === null) {
//           return;
//         }

//         this._component.draw();
//       };
// }
