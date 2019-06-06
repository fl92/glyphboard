import { ComparisonDataItem } from './glyphplot.comparison.data_item';
import { Injectable } from '@angular/core';
import { ComparisonDataContainer } from './glyphplot.comparison.data_container';

@Injectable()
export class ComparisonDataCreator {
  public versions2Data(versionA: any, versionB: any,
    selectedTargetVariable: string = '') {
    const comparison_items: ComparisonDataItem[] = [];
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

    // if (targetVariablesMeta.size >= 1) {
    //   return;
    // }

    // const targetVariablesObj = versionA['schema']['targetVariables'];
    // const targetLabelsObj = versionA['schema']['targetLabels'];
    // const targetPredictionsObj = versionA['schema']['targetPredictions'];
    // for (const targetId in targetVariablesObj) {
    //   if (targetVariablesObj.hasOwnProperty(targetId)) {
    //     const targetName = targetVariablesObj[targetId];
    //     const targetLabel = targetLabelsObj[targetId];
    //     const targetPrediction = targetPredictionsObj[targetId];
    //   targetVariablesMeta.set(targetId, {
    //     targetName: targetName,
    //     targetLabel: targetLabel,
    //     targetPrediction: targetPrediction
    //   }  );
    //   }

    const targetVariablesObj = versionA['schema']['targetVariables'];
    let unnamedFeatureVectorLength = versionA['schema']['unnamedFeatureVectorLength'];
    unnamedFeatureVectorLength = unnamedFeatureVectorLength != null ?
      unnamedFeatureVectorLength : null;

    if ( targetVariablesObj != null) {
      for (const targetId in targetVariablesObj) {
        if (targetVariablesObj.hasOwnProperty(targetId)) {
          const targetName: string = targetVariablesObj[targetId]['targetName'];
          const targetLabel: string[] = targetVariablesObj[targetId]['targetLabel'];
          const targetPrediction: string[] = targetVariablesObj[targetId]['targetPrediction'];
          targetVariablesMeta.set(targetId, {
            targetName: targetName,
            targetLabel: targetLabel,
            targetPrediction: targetPrediction
          }  );
        }
      }
      selectedTargetVariable = targetVariablesMeta.keys().next().value;
    }


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
      data_item.objectId = objId;

      const objectA = objectsAMap.get(objId);
      const objectB = objectsBMap.get(objId);
      const positionA = positionsAMap.get(objId);
      const positionB = positionsBMap.get(objId);

      for (const [isA, object] of [[true, objectA], [false, objectB]]) {
        const position = isA ? positionA : positionB;
        let targetMap: Map<string, [number[], number[]]> = null;
        let featureMap: Map<any, number> = null;
        let valueMap: Map<any, string> = null;
        let unnamedFeatureVector: number[] = null;
        if ( object != null) {

          featureMap = new Map<any, number>();
          const defContext = object != null ?
            object['default-context'] :
            undefined;
          const vals = object['values'];
            for (const featId in vals) {
              if (vals.hasOwnProperty(featId)) {
                  const featuresObj = object['features'][defContext];
                  if (featuresObj.hasOwnProperty(featId)) {
                    const feature = Number(featuresObj[featId]);
                    featureMap.set(featId, feature)
                  }
              }
            }

          valueMap = new Map<any, string>();
          for (const featId in vals) {
            if (vals.hasOwnProperty(featId)) {
              const valsObj = object['values'];
              const value = String(valsObj[featId]);
              valueMap.set(featId, value);
            }
          }


          if ( targetVariablesObj != null) {
            const targetObj = object['targetVariables'];
            if (targetObj != null) {
              targetMap = new Map<string, [number[], number[]]>();
              for (const targetId in targetObj) {
                if (targetObj.hasOwnProperty(targetId)) {
                  const target = targetObj[targetId];
                  let label = target['targetLabel'];
                  let prediction = target['targetPrediction'];
                  if (label == null || label.length === 0) {label = null; }
                  if (prediction == null || prediction.length === 0) {prediction = null; }
                  targetMap.set(targetId, [label, prediction])
                }
              }
            }
          }

          if (unnamedFeatureVectorLength != null) {
            unnamedFeatureVector = object['unnamedFeatureVector'];
            if (unnamedFeatureVector == null
              || unnamedFeatureVector.length < unnamedFeatureVectorLength ) {
                unnamedFeatureVector = [];
                while (unnamedFeatureVector.length >= unnamedFeatureVectorLength) {
                  unnamedFeatureVector.push(0);
                }
              }
            }
        }

         isA ?
             data_item.setVersionA(targetMap, position, featureMap, valueMap, unnamedFeatureVector) :
             data_item.setVersionB(targetMap, position, featureMap, valueMap, unnamedFeatureVector);
      }
     data_item.targetVariablesMeta = targetVariablesMeta;
     comparison_items.push(data_item);
    }, this);

    const schema = versionA['schema']
    const container = new ComparisonDataContainer(comparison_items, schema);
    return container;
  }

  // public data2PositionData(items: ComparisonDataItem[], useA: boolean) {
  //   const buffer = { positions: []};
  //   items.forEach( item => {
  //     const _id = item.objectId;
  //     const position = useA ? item.drawnPositionA : item.drawnPositionB;
  //     if (position == null) {
  //       return;
  //     }
  //     const [_x, _y] = position;
  //     const elem =  {
  //       id : _id,
  //       position: {
  //         x: _x,
  //         y: _y
  //       }
  //     }
  //     buffer.positions.push(elem);
  //   });
  //   return buffer;
  // }

}
