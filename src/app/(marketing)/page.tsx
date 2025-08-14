import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen relative">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-2 text-center relative z-10">

        <div className="max-w-5xl mx-auto flex flex-col gap-y-4">
          <h1 className="text-6xl font-lilita text-[#2d2e40] mb-8 uppercase mt-12 tracking-wide">
           Stop Debating. Start Eating.
          </h1>
          
            <Link href="/spin">
              <Button size="lg" className="-mt-3 text-[3rem] font-bold w-auto h-auto px-4 py-1 bg-[#ef4e2d] border-b-8 border-[#c83e22] font-league-spartan transition-all duration-200 uppercase rounded-2xl hover:bg-[#e03c24] hover:border-[#b32f1a] hover:cursor-pointer">
               Spin Now
              </Button>
            </Link>
          <img src="full-logo.png" alt="Just Choose Already Logo" className="h-[18rem] w-auto align-middle mx-auto mt-2" />
        </div>
      </div>


    <div className="min-h-screen bg-gradient-to-br">
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
            <h1 className="text-5xl md:text-5xl text-[#ef4e2d] font-league-spartan mb-2 tracking-wide font-bold">
              HOW IT WORKS
            </h1>

          <div className="grid lg:grid-cols-2 gap-3 items-center font-lilita">
            {/* Steps Section */}
            <div className="space-y-12 mt-6">
              {/* Step 1 */}
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-black text-gray-800 uppercase tracking-wide transition-all duration-300 hover:text-4xl hover:text-[#ef4e2d] hover:scale-105 cursor-default">
                  STEP 1: TELL US WHERE YOU ARE
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed font-nunito tracking-wide">
                  Enter your location so we can find nearby restaurants.
                </p>
              </div>

              {/* Step 2 */}
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-black text-gray-800 uppercase tracking-wide transition-all duration-300 hover:text-4xl hover:text-[#ef4e2d] hover:scale-105 cursor-default">
                  STEP 2: SPIN THE WHEEL!
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed font-nunito tracking-wide">
                  Let fate decide where you eat.
                </p>
              </div>

              {/* Step 3 */}
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-black text-gray-800 uppercase tracking-wide transition-all duration-300 hover:text-4xl hover:text-[#ef4e2d] hover:scale-105 cursor-default">
                  STEP 3: GO EAT!
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed  font-nunito tracking-wide">
                  We&apos;ll show you a spot. If you&apos;re not feeling it, spin again!
                </p>
              </div>
            </div>

            {/* Demo Section */}
            <div className="bg-gray-700 rounded-3xl p-8 shadow-2xl">
              <div className="aspect-video bg-gray-600 rounded-2xl flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">🎬</div>
                  <h3 className="text-2xl font-bold mb-2">Demo gif</h3>
                  <p className="text-gray-300">Watch the wheel spin in action!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16 space-y-8">
            <Link href="/spin">
              <Button 
                size="lg" 
                className="-mt-3 text-[3rem] font-bold w-auto h-auto px-4 py-1 bg-[#ef4e2d] border-b-8 border-[#c83e22] font-league-spartan transition-all duration-200 uppercase rounded-2xl hover:bg-[#e03c24] hover:border-[#b32f1a] hover:cursor-pointer"
              >
                Try It Now!
              </Button>
            </Link>
            
            </div>
          </div>
        </div>
      </div>
    </div>



  )
}
