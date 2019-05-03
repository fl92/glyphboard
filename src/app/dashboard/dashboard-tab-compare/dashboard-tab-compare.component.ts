import { Component, OnInit, Injector } from '@angular/core';
import { DashboardTabComponent } from '../dashboard-tab/dashboard-tab.component';
import { ConfigurationCompare } from 'app/shared/services/configuration.compare.service';

@Component({
  selector: 'app-dashboard-tab-compare',
  templateUrl: './dashboard-tab-compare.component.html',
  styleUrls: ['./dashboard-tab-compare.component.scss']
})
export class DashboardTabCompareComponent extends DashboardTabComponent implements OnInit {
  public datasets: any;
  private allDatasets: Array<any>;

  constructor(injector: Injector,
    private compareConfiguration: ConfigurationCompare ) {
    super(injector);
  }

  ngOnInit() {
    // this.dataProvider.getDataSets().subscribe(message => {
    //   this.datasets = message;
    //   this.updateDatasets();
    // });
    // this.dataProvider.getDataSets().subscribe(message => {
    //   this.datasets = message;
    //   this.updateDatasets();
    // });
    this.dataProvider.getDataSet().subscribe(message => {
      if (message == null) {
        return;
      }



      // if (this.configuration.dataSetRequest === 0 &&
      //     this.selectedDataset !== this.selectedDatasetSecond) {
      //   // Load same dataset for right side!
      //   this.selectedDatasetSecond = this.selectedDataset;
      //   this.dashboardDataSetChangedSecond();
      // }
    });

  }

  onTabVisible() {
    this.updateData(true);
    // change glyphplot
  }

  private updateDatasets() {
    // if (this.datasets === undefined || this.datasets.length === 0) {
    //   return;
    // }

    // this.allDatasets = [];
    // this.datasets.forEach(dataset => {
    //   dataset.Items.forEach(item => {
    //     // if (item.Algorithms.position instanceof Array) {
    //     //   // item.Algorithms.position.forEach(positionAlgorithm => {
    //     //   //   this.allDatasets.push({
    //     //   //     name: dataset.Dataset,
    //     //   //     version: item.Time,
    //     //   //     position: positionAlgorithm
    //     //   //   });
    //     //   // });
    //     // } else {
    //     //   // this.allDatasets.push({
    //     //   //   name: dataset.Dataset,
    //     //   //   version: item.Time,
    //     //   //   position: item.Algorithms.position
    //     //   // });
    //     // }
    //   });
    // });
  }

  public updateData(loadConfigA) {
    this.compareConfiguration.loadConfigA = true;
    this.dataProvider.downloadDataSet(
      'febrl',
      '22032018',
      'tsne'
    );
   // this.dataProvider.getDataSet();
    // this.dataProvider.downloadDataSet(
    //   'comptest',
    //   '23457',
    //   'tsne'
    // );
  }

}
