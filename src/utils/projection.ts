import { Vector3 } from "three";
import * as ML from "ml-matrix";

/**
 * Project a vector on a plane
 * @param planeVector1 - a vector on the plane
 * @param planeVector2 - another vector on the plane
 * @param vectorToProject - a vector to project on the plane
 * @returns projected vector
 * @example
 * const planeVector1 = new Vector3(1, 0, 0);
 * const planeVector2 = new Vector3(0, 1, 0);
 * const vectorToProject = new Vector3(1, 1, 1);
 * const projectedVector = projectVectorOnPlane({
 *  planeVector1,
 * planeVector2,
 * vectorToProject,
 * })
 */
export function projectVector3On2DPlane({
  planeVector1,
  planeVector2,
  vectorToProject,
}: {
  planeVector1: Vector3;
  planeVector2: Vector3;
  vectorToProject: Vector3;
}) {
  // Refer to link below for getting the projected vector on a plane
  // https://blog.naver.com/PostView.nhn?blogId=yjh0853&logNo=222083127111&parentCategoryNo=&categoryNo=17&viewDate=&isShowPopularPosts=false&from=postView
  // the two plane vectors must be able to span the plane (= not parallel)
  const planeMatrix = new ML.Matrix([
    planeVector1.toArray(),
    planeVector2.toArray(),
  ]).transpose();
  const aTmula = planeMatrix.clone().transpose().mmul(planeMatrix.clone());
  const bVector = new ML.Matrix([vectorToProject.toArray()]).transpose();
  const aTmulb = planeMatrix.clone().transpose().mmul(bVector);
  const x = ML.inverse(aTmula).mmul(aTmulb);
  const ax = planeMatrix.mmul(x);
  const ax_vector = ax.to1DArray();
  const projectedVector = new Vector3(ax_vector[0], ax_vector[1], ax_vector[2]);
  return projectedVector;
}
