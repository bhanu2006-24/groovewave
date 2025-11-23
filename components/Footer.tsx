import React from 'react';
import { Github, Linkedin, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-12 mt-auto pb-32 md:pb-12"> 
      {/* Extra padding bottom for mobile player spacing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold text-white">GrooveWave</h3>
            <p className="text-slate-500 text-sm mt-1">
              Music discovery made simple. No ads, just vibes.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-3">
             <span className="text-slate-400 text-sm font-medium">Connect with the Developer</span>
             <div className="flex flex-wrap justify-center gap-4">
                <a 
                  href="https://github.com/bhanu2006-24" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 hover:text-cyan-400 transition-all duration-200 text-slate-300 group border border-slate-700/50 hover:border-cyan-500/50"
                >
                  <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">bhanu2006-24</span>
                </a>
                
                <a 
                  href="https://www.linkedin.com/in/bhanu-saini-3bb251391/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 hover:text-blue-400 transition-all duration-200 text-slate-300 group border border-slate-700/50 hover:border-blue-500/50"
                >
                  <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Bhanu Saini</span>
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
             </div>
          </div>

        </div>
        
        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-slate-600 text-sm flex flex-col md:flex-row justify-center items-center gap-4">
          <p>&copy; {new Date().getFullYear()} GrooveWave.</p>
          <span className="hidden md:inline text-slate-700">•</span>
          <p>Powered by iTunes Search API</p>
        </div>
      </div>
    </footer>
  );
};