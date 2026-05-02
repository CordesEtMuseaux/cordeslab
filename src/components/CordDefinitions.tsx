import React from 'react';

const CordDefinitions = () => (
  <svg style={{ position: 'absolute', width: 0, height: 0 }}>
    <defs>
      {/* LA TEXTURE : Le grain de la paracorde */}
      <pattern id="nylonTexture" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
         <line x1="0" y1="0" x2="0" y2="10" stroke="black" strokeWidth="2" strokeOpacity="0.1" />
         <line x1="0" y1="0" x2="10" y2="0" stroke="white" strokeWidth="1" strokeOpacity="0.1" />
      </pattern>

      {/* LE DÉGRADÉ ARC-EN-CIEL : Pour la couleur "Rainbow" */}
      <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ff0000" />    {/* Rouge */}
        <stop offset="20%" stopColor="#ff8c00" />   {/* Orange */}
        <stop offset="40%" stopColor="#ffff00" />   {/* Jaune */}
        <stop offset="60%" stopColor="#008000" />   {/* Vert */}
        <stop offset="80%" stopColor="#0000ff" />   {/* Bleu */}
        <stop offset="100%" stopColor="#800080" />  {/* Violet */}
      </linearGradient>

      {/* LE RELIEF : L'effet bombé/brillant */}
      <filter id="cordRelief" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
        <feSpecularLighting in="blur" surfaceScale="3" specularConstant="0.8" specularExponent="20" lightingColor="#ffffff" result="specOut">
          <fePointLight x="-50" y="-100" z="200" />
        </feSpecularLighting>
        <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut" />
        <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
      </filter>
    </defs>
  </svg>
);

export default CordDefinitions;