import { Component, OnInit, HostListener } from '@angular/core';
import { DataproviderService } from '../shared/services/dataprovider.service';
import { RegionManager } from '../region/region.manager';
import { Logger } from '../shared/services/logger.service';
import { Configuration } from 'app/shared/services/configuration.service';
import { LenseCursor } from 'app/lense/cursor.service';
import { EventAggregatorService } from 'app/shared/events/event-aggregator.service';
import { RefreshPlotEvent } from 'app/shared/events/refresh-plot.event';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  providers: [ DataproviderService, Logger, RegionManager ],
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private splitScreen: boolean;
  private isKeyDown: boolean;

  constructor(
    private logger: Logger,
    public regionManager: RegionManager,
    private configuration: Configuration,
    private cursor: LenseCursor,
    private eventAggregator: EventAggregatorService) {
    this.regionManager.addRegion('glyphs', 0, 0.8, false);
    this.regionManager.addRegion('glyphs2', 0.5, 0.8, false);
    this.regionManager.addRegion('features', 0, 0, false);
    this.regionManager.addRegion('dataflow', 0, 0, false);
    this.regionManager.addRegion('compare_glyphs', 0, 0.8, true);
  }

  @HostListener('document:keyup', ['$event'])
  @HostListener('document:keydown', ['$event'])
  keypress(e: KeyboardEvent) {
    if (this.isKeyDown && e.type === 'keydown') {
      return;
    }
    if (e.type === 'keyup') {
      this.isKeyDown = false;
    } else {
      this.isKeyDown = true;
    }

    switch (e.key.toLowerCase()) {
      case 'control':
        if (e.type === 'keyup') {
          this.activatePanningMode();
        } else {
          this.activateSelectionMode();
        }
        break;
      case 'm':
        // Magic Lens mode
        if (e.altKey && e.type === 'keyup') {
          this.cursor.toggle(true);
          this.configuration.configurations[0].useDragSelection = false;
          this.configuration.configurations[1].useDragSelection = false;
        }
        break;
      case 'p':
        // Zooming and panning mode
        if (e.altKey && e.type === 'keyup') {
          this.activatePanningMode();
        }
        break;
      case 's':
        // Selection mode
        if (e.altKey && e.type === 'keyup') {
          this.activateSelectionMode();
        }
        break;
      case '3':
        // Switch for Region 4 for WebGL Glyphplot, disable D3 Glyphplot
        if (e.type === 'keyup') {
          const d3Glyphplot = this.regionManager.regions[0].display === 'block';

          if (d3Glyphplot) {
            this.splitScreen = this.regionManager.regions[1].display === 'block';
            this.regionManager.regions[0].display = 'none';
            this.regionManager.regions[1].display = 'none';
            this.regionManager.regions[4].display = 'visible';
          } else {
            this.regionManager.regions[0].display = 'block';
            this.regionManager.regions[1].display = this.splitScreen ? 'block' : 'none';
            this.regionManager.regions[4].display = 'none';
          }
        }
        break;
      default:
        return;
    }

    this.eventAggregator.getEvent(RefreshPlotEvent).publish(true);
  }

  activatePanningMode() {
    this.cursor.toggle(false);
    this.configuration.configurations[0].useDragSelection = false;
    this.configuration.configurations[1].useDragSelection = false;
  }

  activateSelectionMode() {
    this.cursor.toggle(false);
    this.configuration.configurations[0].useDragSelection = true;
    this.configuration.configurations[1].useDragSelection = true;
  }

  ngOnInit() {
    this.onResize();
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.regionManager.updateRegions(width, height);
  }
}
