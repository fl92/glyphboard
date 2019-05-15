import { Component, OnInit, Injector } from '@angular/core';
import { DashboardTabComponent } from '../dashboard-tab/dashboard-tab.component';
import { ConfigurationCompare } from 'app/shared/services/configuration.compare.service';
import { DoubleDataproviderService } from 'app/shared/services/doubledataprovider.service';
import { Subject } from 'rxjs';
// import { Options, LabelType } from 'ng5-slider';
import { ConfigurationDataCompare } from 'app/shared/services/configuration.data.compare';
import { RefreshPlotEvent } from 'app/shared/events/refresh-plot.event';

@Component({
  selector: 'app-dashboard-tab-compare',
  templateUrl: './dashboard-tab-compare.component.html',
  styleUrls: ['./dashboard-tab-compare.component.scss'],
  providers: [DoubleDataproviderService]
})
export class DashboardTabCompareComponent extends DashboardTabComponent implements OnInit {

  public eventsSubject: Subject<void> = new Subject<void>();
  private configurationDataCompare: ConfigurationDataCompare;

  diffMin = -1;
  diffMax = 1;
  // diffOptions: Options = {
  //   floor: -1, ceil: 1,
  //   step: 0.01,
  //   translate: (value, label) => { return ''}
  //   }

  constructor(
    injector: Injector,
    public configurationCompare: ConfigurationCompare,
    private doubleDataProvider: DoubleDataproviderService
  ) {
    super(injector);
    this.configurationDataCompare = configurationCompare.configurationCompareData;

  }

  ngOnInit() {
    this.doubleDataProvider.getDataSetA().subscribe(
      msg => {
        if (msg === undefined || msg === null) {return; }
        this.configurationCompare.configurationCompareData.setDataA(msg);
      });
    this.doubleDataProvider.getDataSetB().subscribe(
      msg => {
        if (msg === undefined || msg === null) {return; }
        this.configurationCompare.configurationCompareData.setDataB(msg);
      });
      this.onOpenTab(); // TODO anders
  }

  public onColorChange(e: any): void {}

  public onFeatureConfigChange(e: any): void {
    const filter = this.configurationDataCompare.connectionFilter;
    filter.maxDifference = this.diffMax;
    filter.minDifference = this.diffMin;
    this.eventAggregator.getEvent(RefreshPlotEvent).publish(true);
  }

  onOpenTab() {
    this.doubleDataProvider.downloadDataSetA('compTest', '22032018', 'tsne')
    this.doubleDataProvider.downloadDataSetB('compTest', '22032019', 'tsne')
  }

  onToggleMode() {
    const isComp = this.configurationCompare.isComparisonMode
      = !this.configurationCompare.isComparisonMode;
    const gylph1 = this.regionManager.regions[0];
    const gylph2 = this.regionManager.regions[1];
    const compare_glyph = this.regionManager.regions[4];
    gylph1.display = (isComp) ? 'none' : 'block';
    gylph2.display = 'none';
    compare_glyph.display = (isComp) ? 'block' : 'none';
  }

  /** which version determines positions */
  onToggleDrawA() {
    this.configurationCompare.isDrawPositionA
      = !this.configurationCompare.isDrawPositionA;
      this.eventAggregator.getEvent(RefreshPlotEvent).publish(true);
  }

  onToggleGlyphType() {
    this.configurationDataCompare.toggleComparisonGlyphs();
    this.eventAggregator.getEvent(RefreshPlotEvent).publish(true);
  }

}
