import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background - use a cool movie backdrop */}
      <div className="absolute inset-0">
        <img 
          src="https://image.tmdb.org/t/p/original/56zTpe2xvaA4alU51DKVaYk4CO0.jpg" // Fallout backdrop or any cool one
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8 text-center">
        <h1 className="text-6xl sm:text-8xl md:text-9xl font-bold text-red-600 mb-8 drop-shadow-2xl">
          PrimeScene
        </h1>
        <p className="text-2xl sm:text-4xl md:text-5xl font-light mb-12 max-w-4xl">
          Unlimited movies, TV shows, and more.
        </p>
        <p className="text-xl sm:text-2xl mb-12 text-white/80">
          Watch anywhere. Cancel anytime.
        </p>

        <Link 
          to="/login"
          className="px-12 py-6 bg-red-600 text-white text-2xl font-bold rounded-lg hover:bg-red-700 transition shadow-2xl"
        >
          Sign up to Start Watching
        </Link>

        <p className="mt-12 text-white/60 text-lg">
          Ready to watch? Sign up to access your personal cinema.
        </p>
      </div>
    </div>
  );
}

export default Landing;