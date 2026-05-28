import React from 'react';
import { motion } from 'motion/react';
import { Headphones, Mail, MapPin, MessageSquare, Bot } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-28 pb-20 px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10 space-y-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-4">
                Support & <br/><span className="text-[#FFC107]">Contact</span>
              </h1>
              <p className="text-white/50 text-sm md:text-base leading-relaxed max-w-md">
                Whether you need immediate trip assistance, parcel tracking help, or business logistics support, our dedicated regional teams are standing by.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-[#121212] p-6 rounded-2xl border border-white/5">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                  <Headphones className="w-5 h-5 text-white/50" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-[#FFC107] mb-1">24/7 Helpline</div>
                  <div className="font-mono text-lg font-bold">1800-RAPDO-X9</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-[#121212] p-6 rounded-2xl border border-white/5">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white/50" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-[#FFC107] mb-1">Email Support</div>
                  <div className="font-mono text-sm text-white/80">support@rapdo.in</div>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-[#121212] p-6 rounded-2xl border border-white/5">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white/50" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-[#FFC107] mb-1">Patna HQ</div>
                  <div className="text-sm text-white/80">Kankarbagh Main Road, Patna, Bihar, 800020</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#121212] border border-white/5 p-8 md:p-10 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#FFC107]/5 rounded-full blur-[80px]" />
            <div className="relative z-10 space-y-6">
              <h3 className="text-2xl font-black uppercase tracking-wide flex items-center gap-3">
                <MessageSquare className="text-[#FFC107]" /> Issue Reporting
              </h3>
              
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                   <label className="text-xs font-black uppercase tracking-widest text-white/40 mb-2 block">Name</label>
                   <input type="text" className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#FFC107]/50 transition-colors" placeholder="Your full name" />
                </div>
                <div>
                   <label className="text-xs font-black uppercase tracking-widest text-white/40 mb-2 block">Category</label>
                   <select className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#FFC107]/50 appearance-none">
                     <option>Trip & Charge Issue</option>
                     <option>Lost Item Recovery</option>
                     <option>Captain Behavior</option>
                     <option>App Bug / Tech Support</option>
                   </select>
                </div>
                <div>
                   <label className="text-xs font-black uppercase tracking-widest text-white/40 mb-2 block">Details</label>
                   <textarea rows={4} className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#FFC107]/50 resize-none" placeholder="Describe your issue..."></textarea>
                </div>
                <button type="submit" className="w-full py-4 bg-[#FFC107] hover:bg-[#FFB300] text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-lg transition-all">
                  Submit Ticket
                </button>
              </form>

              <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between">
                <div className="text-xs text-white/50 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#FFC107]" /> Or ask RAPDO AI
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
