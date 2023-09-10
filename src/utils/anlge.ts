import { MathUtils, Quaternion, Vector3 } from "three";

export const setRotationByAxis = (
  q: Quaternion,
  v_axis: Vector3,
  n_degree: number
) => {
  const vector = v_axis.normalize();
  const radian = MathUtils.degToRad(n_degree);
  const halfAngle = radian / 2,
    s = Math.sin(halfAngle);
  q.x = vector.x * s;
  q.y = vector.y * s;
  q.z = vector.z * s;
  q.w = Math.cos(halfAngle);
};

export const radToDeg = (rad: number) => {
  return rad * (180 / Math.PI);
};
