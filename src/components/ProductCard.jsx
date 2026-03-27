import React, { useState } from 'react';

const ProductCard = ({ product, isFavorite, onToggleFavorite }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const cardStyles = {
        container: {
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
            position: "relative"
        },
        imageContainer: {
            height: "240px",
            overflow: "hidden",
            position: "relative",
            background: "rgba(248, 250, 252, 0.5)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px"
        },
        image: {
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.15))",
            opacity: imageLoaded ? 1 : 0
        },
        priceTag: {
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "white",
            padding: "8px 16px",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: "700",
            boxShadow: "0 4px 16px rgba(16, 185, 129, 0.3)",
            letterSpacing: "-0.02em"
        },
        favoriteBtn: {
            position: "absolute",
            top: "16px",
            left: "16px",
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 2,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
        },
        content: {
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            gap: "12px"
        },
        title: {
            margin: 0,
            fontSize: "17px",
            fontWeight: "600",
            color: "#0f172a",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: "1.4",
            letterSpacing: "-0.02em",
            minHeight: "48px"
        },
        rating: {
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px"
        },
        tags: {
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginTop: "auto"
        },
        tag: {
            background: "rgba(241, 245, 249, 0.8)",
            backdropFilter: "blur(10px)",
            padding: "6px 12px",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#475569",
            fontWeight: "500",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            letterSpacing: "-0.01em"
        },
        buyButtons: {
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "8px",
            marginTop: "12px"
        },
        buyBtn: {
            padding: "10px 8px",
            borderRadius: "10px",
            fontSize: "11px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            border: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            letterSpacing: "-0.01em"
        }
    };

    return (
        <>
            <div 
                style={cardStyles.container}
                onClick={() => setShowDetails(true)}
                onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.1)";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.8)";
                    const img = e.currentTarget.querySelector('img');
                    if (img) img.style.transform = "scale(1.05)";
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.06)";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.7)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.5)";
                    const img = e.currentTarget.querySelector('img');
                    if (img) img.style.transform = "scale(1)";
                }}
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(product.id);
                    }}
                    style={cardStyles.favoriteBtn}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.95)";
                        e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.8)";
                        e.currentTarget.style.transform = "scale(1)";
                    }}
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                    <span style={{ fontSize: "20px" }}>{isFavorite ? '❤️' : '🤍'}</span>
                </button>

                <div style={cardStyles.imageContainer}>
                    <img
                        src={product.image}
                        alt={product.name}
                        style={cardStyles.image}
                        onLoad={() => setImageLoaded(true)}
                    />
                    <div style={cardStyles.priceTag}>
                        ₹{product.price.toLocaleString('en-IN')}
                    </div>
                </div>

                <div style={cardStyles.content}>
                    <h3 style={cardStyles.title}>{product.name}</h3>

                    <div style={cardStyles.rating}>
                        <span style={{ color: "#fbbf24", fontSize: "18px" }}>★</span>
                        <span style={{ color: "#0f172a", fontWeight: "700" }}>{product.rating}</span>
                        <span style={{ color: "#64748b", fontSize: "13px" }}>
                            ({product.reviews.toLocaleString('en-IN')})
                        </span>
                    </div>

                    <div style={cardStyles.tags}>
                        {product.brand && (
                            <span style={cardStyles.tag}>
                                {product.brand.split(' ')[0]}
                            </span>
                        )}
                        {product.processor && (
                            <span style={cardStyles.tag}>
                                {product.processor.split(' ')[0]}
                            </span>
                        )}
                    </div>

                    <div style={cardStyles.buyButtons}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(product.buyLinks?.official, '_blank');
                            }}
                            style={{
                                ...cardStyles.buyBtn,
                                background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))",
                                border: "1px solid rgba(16, 185, 129, 0.4)",
                                color: "#ffffff"
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = "linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.3))";
                                e.currentTarget.style.transform = "translateY(-2px)";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))";
                                e.currentTarget.style.transform = "translateY(0)";
                            }}
                            title="Buy from Official Site"
                        >
                            <span style={{ fontSize: "16px" }}>🏢</span>
                            <span>Official</span>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(product.buyLinks?.amazon, '_blank');
                            }}
                            style={{
                                ...cardStyles.buyBtn,
                                background: "linear-gradient(135deg, rgba(255, 153, 0, 0.2), rgba(230, 138, 0, 0.2))",
                                border: "1px solid rgba(255, 153, 0, 0.4)",
                                color: "#ffffff"
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = "linear-gradient(135deg, rgba(255, 153, 0, 0.3), rgba(230, 138, 0, 0.3))";
                                e.currentTarget.style.transform = "translateY(-2px)";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = "linear-gradient(135deg, rgba(255, 153, 0, 0.2), rgba(230, 138, 0, 0.2))";
                                e.currentTarget.style.transform = "translateY(0)";
                            }}
                            title="Buy from Amazon"
                        >
                            <span style={{ fontSize: "16px" }}>📦</span>
                            <span>Amazon</span>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(product.buyLinks?.flipkart, '_blank');
                            }}
                            style={{
                                ...cardStyles.buyBtn,
                                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))",
                                border: "1px solid rgba(59, 130, 246, 0.4)",
                                color: "#ffffff"
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = "linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.3))";
                                e.currentTarget.style.transform = "translateY(-2px)";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))";
                                e.currentTarget.style.transform = "translateY(0)";
                            }}
                            title="Buy from Flipkart"
                        >
                            <span style={{ fontSize: "16px" }}>🛒</span>
                            <span>Flipkart</span>
                        </button>
                    </div>
                </div>
            </div>

            {showDetails && <ProductModal product={product} onClose={() => setShowDetails(false)} />}
        </>
    );
};

