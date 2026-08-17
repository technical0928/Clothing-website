const prisma = require("../utills/db"); // ✅ Use shared connection with SSL
const { asyncHandler, handleServerError, AppError } = require("../utills/errorHandler");

// Security: Define whitelists for allowed filter types and operators
const ALLOWED_FILTER_TYPES = ['price', 'rating', 'category', 'inStock', 'outOfStock', 'size', 'color'];
const ALLOWED_OPERATORS = ['gte', 'lte', 'gt', 'lt', 'equals', 'contains'];
const ALLOWED_SORT_VALUES = ['defaultSort', 'titleAsc', 'titleDesc', 'lowPrice', 'highPrice'];

// Exact-token match for comma-separated fields (sizes: "S,M,L,XL", colors: "Black,White")
function tokenMatches(fieldValue, token) {
  if (!fieldValue || !token) {
    return false;
  }
  const wanted = String(token).trim().toLowerCase();
  return String(fieldValue)
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .includes(wanted);
}

// Build a Prisma WHERE clause that matches an EXACT token inside a
// comma-separated field (sizes: "S,M,L,XL") at the database level, so we
// never have to pull the whole catalog into memory just to filter. "L" will
// not match "XL" or "XXL", and the query stays fully paginated.
function buildExactTokenWhere(field, token) {
  const wanted = String(token).trim().toLowerCase();
  return {
    OR: [
      { [field]: { equals: wanted, mode: "insensitive" } },
      { [field]: { startsWith: `${wanted},`, mode: "insensitive" } },
      { [field]: { contains: `,${wanted},`, mode: "insensitive" } },
      { [field]: { endsWith: `,${wanted}`, mode: "insensitive" } },
    ],
  };
}

// Security: Input validation functions
function validateFilterType(filterType) {
  return ALLOWED_FILTER_TYPES.includes(filterType);
}

function validateOperator(operator) {
  return ALLOWED_OPERATORS.includes(operator);
}

function validateSortValue(sortValue) {
  return ALLOWED_SORT_VALUES.includes(sortValue);
}

function validateAndSanitizeFilterValue(filterType, filterValue) {
  switch (filterType) {
    case 'price':
    case 'rating':
    case 'inStock':
    case 'outOfStock':
      const numValue = parseInt(filterValue);
      return isNaN(numValue) ? null : numValue;
    case 'category':
    case 'size':
    case 'color':
      return typeof filterValue === 'string' && filterValue.trim().length > 0
        ? filterValue.trim()
        : null;
    default:
      return null;
  }
}

// Security: Safe filter object builder
function buildSafeFilterObject(filterArray) {
  const filterObj = {};

  for (const item of filterArray) {
    // Validate filter type
    if (!validateFilterType(item.filterType)) {
      console.warn(`Invalid filter type: ${item.filterType}`);
      continue;
    }

    // Validate operator
    if (!validateOperator(item.filterOperator)) {
      console.warn(`Invalid operator: ${item.filterOperator}`);
      continue;
    }

    // Validate and sanitize filter value
    const sanitizedValue = validateAndSanitizeFilterValue(item.filterType, item.filterValue);
    if (sanitizedValue === null) {
      console.warn(`Invalid filter value for ${item.filterType}: ${item.filterValue}`);
      continue;
    }

    // Build safe filter object (map UI filter names to real Prisma fields)
    const fieldName =
      item.filterType === "size"
        ? "sizes"
        : item.filterType === "color"
        ? "colors"
        : item.filterType;
    filterObj[fieldName] = {
      [item.filterOperator]: sanitizedValue,
    };
  }

  return filterObj;
}

function isValidUUID(value) {
  return typeof value === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value);
}

function normalizeCategoryValue(value) {
  return String(value).trim().toLowerCase().replace(/[\s_-]+/g, '');
}

function parsePositivePrice(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? Math.round(value) : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.replace(/[^\d.]/g, "");
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null;
}

function normalizeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateUniqueSlug(value) {
  const baseSlug = normalizeSlug(value);
  if (!baseSlug) {
    return "";
  }

  let uniqueSlug = baseSlug;
  let suffix = 1;

  while (await prisma.product.findUnique({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return uniqueSlug;
}

const getAllProducts = asyncHandler(async (request, response) => {
  const mode = request.query.mode || "";

  // checking if we are on the admin products page because we don't want to have filtering, sorting and pagination there
  if (mode === "admin") {
    const adminProducts = await prisma.product.findMany({});
    return response.json(adminProducts);
  }

  // Lightweight mode for the shop filter sidebar: return only the distinct
  // sizes/colors, not the whole catalog. Fetching every product just to build
  // filter chips would get slower as the catalog grows.
  if (mode === "options") {
    const rows = await prisma.product.findMany({
      select: { sizes: true, colors: true },
    });
    // Dedupe case-insensitively ("S" vs "s" vs "s ") and keep the first
    // casing seen, so the filter sidebar shows clean, unique options.
    const uniqueValues = (values) => {
      const seen = new Map();
      for (const raw of values) {
        const trimmed = String(raw || "").trim();
        if (!trimmed) continue;
        const key = trimmed.toLowerCase();
        if (!seen.has(key)) seen.set(key, trimmed);
      }
      return Array.from(seen.values());
    };
    const allSizes = [];
    const allColors = [];
    for (const row of rows) {
      allSizes.push(...String(row.sizes || "").split(","));
      allColors.push(...String(row.colors || "").split(","));
    }
    return response.json({
      sizes: uniqueValues(allSizes),
      colors: uniqueValues(allColors),
    });
  }

  // Homepage sections: each one fetches ONLY the bounded batch it needs, so a
  // 20,000-product catalog never loads the whole table on the homepage.
  if (mode === "section") {
    const section = String(request.query.section || "").trim();
    const limit = Math.min(Number(request.query.limit) || 12, 24);
    const include = {
      category: { select: { name: true } },
    };

    if (section === "new") {
      const products = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        include,
      });
      return response.json(products);
    }

    if (section === "sale") {
      // Products with an active discount (salePrice set and lower than price).
      const products = await prisma.product.findMany({
        where: {
          salePrice: { not: null },
          NOT: { salePrice: null },
        },
        orderBy: { createdAt: "desc" },
        take: limit * 2,
        include,
      });
      const onSale = products
        .filter((p) => p.salePrice !== null && p.salePrice < p.price)
        .slice(0, limit);
      return response.json(onSale);
    }

    if (section === "best-sellers") {
      // Most-ordered products, aggregated from line items (bounded result).
      const top = await prisma.customer_order_product.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: limit,
      });
      const ids = top.map((t) => t.productId).filter(Boolean);
      if (ids.length === 0) {
        return response.json([]);
      }
      const products = await prisma.product.findMany({
        where: { id: { in: ids } },
        include,
      });
      // Preserve the sales-rank order
      const orderMap = new Map(products.map((p) => [p.id, p]));
      return response.json(ids.map((id) => orderMap.get(id)).filter(Boolean));
    }

    if (section === "featured" || section === "all") {
      const products = await prisma.product.findMany({
        take: limit,
        include,
      });
      return response.json(products);
    }

    // Category section (women, men, or any other category name/slug)
    const categoryName = section
      .split(/[-_\s]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
    const category = await prisma.category.findFirst({
      where: { name: { equals: categoryName, mode: "insensitive" } },
    });
    if (!category) {
      return response.json([]);
    }
    const products = await prisma.product.findMany({
      where: { categoryId: category.id },
      take: limit,
      include,
    });
    return response.json(products);
  } else {
    const dividerLocation = request.url.indexOf("?");
    let filterObj = {};
    let sortObj = {};
    let sortByValue = "defaultSort";

    // getting current page with validation
    const page = Number(request.query.page);
    const validatedPage = (page && page > 0) ? page : 1;

    if (dividerLocation !== -1) {
      // Decode the raw query string so operators like $lte / $equals are parseable.
      // Browsers and URLSearchParams encode "$" as "%24", so parsing request.url
      // directly would silently drop every filter.
      const rawQuery = request.url.substring(dividerLocation + 1, request.url.length);
      let decodedQuery;
      try {
        decodedQuery = decodeURIComponent(rawQuery);
      } catch {
        decodedQuery = rawQuery;
      }

      const queryArray = decodedQuery.split("&");

      let filterType;
      let filterArray = [];

      for (let i = 0; i < queryArray.length; i++) {
        // Security: Use more robust parsing with validation
        const queryParam = queryArray[i];

        // Extract filter type safely
        if (queryParam.includes("filters")) {
          if (queryParam.includes("price")) {
            filterType = "price";
          } else if (queryParam.includes("rating")) {
            filterType = "rating";
          } else if (queryParam.includes("category")) {
            filterType = "category";
          } else if (queryParam.includes("inStock")) {
            filterType = "inStock";
          } else if (queryParam.includes("outOfStock")) {
            filterType = "outOfStock";
          } else if (queryParam.includes("size")) {
            filterType = "size";
          } else if (queryParam.includes("color")) {
            filterType = "color";
          } else {
            // Skip unknown filter types
            continue;
          }
        }

        if (queryParam.includes("sort")) {
          // Security: Validate sort value
          const extractedSortValue = queryParam.substring(queryParam.indexOf("=") + 1);
          if (validateSortValue(extractedSortValue)) {
            sortByValue = extractedSortValue;
          }
        }

        // Security: Extract filter parameters safely
        if (queryParam.includes("filters") && filterType) {
          let filterValue;

          // Extract filter value based on type
          if (filterType === "category" || filterType === "size" || filterType === "color") {
            filterValue = queryParam.substring(queryParam.indexOf("=") + 1);
          } else {
            const numValue = parseInt(queryParam.substring(queryParam.indexOf("=") + 1));
            filterValue = isNaN(numValue) ? null : numValue;
          }

          // Extract operator safely
          const operatorStart = queryParam.indexOf("$") + 1;
          const operatorEnd = queryParam.indexOf("=") - 1;

          if (operatorStart > 0 && operatorEnd > operatorStart) {
            const filterOperator = queryParam.substring(operatorStart, operatorEnd);

            // Only add to filter array if all values are valid
            if (filterValue !== null && filterOperator) {
              filterArray.push({
                filterType,
                filterOperator,
                filterValue
              });
            }
          }
        }
      }

      // Security: Build filter object using safe function
      filterObj = buildSafeFilterObject(filterArray);
    }

    let whereClause = { ...filterObj };
    const categoryFilterValue = filterObj.category?.equals ? String(filterObj.category.equals).trim() : null;
    const sizeFilterValue = filterObj.sizes?.contains ? String(filterObj.sizes.contains).trim() : null;
    const colorFilterValue = filterObj.colors?.contains ? String(filterObj.colors.contains).trim() : null;

    if (categoryFilterValue) {
      delete whereClause.category;
    }
    if (sizeFilterValue) {
      delete whereClause.sizes;
    }
    if (colorFilterValue) {
      delete whereClause.colors;
    }

    // Security: Build sort object safely
    switch (sortByValue) {
      case "defaultSort":
        sortObj = {};
        break;
      case "titleAsc":
        sortObj = { title: "asc" };
        break;
      case "titleDesc":
        sortObj = { title: "desc" };
        break;
      case "lowPrice":
        sortObj = { price: "asc" };
        break;
      case "highPrice":
        sortObj = { price: "desc" };
        break;
      default:
        sortObj = {};
    }

    // Optional limit override (e.g. the homepage carousel asks for a bounded
    // batch of products, never the whole catalog).
    const requestedLimit = Number(request.query.limit);
    const pageSize =
      requestedLimit > 0 && requestedLimit <= 100 ? requestedLimit : 12;

    // Build the final WHERE clause. Size/color filters match an EXACT token
    // at the database level ("L" never matches "XL"), so we never have to
    // pull the full catalog into memory to post-filter it.
    const AND = [];
    if (sizeFilterValue) {
      AND.push(buildExactTokenWhere("sizes", sizeFilterValue));
    }
    if (colorFilterValue) {
      AND.push(buildExactTokenWhere("colors", colorFilterValue));
    }

    let categoryWhere = {};
    if (categoryFilterValue) {
      // Resolve the category to its exact id so filtering is precise.
      // (SQLite LIKE used by `contains` is case-insensitive and would match
      //  "women" for "men", so we avoid substring matching entirely.)
      if (isValidUUID(categoryFilterValue)) {
        categoryWhere = { categoryId: categoryFilterValue };
      } else {
        const normalize = (value) =>
          String(value).trim().toLowerCase().replace(/[\s_-]+/g, "");
        const wanted = normalize(categoryFilterValue);
        const allCategories = await prisma.category.findMany({
          select: { id: true, name: true },
        });
        const matchedCategory = allCategories.find(
          (category) => normalize(category.name) === wanted
        );
        if (!matchedCategory) {
          return response.json([]);
        }
        categoryWhere = { categoryId: matchedCategory.id };
      }
    }

    const whereClauseFinal = {
      ...whereClause,
      ...categoryWhere,
      ...(AND.length > 0 ? { AND } : {}),
    };

    const findManyOptions = {
      skip: (validatedPage - 1) * pageSize,
      take: pageSize,
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    };

    if (Object.keys(sortObj).length > 0) {
      findManyOptions.orderBy = sortObj;
    }

    // Run the page query and a cheap COUNT in parallel so the frontend can
    // render "Page X of Y" without an extra round-trip.
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        ...findManyOptions,
        where: whereClauseFinal,
      }),
      prisma.product.count({
        where: whereClauseFinal,
      }),
    ]);

    response.set("X-Total-Count", String(totalCount));
    return response.json(products);
  }
});

