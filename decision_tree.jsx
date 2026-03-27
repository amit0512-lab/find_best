import { useState, useEffect } from "react";
import React from "react";
import ProductList from "./src/components/ProductList";
import { mockProducts } from "./src/data/mockProducts";
import { categoryData as data } from "./src/data/categories";
import OnboardingTooltip from "./src/components/OnboardingTooltip";

// Backend API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Compatibility rules for smart filtering
const compatibilityRules = {
  // Tablet rules
  "Tablet": {
    "Brand": {
      "Premium (Apple iPad/Samsung/Microsoft)": { "Price Range": ["₹20–40K", "₹40–70K", "Above ₹70K"] },
      "Mid (Lenovo/Xiaomi/OnePlus)": { "Price Range": ["Under ₹10K", "₹10–20K", "₹20–40K"] },
      "Kids (Amazon Fire/LeapFrog)": { "Price Range": ["Under ₹10K", "₹10–20K"] },
      "Drawing (Wacom/Huion)": { "Price Range": ["₹20–40K", "₹40–70K", "Above ₹70K"] }
    },
    "Processor": {
      "Apple Silicon (M1–M4/A15–A17)": { "Brand": ["Premium (Apple iPad/Samsung/Microsoft)"] },
      "Snapdragon 695–8Gen3": { "Brand": ["Premium (Apple iPad/Samsung/Microsoft)", "Mid (Lenovo/Xiaomi/OnePlus)"] },
      "MediaTek Helio/Dimensity": { "Brand": ["Mid (Lenovo/Xiaomi/OnePlus)", "Kids (Amazon Fire/LeapFrog)"] },
      "Intel Core": { "Brand": ["Premium (Apple iPad/Samsung/Microsoft)", "Drawing (Wacom/Huion)"] }
    },
    "Price Range": {
      "Under ₹10K": { "Brand": ["Mid (Lenovo/Xiaomi/OnePlus)", "Kids (Amazon Fire/LeapFrog)"], "Processor": ["MediaTek Helio/Dimensity"] },
      "₹10–20K": { "Brand": ["Mid (Lenovo/Xiaomi/OnePlus)", "Kids (Amazon Fire/LeapFrog)"], "Processor": ["MediaTek Helio/Dimensity", "Snapdragon 695–8Gen3"] },
      "₹20–40K": { "Brand": ["Premium (Apple iPad/Samsung/Microsoft)", "Mid (Lenovo/Xiaomi/OnePlus)", "Drawing (Wacom/Huion)"], "Processor": ["Snapdragon 695–8Gen3", "MediaTek Helio/Dimensity", "Intel Core"] },
      "₹40–70K": { "Brand": ["Premium (Apple iPad/Samsung/Microsoft)", "Drawing (Wacom/Huion)"], "Processor": ["Apple Silicon (M1–M4/A15–A17)", "Snapdragon 695–8Gen3", "Intel Core"] },
      "Above ₹70K": { "Brand": ["Premium (Apple iPad/Samsung/Microsoft)", "Drawing (Wacom/Huion)"], "Processor": ["Apple Silicon (M1–M4/A15–A17)", "Intel Core"] }
    }
  },
  // Laptop rules
  "Laptop": {
    "Brand": {
      "Premium (Apple/Dell/HP/Lenovo/Asus)": { "Price Range": ["₹50–80K", "₹80K–1.2L", "Above ₹1.2L + EMI filter"] },
      "Gaming (ASUS ROG/MSI/Razer/Alienware)": { "Price Range": ["₹80K–1.2L", "Above ₹1.2L + EMI filter"] },
      "Budget (Acer/IdeaPad/Pavilion)": { "Price Range": ["Under ₹30K", "₹30–50K", "₹50–80K"] }
    },
    "Processor": {
      "Apple Silicon (M1–M4)": { "Brand": ["Premium (Apple/Dell/HP/Lenovo/Asus)"], "OS": ["macOS"] },
      "Intel (i3–i9/Ultra)": { "Brand": ["Premium (Apple/Dell/HP/Lenovo/Asus)", "Gaming (ASUS ROG/MSI/Razer/Alienware)", "Budget (Acer/IdeaPad/Pavilion)"], "OS": ["Windows 11", "Windows 10", "Linux", "Chrome OS"] },
      "AMD (Ryzen 3–9)": { "Brand": ["Premium (Apple/Dell/HP/Lenovo/Asus)", "Gaming (ASUS ROG/MSI/Razer/Alienware)", "Budget (Acer/IdeaPad/Pavilion)"], "OS": ["Windows 11", "Windows 10", "Linux"] }
    },
    "OS": {
      "macOS": { "Brand": ["Premium (Apple/Dell/HP/Lenovo/Asus)"], "Processor": ["Apple Silicon (M1–M4)"] },
      "Windows 11": { "Processor": ["Intel (i3–i9/Ultra)", "AMD (Ryzen 3–9)"] },
      "Windows 10": { "Processor": ["Intel (i3–i9/Ultra)", "AMD (Ryzen 3–9)"] },
      "Linux": { "Processor": ["Intel (i3–i9/Ultra)", "AMD (Ryzen 3–9)"] },
      "Chrome OS": { "Brand": ["Budget (Acer/IdeaPad/Pavilion)"], "Processor": ["Intel (i3–i9/Ultra)"] }
    },
    "Price Range": {
      "Under ₹30K": { "Brand": ["Budget (Acer/IdeaPad/Pavilion)"] },
      "₹30–50K": { "Brand": ["Budget (Acer/IdeaPad/Pavilion)"] },
      "₹50–80K": { "Brand": ["Premium (Apple/Dell/HP/Lenovo/Asus)", "Budget (Acer/IdeaPad/Pavilion)"] },
      "₹80K–1.2L": { "Brand": ["Premium (Apple/Dell/HP/Lenovo/Asus)", "Gaming (ASUS ROG/MSI/Razer/Alienware)"] },
      "Above ₹1.2L + EMI filter": { "Brand": ["Premium (Apple/Dell/HP/Lenovo/Asus)", "Gaming (ASUS ROG/MSI/Razer/Alienware)"] }
    }
  },
  // Headset rules
  "Headset": {
    "Brand": {
      "Premium (Sony/Bose/Sennheiser/Apple)": { "Price Range": ["₹5000–15K", "Above ₹15K"] },
      "Gaming (SteelSeries/Razer/HyperX)": { "Price Range": ["₹1500–5000", "₹5000–15K"] },
      "Budget (boAt/Noise/Zebronics)": { "Price Range": ["Under ₹500", "₹500–1500", "₹1500–5000"] }
    },
    "Price Range": {
      "Under ₹500": { "Brand": ["Budget (boAt/Noise/Zebronics)"] },
      "₹500–1500": { "Brand": ["Budget (boAt/Noise/Zebronics)"] },
      "₹1500–5000": { "Brand": ["Budget (boAt/Noise/Zebronics)", "Gaming (SteelSeries/Razer/HyperX)"] },
      "₹5000–15K": { "Brand": ["Premium (Sony/Bose/Sennheiser/Apple)", "Gaming (SteelSeries/Razer/HyperX)"] },
      "Above ₹15K": { "Brand": ["Premium (Sony/Bose/Sennheiser/Apple)"] }
    },
    "Type / Form": {
      "TWS": { "Brand": ["Premium (Sony/Bose/Sennheiser/Apple)", "Budget (boAt/Noise/Zebronics)"] },
      "Over-Ear": { "Brand": ["Premium (Sony/Bose/Sennheiser/Apple)", "Gaming (SteelSeries/Razer/HyperX)", "Budget (boAt/Noise/Zebronics)"] },
      "On-Ear": { "Brand": ["Budget (boAt/Noise/Zebronics)"] },
      "In-Ear": { "Brand": ["Premium (Sony/Bose/Sennheiser/Apple)", "Budget (boAt/Noise/Zebronics)"] }
    }
  },
  // Console rules
  "Consoles": {
    "Platform": {
      "PlayStation (PS3/PS4/PS5/Pro)": { "Price Range": ["₹30–50K", "Above ₹50K + EMI"] },
      "Xbox (One/Series S/X)": { "Price Range": ["₹30–50K", "Above ₹50K + EMI"] },
      "Nintendo (Switch/OLED/Lite)": { "Price Range": ["₹15–30K", "₹30–50K"] }
    },
    "Price Range": {
      "Under ₹5K": { "Product Type": ["Controller", "Headset", "Carry Case"] },
      "₹5–15K": { "Product Type": ["Controller", "Headset", "Storage", "Retro-Mini"] },
      "₹15–30K": { "Product Type": ["Handheld"], "Platform": ["Nintendo (Switch/OLED/Lite)"] },
      "₹30–50K": { "Product Type": ["Home Console", "Handheld"], "Platform": ["PlayStation (PS3/PS4/PS5/Pro)", "Xbox (One/Series S/X)", "Nintendo (Switch/OLED/Lite)"] },
      "Above ₹50K + EMI": { "Product Type": ["Home Console"], "Platform": ["PlayStation (PS3/PS4/PS5/Pro)", "Xbox (One/Series S/X)"] }
    }
  },
  // Camera rules
  "Camera": {
    "Brand": {
      "Premium (Sony/Canon/Nikon/Leica)": { "Price Range": ["₹50K–1L", "₹1–2L", "Above ₹2L"] },
      "Action (GoPro/DJI/Insta360)": { "Price Range": ["₹10–25K", "₹25–50K"] },
      "Drone (DJI/Autel)": { "Price Range": ["₹25–50K", "₹50K–1L"] }
    },
    "Price Range": {
      "Under ₹10K": { "Product Type": ["Security CCTV", "Dashcam"] },
      "₹10–25K": { "Product Type": ["Point & Shoot", "Action", "Security CCTV", "Dashcam"] },
      "₹25–50K": { "Product Type": ["Action", "Drone", "Instant"] },
      "₹50K–1L": { "Product Type": ["DSLR", "Mirrorless", "Drone"], "Brand": ["Premium (Sony/Canon/Nikon/Leica)", "Drone (DJI/Autel)"] },
      "₹1–2L": { "Product Type": ["DSLR", "Mirrorless"], "Brand": ["Premium (Sony/Canon/Nikon/Leica)"] },
      "Above ₹2L": { "Product Type": ["DSLR", "Mirrorless"], "Brand": ["Premium (Sony/Canon/Nikon/Leica)"] }
    }
  }
};

