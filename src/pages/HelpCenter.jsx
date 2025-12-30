// src/pages/HelpCenter.jsx - FULL VERSION WITH ALL FEATURES + ALL FAQs RESTORED

import { Search, Mail, ChevronRight, HelpCircle, Shield, Users, Tv, Film, Headphones, ThumbsUp, ThumbsDown, MessageCircle, Star, PlayCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const toggleFAQ = (id) => setExpandedFAQ(expandedFAQ === id ? null : id);

  const handleFeedback = (id, helpful) => {
    setFeedbackGiven(prev => ({ ...prev, [id]: helpful }));
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    console.log('Feedback:', { email: feedbackEmail, message: feedbackMessage });
    setFeedbackSent(true);
    setTimeout(() => {
      setShowFeedbackForm(false);
      setFeedbackEmail('');
      setFeedbackMessage('');
      setFeedbackSent(false);
    }, 3000);
  };

  // ALL 22 FAQs RESTORED with related links
  const faqs = [
    { id: 1, q: "How do I sign in?", a: "Use Google or email/password on the login page. Session stays active.", related: [5, 12] },
    { id: 2, q: "Is PrimeScene free?", a: "Yes — 100% free forever. No subscription required.", related: [14] },
    { id: 3, q: "Multiple devices supported?", a: "Yes. Sign in on phone, tablet, laptop, or TV. Cloud sync coming soon.", related: [11] },
    { id: 4, q: "Nollywood content?", a: "Largest collection — classics, new releases, Yoruba epics, exclusives.", related: [] },
    { id: 5, q: "Forgot password?", a: "Click 'Forgot password?' on login → enter email → check inbox.", related: [1, 12] },
    { id: 6, q: "Offline downloads?", a: "Coming soon with Premium plan.", related: [14] },
    { id: 7, q: "Multiple profiles?", a: "Manage Profile → Add Profile (up to 5, more with Premium).", related: [8] },
    { id: 8, q: "Kids Mode?", a: "Safe content with PIN protection and age ratings.", related: [7] },
    { id: 9, q: "Contact support?", a: "Email support@primescene.com or DM @primescene on Instagram.", related: [] },
    { id: 10, q: "Video buffering?", a: "Check internet speed (5Mbps+ for HD). Lower quality if needed.", related: [21] },
    { id: 11, q: "Cast to TV?", a: "Yes — Chromecast, AirPlay, or smart TV browser.", related: [3] },
    { id: 12, q: "Change email?", a: "Account Settings → Change Email (requires password).", related: [1] },
    { id: 13, q: "Data privacy?", a: "We never sell your data. Watch history is private.", related: [] },
    { id: 14, q: "Premium launch?", a: "Soon — 4K, downloads, more profiles, exclusives.", related: [2, 6] },
    { id: 15, q: "App for phones/TV?", a: "Web works everywhere. Native apps coming soon.", related: [3] },
    { id: 16, q: "How do I delete my account?", a: "Contact support@primescene.com — we'll help permanently delete it.", related: [9] },
    { id: 17, q: "Why is video quality low?", a: "We auto-adjust based on connection. Manual control in player.", related: [10] },
    { id: 18, q: "Can I change profile PIN?", a: "Manage Profile → PIN Lock → Change PIN.", related: [8] },
    { id: 19, q: "Subtitles available?", a: "Yes on most titles. Click subtitle icon during playback.", related: [] },
    { id: 20, q: "How do I report a bug?", a: "Email support or DM us with details.", related: [9] },
    { id: 21, q: "What internet speed do I need?", a: "3Mbps for SD, 5Mbps for HD, 15Mbps+ for 4K.", related: [10] },
    { id: 22, q: "Can I skip intros?", a: "Yes! 'Skip Intro' button appears on supported shows.", related: [] },
  ];

  const filteredFAQs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const lower = searchQuery.toLowerCase();
    return faqs.filter(f => f.q.toLowerCase().includes(lower) || f.a.toLowerCase().includes(lower));
  }, [searchQuery]);

  const getRelated = (ids) => faqs.filter(f => ids.includes(f.id));

  // Video Tutorials (replace URLs/thumbnails when you have real videos)
  const videoTutorials = [
    {
      title: "How to Create a Profile",
      desc: "Add and manage multiple profiles in under 30 seconds",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    {
      title: "Enable Kids Mode & PIN Protection",
      desc: "Keep children safe with age ratings and PIN lock",
      thumbnail: "https://img.youtube.com/vi/3tmd-ClpJxA/maxresdefault.jpg",
      url: "https://www.youtube.com/embed/3tmd-ClpJxA"
    },
    {
      title: "Add Movies to My List",
      desc: "Save your favorites for quick access later",
      thumbnail: "https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg",
      url: "https://www.youtube.com/embed/kJQP7kiw5Fk"
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-16 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Help Center</h1>
          <p className="text-gray-400">Quick answers and video guides</p>
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
        </div>

        {/* Video Tutorials */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <PlayCircle size={32} className="text-red-500" />
            Video Tutorials
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {videoTutorials.map((video, i) => (
              <div key={i} className="bg-zinc-900/60 rounded-xl overflow-hidden border border-white/10 hover:border-red-600/40 transition group">
                <div className="relative">
                  <img src={video.thumbnail} alt={video.title} className="w-full aspect-video object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <PlayCircle size={64} className="text-white drop-shadow-2xl" />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold mb-2">{video.title}</h3>
                  <p className="text-sm text-gray-400 mb-4">{video.desc}</p>
                  <a 
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-500 hover:underline text-sm font-medium flex items-center gap-2"
                  >
                    Watch tutorial →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Searches */}
        {!searchQuery && (
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

        {/* FAQ */}
        <div className="space-y-3 mb-12">
          {filteredFAQs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No matching questions found.</p>
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

                    {/* Rate this article */}
                    <div className="mb-4">
                      <p className="text-gray-500 text-xs mb-2">Rate this article:</p>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(star => (
                          <Star key={star} size={20} className="text-yellow-500 hover:fill-yellow-500 transition cursor-pointer" />
                        ))}
                      </div>
                    </div>

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
                        <p className="text-green-500 text-xs ml-4">Thanks!</p>
                      )}
                    </div>

                    {/* Related Articles */}
                    {faq.related?.length > 0 && (
                      <div>
                        <p className="text-gray-500 text-xs mb-2">Related:</p>
                        <div className="flex flex-wrap gap-3">
                          {getRelated(faq.related).map(rel => (
                            <button
                              key={rel.id}
                              onClick={() => toggleFAQ(rel.id)}
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

        {/* Contact + Feedback */}
        <div className="bg-zinc-900/50 rounded-lg p-8 text-center border border-white/10">
          <MessageCircle size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-3">Still need help?</h2>
          <p className="text-gray-400 text-sm mb-6">
            Contact our support team — available 24/7
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
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

          {/* Feedback Form */}
          {!showFeedbackForm ? (
            <button
              onClick={() => setShowFeedbackForm(true)}
              className="text-red-400 hover:underline text-sm"
            >
              Send feedback or report an issue
            </button>
          ) : (
            <div className="mt-6 max-w-md mx-auto">
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <input
                  type="email"
                  placeholder="Your email (optional)"
                  value={feedbackEmail}
                  onChange={(e) => setFeedbackEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 rounded text-sm"
                />
                <textarea
                  placeholder="Describe your issue or suggestion..."
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  required
                  rows="4"
                  className="w-full px-4 py-2 bg-zinc-800 rounded text-sm"
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-red-600 rounded hover:bg-red-700 transition text-sm"
                  >
                    Send
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFeedbackForm(false)}
                    className="px-6 py-2 border border-white/20 rounded hover:bg-white/10 transition text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
              {feedbackSent && (
                <p className="text-green-500 text-sm mt-4">Thank you! Feedback sent.</p>
              )}
            </div>
          )}
        </div>

        {/* Featured Article */}
        <div className="mt-12 bg-gradient-to-r from-red-900/30 to-zinc-900 rounded-lg p-6 border border-red-600/30">
          <div className="flex items-center gap-4">
            <Star size={32} className="text-yellow-500" />
            <div>
              <h3 className="font-bold">Featured: How to use Kids Mode safely</h3>
              <p className="text-sm text-gray-400">Set PINs and age ratings for family viewing</p>
            </div>
            <ChevronRight size={24} className="ml-auto text-red-500" />
          </div>
        </div>

        <p className="text-center text-gray-600 mt-10 text-xs">
          Last updated: December 2025 • Article ID: HC-001
        </p>
      </div>
    </div>
  );
}

export default HelpCenter;