import { Component, OnInit, Injector } from '@angular/core';
import { DashboardTabComponent } from '../dashboard-tab/dashboard-tab.component';
import { ConfigurationCompare } from 'app/shared/services/configuration.compare.service';
import { DoubleDataproviderService } from 'app/shared/services/doubledataprovider.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-dashboard-tab-compare',
  templateUrl: './dashboard-tab-compare.component.html',
  styleUrls: ['./dashboard-tab-compare.component.scss'],
  providers: [DoubleDataproviderService]
})
export class DashboardTabCompareComponent extends DashboardTabComponent implements OnInit {

  public eventsSubject: Subject<void> = new Subject<void>();

  constructor(
    injector: Injector,
    public configurationCompare: ConfigurationCompare,
    private doubleDataProvider: DoubleDataproviderService
  ) {
    super(injector);

  }

  ngOnInit() {
    this.doubleDataProvider.getDataSetA().subscribe(
      msg => {
        if (msg === undefined || msg === null) {return; }
        this.configurationCompare.configurationData.setDataA(msg);
      });
    this.doubleDataProvider.getDataSetB().subscribe(
      msg => {
        if (msg === undefined || msg === null) {return; }
        this.configurationCompare.configurationData.setDataB(msg);
      });
      this.onOpenTab(); // TODO anders
  }

  public onColorChange(e: any): void {}

  public onFeatureConfigChange(e: any): void {}

  onOpenTab() {
    this.doubleDataProvider.downloadDataSetA('compTest', '22032018', 'tsne')
    this.doubleDataProvider.downloadDataSetB('compTest', '22032019', 'tsne')
  }

}