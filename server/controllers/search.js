const prisma = require('../utills/db');

async function searchProducts(request, response) {
    try {
        const rawQuery = request.query.query;
        if (!rawQuery) {
            return response.status(400).json({ error: "Query parameter is required" });
        }

        const query = String(rawQuery).trim();

        // Pagination: search should never pull the whole catalog into memory.
        const page = Number(request.query.page);
        const validatedPage = page > 0 ? page : 1;
        const limit = Number(request.query.limit);
        const pageSize = limit > 0 && limit <= 100 ? limit : 24;

        const where = {
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { manufacturer: { contains: query, mode: 'insensitive' } },
                { fabric: { contains: query, mode: 'insensitive' } },
                { sizes: { contains: query, mode: 'insensitive' } },
                { colors: { contains: query, mode: 'insensitive' } },
                { category: { name: { contains: query, mode: 'insensitive' } } },
            ]
        };

        const [products, totalCount] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: {
                        select: {
                            name: true,
                        },
                    },
                },
                skip: (validatedPage - 1) * pageSize,
                take: pageSize,
            }),
            prisma.product.count({ where }),
        ]);

        response.set("X-Total-Count", String(totalCount));
        return response.json(products);
    } catch (error) {
        console.error("Error searching products:", error);
        return response.status(500).json({ error: "Error searching products" });
    }
}

module.exports = { searchProducts };