const ProductModal = ({ product, onClose }) => {
    const modalStyles = {
        overlay: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
            animation: "fadeIn 0.3s ease"
        },
        container: {
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            borderRadius: "24px",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            maxWidth: "900px",
            width: "100%",
            maxHeight: "90vh",
            overflow: "auto",
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.15)",
            animation: "fadeIn 0.3s ease"
        },
        header: {
            padding: "32px 32px 24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.5)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
            gap: "20px"
        },
        closeBtn: {
            background: "rgba(248, 250, 252, 0.8)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            borderRadius: "50%",
            width: "44px",
            height: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "20px",
            color: "#475569",
            flexShrink: 0,
            transition: "all 0.3s ease"
        },
        content: {
            padding: "32px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "40px"
        },
        imageSection: {
            background: "rgba(248, 250, 252, 0.6)",
            backdropFilter: "blur(10px)",
            borderRadius: "20px",
            padding: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(255, 255, 255, 0.5)"
        },
        specs: {
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginBottom: "24px"
        },
        specItem: {
            display: "flex",
            justifyContent: "space-between",
            padding: "12px 16px",
            background: "rgba(248, 250, 252, 0.6)",
            backdropFilter: "blur(10px)",
            borderRadius: "10px",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            transition: "all 0.2s ease"
        },
        buySection: {
            display: "flex",
            flexDirection: "column",
            gap: "12px"
        },
        primaryBtn: {
            width: "100%",
            padding: "18px",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            border: "none",
            borderRadius: "14px",
            color: "#ffffff",
            fontSize: "16px",
            fontWeight: "700",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 8px 24px rgba(16, 185, 129, 0.3)",
            letterSpacing: "-0.01em"
        },
        secondaryBtns: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px"
        },
        secondaryBtn: {
            padding: "16px",
            borderRadius: "14px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            letterSpacing: "-0.01em"
        }
    };

    return (
        <div style={modalStyles.overlay} onClick={onClose}>
            <div style={modalStyles.container} onClick={(e) => e.stopPropagation()}>
                <div style={modalStyles.header}>
                    <div>
                        <h2 style={{ 
                            margin: "0 0 12px 0", 
                            fontSize: "28px", 
                            fontWeight: "700", 
                            color: "#0f172a",
                            letterSpacing: "-0.02em",
                            lineHeight: "1.3"
                        }}>
                            {product.name}
                        </h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{ color: "#fbbf24", fontSize: "22px" }}>★</span>
                            <span style={{ color: "#0f172a", fontWeight: "700", fontSize: "20px" }}>{product.rating}</span>
                            <span style={{ color: "#64748b", fontSize: "15px" }}>
                                ({product.reviews.toLocaleString('en-IN')} reviews)
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={modalStyles.closeBtn}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
                            e.currentTarget.style.transform = "rotate(90deg)";
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                            e.currentTarget.style.transform = "rotate(0deg)";
                        }}
                        aria-label="Close modal"
                    >
                        ✕
                    </button>
                </div>

                <div style={modalStyles.content}>
                    <div style={modalStyles.imageSection}>
                        <img 
                            src={product.image} 
                            alt={product.name} 
                            style={{ 
                                maxWidth: "100%", 
                                maxHeight: "350px", 
                                objectFit: "contain",
                                filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.2))"
                            }} 
                        />
                    </div>

                    <div>
                        <div style={{ 
                            fontSize: "40px", 
                            fontWeight: "800", 
                            background: "linear-gradient(135deg, #10b981, #059669)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            marginBottom: "24px",
                            letterSpacing: "-0.03em"
                        }}>
                            ₹{product.price.toLocaleString('en-IN')}
                        </div>

                        <h3 style={{ 
                            color: "#0f172a", 
                            fontSize: "16px", 
                            marginBottom: "16px", 
                            fontWeight: "600",
                            letterSpacing: "-0.01em"
                        }}>
                            Specifications
                        </h3>
                        <div style={modalStyles.specs}>
                            {Object.entries(product)
                                .filter(([key]) => !['id', 'name', 'image', 'price', 'rating', 'reviews', 'category', 'subcategory', 'buyLinks'].includes(key))
                                .map(([key, value]) => (
                                    <div 
                                        key={key} 
                                        style={modalStyles.specItem}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = "rgba(241, 245, 249, 0.8)";
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = "rgba(248, 250, 252, 0.6)";
                                        }}
                                    >
                                        <span style={{ 
                                            color: "#64748b", 
                                            fontSize: "14px", 
                                            textTransform: "capitalize",
                                            fontWeight: "500"
                                        }}>
                                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                                        </span>
                                        <span style={{ 
                                            color: "#0f172a", 
                                            fontSize: "14px", 
                                            fontWeight: "600",
                                            textAlign: "right"
                                        }}>
                                            {typeof value === 'string' && value.length > 30 
                                                ? value.substring(0, 30) + '...' 
                                                : value}
                                        </span>
                                    </div>
                                ))}
                        </div>

                        <div style={modalStyles.buySection}>
                            <button
                                style={modalStyles.primaryBtn}
                                onClick={() => window.open(product.buyLinks?.official, '_blank')}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(16, 185, 129, 0.4)";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(16, 185, 129, 0.3)";
                                }}
                            >
                                🏢 Buy from Official Site
                            </button>

                            <div style={modalStyles.secondaryBtns}>
                                <button
                                    style={{
                                        ...modalStyles.secondaryBtn,
                                        background: "linear-gradient(135deg, rgba(255, 153, 0, 0.2), rgba(230, 138, 0, 0.2))",
                                        border: "1px solid rgba(255, 153, 0, 0.4)",
                                        color: "#ffffff"
                                    }}
                                    onClick={() => window.open(product.buyLinks?.amazon, '_blank')}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = "linear-gradient(135deg, rgba(255, 153, 0, 0.3), rgba(230, 138, 0, 0.3))";
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = "linear-gradient(135deg, rgba(255, 153, 0, 0.2), rgba(230, 138, 0, 0.2))";
                                        e.currentTarget.style.transform = "translateY(0)";
                                    }}
                                >
                                    <span style={{ fontSize: "18px" }}>📦</span>
                                    Amazon
                                </button>

                                <button
                                    style={{
                                        ...modalStyles.secondaryBtn,
                                        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))",
                                        border: "1px solid rgba(59, 130, 246, 0.4)",
                                        color: "#ffffff"
                                    }}
                                    onClick={() => window.open(product.buyLinks?.flipkart, '_blank')}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = "linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.3))";
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))";
                                        e.currentTarget.style.transform = "translateY(0)";
                                    }}
                                >
                                    <span style={{ fontSize: "18px" }}>🛒</span>
                                    Flipkart
                                </button>
                            </div>

                            <p style={{ 
                                fontSize: "12px", 
                                color: "#64748b", 
                                textAlign: "center", 
                                marginTop: "8px",
                                lineHeight: "1.5",
                                fontWeight: "500"
                            }}>
                                💡 Compare prices across platforms for the best deal
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
