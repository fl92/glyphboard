import { ComparisonGlyph } from './glyph.comparison';
import { ComparisonHoleGlyph } from './glyph.comparison.hole';

export class ComparisonGlyphCreator {
  private _proto: ComparisonGlyph = new ComparisonHoleGlyph();

  public json2Glyphs(glyphsJSONA, glyphsJSONB): ComparisonGlyph[] {
    const buffer: ComparisonGlyph[] = [];

    const labelIDs: any[] = glyphsJSONB['toBeLabeledFeatures'];
    // const questionsMap = glyphsJSONB['featuresQuestionMapping'];
    const predMap = glyphsJSONB['predictionFeatureMapping'];
    const shownFeatures: any[] = glyphsJSONB['shownFeatures'];
    const dataObjectsA: object[] = glyphsJSONA['dataObjects'];
    const dataObjectsAMap = new Map<any, object> ();
    const dataObjectsB: object[] = glyphsJSONB['dataObjects'];
    const dataObjectsBMap = new Map<any, object> ();
    const positionsA = new Map<any, [number, number]>();
    const positionsB = new Map<any, [number, number]>();

    const objIds = new Set<any>();
    for (const object of dataObjectsA) {
      objIds.add(object['id']);
      dataObjectsAMap.set(object['id'], object);
    }
    for (const object of dataObjectsB) {
      objIds.add(object['id']);
      dataObjectsBMap.set(object['id'], object);
    }

    for (const posObj of glyphsJSONA['positions']) {
      const pos: [number, number] =
      [Number(posObj['position']['x']), Number(posObj['position']['y'])];
      positionsA.set(posObj['id'], pos);
    }
    for (const posObj of glyphsJSONB['positions']) {
      const pos: [number, number] =
      [Number(posObj['position']['x']), Number(posObj['position']['y'])];
      positionsB.set(posObj['id'], pos);
    }

    objIds.forEach((objId) => {

      const glyph = this._proto.clone();
      glyph.selectedFeature = '3';

      const objectA = dataObjectsAMap.get(objId);
      const objectB = dataObjectsBMap.get(objId);

      for (const object of [objectA, objectB]) {
        // const independentFeatures = new Map<string, number>();
        const targetFeatures = new Map<string, [number[], number[]]>();
        // const questions = []; TODO
        const defContext = object['default-context'];
        const vals = object['values'];
          for (const featId in vals) {
            if (shownFeatures.includes(featId)
                  && vals.hasOwnProperty(featId)) {
              if (labelIDs.includes(featId)) {
                const labId = featId;
                const predId = predMap[labId];
                const label: number[] = object['features'][defContext][labId];
                const pred: number[] = object['features'][defContext][predId];

                targetFeatures.set('' + labId, [label, pred] ); // TODO richtigen feature-namen
              } else if ( predMap.hasOwnProperty(featId)) {
                continue;
              } else {
                const features = object['features'][defContext];
                const feature = Number(features[featId]);
                // independentFeatures.set('' + featId, feature);
              }
            }
          }
          if (object === objectA) {
            const position = positionsA.get(objId);
            glyph.setVersionA(targetFeatures, position);
          } else { //  if (object === objectB)
            const position = positionsB.get(objId);
            glyph.setVersionB(targetFeatures, position);
          }
      }
      buffer.push(glyph);
    }, this);
    return buffer;
  }
}
