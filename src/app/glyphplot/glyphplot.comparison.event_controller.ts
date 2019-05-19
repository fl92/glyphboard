import { GlyphplotEventController } from './glyphplot.event.controller';
import { GlyphplotComparisonComponent } from './glyphplot.comparison.component';
import { ConfigurationDataCompare } from 'app/shared/services/configuration.data.compare';
import { LenseCursor } from 'app/lense/cursor.service';
import { Logger } from 'app/shared/services/logger.service';
import { ConfigurationCompare } from 'app/shared/services/configuration.compare.service';
import { EventAggregatorService } from 'app/shared/events/event-aggregator.service';
import * as d3 from 'd3';
import { RefreshPlotEvent } from 'app/shared/events/refresh-plot.event';

export class GlyphplotComparisonEventController extends GlyphplotEventController {

    constructor(private _component: GlyphplotComparisonComponent,
         _configuration: ConfigurationDataCompare,
         _cursor: LenseCursor,
         _logger: Logger,
         _configurationService: ConfigurationCompare,
         _eventAggregator: EventAggregatorService
      ) {
        super (_component, _configuration, _cursor, _logger,
             _configurationService, _eventAggregator);
      }

      protected onRefreshPlot (payload: boolean) {
        // this.configuration.updateCurrentLevelOfDetail(this.component.transform.k);
        // this.updateSelectionMode(this.configuration.useDragSelection);
        // this.component.updateGlyphLayout(true);
        // this.component.draw();
        this.component.animate();
      };

 
        /**
   * Dragging the canvas ended, so update collisions and get a a list of selected glyphs.
   */
  public onDragEnd(): void {
    this.saveEndTransform = d3.event.transform;

    // prevent selection if event was zoom (eventType is something like wheel)
    if (!this.configuration.useDragSelection || this.currentEventType !== 'mousemove') {
      this.currentEventType = null;
      return;
    }
    this.currentEventType = null;

    const selectedIds = this.findSelectedIds();
    this._component.configurationDataCompare.filteredItemsIds = selectedIds;
    this._component.draw();

    // draws the selection rectangle if the user is currently in the specific mode
    if (
      this.configuration.useDragSelection &&
      d3.event
    ) {
      this.component.selectionRect.draw(d3.event);
    }
    this.eventAggregator.getEvent(RefreshPlotEvent).publish(true);
  }


   /**
   * If the mouse cursors moves, update the tooltip for glyphs if needed.
   * @param e mouse move event
   */
  public onMouseMove(e: MouseEvent): void {
    if (this.cursor.isVisible && !this.cursor.isFixed) {
        this.cursor.position = { left: e.clientX, top: e.clientY };
        // this.component.tooltip.isVisible = false;
      }
    if (!this.cursor.isVisible || this.cursor.isFixed ) {

    if (this.configuration.useDragSelection) {
        this.component.draw();
        }
    }

  }

  /**
   * If the canvas is clicked, either fixate the tooltip in its position or make it movable again.
   * @param e mouse click event
   */
  public onClick(e: MouseEvent): void {
    if (!this.configuration.useDragSelection) {
      return;
    }
      const selectedIds: number[] = [];
      this._component.configurationDataCompare.filteredItemsIds = selectedIds;
      this._component.draw();
  }

  private findSelectedIds() {
    const selectedIds: number[] = [];
    const rect = this._component.selectionRect;
    const top: number = (rect.end.y < rect.start.y)
      ? rect.end.y
      : rect.start.y;
    const bottom: number = (top === rect.end.y)
      ? rect.start.y
      : rect.end.y;
    const left: number = (rect.end.x < rect.start.x)
      ? rect.end.x
      : rect.start.x;
    const right: number = (left === rect.end.x)
      ? rect.start.x
      : rect.end.x;
    const compData = this._component.comparedData;
    const drawA = this._component.configurationCompare.versionAnimation;
    compData.forEach(item => {
      const _id = item.objectId;
      const position = drawA ? item.drawnPositionA : item.drawnPositionB;
      if (position == null) {
        return;
      }
      const [_x, _y] = position;
      if (!rect.helper.checkClipping(position)
         && _x > left && _x < right
         && _y > top && _y < bottom) {
        selectedIds.push(_id);
      };
    });
    return selectedIds;
  }
}
