import React from 'react';

const SkeletonLoader = ({ count = 6 }) => {
    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "20px",
        }}>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(10px)",
                        borderRadius: "16px",
                        overflow: "hidden",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        height: "380px",
                        animation: "pulse 1.5s ease-in-out infinite"
                    }}
                >
                    <div style={{
                        height: "200px",
                        background: "rgba(255, 255, 255, 0.05)",
                    }} />
                    <div style={{ padding: "20px" }}>
                        <div style={{
                            height: "20px",
                            background: "rgba(255, 255, 255, 0.1)",
                            borderRadius: "4px",
                            marginBottom: "12px"
                        }} />
                        <div style={{
                            height: "16px",
                            background: "rgba(255, 255, 255, 0.1)",
                            borderRadius: "4px",
                            width: "60%",
                            marginBottom: "12px"
                        }} />
                        <div style={{
                            height: "14px",
                            background: "rgba(255, 255, 255, 0.1)",
                            borderRadius: "4px",
                            width: "40%"
                        }} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SkeletonLoader;
