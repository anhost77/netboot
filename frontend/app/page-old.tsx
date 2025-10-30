import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4">🏇 BetTracker Pro</h1>
        <p className="text-2xl mb-8">Suivez vos paris hippiques comme un pro</p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="bg-primary-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-900 transition-colors border-2 border-white"
          >
            Créer un compte
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="font-semibold mb-2">Statistiques détaillées</h3>
            <p className="text-sm opacity-90">Analysez vos performances avec des graphiques avancés</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
            <div className="text-4xl mb-3">💰</div>
            <h3 className="font-semibold mb-2">Gestion de budget</h3>
            <p className="text-sm opacity-90">Maîtrisez vos dépenses avec des alertes intelligentes</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
            <div className="text-4xl mb-3">📱</div>
            <h3 className="font-semibold mb-2">Accessible partout</h3>
            <p className="text-sm opacity-90">Dashboard responsive pour mobile, tablette et desktop</p>
          </div>
        </div>
      </div>
    </div>
  );
}
