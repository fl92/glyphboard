import { ComparisonGlyph } from './glyph.comparison';
import { ComparisonHoleGlyph } from './glyph.comparison.hole';
import { Injectable } from '@angular/core';

@Injectable()
export class ComparisonGlyphCreator {
  private _proto: ComparisonGlyph = new ComparisonHoleGlyph();

  public versions2Glyphs(versionA: any, versionB: any,
    selectedTargetVariable: string = '') {
    const buffer: ComparisonGlyph[] = [];
    const objectsA = versionA['features'];
    const objectsAMap = new Map<any, object> ();
    const objectsB = versionB['features'];
    const objectsBMap = new Map<any, object> ();

    const positionsA = versionA['positions'];
    const positionsAMap = new Map<any, [number, number]> ();
    const positionsB = versionB['positions'];
    const positionsBMap = new Map<any, [number, number]> ();

    const objIds = new Set<any>();

    const targetVariablesMeta
      = new Map<any, {
        targetName: string,
        targetLabel: string[],
        targetPrediction: string[],
      }> ();

    if (targetVariablesMeta.size >= 1) {
      return;
    }

    const targetVariablesObj = versionA['schema']['targetVariables'];
    const targetLabelsObj = versionA['schema']['targetLabels'];
    const targetPredictionsObj = versionA['schema']['targetPredictions'];
    for (const targetId in targetVariablesObj) {
      if (targetVariablesObj.hasOwnProperty(targetId)) {
        const targetName = targetVariablesObj[targetId];
        const targetLabel = targetLabelsObj[targetId];
        const targetPrediction = targetPredictionsObj[targetId];
      targetVariablesMeta.set(targetId, {
        targetName: targetName,
        targetLabel: targetLabel,
        targetPrediction: targetPrediction
      }  );
      }
    }
    selectedTargetVariable = targetVariablesMeta.keys().next().value;

    // TODO selected target Variable prüfen
    for (const object of objectsA) {
      objIds.add(object['id']);
      objectsAMap.set(object['id'], object);
    }
    for (const object of objectsB) {
      objIds.add(object['id']);
      objectsBMap.set(object['id'], object);
    }
    for (const object of positionsA) {
      objIds.add(object['id']);
      const pos: [number, number] =
      [Number(object['position']['x']), Number(object['position']['y'])];
      positionsAMap.set(object['id'], pos);
    }
    for (const object of positionsB) {
      objIds.add(object['id']);
      const pos: [number, number] =
      [Number(object['position']['x']), Number(object['position']['y'])];
      positionsBMap.set(object['id'], pos);
    }

    objIds.forEach((objId) => {
      const glyph = this._proto.newInstance();
      glyph.selectedFeature = '3';

      const objectA = objectsAMap.get(objId);
      const objectB = objectsBMap.get(objId);
      const positionA = positionsAMap.get(objId);
      const positionB = positionsBMap.get(objId);

      for (const [isA, object] of [[true, objectA], [false, objectB]]) {
        const position = isA ? positionA : positionB;
        // const independentFeatures = new Map<string, number>();
        // const questions = []; TODO
        const defContext = object !== undefined ?
          object['default-context'] :
          undefined;
        // const vals = object['values'];
        //   for (const featId in vals) {
        //   //   if (shownFeatures.includes(featId)
        //   //         && vals.hasOwnProperty(featId)) {
        //   //     if (labelIDs.includes(featId)) {
        //   //       const labId = featId;
        //   //       const predId = predMap[labId];
        //   //       const label: number[] = object['features'][defContext][labId];
        //   //       const pred: number[] = object['features'][defContext][predId];

        //   //       targetFeatures.set('' + labId, [label, pred] ); // TODO richtigen feature-namen
        //   //     } else if ( predMap.hasOwnProperty(featId)) {
        //   //       continue;
        //   //     } else {
        //   //       const features = object['features'][defContext];
        //   //       const feature = Number(features[featId]);
        //   //       // independentFeatures.set('' + featId, feature);
        //   //     }
        //   //   }
        //   }
        let targetMap = null;
        if ( object !== undefined) {
          const targetObj = object['targetVariables'];
          if (targetObj !== undefined) {
            targetMap = new Map<string, [number[], number[]]>();
            for (const targetId in targetObj) {
              if (targetObj.hasOwnProperty(targetId)) {
                const target = targetObj[targetId];
                const label = target['targetLabel'];
                const prediction = target['targetPrediction'];
                targetMap.set(targetId, [label, prediction])
              }
            }
          }
        }

         isA ?
             glyph.setVersionA(targetMap, position) :
             glyph.setVersionB(targetMap, position);
      }
     glyph.selectedFeature = selectedTargetVariable;
     glyph.targetVariablesMeta = targetVariablesMeta;
     buffer.push(glyph);
    }, this);
    return buffer;
  }
  // public json2Glyphs(glyphsJSONA, glyphsJSONB): ComparisonGlyph[] {
  //   const buffer: ComparisonGlyph[] = [];

