// src/pages/HelpCenter.jsx - FINAL PROFESSIONAL HELP CENTER WITH ALL SUGGESTIONS

import { Search, Mail, ChevronRight, HelpCircle, Shield, Users, Tv, Film, Headphones, ThumbsUp, ThumbsDown, MessageCircle, Star, Zap } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [feedbackGiven, setFeedbackGiven] = useState({}); // Track feedback per FAQ

  const toggleFAQ = (id) => setExpandedFAQ(expandedFAQ === id ? null : id);

  const handleFeedback = (id, helpful) => {
    setFeedbackGiven(prev => ({ ...prev, [id]: helpful }));
  };

  // Bulkier FAQ list with related articles
  const faqs = [
    { id: 1, q: "How do I sign in to PrimeScene?", a: "Use Google or email/password on the login page. Your session stays active across devices.", related: [2, 5, 12] },
    { id: 2, q: "Is PrimeScene completely free?", a: "Yes — 100% free forever. No subscription or payment required.", related: [14, 6] },
    { id: 3, q: "Can I watch on multiple devices?", a: "Yes. Sign in on phone, tablet, laptop, or TV. Cloud sync coming soon.", related: [11, 15] },
    { id: 4, q: "What kind of Nollywood content do you have?", a: "Largest collection — classics, new releases, Yoruba epics, and exclusive titles.", related: [13] },
    { id: 5, q: "Forgot password?", a: "Click 'Forgot password?' on login → enter email → check inbox for reset link.", related: [1, 12] },
    { id: 6, q: "Offline downloads?", a: "Coming soon with Premium plan.", related: [2, 14] },
    { id: 7, q: "How do I create multiple profiles?", a: "Manage Profile → Add Profile (up to 5, more with Premium).", related: [8, 3] },
    { id: 8, q: "What is Kids Mode?", a: "Safe content with PIN protection and age ratings for family safety.", related: [7, 5] },
    { id: 9, q: "How do I contact support?", a: "Email support@primescene.com or DM @primescene on Instagram.", related: [] },
    { id: 10, q: "Video buffering issues?", a: "Check internet speed (5Mbps+ for HD). Lower quality in settings if needed.", related: [11, 21] },
    { id: 11, q: "How do I cast to TV?", a: "Use Chromecast, AirPlay, or smart TV browser.", related: [3, 10] },
    { id: 12, q: "How do I change my email?", a: "Account Settings → Change Email (requires password confirmation).", related: [1, 5] },
    { id: 13, q: "Is my data private?", a: "Yes! We never sell your data. Watch history is private and used only for recommendations.", related: [8] },
    { id: 14, q: "When is Premium launching?", a: "Very soon — includes 4K, downloads, more profiles, exclusives.", related: [2, 6] },
    { id: 15, q: "Native apps for phones/TV?", a: "Web works everywhere. Native apps coming soon.", related: [3] },
    { id: 16, q: "How do I delete my account?", a: "Contact support@primescene.com — we'll help permanently delete it.", related: [9] },
    { id: 17, q: "Why is video quality low?", a: "We auto-adjust based on connection. Manual control in player settings.", related: [10] },
    { id: 18, q: "Can I change profile PIN?", a: "Manage Profile → PIN Lock → Change PIN.", related: [8] },
    { id: 19, q: "Are subtitles available?", a: "Yes on most titles. Click subtitle icon during playback.", related: [] },
    { id: 20, q: "How do I report a bug?", a: "Email support or DM us with details and screenshots.", related: [9] },
    { id: 21, q: "Recommended internet speed?", a: "3Mbps SD, 5Mbps HD, 15Mbps+ 4K (Premium).", related: [10, 17] },
    { id: 22, q: "Can I skip intros?", a: "Yes! 'Skip Intro' appears on supported shows.", related: [] },
  ];

  const filteredFAQs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const lowerQuery = searchQuery.toLowerCase();
    return faqs.filter(faq => 
      faq.q.toLowerCase().includes(lowerQuery) || 
      faq.a.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery]);

  const getRelatedFAQs = (relatedIds) => {
    return faqs.filter(faq => relatedIds.includes(faq.id));
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-16 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Hero with Quick Links */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Help Center</h1>
          <p className="text-gray-400 mb-8">Quick answers to common questions</p>
          
          {/* Quick Links */}
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            <Link to="/help/account" className="px-5 py-2 bg-zinc-900 rounded-full text-sm hover:bg-red-600/30 transition">Account & Login</Link>
            <Link to="/help/profiles" className="px-5 py-2 bg-zinc-900 rounded-full text-sm hover:bg-red-600/30 transition">Profiles & Kids</Link>
            <Link to="/help/streaming" className="px-5 py-2 bg-zinc-900 rounded-full text-sm hover:bg-red-600/30 transition">Streaming Issues</Link>
            <Link to="/help/contact" className="px-5 py-2 bg-zinc-900 rounded-full text-sm hover:bg-red-600/30 transition">Contact Support</Link>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FAQs..."
              className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:border-red-600 focus:outline-none transition text-sm"
            />
          </div>
          {searchQuery && (
            <p className="text-right text-xs text-gray-500 mt-2">
              {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        {/* Popular Searches */}
        { !searchQuery && (
          <div className="mb-10">
            <p className="text-gray-500 text-sm mb-3">Popular searches:</p>
            <div className="flex flex-wrap gap-2">
              {["login problem", "kids mode", "forgot password", "nollywood", "buffering", "cast to tv"].map(term => (
                <button
                  key={term}
                  onClick={() => setSearchQuery(term)}
                  className="px-4 py-1 bg-zinc-900/60 rounded-full text-xs hover:bg-red-600/30 transition"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FAQ with feedback & related */}
        <div className="space-y-3 mb-12">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No matching questions found.</p>
              <p className="text-gray-600 text-sm mt-2">Try different keywords or contact support.</p>
            </div>
          ) : (
            filteredFAQs.map((faq) => (
              <div key={faq.id} className="bg-zinc-900/40 rounded-lg border border-white/10">
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full text-left p-4 flex items-center justify-between hover:bg-zinc-800/50 transition rounded-lg group"
                >
                  <h3 className="font-medium text-sm pr-4 group-hover:text-red-400 transition">
                    {faq.q}
                  </h3>
                  <ChevronRight size={18} className={`text-red-500 transition-transform ${expandedFAQ === faq.id ? 'rotate-90' : ''}`} />
                </button>
                {expandedFAQ === faq.id && (
                  <div className="px-4 pb-5 border-t border-white/5 mt-2">
                    <p className="text-gray-300 text-sm leading-relaxed mb-5">
                      {faq.a}
                    </p>

                    {/* Was this helpful? */}
                    <div className="flex items-center gap-6 mb-4">
                      <p className="text-gray-500 text-xs">Was this helpful?</p>
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleFeedback(faq.id, true)}
                          disabled={feedbackGiven[faq.id] !== undefined}
                          className="flex items-center gap-2 text-xs hover:text-green-400 transition disabled:opacity-50"
                        >
                          <ThumbsUp size={16} />
                          Yes
                        </button>
                        <button
                          onClick={() => handleFeedback(faq.id, false)}
                          disabled={feedbackGiven[faq.id] !== undefined}
                          className="flex items-center gap-2 text-xs hover:text-red-400 transition disabled:opacity-50"
                        >
                          <ThumbsDown size={16} />
                          No
                        </button>
                      </div>
                      {feedbackGiven[faq.id] !== undefined && (
                        <p className="text-green-500 text-xs ml-4">Thanks for your feedback!</p>
                      )}
                    </div>

                    {/* Related Articles */}
                    {faq.related && faq.related.length > 0 && (
                      <div>
                        <p className="text-gray-500 text-xs mb-2">Related articles:</p>
                        <div className="flex flex-wrap gap-2">
                          {getRelatedFAQs(faq.related).map(rel => (
                            <button
                              key={rel.id}
                              onClick={() => {
                                toggleFAQ(rel.id);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="text-xs text-red-400 hover:underline"
                            >
                              {rel.q}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Still need help section */}
        <div className="bg-zinc-900/50 rounded-lg p-8 text-center border border-white/10">
          <MessageCircle size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-3">Still can't find what you're looking for?</h2>
          <p className="text-gray-400 text-sm mb-6">
            Try searching again or contact our support team
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:support@primescene.com"
              className="px-8 py-3 bg-red-600 rounded-lg font-medium hover:bg-red-700 transition flex items-center justify-center gap-2 text-sm"
            >
              <Mail size={18} />
              Email Support
            </a>
            <a 
              href="https://instagram.com/primescene"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium hover:opacity-90 transition flex items-center justify-center gap-2 text-sm"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Instagram DM
            </a>
          </div>
          <p className="text-gray-500 text-xs mt-6">
            Average response time: under 1 hour • Last updated: December 2025
          </p>
        </div>

        <p className="text-center text-gray-600 mt-10 text-xs">
          © 2025 PrimeScene • Made with ❤️ in Nigeria
        </p>
      </div>
    </div>
  );
}

export default HelpCenter;