import { ComparisonDataItem } from './glyphplot.comparison.data_item';
import { Injectable } from '@angular/core';

@Injectable()
export class ComparisonDataCreator {
  public versions2Data(versionA: any, versionB: any,
    selectedTargetVariable: string = '') {
    const buffer: ComparisonDataItem[] = [];
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
      const data_item = new ComparisonDataItem();
      data_item.selectedFeature = '3';
      data_item.objectId = objId;

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
             data_item.setVersionA(targetMap, position) :
             data_item.setVersionB(targetMap, position);
      }
     data_item.selectedFeature = selectedTargetVariable;
     data_item.targetVariablesMeta = targetVariablesMeta;
     buffer.push(data_item);
    }, this);
    return buffer;
  }
}
