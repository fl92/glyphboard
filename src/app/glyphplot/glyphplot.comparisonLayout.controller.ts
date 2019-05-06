import { Logger } from 'app/shared/services/logger.service';
import * as d3 from 'd3';
import { Configuration } from '../shared/services/configuration.service';
import { GlyphplotComparisonComponent } from './glyphplot.comparison.component';


export class GlyphplotComparisonLayoutController {
    constructor(
        private component: GlyphplotComparisonComponent,
        private logger: Logger,
        private configurationService: Configuration) {
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
        let minX = 0,
            maxX = 0,
            minY = 0,
            maxY = 0;

        // this.component.configuration.itemsCount = this.component.glyphs.length;
        this.component.glyphs.forEach( d => {});
    }

    private search(quadtree, x0, y0, x3, y3) {}

    public getItems(): [Map<any, [number[], number[]]>, [number, number]] {
        return null;
    }

   // public getPositions(): any {}

 //   public getFeaturesForItem(d: any) {}
}