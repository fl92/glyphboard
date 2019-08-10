// author: Florian Dietz
import { Component, OnInit, Injector, ViewChild} from '@angular/core';
import { DashboardTabComponent } from '../dashboard-tab/dashboard-tab.component';
import { ConfigurationCompare } from 'app/shared/services/configuration.compare.service';
import { Subject } from 'rxjs';
import { ConfigurationDataCompare } from 'app/shared/services/configuration.data.compare';
import { RefreshPlotEvent } from 'app/shared/events/refresh-plot.event';
import { ConnectionCompareFilter } from 'app/shared/filter/connection.compare-filter';
import { DashboardPropertyConfigComponent } from './dashboard-property-config.component';
import { ColorComputation } from 'app/glyph/glyph.comparison.move.colorComputation';


/**
 * This component defines a dashboard tab in which holds all
 * the control elements for version comparison.
 */
@Component({
  selector: 'app-dashboard-tab-compare',
  templateUrl: './dashboard-tab-compare.component.html',
  styleUrls: ['./dashboard-tab-compare.component.scss'],
})
export class DashboardTabCompareComponent extends DashboardTabComponent implements OnInit {

  public eventsSubject: Subject<void> = new Subject<void>();
  private configurationDataCompare: ConfigurationDataCompare;

  private filter: ConnectionCompareFilter;

  // components to define min and max of movement characteristics
  // for filtering
  @ViewChild('correlation')
  private correlationComponent: DashboardPropertyConfigComponent;

  @ViewChild('difference')
  private differenceComponent: DashboardPropertyConfigComponent;

  @ViewChild('movement')
  private movementComponent: DashboardPropertyConfigComponent;

  // has this tab data
  private _hasData = false;

  // is this tab active to use
  isActive = false;

  constructor(
    injector: Injector,
    public configurationCompare: ConfigurationCompare,
  ) {
    super(injector);
    this.configurationDataCompare = configurationCompare.configurationCompareData;
    this.filter = this.configurationDataCompare.connectionFilter;

  }

  ngOnInit() {

      // init color scale of differenceComponent
      const computation: ColorComputation = this.configurationCompare.configurationCompareData.heatMapComputation;
      const that = this;
      computation.onChanged = () => {
        that._hasData = true;
        that.updateIsActive();
        that.differenceComponent.drawScale((context, w, h) => {
          computation.computeColorIII(2, 2, false);

          const step = 2 * (computation.max / w);
          for (let x = 0, heat = -computation.max;
                    x < w; x++, heat += step) {
          context.fillRect(x, 0,
            1, h);
          context.fillStyle = computation.computeColorIII(heat, computation.maxAlpha, false);
          context.fill();
          }
        });

        // init color scale of movementComponent
        that.movementComponent.drawScale((context, w, h) => {
          computation.computeColorIII(2, 2, false);

          const step = (computation.maxAlpha / w);
          for (let x = 0, heat = 0;
                    x < w; x++, heat += step) {
          context.fillRect(x, 0,
            1, h);
          context.fillStyle = computation.computeColorIII(0, heat, false);
          context.fill();
          }
        });


        // init color scale of correlationComponent
        that.correlationComponent.drawScale((context, w, h) => {
          const halfW = w / 2;
          const halfH = h / 2;
          context.beginPath();
          context.moveTo(0, halfH);
          context.lineTo(halfW, halfH);
          context.lineTo(w, halfH - 2);
          context.lineTo(w, halfH + 3);
          context.lineTo(halfW, halfH + 1);
          context.lineTo(0, halfH + 1);
          context.closePath();
          context.fillStyle = '#000000';
          context.fill();
        });
      };

      this.configurationCompare.addOnComparisonModeChanged ( (_) => that.updateIsActive());

  }

  public onColorChange(e: any): void {}


  public onFeatureConfigChange(e: any): void {
    this.eventAggregator.getEvent(RefreshPlotEvent).publish(true);
  }

  /**
   * which version determines positions
   * */
  onToggleDrawA() {
    this.configurationCompare.isChangeVersion = true;
      this.eventAggregator.getEvent(RefreshPlotEvent).publish(true);
  }


  /**
   * MovementVisualizer and MovementGlyph or HoleGlyph
   */
  onToggleGlyphType() {
    this.configurationDataCompare.toggleComparisonGlyphs();
    this.eventAggregator.getEvent(RefreshPlotEvent).publish(true);
  }

  private updateIsActive() {
    let buffer = this.configurationCompare.isComparisonMode;
    buffer = buffer && this._hasData;
    this.isActive = buffer;
  }

}
