function rotateMatrixClockwise<T>(matrix: T[][]): T[][] {
  const numRows = matrix.length;
  const numCols = matrix[0].length;

  // Create a new matrix to store the rotated values
  const rotatedMatrix: T[][] = new Array(numCols);
  for (let i = 0; i < numCols; i++) {
    rotatedMatrix[i] = new Array(numRows);
  }

  // Populate the rotated matrix
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      rotatedMatrix[j][numRows - 1 - i] = matrix[i][j];
    }
  }

  return rotatedMatrix;
}

function rotateMatrixCounterClockwise<T>(matrix: T[][]): T[][] {
  const numRows = matrix.length;
  const numCols = matrix[0].length;

  // Create a new matrix to store the rotated values
  const rotatedMatrix: T[][] = new Array(numCols);
  for (let i = 0; i < numCols; i++) {
    rotatedMatrix[i] = new Array(numRows);
  }

  // Populate the rotated matrix in a counterclockwise direction
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      rotatedMatrix[numCols - 1 - j][i] = matrix[i][j];
    }
  }

  return rotatedMatrix;
}

export function rotateMatrixClockwiseBy<T>(matrx: T[][], times: number): T[][] {
  let rotatedMatrix: T[][] = matrx;
  for (let i = 0; i < times; i++) {
    rotatedMatrix = rotateMatrixClockwise(rotatedMatrix);
  }
  return rotatedMatrix;
}

export function rotateMatrixCounterClockwiseBy<T>(
  matrix: T[][],
  times: number
): T[][] {
  let rotatedMatrix: T[][] = matrix;
  for (let i = 0; i < times; i++) {
    rotatedMatrix = rotateMatrixCounterClockwise(rotatedMatrix);
  }
  return rotatedMatrix;
}
