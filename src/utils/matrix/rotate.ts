export function rotateMatrix(matrix: number[][]): number[][] {
  const n: number = matrix.length;
  // Create a new matrix to store the rotated values
  const rotatedMatrix: number[][] = Array.from(Array(n), () =>
    new Array(n).fill(0)
  );

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      rotatedMatrix[i][j] = matrix[n - j - 1][i];
    }
  }

  return rotatedMatrix;
}