// Check if an option is compatible with current filters
const isOptionCompatible = (productType, currentQuestionLabel, optionValue, activeFilters) => {
  const rules = compatibilityRules[productType];
  if (!rules || !rules[currentQuestionLabel]) return true;

  const optionRules = rules[currentQuestionLabel][optionValue];
  
  // If no rules defined for this option, it's compatible with everything
  if (!optionRules) return true;

  // Check if this option is compatible with already selected filters
  for (const [filterKey, allowedValues] of Object.entries(optionRules)) {
    const selectedValue = activeFilters[filterKey]?.[0];
    if (selectedValue && !allowedValues.includes(selectedValue)) {
      return false;
    }
  }

  // REVERSE CHECK: Check if already selected filters are compatible with this option
  for (const [selectedFilterKey, selectedValues] of Object.entries(activeFilters)) {
    if (selectedValues && selectedValues.length > 0 && selectedFilterKey !== currentQuestionLabel) {
      const selectedValue = selectedValues[0];
      const selectedFilterRules = rules[selectedFilterKey];
      
      if (selectedFilterRules && selectedFilterRules[selectedValue]) {
        const constraints = selectedFilterRules[selectedValue][currentQuestionLabel];
        if (constraints && !constraints.includes(optionValue)) {
          return false;
        }
      }
    }
  }

  return true;
};

// Get reason why option is disabled
const getDisabledReason = (productType, currentQuestionLabel, optionValue, activeFilters) => {
  const rules = compatibilityRules[productType];
  if (!rules || !rules[currentQuestionLabel]) return null;

  const optionRules = rules[currentQuestionLabel][optionValue];
  if (!optionRules) return null;

  // Check forward compatibility
  for (const [filterKey, allowedValues] of Object.entries(optionRules)) {
    const selectedValue = activeFilters[filterKey]?.[0];
    if (selectedValue && !allowedValues.includes(selectedValue)) {
      return `Not compatible with ${filterKey}: ${selectedValue}`;
    }
  }

  // Check reverse compatibility
  for (const [selectedFilterKey, selectedValues] of Object.entries(activeFilters)) {
    if (selectedValues && selectedValues.length > 0 && selectedFilterKey !== currentQuestionLabel) {
      const selectedValue = selectedValues[0];
      const selectedFilterRules = rules[selectedFilterKey];
      
      if (selectedFilterRules && selectedFilterRules[selectedValue]) {
        const constraints = selectedFilterRules[selectedValue][currentQuestionLabel];
        if (constraints && !constraints.includes(optionValue)) {
          return `${selectedFilterKey} "${selectedValue}" requires different ${currentQuestionLabel}`;
        }
      }
    }
  }

  return null;
};

// Wizard helper
const parseOptions = (detailString) => {
  return detailString.split(" | ").map(segment => {
    const parts = segment.split(": ");
    const label = parts.length > 1 ? parts[0] : null;
    const optionsStr = parts.length > 1 ? parts[1] : segment;
    const options = optionsStr.split(" / ").map(s => s.trim());

    return {
      label: label,
      options: options
    };
  });
};