  //   const labelIDs: any[] = glyphsJSONB['toBeLabeledFeatures'];
  //   // const questionsMap = glyphsJSONB['featuresQuestionMapping'];
  //   const predMap = glyphsJSONB['predictionFeatureMapping'];
  //   const shownFeatures: any[] = glyphsJSONB['shownFeatures'];
  //   const dataObjectsA: object[] = glyphsJSONA['dataObjects'];
  //   const dataObjectsAMap = new Map<any, object> ();
  //   const dataObjectsB: object[] = glyphsJSONB['dataObjects'];
  //   const dataObjectsBMap = new Map<any, object> ();
  //   const positionsA = new Map<any, [number, number]>();
  //   const positionsB = new Map<any, [number, number]>();

  //   const objIds = new Set<any>();
  //   for (const object of dataObjectsA) {
  //     objIds.add(object['id']);
  //     dataObjectsAMap.set(object['id'], object);
  //   }
  //   for (const object of dataObjectsB) {
  //     objIds.add(object['id']);
  //     dataObjectsBMap.set(object['id'], object);
  //   }

  //   for (const posObj of glyphsJSONA['positions']) {
  //     const pos: [number, number] =
  //     [Number(posObj['position']['x']), Number(posObj['position']['y'])];
  //     positionsA.set(posObj['id'], pos);
  //   }
  //   for (const posObj of glyphsJSONB['positions']) {
  //     const pos: [number, number] =
  //     [Number(posObj['position']['x']), Number(posObj['position']['y'])];
  //     positionsB.set(posObj['id'], pos);
  //   }

  //   objIds.forEach((objId) => {

  //     const glyph = this._proto.clone();
  //     glyph.selectedFeature = '3';

  //     const objectA = dataObjectsAMap.get(objId);
  //     const objectB = dataObjectsBMap.get(objId);

  //     for (const object of [objectA, objectB]) {
  //       // const independentFeatures = new Map<string, number>();
  //       const targetFeatures = new Map<string, [number[], number[]]>();
  //       // const questions = []; TODO
  //       const defContext = object['default-context'];
  //       const vals = object['values'];
  //         for (const featId in vals) {
  //           if (shownFeatures.includes(featId)
  //                 && vals.hasOwnProperty(featId)) {
  //             if (labelIDs.includes(featId)) {
  //               const labId = featId;
  //               const predId = predMap[labId];
  //               const label: number[] = object['features'][defContext][labId];
  //               const pred: number[] = object['features'][defContext][predId];

  //               targetFeatures.set('' + labId, [label, pred] ); // TODO richtigen feature-namen
  //             } else if ( predMap.hasOwnProperty(featId)) {
  //               continue;
  //             } else {
  //               const features = object['features'][defContext];
  //               const feature = Number(features[featId]);
  //               // independentFeatures.set('' + featId, feature);
  //             }
  //           }
  //         }
  //         if (object === objectA) {
  //           const position = positionsA.get(objId);
  //           glyph.setVersionA(targetFeatures, position);
  //         } else { //  if (object === objectB)
  //           const position = positionsB.get(objId);
  //           glyph.setVersionB(targetFeatures, position);
  //         }
  //     }
  //     buffer.push(glyph);
  //   }, this);
  //   return buffer;
  // }

  public set proto(v: ComparisonGlyph) {
    this._proto = v;
  }
}
