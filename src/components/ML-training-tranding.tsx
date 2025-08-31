import { kMeansCluster } from "simple-statistics";

// --- Convert product to vector ---
function productToVector(product) {
  return [
    product.price,
    product.stockQuantity,
    product.inStock ? 1 : 0,
    product.reviews?.average || 0
  ];
}

// --- Convert order to vector (aggregate) ---
function orderToVector(order) {
  return [
    order.total,
    order.items.length,
    order.shipping,
    order.tax
  ];
}

// --- Euclidean distance helper ---
function euclidean(a: number[], b: number[]) {
  const len = Math.max(a.length, b.length);
  let sum = 0;
  for (let i = 0; i < len; i++) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

// --- Trending Products Feature (20% probability + recency bias) ---
function markTrending(products) {
  const now = Date.now();

  return products.map(product => {
    const createdAt = product.createdAt?.seconds
      ? product.createdAt.seconds * 1000
      : now;

    const ageInDays = (now - createdAt) / (1000 * 60 * 60 * 24);
    const recencyBoost = ageInDays < 30 ? 0.3 : 0; // boost if <30 days old

    const trendingProb = 0.2 + recencyBoost;

    return {
      ...product,
      isTrending: Math.random() < trendingProb
    };
  });
}

// --- Recommend products without repeats ---
export function recommendProducts(products, orders) {
  const trendingProducts = markTrending(products);

  const productVectors = trendingProducts.map(productToVector);
  const assignments = kMeansCluster(productVectors, 3);

  const clusteredProducts = trendingProducts.map((p, i) => ({
    ...p,
    cluster: assignments[i]
  }));

  const seen = new Set<string>(); // track used products
  const recommendations: any[] = [];

  for (const order of orders) {
    const orderVec = orderToVector(order);

    const scored = clusteredProducts
      .map(p => ({
        product: p,
        score: euclidean(productToVector(p), orderVec),
        cluster: p.cluster,
        isTrending: p.isTrending
      }))
      .filter(p => !seen.has(p.product.id)) // skip duplicates
      .sort((a, b) => {
        if (a.isTrending && !b.isTrending) return -1;
        if (!a.isTrending && b.isTrending) return 1;
        return a.score - b.score;
      })
      .slice(0, 3);

    scored.forEach(item => seen.add(item.product.id)); // mark as used
    recommendations.push(...scored);
  }

  return recommendations;
}
