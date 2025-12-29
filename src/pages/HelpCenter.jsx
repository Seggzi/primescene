import { Plus } from 'lucide-react';

function HelpCenter() {
  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6 md:px-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black mb-12 text-center">Help Center</h1>
        <p className="text-xl text-gray-400 text-center mb-16 max-w-3xl mx-auto">
          Find answers to common questions and learn how to get the most out of PrimeScene.
        </p>

        <div className="space-y-8">
          <div className="bg-zinc-900/70 rounded-3xl p-10 border border-white/10">
            <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer text-lg font-bold py-4">
                  Is PrimeScene free to use?
                  <Plus className="w-6 h-6 group-open:rotate-45 transition-transform" />
                </summary>
                <p className="text-gray-300 pb-4">
                  Yes! PrimeScene is completely free. No subscription or payment required for unlimited streaming.
                </p>
              </details>

              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer text-lg font-bold py-4">
                  What devices can I use?
                  <Plus className="w-6 h-6 group-open:rotate-45 transition-transform" />
                </summary>
                <p className="text-gray-300 pb-4">
                  Any device with a web browser: phones, tablets, laptops, smart TVs. No app download needed.
                </p>
              </details>

              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer text-lg font-bold py-4">
                  Do you have Nollywood movies?
                  <Plus className="w-6 h-6 group-open:rotate-45 transition-transform" />
                </summary>
                <p className="text-gray-300 pb-4">
                  Yes! We have one of the largest collections of Nollywood films — classics and new releases.
                </p>
              </details>

              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer text-lg font-bold py-4">
                  Will there be a Premium plan?
                  <Plus className="w-6 h-6 group-open:rotate-45 transition-transform" />
                </summary>
                <p className="text-gray-300 pb-4">
                  Coming soon! Premium will include offline downloads, 4K, multiple profiles, and exclusives.
                </p>
              </details>
            </div>
          </div>

          {/* Contact Buttons */}
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold">Need Help?</h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a 
                href="mailto:support@primescene.com"
                className="px-12 py-4 bg-red-600 rounded-full font-bold hover:bg-red-700 transition"
              >
                Email Support
              </a>
              <a 
                href="https://instagram.com/primescene" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold hover:opacity-90 transition"
              >
                Instagram @PrimeSceneNG
              </a>
            </div>
            <p className="text-gray-500">
              We typically respond within 1 hour • 24/7 support coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpCenter;