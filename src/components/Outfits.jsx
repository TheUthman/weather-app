/* eslint-disable no-unused-vars */
import React from 'react'
import { GiClothes } from "react-icons/gi";

export const Outfits = ({data}) => {
  const getOutfitRecommendation = (temperature) => {
    if (temperature >= 28) {
      return {
        type: "Lightweight & Breathable",
        items: ["T-shirt", "Shorts", "Tank top"],
        vibe: "☀️ Sunny & Relaxed"
      };
    } else if (temperature >= 20) {
      return {
        type: "Smart Casual",
        items: ["Jeans", "T-shirt", "Light jacket"],
        vibe: "🏙️ City Vibes"
      };
    } else if (temperature >= 15) {
      return {
        type: "Comfortable & Cozy",
        items: ["Sweater", "Jeans", "Jacket"],
        vibe: "☕ Warm & Snug"
      };
    } else {
      return {
        type: "Warm & Protected",
        items: ["Winter jacket", "Scarf", "Gloves"],
        vibe: "❄️ Cold & Windy"
      };
    }
  };

  const outfit = getOutfitRecommendation(data);
  return (
    <div className='insight-card'>
        <GiClothes size={20} color={"black"}/>
        <p className='insight-message'>
            <strong>
                What to wear today?
            </strong>
            {outfit.items.join(", ")}
            {outfit.vibe}
        </p>
    </div>
  )
}