const getAllProductsOld = asyncHandler(async (request, response) => {
  const products = await prisma.product.findMany({
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
  });
  response.status(200).json(products);
});

async function getOrCreateDefaultMerchant() {
  const defaultMerchantName = "Noor-e-Multan";
  let merchant = await prisma.merchant.findFirst({
    where: {
      name: defaultMerchantName,
    },
  });

  if (!merchant) {
    merchant = await prisma.merchant.create({
      data: {
        name: defaultMerchantName,
        description: "Default brand merchant for Noor-e-Multan",
        status: "ACTIVE",
      },
    });
  }

  return merchant;
}

const createProduct = asyncHandler(async (request, response) => {
  const {
    merchantId,
    slug,
    title,
    mainImage,
    price,
    salePrice,
    description,
    manufacturer,
    categoryId,
    inStock,
    sizes,
    colors,
    fabric,
  } = request.body;

  if (!title) {
    throw new AppError("Missing required field: title", 400);
  }

  const uniqueSlug = await generateUniqueSlug(slug || title);
  const parsedPrice = parsePositivePrice(price);

  if (!uniqueSlug) {
    throw new AppError("Missing required field: slug", 400);
  }

  if (parsedPrice === null) {
    throw new AppError("Missing or invalid required field: price", 400);
  }

  if (!categoryId) {
    throw new AppError("Missing required field: categoryId", 400);
  }

  const merchant = merchantId
    ? await prisma.merchant.findUnique({ where: { id: merchantId } })
    : await getOrCreateDefaultMerchant();

  if (!merchant) {
    throw new AppError("Unable to resolve merchant", 500);
  }

  const createData = {
    merchantId: merchant.id,
    slug: uniqueSlug,
    title,
    mainImage,
    price: parsedPrice,
    salePrice: salePrice !== undefined && salePrice !== null ? parsePositivePrice(salePrice) : null,
    rating: 5,
    description,
    manufacturer,
    categoryId,
    inStock,
    sizes: sizes || "",
    colors: colors || "",
    fabric: fabric || "",
  };

  let product;
  try {
    product = await prisma.product.create({ data: createData });
  } catch (error) {
    if (error && error.code === "P2002" && error.meta?.target?.includes("slug")) {
      const fallbackSlug = await generateUniqueSlug(slug || title);
      product = await prisma.product.create({
        data: {
          ...createData,
          slug: fallbackSlug,
        },
      });
    } else {
      throw error;
    }
  }

  return response.status(201).json(product);
});

