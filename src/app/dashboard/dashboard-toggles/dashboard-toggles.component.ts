import { Component, OnInit } from '@angular/core';
import { LenseCursor } from 'app/lense/cursor.service';
import { Configuration } from 'app/shared/services/configuration.service';
import { EventAggregatorService } from 'app/shared/events/event-aggregator.service';
import { RefreshPlotEvent } from 'app/shared/events/refresh-plot.event';
import { ConfigurationCompare } from 'app/shared/services/configuration.compare.service';
import { ConfigurationData } from 'app/shared/services/configuration.data';

@Component({
  selector: 'app-dashboard-toggles',
  templateUrl: './dashboard-toggles.component.html',
  styleUrls: ['./dashboard-toggles.component.scss']
})
export class DashboardTogglesComponent implements OnInit {

  constructor(public cursor: LenseCursor,
    public configuration: Configuration,
    private configurationCompare: ConfigurationCompare,
    private eventAggregator: EventAggregatorService) { }

  ngOnInit() {
  }

  /**
   * Switch between the interaction techniques magic lens and zoom.
   * @param {any} e The onChange event for HTML-radiobuttons
   */
  public onInteractionToggle(e: any): void {
    this.cursor.toggle(e.srcElement.value === 'magiclens');

    let confs: ConfigurationData[] = [];
    confs = confs.concat (this.configuration.configurations);
    confs = confs.concat(this.configurationCompare.configurationCompareData);
    confs.forEach( (conf) => {
      conf.useDragSelection = e.srcElement.value === 'selection';
    });
    this.eventAggregator.getEvent(RefreshPlotEvent).publish(true);
  }

}
