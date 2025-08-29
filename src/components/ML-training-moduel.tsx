import * as ss from "simple-statistics";

// Convert product to vector
function productToVector(product) {
  return [
    product.price,
    product.stockQuantity,
    product.inStock ? 1 : 0,
    product.reviews?.average || 0
  ];
}

// Convert order to vector (aggregate)
function orderToVector(order) {
  return [
    order.total,
    order.items.length,
    order.shipping,
    order.tax
  ];
}

// Simple Euclidean distance
function euclidean(a: number[], b: number[]) {
  const len = Math.max(a.length, b.length);
  let sum = 0;
  for (let i = 0; i < len; i++) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

// --- Basic K-means clustering ---
function kMeans(vectors: number[][], k = 3, maxIterations = 100) {
  let centroids = vectors.slice(0, k);

  for (let iter = 0; iter < maxIterations; iter++) {
    const clusters: number[][][] = Array.from({ length: k }, () => []);

    vectors.forEach(vec => {
      let bestIndex = 0;
      let bestDist = Infinity;
      centroids.forEach((c, i) => {
        const dist = euclidean(vec, c);
        if (dist < bestDist) {
          bestDist = dist;
          bestIndex = i;
        }
      });
      clusters[bestIndex].push(vec);
    });

    const newCentroids = clusters.map(cluster =>
      cluster.length
        ? cluster[0].map((_, i) => ss.mean(cluster.map(v => v[i])))
        : []
    );

    if (JSON.stringify(newCentroids) === JSON.stringify(centroids)) break;
    centroids = newCentroids;
  }

  const assignments = vectors.map(vec => {
    let bestIndex = 0;
    let bestDist = Infinity;
    centroids.forEach((c, i) => {
      const dist = euclidean(vec, c);
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = i;
      }
    });
    return bestIndex;
  });

  return { centroids, assignments };
}

// --- Recommend products using K-means clustering ---
export function recommendProducts(products, orders) {
  const productVectors = products.map(productToVector);
  const { assignments } = kMeans(productVectors, 3);

  const clusteredProducts = products.map((p, i) => ({
    ...p,
    cluster: assignments[i]
  }));

  return orders.flatMap(order => {
    const orderVec = orderToVector(order);
    const clusterScores = clusteredProducts.map(p => ({
      product: p,
      score: euclidean(productToVector(p), orderVec),
      cluster: p.cluster
    }));
    return clusterScores.sort((a, b) => a.score - b.score).slice(0, 3);
  });
}
