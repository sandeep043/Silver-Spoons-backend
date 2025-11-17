const productService = require('../services/product.service');

/**
 * GET /products/search
 * Query params:
 * - query: text to search in product name
 * - type: veg / non-veg
 * - category: product category
 * - minPrice, maxPrice: numeric
 * - page, limit: pagination
 * - sortBy, order: sorting
 */
async function searchProducts(req, res) {
    try {
        // normalize query keys and string values (trim) to be resilient to accidental spaces
        const normalized = {};
        Object.keys(req.query || {}).forEach(k => {
            const cleanKey = k.trim();
            const raw = req.query[k];
            normalized[cleanKey] = typeof raw === 'string' ? raw.trim() : raw;
        });

        const {
            query,
            type,
            category,
            minPrice,
            maxPrice,
            page,
            limit,
            sortBy,
            order,
        } = normalized;

        const filters = {
            query: query != null ? query : undefined,
          
            type: type != null ? type : undefined,
            category: category != null ? category : undefined,
            minPrice: minPrice != null ? Number(minPrice) : undefined,
            maxPrice: maxPrice != null ? Number(maxPrice) : undefined,
            page: page != null ? Number(page) : undefined,
            limit: limit != null ? Number(limit) : undefined,
            sortBy,
            order,
        };

        const result = await productService.searchProducts(filters);

        return res.json({
            success: true,
            data: result.products,
            meta: {
                total: result.total,
                page: result.page,
                limit: result.limit,
            },
        });
    } catch (err) {
        console.error('searchProducts error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

module.exports = {
    searchProducts,
};

