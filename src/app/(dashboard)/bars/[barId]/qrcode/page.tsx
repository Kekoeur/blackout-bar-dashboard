// apps/bar-dashboard/src/app/(dashboard)/bars/[barId]/qrcode/page.tsx

'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useBarStore } from '@/store/barStore';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Palette, Settings } from 'lucide-react';
import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import api from '@/lib/api';

export default function QRCodePage() {
  const params = useParams();
  const barId = params.barId as string;
  const { bars } = useBarStore();
  const bar = bars.find((b) => b.id === barId);
  const qrRef = useRef<HTMLDivElement>(null);

  // Configuration du QR Code
  const [config, setConfig] = useState({
    size: 512,
    fgColor: '#000000',
    bgColor: '#ffffff',
    level: 'H' as 'L' | 'M' | 'Q' | 'H',
    includeMargin: true,
    imageSettings: {
      src: '',
      height: 0,
      width: 0,
      excavate: true,
    },
  });

  const [showLogo, setShowLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');

  // Données du QR Code
  const qrData = JSON.stringify({
    type: 'bar',
    barId: barId,
    name: bar?.name || 'Unknown Bar',
  });

  // Télécharger en PNG
  const downloadPNG = async () => {
    if (!qrRef.current) return;
    
    const canvas = await html2canvas(qrRef.current, {
      backgroundColor: config.bgColor,
      scale: 2,
    });
    
    const link = document.createElement('a');
    link.download = `qrcode-${bar?.name || 'bar'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Télécharger en JPG
  const downloadJPG = async () => {
    if (!qrRef.current) return;
    
    const canvas = await html2canvas(qrRef.current, {
      backgroundColor: config.bgColor,
      scale: 2,
    });
    
    const link = document.createElement('a');
    link.download = `qrcode-${bar?.name || 'bar'}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 1.0);
    link.click();
  };

  // Télécharger en PDF
  const downloadPDF = async () => {
    if (!qrRef.current) return;
    
    const canvas = await html2canvas(qrRef.current, {
      backgroundColor: config.bgColor,
      scale: 2,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    // Centrer le QR code sur la page A4
    const imgWidth = 100;
    const imgHeight = 100;
    const x = (210 - imgWidth) / 2; // A4 width = 210mm
    const y = (297 - imgHeight) / 2; // A4 height = 297mm
    
    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
    pdf.save(`qrcode-${bar?.name || 'bar'}.pdf`);
  };

  // Télécharger en SVG
  const downloadSVG = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = `qrcode-${bar?.name || 'bar'}.svg`;
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">QR Code du bar</h1>
          <p className="text-slate-400">
            Personnalisez et téléchargez votre QR code
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Prévisualisation */}
          <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Settings size={24} />
              Aperçu
            </h2>
            
            <div 
              ref={qrRef}
              className="flex items-center justify-center p-8 rounded-xl"
              style={{ backgroundColor: config.bgColor }}
            >
              <div className="relative">
                <QRCodeSVG
                  value={qrData}
                  size={config.size}
                  bgColor={config.bgColor}
                  fgColor={config.fgColor}
                  level={config.level}
                  includeMargin={config.includeMargin}
                  imageSettings={
                    showLogo && logoUrl
                      ? {
                          src: logoUrl,
                          height: config.size * 0.2,
                          width: config.size * 0.2,
                          excavate: true,
                        }
                      : undefined
                  }
                />
              </div>
            </div>

            {/* Info bar */}
            <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
              <div className="text-sm text-slate-400 mb-2">Informations</div>
              <div className="text-white">
                <div className="flex justify-between mb-1">
                  <span>Bar:</span>
                  <span className="font-semibold">{bar?.name}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>ID:</span>
                  <span className="font-mono text-xs">{barId.substring(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span>Taille:</span>
                  <span className="font-semibold">{config.size}x{config.size}px</span>
                </div>
              </div>
            </div>
          </div>

          {/* Personnalisation */}
          <div className="space-y-6">
            {/* Couleurs */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Palette size={20} />
                Couleurs
              </h3>

              <div className="space-y-4">
                {/* Couleur principale */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Couleur du QR Code
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={config.fgColor}
                      onChange={(e) => setConfig({ ...config, fgColor: e.target.value })}
                      className="w-16 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.fgColor}
                      onChange={(e) => setConfig({ ...config, fgColor: e.target.value })}
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>

                {/* Couleur de fond */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Couleur de fond
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={config.bgColor}
                      onChange={(e) => setConfig({ ...config, bgColor: e.target.value })}
                      className="w-16 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.bgColor}
                      onChange={(e) => setConfig({ ...config, bgColor: e.target.value })}
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>

                {/* Presets de couleurs */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Thèmes prédéfinis
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { name: 'Classique', fg: '#000000', bg: '#ffffff' },
                      { name: 'Orange', fg: '#ea580c', bg: '#fff7ed' },
                      { name: 'Bleu', fg: '#0284c7', bg: '#f0f9ff' },
                      { name: 'Violet', fg: '#9333ea', bg: '#faf5ff' },
                      { name: 'Rose', fg: '#ec4899', bg: '#fdf2f8' },
                      { name: 'Vert', fg: '#16a34a', bg: '#f0fdf4' },
                      { name: 'Sombre', fg: '#ffffff', bg: '#0f172a' },
                      { name: 'Rouge', fg: '#dc2626', bg: '#fef2f2' },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => setConfig({ ...config, fgColor: preset.fg, bgColor: preset.bg })}
                        className="p-2 rounded-lg border-2 border-slate-700 hover:border-orange-500 transition-colors"
                        style={{ background: `linear-gradient(135deg, ${preset.bg} 50%, ${preset.fg} 50%)` }}
                        title={preset.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Paramètres */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Settings size={20} />
                Paramètres
              </h3>

              <div className="space-y-4">
                {/* Taille */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Taille: {config.size}px
                  </label>
                  <input
                    type="range"
                    min="256"
                    max="1024"
                    step="64"
                    value={config.size}
                    onChange={(e) => setConfig({ ...config, size: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>256px</span>
                    <span>1024px</span>
                  </div>
                </div>

                {/* Niveau de correction */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Correction d'erreur
                  </label>
                  <select
                    value={config.level}
                    onChange={(e) => setConfig({ ...config, level: e.target.value as any })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  >
                    <option value="L">Faible (7%)</option>
                    <option value="M">Moyen (15%)</option>
                    <option value="Q">Élevé (25%)</option>
                    <option value="H">Maximum (30%) - Recommandé pour logo</option>
                  </select>
                </div>

                {/* Marge */}
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.includeMargin}
                      onChange={(e) => setConfig({ ...config, includeMargin: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-slate-300">Inclure une marge</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Logo */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">Logo central</h3>

              <div className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showLogo}
                    onChange={(e) => setShowLogo(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-slate-300">Ajouter un logo</span>
                </label>

                {showLogo && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      URL du logo
                    </label>
                    <input
                      type="url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      ⚠️ Le logo doit être carré et sur fond transparent (PNG)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Téléchargement */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Download size={20} />
                Télécharger
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={downloadPNG}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  PNG
                </button>
                <button
                  onClick={downloadJPG}
                  className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  JPG
                </button>
                <button
                  onClick={downloadSVG}
                  className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  SVG
                </button>
                <button
                  onClick={downloadPDF}
                  className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}