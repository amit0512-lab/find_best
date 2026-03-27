import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

const ProductList = ({ products, selectedCategoryPath, favorites: propFavorites, setFavorites: propSetFavorites }) => {
    const [sortBy, setSortBy] = useState('relevance');
    const [searchQuery, setSearchQuery] = useState('');
    const [apiProducts, setApiProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Use prop favorites if provided, otherwise use local state
    const favorites = propFavorites || [];
    const setFavorites = propSetFavorites || (() => {});
    
    // Fetch products from backend API
    useEffect(() => {
        const fetchProducts = async () => {
            if (products.length > 0) {
                setApiProducts(products);
                return;
            }
            
            setIsLoading(true);
            try {
                const response = await fetch('http://localhost:8000/api/products');
                if (response.ok) {
                    const data = await response.json();
                    setApiProducts(data);
                }
            } catch (error) {
                console.error("Error fetching products from API:", error);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchProducts();
    }, []);
    
    // Use apiProducts if available, otherwise use mock products
    const displayProducts = apiProducts.length > 0 ? apiProducts : products;

    if (!products || products.length === 0) {
        return (
            <div style={{
                textAlign: "center",
                padding: "80px 32px",
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderRadius: "24px",
                border: "2px dashed rgba(255, 255, 255, 0.5)",
                marginTop: "24px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)"
            }}>
                <div style={{ 
                    fontSize: "72px", 
                    marginBottom: "24px", 
                    opacity: 0.5,
                    filter: "grayscale(0.3)"
                }}>
                    🔍
                </div>
                <h3 style={{ 
                    color: "#0f172a", 
                    marginBottom: "12px", 
                    fontSize: "26px", 
                    fontWeight: "700",
                    letterSpacing: "-0.02em"
                }}>
                    No matching products found
                </h3>
                <p style={{ 
                    color: "#64748b", 
                    fontSize: "16px",
                    maxWidth: "400px",
                    margin: "0 auto",
                    lineHeight: "1.6"
                }}>
                    Try adjusting your filters or go back to select different options.
                </p>
            </div>
        );
    }

    const categoryName = selectedCategoryPath && selectedCategoryPath.length > 0
        ? selectedCategoryPath[selectedCategoryPath.length - 1]
        : "Results";

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'rating':
                return b.rating - a.rating;
            case 'popular':
                return b.reviews - a.reviews;
            default:
                return 0;
        }
    });

    const toggleFavorite = (productId) => {
        setFavorites(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const inputStyles = {
        base: {
            padding: "14px 18px",
            borderRadius: "14px",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            background: "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(10px)",
            color: "#0f172a",
            fontSize: "15px",
            fontWeight: "500",
            outline: "none",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            letterSpacing: "-0.01em"
        }
    };

    return (
        <div style={{ marginTop: "24px" }}>
            <div style={{
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                padding: "28px 32px",
                borderRadius: "20px",
                marginBottom: "32px",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)"
            }}>
                <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    marginBottom: "20px", 
                    flexWrap: "wrap", 
                    gap: "16px" 
                }}>
                    <h2 style={{ 
                        margin: 0, 
                        fontSize: "28px", 
                        color: "#0f172a", 
                        fontWeight: "700",
                        letterSpacing: "-0.02em"
                    }}>
                        {categoryName}
                    </h2>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px"
                    }}>
                        <span style={{ 
                            color: "#0f172a", 
                            fontSize: "15px", 
                            fontWeight: "600",
                            background: "#f0fdf4",
                            padding: "8px 20px", 
                            borderRadius: "12px",
                            border: "1px solid #bbf7d0",
                            letterSpacing: "-0.01em"
                        }}>
                            {sortedProducts.length} {sortedProducts.length !== 1 ? 'products' : 'product'}
                        </span>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                    <div style={{ flex: "1", minWidth: "240px", position: "relative" }}>
                        <input
                            type="text"
                            placeholder="🔍 Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={inputStyles.base}
                            onFocus={(e) => {
                                e.target.style.background = "rgba(255, 255, 255, 0.9)";
                                e.target.style.borderColor = "#8b5cf6";
                                e.target.style.boxShadow = "0 0 0 3px rgba(139, 92, 246, 0.1)";
                            }}
                            onBlur={(e) => {
                                e.target.style.background = "rgba(255, 255, 255, 0.6)";
                                e.target.style.borderColor = "rgba(255, 255, 255, 0.5)";
                                e.target.style.boxShadow = "none";
                            }}
                        />
                    </div>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{
                            ...inputStyles.base,
                            minWidth: "180px",
                            cursor: "pointer",
                            paddingRight: "40px",
                            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E\")",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 16px center",
                            appearance: "none"
                        }}
                    >
                        <option value="relevance" style={{ background: "#1e293b", color: "#ffffff" }}>
                            Most Relevant
                        </option>
                        <option value="price-low" style={{ background: "#1e293b", color: "#ffffff" }}>
                            Price: Low to High
                        </option>
                        <option value="price-high" style={{ background: "#1e293b", color: "#ffffff" }}>
                            Price: High to Low
                        </option>
                        <option value="rating" style={{ background: "#1e293b", color: "#ffffff" }}>
                            Highest Rated
                        </option>
                        <option value="popular" style={{ background: "#1e293b", color: "#ffffff" }}>
                            Most Popular
                        </option>
                    </select>
                </div>
            </div>

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "24px",
            }}>
                {sortedProducts.map(product => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        isFavorite={favorites.includes(product.id)}
                        onToggleFavorite={toggleFavorite}
                    />
                ))}
            </div>
        </div>
    );
};

export default ProductList;
