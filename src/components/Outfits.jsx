/* eslint-disable no-unused-vars */
import React from 'react'
import Icon from "./Icon";

export const Outfits = ({data}) => {
  const getOutfitRecommendation = (temperature) => {
    if (temperature >= 28) {
      return {
        type: "Lightweight & Breathable",
        items: ["T-shirt", "Shorts", "Sunglasses"],
        tempColor: "#FFA500",
        tempBg: "#FFF5E6",
        vibe: "Sunny & Hot"
      };
    } else if (temperature >= 20) {
      return {
        type: "Smart Casual",
        items: ["Jeans", "T-shirt", "Light jacket"],
        tempColor: "#F59E0B",
        tempBg: "#FEF3C7",
        vibe: "Comfortable"
      };
    } else if (temperature >= 15) {
      return {
        type: "Comfortable & Cozy",
        items: ["Sweater", "Jeans", "Jacket"],
        tempColor: "#3B82F6",
        tempBg: "#EFF6FF",
        vibe: "Cool"
      };
    } else {
      return {
        type: "Warm & Protected",
        items: ["Winter jacket", "Scarf", "Gloves"],
        tempColor: "#0EA5E9",
        tempBg: "#E0F2FE",
        vibe: "Cold"
      };
    }
  };

  const outfit = getOutfitRecommendation(data);

  return (
    <div className="insight-card-minimalist outfits-card" style={{ borderColor: outfit.tempColor }}>
      <div className="insight-card-header">
        <Icon name="shirt" size={24} style={{ color: outfit.tempColor }} />
        <h3 className="insight-card-title">What to Wear</h3>
      </div>
      <div className="insight-card-content">
        <div
          className="outfit-temp-badge"
          style={{ "--badge-bg": outfit.tempBg, color: outfit.tempColor }}
        >
          {data}°F
        </div>
        <div className="outfit-items">
          {outfit.items.map((item, index) => (
            <div key={index} className="outfit-item">
              <span>•</span> {item}
            </div>
          ))}
        </div>
      </div>
      <div className="outfit-vibe" style={{ color: outfit.tempColor }}>
        {outfit.vibe}
      </div>
    </div>
  );
}
