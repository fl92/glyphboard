import { GlyphplotComponent } from './glyphplot.component';
import { Logger } from 'app/shared/services/logger.service';
import * as d3 from 'd3';
import { Configuration } from '../shared/services/configuration.service';


export class GlyphplotComparisonLayoutController {
    constructor(
        private component: GlyphplotComponent,
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

    public updatePositions(): void {}


    private search(quadtree, x0, y0, x3, y3) {}

    public getItems(): [Map<any, [number[], number[]]>, [number, number]] {
        return null;
    }

   // public getPositions(): any {}

 //   public getFeaturesForItem(d: any) {}
}