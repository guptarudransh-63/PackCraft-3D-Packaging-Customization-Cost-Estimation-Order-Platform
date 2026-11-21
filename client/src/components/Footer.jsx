import React from 'react';
import { Box, ShieldCheck, Recycle, CheckCircle2, Award, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-charcoal-950 text-charcoal-300 pt-16 pb-12 border-t border-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Quality & Certification strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-charcoal-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-charcoal-900 border border-charcoal-800 flex items-center justify-center text-kraft-400">
              <Recycle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider font-mono">100% Recyclable</h4>
              <p className="text-[11px] text-charcoal-400">Curbside pulp & corrugated</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-charcoal-900 border border-charcoal-800 flex items-center justify-center text-kraft-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider font-mono">FSC Certified</h4>
              <p className="text-[11px] text-charcoal-400">Responsible forestry sourcing</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-charcoal-900 border border-charcoal-800 flex items-center justify-center text-kraft-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider font-mono">ISO 9001 Plant</h4>
              <p className="text-[11px] text-charcoal-400">Precision die tolerances ±1mm</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-charcoal-900 border border-charcoal-800 flex items-center justify-center text-kraft-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider font-mono">Prepress Verified</h4>
              <p className="text-[11px] text-charcoal-400">1:1 PDF die proof guarantee</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 py-12 border-b border-charcoal-850">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-kraft-400 text-charcoal-950 flex items-center justify-center font-bold">
                <Box className="w-4 h-4 text-charcoal-950" />
              </div>
              <span className="font-display font-extrabold text-xl text-white tracking-tight">PackCraft</span>
            </div>
            <p className="text-xs text-charcoal-400 leading-relaxed max-w-sm mb-6">
              Industrial packaging configuration, parametric 3D visualization, dynamic manufacturing pricing, and order fulfillment platform for direct-to-consumer and retail brands.
            </p>
            <div className="font-mono text-xs text-kraft-400">
              Plant & HQ: Industrial District, Austin, TX 78701
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-4">Packaging Styles</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/customizer" className="hover:text-white transition-colors">Roll-End Mailer Boxes</Link></li>
              <li><Link to="/customizer" className="hover:text-white transition-colors">Folding Paperboard Cartons</Link></li>
              <li><Link to="/customizer" className="hover:text-white transition-colors">2-Piece Luxury Rigid Boxes</Link></li>
              <li><Link to="/customizer" className="hover:text-white transition-colors">Corrugated Shipping Cartons</Link></li>
              <li><Link to="/customizer" className="hover:text-white transition-colors">Gusseted Kraft Shopping Bags</Link></li>
              <li><Link to="/customizer" className="hover:text-white transition-colors">Slide Product Sleeves</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-4">Substrates & Finishes</h5>
            <ul className="space-y-2 text-xs">
              <li><span className="text-charcoal-400">Natural Kraft E-Flute / B-Flute</span></li>
              <li><span className="text-charcoal-400">Bleached White SBS Boxboard</span></li>
              <li><span className="text-charcoal-400">1.8mm & 2.5mm Greyboard</span></li>
              <li><span className="text-charcoal-400">Matte & Gloss UV Coatings</span></li>
              <li><span className="text-charcoal-400">Soft-Touch Sensory Velvet</span></li>
              <li><span className="text-charcoal-400">Hot Foil & Spot Gloss Accents</span></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-4">Platform & Support</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/catalogue" className="hover:text-white transition-colors">Product Catalogue</Link></li>
              <li><Link to="/customizer" className="hover:text-white transition-colors">Interactive 3D Studio</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Customer Portal</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Admin Dashboard</Link></li>
              <li><span className="text-charcoal-500 font-mono text-[10px]">API v1.0 / Node-Mongoose Engine</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-charcoal-500 gap-4">
          <p>© {new Date().getFullYear()} PackCraft Technologies Inc. All rights reserved. Industrial packaging platform.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-charcoal-400 cursor-pointer">FEFCO Compliance</span>
            <span className="hover:text-charcoal-400 cursor-pointer">Privacy & Terms</span>
            <span className="hover:text-charcoal-400 cursor-pointer">Material Traceability</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
