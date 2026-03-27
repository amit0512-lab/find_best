import React, { useState, useEffect } from 'react';

const OnboardingTooltip = () => {
    const [show, setShow] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
        if (!hasSeenOnboarding) {
            setTimeout(() => setShow(true), 1000);
        }
    }, []);

    const steps = [
        {
            title: "Welcome to PickAI! 👋",
            description: "Let's help you find the perfect product with AI-powered recommendations.",
            position: "center"
        },
        {
            title: "Select a Category",
            description: "Choose what you're looking for from our smart categories.",
            position: "top"
        },
        {
            title: "Answer Quick Questions",
            description: "We'll ask a few questions to understand your needs better.",
            position: "center"
        },
        {
            title: "Get Personalized Results",
            description: "See products that match your exact requirements!",
            position: "center"
        }
    ];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            localStorage.setItem('hasSeenOnboarding', 'true');
            setShow(false);
        }
    };

    const handleSkip = () => {
        localStorage.setItem('hasSeenOnboarding', 'true');
        setShow(false);
    };

    if (!show) return null;

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "20px"
        }}>
            <div style={{
                background: "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
                borderRadius: "24px",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                padding: "40px",
                maxWidth: "500px",
                width: "100%",
                boxShadow: "0 24px 80px rgba(0, 0, 0, 0.2)",
                textAlign: "center"
            }}>
                <div style={{ fontSize: "48px", marginBottom: "20px" }}>
                    {step === 0 && "🎯"}
                    {step === 1 && "📱"}
                    {step === 2 && "❓"}
                    {step === 3 && "✨"}
                </div>
                <h2 style={{ 
                    color: "#0f172a", 
                    fontSize: "24px", 
                    fontWeight: "700", 
                    marginBottom: "12px",
                    letterSpacing: "-0.02em"
                }}>
                    {steps[step].title}
                </h2>
                <p style={{ 
                    color: "#475569", 
                    fontSize: "16px", 
                    lineHeight: "1.6",
                    marginBottom: "32px"
                }}>
                    {steps[step].description}
                </p>

                <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "24px" }}>
                    {steps.map((_, i) => (
                        <div key={i} style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: i === step ? "#10b981" : "#cbd5e1",
                            transition: "all 0.3s ease"
                        }} />
                    ))}
                </div>

                <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                    <button
                        onClick={handleSkip}
                        style={{
                            background: "rgba(255, 255, 255, 0.6)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255, 255, 255, 0.5)",
                            color: "#475569",
                            padding: "12px 24px",
                            borderRadius: "12px",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.3s ease"
                        }}
                    >
                        Skip
                    </button>
                    <button
                        onClick={handleNext}
                        style={{
                            background: "linear-gradient(135deg, #10b981, #059669)",
                            border: "none",
                            color: "#ffffff",
                            padding: "12px 32px",
                            borderRadius: "12px",
                            fontSize: "14px",
                            fontWeight: "700",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            boxShadow: "0 4px 16px rgba(16, 185, 129, 0.3)"
                        }}
                    >
                        {step === steps.length - 1 ? "Get Started" : "Next"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingTooltip;