export default function CashifyWizard() {
  // Navigation State
  const [navigationPath, setNavigationPath] = useState([]);
  const [currentStep, setCurrentStep] = useState("CATEGORY"); // "CATEGORY", "WIZARD", "RESULTS"
  const currentNode = navigationPath.length === 0 ? data : navigationPath[navigationPath.length - 1];

  // Wizard State
  const [wizardQuestions, setWizardQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeFilters, setActiveFilters] = useState({});
  
  // Products State
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState(null);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [showModal, setShowModal] = useState(null); // 'howItWorks' or 'about' or 'favorites'
  const [favorites, setFavorites] = useState([]);

  // Fetch products from backend when category changes
  useEffect(() => {
    const fetchProducts = async () => {
      if (navigationPath.length === 0) {
        setProducts([]);
        return;
      }
      
      setIsLoadingProducts(true);
      setProductsError(null);
      
      try {
        // Build query params from navigation path
        const params = new URLSearchParams();
        navigationPath.forEach(node => {
          if (node.name) {
            params.append('category', node.name);
          }
        });
        
        const response = await fetch(`${API_URL}/api/products?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        // Fallback to mock products if API fails
        setProducts(mockProducts);
        setProductsError("Using mock data due to API error");
      } finally {
        setIsLoadingProducts(false);
      }
    };
    
    fetchProducts();
  }, [navigationPath]);

  // Reset to initial state
  const resetFlow = () => {
    setNavigationPath([]);
    setCurrentStep("CATEGORY");
    setWizardQuestions([]);
    setCurrentQuestionIndex(0);
    setActiveFilters({});
  };

  // Handlers
  // Handlers
  const handleNodeSelect = (node) => {
    const newPath = [...navigationPath, node];

    if (node.children) {
      setNavigationPath(newPath);
      setCurrentStep("CATEGORY");
    } else if (node.detail) {
      setNavigationPath(newPath);
      setWizardQuestions(parseOptions(node.detail));
      setCurrentQuestionIndex(0);
      setActiveFilters({});
      setCurrentStep("WIZARD");
    } else {
      setNavigationPath(newPath);
      setCurrentStep("RESULTS");
    }
  };

  const navigateToLevel = (index) => {
    if (index === -1) {
      resetFlow();
    } else {
      const newPath = navigationPath.slice(0, index + 1);
      setNavigationPath(newPath);
      const node = newPath[newPath.length - 1];
      if (node.children) {
        setCurrentStep("CATEGORY");
      } else if (node.detail) {
        setWizardQuestions(parseOptions(node.detail));
        setCurrentStep("WIZARD");
      }
    }
  };

  const handleWizardAnswer = (questionLabel, optionValue) => {
    setIsLoading(true);
    
    setTimeout(() => {
      setActiveFilters(prev => ({
        ...prev,
        [questionLabel]: [optionValue]
      }));

      // Advance to next question or end wizard
      if (currentQuestionIndex < wizardQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
      
      setIsLoading(false);
    }, 300);
  };

  const computeFilteredProducts = () => {
    // Use products from backend API, fallback to mock if not loaded
    let results = products.length > 0 ? products : mockProducts;

    // Filter by category properties
    if (navigationPath.length > 0) {
      results = results.filter(product => {
        return navigationPath.some(node =>
          product.category?.includes(node.name) ||
          product.subcategory?.includes(node.name) ||
          product.type?.includes(node.name)
        );
      });
    }

    // Apply active filters (skip "Open to Any" selections)
    const filterKeys = Object.keys(activeFilters);
    if (filterKeys.length > 0) {
      results = results.filter(product => {
        return filterKeys.every(filterCategory => {
          const selectedOptions = activeFilters[filterCategory];
          if (selectedOptions.length === 0) return true;
          
          // Skip filtering if user selected "Open to Any"
          if (selectedOptions.includes("Open to Any")) return true;

          const objKey = filterCategory.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
          }).replace(/\s+/g, '');

          if (product[objKey] !== undefined) {
            return selectedOptions.includes(product[objKey]);
          } else if (product[filterCategory.toLowerCase()] !== undefined) {
            return selectedOptions.includes(product[filterCategory.toLowerCase()]);
          } else {
            return selectedOptions.some(option => {
              return Object.values(product).some(val => val === option);
            });
          }
        });
      });
    }

    return results;
  };

  const renderBreadcrumbs = () => {
    if (navigationPath.length === 0) return null;

    return (
      <div style={{ padding: "20px 0", color: "#64748b", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <span style={{ cursor: "pointer", fontWeight: "500", color: "#475569" }} onClick={() => navigateToLevel(-1)}>Home</span>

        {navigationPath.map((node, index) => (
          <React.Fragment key={index}>
            <span style={{ color: "#cbd5e1" }}>›</span>
            <span
              style={{ cursor: "pointer", color: index === navigationPath.length - 1 ? "#0f172a" : "#64748b", fontWeight: index === navigationPath.length - 1 ? "600" : "500" }}
              onClick={() => {
                if (currentStep === "RESULTS" && index === navigationPath.length - 1) {
                  setCurrentStep("WIZARD");
                } else {
                  navigateToLevel(index);
                }
              }}
            >
              {node.name}
            </span>
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <>
      <OnboardingTooltip />
      <div style={{
      minHeight: "100vh",
      background: "transparent",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      color: "#0f172a",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Animated floating orbs */}
      <div style={{
        position: "fixed",
        top: "-10%",
        right: "-5%",
        width: "600px",
        height: "600px",
        background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(60px)",
        animation: "float 20s ease-in-out infinite",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "fixed",
        bottom: "-10%",
        left: "-5%",
        width: "500px",
        height: "500px",
        background: "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(60px)",
        animation: "float 15s ease-in-out infinite reverse",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "fixed",
        top: "40%",
        left: "50%",
        width: "400px",
        height: "400px",
        background: "radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(60px)",
        animation: "float 18s ease-in-out infinite",
        pointerEvents: "none"
      }} />

      {/* Header with glassmorphism */}
      <header style={{
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.5)",
        padding: "16px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
        position: "sticky",
        top: 0,
        zIndex: 10,
        gap: "24px"
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={resetFlow}>
          <div style={{ 
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
            color: "white", 
            width: "40px", 
            height: "40px", 
            borderRadius: "12px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            fontSize: "20px", 
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "24px",
              height: "24px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "3px"
            }}>
              <div style={{ background: "rgba(255, 255, 255, 0.9)", borderRadius: "3px" }}></div>
              <div style={{ background: "rgba(255, 255, 255, 0.6)", borderRadius: "3px" }}></div>
              <div style={{ background: "rgba(255, 255, 255, 0.6)", borderRadius: "3px" }}></div>
              <div style={{ background: "rgba(255, 255, 255, 0.9)", borderRadius: "3px" }}></div>
            </div>
          </div>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: "24px", 
              fontWeight: "800", 
              color: "#0f172a", 
              letterSpacing: "-0.02em",
              lineHeight: "1"
            }}>
              PickAI
            </h1>
            <p style={{ 
              margin: 0, 
              fontSize: "10px", 
              color: "#64748b", 
              fontWeight: "500",
              letterSpacing: "0.05em",
              textTransform: "uppercase"
            }}>
              Smart Shopping
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={{ 
          display: "flex", 
          gap: "8px", 
          alignItems: "center",
          flex: "1",
          justifyContent: "center"
        }}>
          <button
            onClick={() => setShowModal('howItWorks')}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#475569",
              textDecoration: "none",
              transition: "all 0.3s ease",
              background: "transparent",
              border: "none",
              cursor: "pointer"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.6)";
              e.currentTarget.style.color = "#8b5cf6";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#475569";
            }}
          >
            How It Works
          </button>
          <button
            onClick={() => setShowModal('about')}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#475569",
              textDecoration: "none",
              transition: "all 0.3s ease",
              background: "transparent",
              border: "none",
              cursor: "pointer"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.6)";
              e.currentTarget.style.color = "#8b5cf6";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#475569";
            }}
          >
            About
          </button>
        </nav>

        {/* Search Bar */}
        <div style={{
          position: "relative",
          flex: "0 1 400px"
        }}>
          <input
            type="text"
            placeholder="Search products..."
            style={{
              width: "100%",
              padding: "12px 40px 12px 16px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.5)",
              background: "rgba(255, 255, 255, 0.6)",
              backdropFilter: "blur(10px)",
              fontSize: "14px",
              color: "#0f172a",
              outline: "none",
              transition: "all 0.3s ease",
              fontFamily: "inherit"
            }}
            onFocus={e => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)";
              e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.5)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(139, 92, 246, 0.2)";
            }}
            onBlur={e => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.6)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.5)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
          <span style={{
            position: "absolute",
            right: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "18px",
            color: "#94a3b8",
            pointerEvents: "none"
          }}>
            🔍
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {/* Favorites */}
          <button
            onClick={() => setShowModal('favorites')}
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.5)",
              background: "rgba(255, 255, 255, 0.6)",
              backdropFilter: "blur(10px)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              transition: "all 0.3s ease",
              position: "relative"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.6)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            ❤️
            {favorites.length > 0 && (
              <span style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                color: "white",
                fontSize: "10px",
                fontWeight: "700",
                padding: "2px 6px",
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(239, 68, 68, 0.4)"
              }}>
                {favorites.length}
              </span>
            )}
          </button>

          {/* Cart - Removed as requested */}

          {/* User Profile */}
          <button
            style={{
              padding: "10px 20px",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.5)",
              background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
              color: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              fontWeight: "600",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(139, 92, 246, 0.4)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(139, 92, 246, 0.3)";
            }}
          >
            <span style={{ fontSize: "18px" }}>👤</span>
            Sign In
          </button>
        </div>
      </header>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px 40px", position: "relative", zIndex: 1 }}>

        {renderBreadcrumbs()}

        {/* STEP 1/2: CATEGORY EXPLORATION */}
        {currentStep === "CATEGORY" && (
          <div style={{ paddingTop: "20px" }}>
            {/* Hero Section - Only on landing page */}
            {navigationPath.length === 0 && (
              <div style={{ 
                textAlign: "center", 
                marginBottom: "60px",
                padding: "40px 20px",
                animation: "fadeInUp 0.8s ease-out"
              }}>
                <h1 style={{ 
                  fontSize: "56px", 
                  fontWeight: "800", 
                  marginBottom: "20px", 
                  color: "#0f172a",
                  letterSpacing: "-0.03em",
                  lineHeight: "1.1",
                  animation: "fadeInUp 0.8s ease-out"
                }}>
                  Find Your Perfect Product
                </h1>
                <h2 style={{ 
                  fontSize: "56px", 
                  fontWeight: "800", 
                  marginBottom: "24px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
                  backgroundSize: "200% 200%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  letterSpacing: "-0.03em",
                  lineHeight: "1.1",
                  animation: "fadeInUp 0.8s ease-out 0.2s both, gradientShift 3s ease infinite"
                }}>
                  Smart, Fast & Personalized
                </h2>
                <p style={{ 
                  fontSize: "20px", 
                  color: "#64748b", 
                  maxWidth: "700px", 
                  margin: "0 auto 40px",
                  lineHeight: "1.6",
                  fontWeight: "500",
                  animation: "fadeInUp 0.8s ease-out 0.4s both"
                }}>
                  Answer a few quick questions and let our intelligent system guide you to products that perfectly match your needs, budget, and preferences.
                </p>
                <div style={{ 
                  display: "flex", 
                  gap: "16px", 
                  justifyContent: "center", 
                  alignItems: "center",
                  flexWrap: "wrap",
                  animation: "fadeInUp 0.8s ease-out 0.6s both"
                }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "8px",
                    background: "rgba(255, 255, 255, 0.7)",
                    backdropFilter: "blur(10px)",
                    padding: "12px 20px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.5)"
                  }}>
                    <span style={{ fontSize: "20px" }}>⚡</span>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>Quick & Easy</span>
                  </div>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "8px",
                    background: "rgba(255, 255, 255, 0.7)",
                    backdropFilter: "blur(10px)",
                    padding: "12px 20px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.5)"
                  }}>
                    <span style={{ fontSize: "20px" }}>🎯</span>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>Personalized Results</span>
                  </div>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "8px",
                    background: "rgba(255, 255, 255, 0.7)",
                    backdropFilter: "blur(10px)",
                    padding: "12px 20px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.5)"
                  }}>
                    <span style={{ fontSize: "20px" }}>💡</span>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>Smart Recommendations</span>
                  </div>
                </div>
              </div>
            )}

            <h2 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "40px", textAlign: "center", color: "#0f172a", letterSpacing: "-0.02em" }}>
              {navigationPath.length === 0 ? "Choose Your Category" : `Select ${currentNode.name} Type`}
            </h2>

            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", 
              gap: "20px", 
              maxWidth: "1100px",
              margin: "0 auto",
              gridAutoRows: "minmax(160px, auto)"
            }}>
              {currentNode.children?.map((child, index) => {
                // Bento Grid: Create varied card sizes for visual interest
                const isLarge = index % 7 === 0; // Every 7th card is large
                const isMedium = index % 4 === 0 && !isLarge; // Every 4th card is medium
                
                return (
                  <div
                    key={child.name}
                    onClick={() => handleNodeSelect(child)}
                    style={{
                      background: "rgba(255, 255, 255, 0.7)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      border: "1px solid rgba(255, 255, 255, 0.5)",
                      borderRadius: "20px",
                      padding: isLarge ? "40px 24px" : isMedium ? "36px 20px" : "32px 20px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
                      gridColumn: isLarge ? "span 2" : "span 1",
                      gridRow: isLarge ? "span 2" : isMedium ? "span 1" : "span 1",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: isLarge ? "16px" : "12px",
                      position: "relative",
                      overflow: "hidden"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)";
                      e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                      e.currentTarget.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.12)";
                      e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.5)";
                      const topBar = e.currentTarget.querySelector('.top-bar');
                      if (topBar) topBar.style.opacity = "1";
                      const icon = e.currentTarget.querySelector('.icon');
                      if (icon) icon.style.transform = "scale(1.15) rotate(5deg)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.7)";
                      e.currentTarget.style.transform = "translateY(0) scale(1)";
                      e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.06)";
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.5)";
                      const topBar = e.currentTarget.querySelector('.top-bar');
                      if (topBar) topBar.style.opacity = "0";
                      const icon = e.currentTarget.querySelector('.icon');
                      if (icon) icon.style.transform = "scale(1) rotate(0deg)";
                    }}
                  >
                    {/* Gradient overlay on hover */}
                    <div 
                      className="top-bar"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "4px",
                        background: "linear-gradient(90deg, #667eea, #764ba2, #f093fb)",
                        opacity: 0,
                        transition: "opacity 0.3s ease"
                      }} 
                    />
                    
                    <div 
                      className="icon"
                      style={{ 
                        fontSize: isLarge ? "72px" : isMedium ? "60px" : "52px",
                        transition: "transform 0.3s ease",
                        filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))"
                      }}
                    >
                      {child.icon}
                    </div>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: isLarge ? "20px" : isMedium ? "18px" : "16px", 
                      fontWeight: "600", 
                      color: "#0f172a", 
                      letterSpacing: "-0.01em",
                      lineHeight: "1.3"
                    }}>
                      {child.name}
                    </h3>
                    {isLarge && (
                      <p style={{
                        margin: 0,
                        fontSize: "14px",
                        color: "#64748b",
                        fontWeight: "500"
                      }}>
                        Explore all options
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: WIZARD */}
        {currentStep === "WIZARD" && currentNode && (
          <div style={{ paddingTop: "20px" }}>
            <h2 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "40px", color: "#0f172a", letterSpacing: "-0.02em" }}>
              Find the perfect {currentNode.name}
            </h2>

            <div className="wizard-container" style={{
              display: "flex",
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: "24px",
              overflow: "hidden",
              border: "1px solid rgba(255, 255, 255, 0.5)",
              minHeight: "450px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)"
            }}>
              {/* Left side: Image */}
              <div className="wizard-image" style={{
                flex: "1",
                background: "rgba(248, 250, 252, 0.5)",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px",
                borderRight: "1px solid rgba(255, 255, 255, 0.5)"
              }}>
                <img
                  src={currentNode.image || "https://images.unsplash.com/photo-1550029402-226115b7c579?w=400&q=80"}
                  alt={currentNode.name}
                  style={{ maxWidth: "80%", maxHeight: "300px", objectFit: "contain", borderRadius: "16px", filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.3))" }}
                />
              </div>

              {/* Right side: Questions block */}
              <div style={{ flex: "1.5", padding: "40px" }}>
                <div style={{ marginBottom: "28px" }}>
                  <h1 style={{ fontSize: "24px", margin: "0 0 8px 0", color: "#0f172a", fontWeight: "700", letterSpacing: "-0.02em" }}>{currentNode.name}</h1>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "14px", fontWeight: "500" }}>
                    {mockProducts.filter(p => navigationPath.some(n => p.category?.includes(n.name) || p.subcategory?.includes(n.name) || p.type?.includes(n.name))).length}+ products available
                  </p>
                </div>

                {/* Dynamic Question Card */}
                <div style={{ 
                  background: "rgba(255, 255, 255, 0.6)", 
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.5)", 
                  borderRadius: "16px", 
                  padding: "28px", 
                  position: "relative",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)"
                }}>
                  {/* Progress Indicator */}
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    marginBottom: "24px",
                    padding: "16px 20px",
                    background: "rgba(255, 255, 255, 0.5)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.5)"
                  }}>
                    <div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px", fontWeight: "500" }}>
                        Question {currentQuestionIndex + 1} of {wizardQuestions.length}
                      </div>
                      <div style={{ 
                        width: "200px", 
                        height: "6px", 
                        background: "#e2e8f0", 
                        borderRadius: "3px",
                        overflow: "hidden"
                      }}>
                        <div style={{ 
                          width: `${((currentQuestionIndex + 1) / wizardQuestions.length) * 100}%`, 
                          height: "100%", 
                          background: "linear-gradient(90deg, #10b981, #059669)",
                          transition: "width 0.3s ease",
                          borderRadius: "3px"
                        }} />
                      </div>
                    </div>
                    <button
                      onClick={resetFlow}
                      style={{
                        background: "rgba(255, 255, 255, 0.6)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.5)",
                        color: "#475569",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.3s ease"
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)";
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.8)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.6)";
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.5)";
                      }}
                    >
                      ↻ Start Over
                    </button>
                  </div>

                  {/* Stepper dots */}
                  <div style={{ position: "absolute", top: "24px", right: "24px", display: "flex", gap: "6px" }}>
                    {wizardQuestions.map((_, i) => (
                      <div 
                        key={i} 
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          background: i <= currentQuestionIndex ? "rgba(34, 197, 94, 0.9)" : "rgba(255, 255, 255, 0.3)",
                          boxShadow: i === currentQuestionIndex ? "0 0 12px rgba(34, 197, 94, 0.6)" : "none",
                          transition: "all 0.3s ease",
                          cursor: i < currentQuestionIndex ? "pointer" : "default"
                        }}
                        onClick={() => i < currentQuestionIndex && setCurrentQuestionIndex(i)}
                        title={i < currentQuestionIndex ? "Click to go back to this question" : ""}
                      />
                    ))}
                  </div>

                  {wizardQuestions.length > 0 && currentQuestionIndex < wizardQuestions.length ? (
                    <>
                      <h3 style={{ fontSize: "18px", margin: "0 0 8px 0", color: "#0f172a", fontWeight: "700", letterSpacing: "-0.01em" }}>
                        {wizardQuestions[currentQuestionIndex].label}
                      </h3>
                      <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px", fontWeight: "500" }}>
                        Select one option to continue, or choose "Open to Any" if you're flexible
                      </p>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                        {/* Add "Open to Any" option first */}
                        {(() => {
                          const isSelected = activeFilters[wizardQuestions[currentQuestionIndex].label]?.includes("Open to Any");
                          return (
                            <div key="open-to-any" style={{ position: "relative", display: "inline-block" }}>
                              <button
                                onClick={() => handleWizardAnswer(wizardQuestions[currentQuestionIndex].label, "Open to Any")}
                                tabIndex={0}
                                aria-label={`Open to Any${isSelected ? ' - Selected' : ''}`}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleWizardAnswer(wizardQuestions[currentQuestionIndex].label, "Open to Any");
                                  }
                                }}
                                style={{
                                  background: isSelected 
                                    ? "linear-gradient(135deg, #8b5cf6, #7c3aed)" 
                                    : "rgba(139, 92, 246, 0.1)",
                                  backdropFilter: "blur(10px)",
                                  border: isSelected 
                                    ? "2px solid #8b5cf6" 
                                    : "2px dashed rgba(139, 92, 246, 0.4)",
                                  color: isSelected ? "#ffffff" : "#8b5cf6",
                                  padding: "12px 24px",
                                  borderRadius: "12px",
                                  fontSize: "14px",
                                  fontWeight: isSelected ? "700" : "600",
                                  cursor: "pointer",
                                  transition: "all 0.3s ease",
                                  boxShadow: isSelected ? "0 4px 20px rgba(139, 92, 246, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.04)",
                                  position: "relative"
                                }}
                                onMouseEnter={e => {
                                  if (!isSelected) {
                                    e.currentTarget.style.background = "rgba(139, 92, 246, 0.15)";
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(139, 92, 246, 0.2)";
                                  }
                                }}
                                onMouseLeave={e => {
                                  if (!isSelected) {
                                    e.currentTarget.style.background = "rgba(139, 92, 246, 0.1)";
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.04)";
                                  }
                                }}
                              >
                                ✨ Open to Any
                              </button>
                            </div>
                          );
                        })()}

                        {/* Regular options */}
                        {wizardQuestions[currentQuestionIndex].options.map(option => {
                          const isSelected = activeFilters[wizardQuestions[currentQuestionIndex].label]?.includes(option);
                          
                          // Get product type from navigation path
                          const productType = navigationPath.find(n => !n.children)?.name;
                          
                          // Check if option is compatible with previous selections
                          const isCompatible = isOptionCompatible(
                            productType, 
                            wizardQuestions[currentQuestionIndex].label, 
                            option, 
                            activeFilters
                          );
                          
                          const isDisabled = !isCompatible;
                          const disabledReason = isDisabled ? getDisabledReason(
                            productType,
                            wizardQuestions[currentQuestionIndex].label,
                            option,
                            activeFilters
                          ) : null;
                          
                          return (
                            <div key={option} style={{ position: "relative", display: "inline-block" }}>
                              <button
                                onClick={() => !isDisabled && handleWizardAnswer(wizardQuestions[currentQuestionIndex].label, option)}
                                disabled={isDisabled}
                                title={disabledReason || ""}
                                tabIndex={isDisabled ? -1 : 0}
                                aria-label={`${option}${isDisabled ? ' - Not compatible' : ''}${isSelected ? ' - Selected' : ''}`}
                                aria-disabled={isDisabled}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    !isDisabled && handleWizardAnswer(wizardQuestions[currentQuestionIndex].label, option);
                                  }
                                }}
                                style={{
                                  background: isDisabled 
                                    ? "rgba(226, 232, 240, 0.5)" 
                                    : isSelected 
                                      ? "linear-gradient(135deg, #10b981, #059669)" 
                                      : "rgba(255, 255, 255, 0.6)",
                                  backdropFilter: "blur(10px)",
                                  border: isDisabled
                                    ? "2px dashed rgba(203, 213, 225, 0.5)"
                                    : isSelected 
                                      ? "2px solid #10b981" 
                                      : "1px solid rgba(255, 255, 255, 0.5)",
                                  color: isDisabled ? "#94a3b8" : isSelected ? "#ffffff" : "#0f172a",
                                  padding: "12px 24px",
                                  borderRadius: "12px",
                                  fontSize: "14px",
                                  fontWeight: isSelected ? "700" : "500",
                                  cursor: isDisabled ? "not-allowed" : "pointer",
                                  transition: "all 0.3s ease",
                                  boxShadow: isSelected ? "0 4px 20px rgba(16, 185, 129, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.04)",
                                  opacity: isDisabled ? 0.6 : 1,
                                  textDecoration: isDisabled ? "line-through" : "none",
                                  position: "relative"
                                }}
                                onMouseEnter={e => {
                                  if (!isSelected && !isDisabled) {
                                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.8)";
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.08)";
                                  }
                                }}
                                onMouseLeave={e => {
                                  if (!isSelected && !isDisabled) {
                                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.6)";
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.04)";
                                  }
                                }}
                              >
                                {option}
                              </button>
                            </div>
                          )
                        })}
                      </div>

                      {/* Navigation controls within Wizard */}
                      {currentQuestionIndex > 0 && (
                        <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-start" }}>
                          <button
                            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                            style={{ background: "transparent", border: "none", color: "#475569", cursor: "pointer", fontSize: "14px", fontWeight: "500", display: "flex", alignItems: "center", gap: "4px" }}
                          >
                            <span>←</span> Back
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <h3 style={{ fontSize: "20px", color: "#0f172a", marginBottom: "16px", fontWeight: "700", letterSpacing: "-0.01em" }}>All Set!</h3>
                      <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "28px" }}>We've gathered your preferences.</p>
                      <button
                        onClick={() => setCurrentStep("RESULTS")}
                        style={{
                          background: "linear-gradient(135deg, #10b981, #059669)",
                          color: "white",
                          border: "none",
                          padding: "16px 36px",
                          borderRadius: "12px",
                          fontSize: "16px",
                          fontWeight: "700",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          display: "flex",
                          alignItems: "center",
                          margin: "0 auto",
                          gap: "8px",
                          boxShadow: "0 8px 24px rgba(16, 185, 129, 0.3)",
                          letterSpacing: "-0.01em"
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 12px 32px rgba(16, 185, 129, 0.4)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 8px 24px rgba(16, 185, 129, 0.3)";
                        }}
                      >
                        Get Matches →
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: "28px", textAlign: "right" }}>
                  {/* Skip button if they just want to see results early */}
                  {currentQuestionIndex < wizardQuestions.length && (
                    <button
                      onClick={() => setCurrentStep("RESULTS")}
                      style={{
                        background: "rgba(255, 255, 255, 0.6)",
                        backdropFilter: "blur(10px)",
                        color: "#0f172a",
                        border: "1px solid rgba(255, 255, 255, 0.5)",
                        padding: "14px 28px",
                        borderRadius: "12px",
                        fontSize: "15px",
                        fontWeight: "600",
                        cursor: "pointer",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
                        transition: "all 0.3s ease",
                        letterSpacing: "-0.01em"
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.1)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.6)";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.06)";
                      }}
                    >
                      Show My Matches ✨
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: RESULTS */}
        {currentStep === "RESULTS" && (
          <div>
            {/* Active Filters Summary */}
            <div style={{ 
              background: "rgba(255, 255, 255, 0.6)", 
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              padding: "20px 24px", 
              borderRadius: "16px", 
              marginBottom: "28px", 
              border: "1px solid rgba(255, 255, 255, 0.5)",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)"
            }}>
              <h4 style={{ margin: "0 0 16px 0", fontSize: "15px", color: "#0f172a", fontWeight: "600", letterSpacing: "-0.01em" }}>Your Preferences</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {Object.entries(activeFilters).map(([key, values]) => (
                  values.length > 0 && (
                    <span key={key} style={{ 
                      background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", 
                      color: "#ffffff", 
                      padding: "6px 16px", 
                      borderRadius: "20px", 
                      fontSize: "13px", 
                      fontWeight: "600",
                      border: "1px solid rgba(139, 92, 246, 0.3)",
                      boxShadow: "0 2px 8px rgba(139, 92, 246, 0.3)",
                      letterSpacing: "-0.01em"
                    }}>
                      {values.join(", ")}
                    </span>
                  )
                ))}
                {Object.keys(activeFilters).length === 0 && (
                  <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "500" }}>No specific filters applied.</span>
                )}
                <button
                  onClick={() => { setActiveFilters({}); setCurrentQuestionIndex(0); setCurrentStep("WIZARD"); }}
                  style={{ 
                    background: "rgba(239, 68, 68, 0.1)", 
                    backdropFilter: "blur(5px)",
                    border: "1px solid rgba(239, 68, 68, 0.3)", 
                    color: "#ef4444", 
                    cursor: "pointer", 
                    fontSize: "13px", 
                    marginLeft: "8px", 
                    fontWeight: "600", 
                    padding: "6px 16px",
                    borderRadius: "20px",
                    transition: "all 0.3s ease",
                    letterSpacing: "-0.01em"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                  }}
                >
                  Edit
                </button>
              </div>
            </div>

            <ProductList 
              products={computeFilteredProducts()} 
              selectedCategoryPath={navigationPath.map(n => n.name)}
              favorites={favorites}
              setFavorites={setFavorites}
            />
          </div>
        )}

      </main>

      {/* How It Works Modal */}
      {showModal === 'howItWorks' && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }} onClick={() => setShowModal(null)}>
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: "24px",
            padding: "40px",
            maxWidth: "700px",
            maxHeight: "80vh",
            overflow: "auto",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ margin: 0, fontSize: "32px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.02em" }}>
                How It Works
              </h2>
              <button onClick={() => setShowModal(null)} style={{
                background: "rgba(255, 255, 255, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                borderRadius: "10px",
                width: "36px",
                height: "36px",
                cursor: "pointer",
                fontSize: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease"
              }}>×</button>
            </div>
            
            <div style={{ color: "#475569", lineHeight: "1.8" }}>
              <div style={{ marginBottom: "32px" }}>
                <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "24px" }}>1️⃣</span> Choose Your Category
                </h3>
                <p style={{ margin: 0, fontSize: "15px" }}>
                  Start by selecting the product category you're interested in. Browse through our organized categories like Mobile, Electronics, Home & Kitchen, Automobile, Sports, and more.
                </p>
              </div>

              <div style={{ marginBottom: "32px" }}>
                <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "24px" }}>2️⃣</span> Answer Smart Questions
                </h3>
                <p style={{ margin: 0, fontSize: "15px" }}>
                  Our AI-powered wizard will ask you relevant questions about your preferences - budget, brand, features, and specifications. The questions adapt based on your previous answers using smart compatibility rules.
                </p>
              </div>

              <div style={{ marginBottom: "32px" }}>
                <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "24px" }}>3️⃣</span> Get Personalized Results
                </h3>
                <p style={{ margin: 0, fontSize: "15px" }}>
                  Based on your answers, we'll show you a curated list of products that match your exact requirements. You can further filter, sort, and compare products to find the perfect match.
                </p>
              </div>

              <div style={{ marginBottom: "32px" }}>
                <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "24px" }}>4️⃣</span> Save & Compare
                </h3>
                <p style={{ margin: 0, fontSize: "15px" }}>
                  Add products to your favorites for later viewing. Compare specifications, prices, and ratings to make an informed decision.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "24px" }}>5️⃣</span> Buy with Confidence
                </h3>
                <p style={{ margin: 0, fontSize: "15px" }}>
                  Click on buy buttons to purchase from official stores, Amazon, or Flipkart. We provide direct links to trusted sellers so you can shop with confidence.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showModal === 'about' && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }} onClick={() => setShowModal(null)}>
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: "24px",
            padding: "40px",
            maxWidth: "700px",
            maxHeight: "80vh",
            overflow: "auto",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ margin: 0, fontSize: "32px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.02em" }}>
                About PickAI
              </h2>
              <button onClick={() => setShowModal(null)} style={{
                background: "rgba(255, 255, 255, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                borderRadius: "10px",
                width: "36px",
                height: "36px",
                cursor: "pointer",
                fontSize: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease"
              }}>×</button>
            </div>
            
            <div style={{ color: "#475569", lineHeight: "1.8" }}>
              <p style={{ fontSize: "16px", marginBottom: "24px", color: "#0f172a", fontWeight: "600" }}>
                Your Smart Shopping Companion
              </p>

              <p style={{ fontSize: "15px", marginBottom: "20px" }}>
                PickAI is an intelligent product discovery platform that revolutionizes the way you shop online. We understand that finding the perfect product among thousands of options can be overwhelming and time-consuming.
              </p>

              <p style={{ fontSize: "15px", marginBottom: "20px" }}>
                That's why we built PickAI - to make product discovery simple, fast, and personalized. Our AI-powered recommendation engine asks you smart questions about your needs and preferences, then filters through vast product catalogs to show you only the items that truly match your requirements.
              </p>

              <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", marginTop: "32px", marginBottom: "16px" }}>
                What Makes Us Different
              </h3>

              <ul style={{ paddingLeft: "20px", marginBottom: "24px" }}>
                <li style={{ marginBottom: "12px", fontSize: "15px" }}>
                  <strong>Smart Filtering:</strong> Our compatibility rules ensure you only see options that make sense based on your previous choices
                </li>
                <li style={{ marginBottom: "12px", fontSize: "15px" }}>
                  <strong>No Overwhelm:</strong> Instead of showing thousands of products, we guide you through a simple wizard to narrow down your options
                </li>
                <li style={{ marginBottom: "12px", fontSize: "15px" }}>
                  <strong>Unbiased Recommendations:</strong> We don't favor any particular brand or seller - our goal is to help you find what's best for you
                </li>
                <li style={{ marginBottom: "12px", fontSize: "15px" }}>
                  <strong>Multi-Store Access:</strong> Compare prices and buy from official stores, Amazon, or Flipkart - all in one place
                </li>
                <li style={{ marginBottom: "12px", fontSize: "15px" }}>
                  <strong>Beautiful Experience:</strong> Shopping should be enjoyable, so we've designed a clean, modern interface that's a pleasure to use
                </li>
              </ul>

              <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", marginTop: "32px", marginBottom: "16px" }}>
                Our Mission
              </h3>

              <p style={{ fontSize: "15px", marginBottom: "20px" }}>
                To empower every shopper with the tools and information they need to make confident, informed purchase decisions. We believe shopping should be about finding the right product for your needs, not about sifting through endless options or falling for marketing gimmicks.
              </p>

              <p style={{ fontSize: "15px", marginBottom: "0" }}>
                Whether you're looking for a smartphone, laptop, home appliance, or any other product, PickAI is here to guide you to the perfect choice.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Favorites Modal */}
      {showModal === 'favorites' && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }} onClick={() => setShowModal(null)}>
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: "24px",
            padding: "40px",
            maxWidth: "900px",
            width: "100%",
            maxHeight: "80vh",
            overflow: "auto",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "32px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.02em" }}>
                  My Favorites
                </h2>
                <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#64748b", fontWeight: "500" }}>
                  {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
                </p>
              </div>
              <button onClick={() => setShowModal(null)} style={{
                background: "rgba(255, 255, 255, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                borderRadius: "10px",
                width: "36px",
                height: "36px",
                cursor: "pointer",
                fontSize: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease"
              }}>×</button>
            </div>
            
            {favorites.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: "64px", marginBottom: "20px", opacity: 0.5 }}>💔</div>
                <h3 style={{ fontSize: "22px", fontWeight: "700", color: "#0f172a", marginBottom: "12px" }}>
                  No favorites yet
                </h3>
                <p style={{ fontSize: "15px", color: "#64748b", marginBottom: "24px" }}>
                  Start adding products to your favorites by clicking the heart icon on any product card.
                </p>
                <button
                  onClick={() => setShowModal(null)}
                  style={{
                    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                    color: "white",
                    border: "none",
                    padding: "12px 28px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(139, 92, 246, 0.4)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(139, 92, 246, 0.3)";
                  }}
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", 
                gap: "20px" 
              }}>
                {products.length > 0 
                  ? products.filter(p => favorites.includes(p.id)).map(product => (
                      <div key={product.id} style={{
                        background: "rgba(255, 255, 255, 0.7)",
                        backdropFilter: "blur(10px)",
                        borderRadius: "16px",
                        border: "1px solid rgba(255, 255, 255, 0.5)",
                        overflow: "hidden",
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)"
                      }}>
                        <div style={{ position: "relative" }}>
                          <img 
                            src={product.image} 
                            alt={product.name}
                            style={{ 
                              width: "100%", 
                              height: "200px", 
                              objectFit: "cover" 
                            }}
                          />
                          <button
                            onClick={() => setFavorites(prev => prev.filter(id => id !== product.id))}
                            style={{
                              position: "absolute",
                              top: "12px",
                              right: "12px",
                              width: "36px",
                              height: "36px",
                              borderRadius: "10px",
                              border: "none",
                              background: "rgba(255, 255, 255, 0.9)",
                              backdropFilter: "blur(10px)",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "18px",
                              transition: "all 0.3s ease",
                              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.transform = "scale(1.1)";
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                          >
                            ❤️
                          </button>
                        </div>
                        <div style={{ padding: "16px" }}>
                          <h3 style={{ 
                            fontSize: "16px", 
                            fontWeight: "600", 
                            color: "#0f172a", 
                            marginBottom: "8px",
                            lineHeight: "1.3"
                          }}>
                            {product.name}
                          </h3>
                          <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "8px",
                            marginBottom: "12px"
                          }}>
                            <span style={{ 
                              fontSize: "20px", 
                              fontWeight: "700", 
                              color: "#0f172a" 
                            }}>
                              ₹{product.price.toLocaleString('en-IN')}
                            </span>
                            <span style={{ 
                              fontSize: "13px", 
                              color: "#64748b",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}>
                              ⭐ {product.rating}
                            </span>
                          </div>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <a
                              href={product.buyLinks?.amazon}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                flex: 1,
                                padding: "10px",
                                borderRadius: "10px",
                                background: "linear-gradient(135deg, #10b981, #059669)",
                                color: "white",
                                textAlign: "center",
                                textDecoration: "none",
                                fontSize: "13px",
                                fontWeight: "600",
                                transition: "all 0.3s ease",
                                boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)"
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.4)";
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 2px 8px rgba(16, 185, 129, 0.3)";
                              }}
                            >
                              Buy Now
                            </a>
                            <button
                              onClick={() => setFavorites(prev => prev.filter(id => id !== product.id))}
                              style={{
                                padding: "10px 16px",
                                borderRadius: "10px",
                                background: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                color: "#ef4444",
                                fontSize: "13px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.3s ease"
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  : products.length === 0 && favorites.length > 0 && mockProducts.filter(p => favorites.includes(p.id)).map(product => (
                      <div key={product.id} style={{
                        background: "rgba(255, 255, 255, 0.7)",
                        backdropFilter: "blur(10px)",
                        borderRadius: "16px",
                        border: "1px solid rgba(255, 255, 255, 0.5)",
                        overflow: "hidden",
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)"
                      }}>
                        <div style={{ position: "relative" }}>
                          <img 
                            src={product.image} 
                            alt={product.name}
                            style={{ 
                              width: "100%", 
                              height: "200px", 
                              objectFit: "cover" 
                            }}
                          />
                          <button
                            onClick={() => setFavorites(prev => prev.filter(id => id !== product.id))}
                            style={{
                              position: "absolute",
                              top: "12px",
                              right: "12px",
                              width: "36px",
                              height: "36px",
                              borderRadius: "10px",
                              border: "none",
                              background: "rgba(255, 255, 255, 0.9)",
                              backdropFilter: "blur(10px)",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "18px",
                              transition: "all 0.3s ease",
                              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.transform = "scale(1.1)";
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                          >
                            ❤️
                          </button>
                        </div>
                        <div style={{ padding: "16px" }}>
                          <h3 style={{ 
                            fontSize: "16px", 
                            fontWeight: "600", 
                            color: "#0f172a", 
                            marginBottom: "8px",
                            lineHeight: "1.3"
                          }}>
                            {product.name}
                          </h3>
                          <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "8px",
                            marginBottom: "12px"
                          }}>
                            <span style={{ 
                              fontSize: "20px", 
                              fontWeight: "700", 
                              color: "#0f172a" 
                            }}>
                              ₹{product.price.toLocaleString('en-IN')}
                            </span>
                            <span style={{ 
                              fontSize: "13px", 
                              color: "#64748b",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}>
                              ⭐ {product.rating}
                            </span>
                          </div>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <a
                              href={product.buyLinks?.amazon}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                flex: 1,
                                padding: "10px",
                                borderRadius: "10px",
                                background: "linear-gradient(135deg, #10b981, #059669)",
                                color: "white",
                                textAlign: "center",
                                textDecoration: "none",
                                fontSize: "13px",
                                fontWeight: "600",
                                transition: "all 0.3s ease",
                                boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)"
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.4)";
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 2px 8px rgba(16, 185, 129, 0.3)";
                              }}
                            >
                              Buy Now
                            </a>
                            <button
                              onClick={() => setFavorites(prev => prev.filter(id => id !== product.id))}
                              style={{
                                padding: "10px 16px",
                                borderRadius: "10px",
                                background: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                color: "#ef4444",
                                fontSize: "13px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.3s ease"
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer with glassmorphism */}
      <footer style={{
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255, 255, 255, 0.5)",
        marginTop: "80px",
        padding: "60px 40px 30px",
        position: "relative",
        zIndex: 1
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
            gap: "40px",
            marginBottom: "40px"
          }}>
            {/* Brand Section */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{ 
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
                  color: "white", 
                  width: "40px", 
                  height: "40px", 
                  borderRadius: "12px", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                  position: "relative"
                }}>
                  <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "24px",
                    height: "24px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "3px"
                  }}>
                    <div style={{ background: "rgba(255, 255, 255, 0.9)", borderRadius: "3px" }}></div>
                    <div style={{ background: "rgba(255, 255, 255, 0.6)", borderRadius: "3px" }}></div>
                    <div style={{ background: "rgba(255, 255, 255, 0.6)", borderRadius: "3px" }}></div>
                    <div style={{ background: "rgba(255, 255, 255, 0.9)", borderRadius: "3px" }}></div>
                  </div>
                </div>
                <div>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: "20px", 
                    fontWeight: "800", 
                    color: "#0f172a",
                    letterSpacing: "-0.02em"
                  }}>
                    PickAI
                  </h3>
                  <p style={{ 
                    margin: 0, 
                    fontSize: "10px", 
                    color: "#64748b", 
                    fontWeight: "500",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase"
                  }}>
                    Smart Shopping
                  </p>
                </div>
              </div>
              <p style={{ 
                fontSize: "14px", 
                color: "#64748b", 
                lineHeight: "1.6",
                margin: "0 0 16px 0"
              }}>
                Find your perfect product with AI-powered recommendations. Smart, fast, and personalized shopping experience.
              </p>
              <div style={{ display: "flex", gap: "12px" }}>
                <a href="#" style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.6)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  textDecoration: "none",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.6)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}>
                  𝕏
                </a>
                <a href="#" style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.6)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  textDecoration: "none",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.6)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}>
                  📘
                </a>
                <a href="#" style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.6)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  textDecoration: "none",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.6)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}>
                  📷
                </a>
                <a href="#" style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.6)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  textDecoration: "none",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.6)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}>
                  💼
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{ 
                fontSize: "16px", 
                fontWeight: "700", 
                color: "#0f172a", 
                marginBottom: "16px",
                letterSpacing: "-0.01em"
              }}>
                Quick Links
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["Home", "Categories", "How It Works", "About Us", "Contact"].map(link => (
                  <li key={link} style={{ marginBottom: "10px" }}>
                    <a href="#" style={{
                      color: "#64748b",
                      textDecoration: "none",
                      fontSize: "14px",
                      fontWeight: "500",
                      transition: "color 0.3s ease"
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = "#8b5cf6"}
                    onMouseLeave={e => e.currentTarget.style.color = "#64748b"}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 style={{ 
                fontSize: "16px", 
                fontWeight: "700", 
                color: "#0f172a", 
                marginBottom: "16px",
                letterSpacing: "-0.01em"
              }}>
                Popular Categories
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["Mobile", "Electronics", "Home & Kitchen", "Automobile", "Sports"].map(cat => (
                  <li key={cat} style={{ marginBottom: "10px" }}>
                    <a href="#" style={{
                      color: "#64748b",
                      textDecoration: "none",
                      fontSize: "14px",
                      fontWeight: "500",
                      transition: "color 0.3s ease"
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = "#8b5cf6"}
                    onMouseLeave={e => e.currentTarget.style.color = "#64748b"}>
                      {cat}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 style={{ 
                fontSize: "16px", 
                fontWeight: "700", 
                color: "#0f172a", 
                marginBottom: "16px",
                letterSpacing: "-0.01em"
              }}>
                Support
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["Help Center", "Privacy Policy", "Terms of Service", "Cookie Policy", "FAQ"].map(item => (
                  <li key={item} style={{ marginBottom: "10px" }}>
                    <a href="#" style={{
                      color: "#64748b",
                      textDecoration: "none",
                      fontSize: "14px",
                      fontWeight: "500",
                      transition: "color 0.3s ease"
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = "#8b5cf6"}
                    onMouseLeave={e => e.currentTarget.style.color = "#64748b"}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.5)",
            paddingTop: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px"
          }}>
            <p style={{ 
              margin: 0, 
              fontSize: "14px", 
              color: "#64748b",
              fontWeight: "500"
            }}>
              © 2026 PickAI. All rights reserved.
            </p>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              <a href="#" style={{
                color: "#64748b",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: "500",
                transition: "color 0.3s ease"
              }}
              onMouseEnter={e => e.currentTarget.style.color = "#8b5cf6"}
              onMouseLeave={e => e.currentTarget.style.color = "#64748b"}>
                Privacy
              </a>
              <a href="#" style={{
                color: "#64748b",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: "500",
                transition: "color 0.3s ease"
              }}
              onMouseEnter={e => e.currentTarget.style.color = "#8b5cf6"}
              onMouseLeave={e => e.currentTarget.style.color = "#64748b"}>
                Terms
              </a>
              <a href="#" style={{
                color: "#64748b",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: "500",
                transition: "color 0.3s ease"
              }}
              onMouseEnter={e => e.currentTarget.style.color = "#8b5cf6"}
              onMouseLeave={e => e.currentTarget.style.color = "#64748b"}>
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
