import * as ss from "simple-statistics";

// --- Convert product to vector with time and price emphasis ---
function productToVector(product, now = Date.now()) {
  // Normalize "time" as recency in days
  const daysOld = (now - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24);

  return {
    price: product.price,
    stockQuantity: product.stockQuantity,
    inStock: product.inStock ? 1 : 0,
    reviews: product.reviews?.average || 0,
    timeRecency: 1 / (1 + daysOld) // fresher product → closer to 1
  };
}

// --- Weighted similarity score ---
// price = 30%, time = 20%, stock+reviews = 50%
function weightedScore(productVec, orderVec) {
  const priceDiff = Math.abs(productVec.price - orderVec.avgSpend);
  const timeScore = productVec.timeRecency; // 0–1
  const stockScore = productVec.stockQuantity / 100; // normalized
  const reviewScore = productVec.reviews / 5; // normalized 0–1

  return (
    (0.25 * (1 / (1 + priceDiff))) + // smaller diff = higher score
    (0.25 * timeScore) +
    (0.25 * stockScore) +
    (0.25 * reviewScore)
  );
}

// Convert order to "profile vector"
function orderToProfile(order) {
  return {
    avgSpend: order.total / (order.items.length || 1)
  };
}

// --- Recommend products with NO repetition ---
export function recommendTrendingProducts(products, orders) {
  const now = Date.now();
  const recommendations: any[] = [];
  const usedProductIds = new Set(); // ✅ Track already recommended products

  for (const order of orders) {
    const orderProfile = orderToProfile(order);

    const scores = products
      .filter(p => !usedProductIds.has(p.id)) // skip already picked
      .map(product => {
        const vec = productToVector(product, now);
        return {
          product,
          score: weightedScore(vec, orderProfile)
        };
      })
      .sort((a, b) => b.score - a.score) // higher score = better
      .slice(0, 3);

    scores.forEach(s => usedProductIds.add(s.product.id)); // ✅ Mark as used
    recommendations.push(...scores);
  }

  return recommendations;
}
