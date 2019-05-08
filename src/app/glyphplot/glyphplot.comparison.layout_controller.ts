import { Logger } from 'app/shared/services/logger.service';
import * as d3 from 'd3';
import { Configuration } from '../shared/services/configuration.service';
import { GlyphplotComparisonComponent } from './glyphplot.comparison.component';
import { GlyphplotLayoutController } from './glyphplot.layout.controller';


export class GlyphplotComparisonLayoutController extends GlyphplotLayoutController{
    constructor(
        private _component: GlyphplotComparisonComponent,
        private _logger: Logger,
        private _configurationService: Configuration) {
            super(_component, _logger, _configurationService);
    }

    public drawSingleGlyph(
        position: {x: number, y: number},
        feature: any,
        progress: number,
        isPassive: boolean,
        isHighligted: boolean,
        animationProgress: number): void {
        }

    public updatePositions(): void {
        let minX = Infinity,
            maxX = -Infinity,
            minY = Infinity,
            maxY = -Infinity;

        this._component.comparedData.forEach( d => {
            [d.positionA, d.positionB].forEach((pos) => {
                if ( pos != null) {
                    const [x, y] = pos;
                    minX = Math.min(x, minX);
                    maxX = Math.max(x, maxX);
                    minY = Math.min(y, minY);
                    maxY = Math.max(y, maxY);
                    }
                });
        });
        this._component.xAxis = d3
        .scaleLinear()
        .domain([minX + minX / 20, maxX - minX / 20])
        .range([5, this._component.width - 5]);

        this._component.yAxis = d3
        .scaleLinear()
        .domain([minY + minY / 20, maxY - minY / 20])
        .range([this._component.height - 5, 5]);
    }

    // private search(quadtree, x0, y0, x3, y3) {}

    public getItems(): [Map<any, [number[], number[]]>, [number, number]] {
        return null;
    }

   // public getPositions(): any {}

 //   public getFeaturesForItem(d: any) {}
}