// Method for updating existing product
const updateProduct = asyncHandler(async (request, response) => {
  const { id } = request.params;
  const {
    merchantId,
    slug,
    title,
    mainImage,
    price,
    salePrice,
    rating,
    description,
    manufacturer,
    categoryId,
    inStock,
    sizes,
    colors,
    fabric,
  } = request.body;

  if (!id) {
    throw new AppError("Product ID is required", 400);
  }

  const existingProduct = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  if (!existingProduct) {
    throw new AppError("Product not found", 404);
  }

  const parsedPrice =
    price !== undefined && price !== null ? parsePositivePrice(price) : existingProduct.price;

  if (parsedPrice === null) {
    throw new AppError("Missing or invalid required field: price", 400);
  }

  const normalizedSlug =
    slug !== undefined && slug !== null ? normalizeSlug(slug) : existingProduct.slug;

  if (
    slug !== undefined &&
    slug !== null &&
    normalizedSlug !== existingProduct.slug
  ) {
    const duplicateSlugProduct = await prisma.product.findUnique({
      where: { slug: normalizedSlug },
    });

    if (duplicateSlugProduct && duplicateSlugProduct.id !== id) {
      throw new AppError("Product slug already exists", 409);
    }
  }

  // Never clear an existing image with an empty/undefined value — the admin
  // edit form can send an empty mainImage and would otherwise wipe the photo.
  const resolvedMainImage =
    mainImage !== undefined && mainImage !== null && mainImage !== ""
      ? mainImage
      : existingProduct.mainImage;

  const updatedProduct = await prisma.product.update({
    where: {
      id,
    },
    data: {
      merchantId: merchantId || existingProduct.merchantId,
      title: title ?? existingProduct.title,
      mainImage: resolvedMainImage,
      slug: normalizedSlug,
      price: parsedPrice,
      salePrice: salePrice !== undefined ? parsePositivePrice(salePrice) : existingProduct.salePrice,
      rating: rating ?? existingProduct.rating,
      description: description ?? existingProduct.description,
      manufacturer: manufacturer ?? existingProduct.manufacturer,
      categoryId: categoryId ?? existingProduct.categoryId,
      inStock: inStock !== undefined && inStock !== null ? inStock : existingProduct.inStock,
      sizes: sizes !== undefined ? sizes : existingProduct.sizes,
      colors: colors !== undefined ? colors : existingProduct.colors,
      fabric: fabric !== undefined ? fabric : existingProduct.fabric,
    },
  });

  return response.status(200).json(updatedProduct);
});

// Method for deleting a product
const deleteProduct = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("Product ID is required", 400);
  }

  // Check for related records in order_product table
  const relatedOrderProductItems = await prisma.customer_order_product.findMany({
    where: {
      productId: id,
    },
  });

  if (relatedOrderProductItems.length > 0) {
    throw new AppError("Cannot delete product because of foreign key constraint", 400);
  }

  await prisma.product.delete({
    where: {
      id,
    },
  });
  return response.status(204).send();
});

const searchProducts = asyncHandler(async (request, response) => {
  const { query } = request.query;

  if (!query) {
    throw new AppError("Query parameter is required", 400);
  }

  const products = await prisma.product.findMany({
    where: {
      OR: [
        {
          title: {
            contains: query,
          },
        },
        {
          description: {
            contains: query,
          },
        },
      ],
    },
  });

  return response.json(products);
});

const getProductById = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("Product ID is required", 400);
  }

  const product = await prisma.product.findUnique({
    where: {
      id: id,
    },
    include: {
      category: true,
    },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return response.status(200).json(product);
});

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductById,
};
