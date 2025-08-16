import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaClock, FaVideo } from "react-icons/fa6";
import { LuFerrisWheel } from "react-icons/lu";
import { MdPhoneAndroid, MdStars } from "react-icons/md";
import { BsArrowsMove } from "react-icons/bs";
import { GiSpiderMask } from "react-icons/gi";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center hero-section -mt-[4rem]">
        <div className="container mx-auto px-6 py-0 text-center relative z-10">
          <div className="max-w-6xl mx-auto space-y-10">
            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-lilita text-[#2d2e40] leading-tight tracking-tight">
                Stop Debating.
                <br />
                <span className="text-[#ef4e2d]">Start Eating.</span>
              </h1>
            </div>

            {/* CTA Button */}
            <div className="space-y-6">
              <Link href="/spin">
                <Button
                  size="lg"
                  className="text-2xl md:text-3xl font-bold px-12 py-6 bg-[#ef4e2d] border-b-8 border-[#c83e22] font-league-spartan transition-all duration-300 uppercase rounded-3xl hover:bg-[#e03c24] hover:border-[#b32f1a] hover:scale-105 transform hover:cursor-pointer"
                >
                  Spin Now
                </Button>
              </Link>

              <p className="text-sm text-gray-500 font-nunito">
                It only takes 3 seconds to decide
              </p>
            </div>

            {/* Logo */}
            <div className="pt-2">
              <img
                src="full-logo.png"
                alt="Just Choose Already Logo"
                className="h-60 md:h-60 w-auto mx-auto opacity-90 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sound Familiar Section */}
      <section className="py-24 font-nunito">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12 space-y-4">
              <h2 className="text-4xl md:text-6xl text-[#2d2e40] font-lilita uppercase tracking-wide">
                Sound Familiar?
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 font-league-spartan max-w-3xl mx-auto leading-relaxed">
                We&apos;ve all been trapped in these food decision nightmares...
              </p>
            </div>

            {/* Problem Cards */}
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {/* Card 1: The Group Chat Chaos */}
              <div className="bg-white/30 backdrop-blur-sm rounded-2xl shadow-lg border-l-4 border-[#ef4e2d] p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-[#ef4e2d]/10 rounded-full">
                    <MdPhoneAndroid className="text-3xl text-[#ef4e2d]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#2d2e40] font-league-spartan uppercase tracking-wide">
                      Group Chat Hell
                    </h3>
                    <p className="text-sm text-gray-500">
                      6 people, 0 decisions
                    </p>
                  </div>
                </div>

                <div className="space-y-1 max-h-80 overflow-hidden">
                  <div className="flex gap-2">
                    <div className="bg-[#ef4e2d] text-white px-3 py-2 rounded-2xl rounded-bl-sm text-sm max-w-[75%]">
                      Pizza?
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <div className="bg-gray-200 text-gray-800 px-3 py-2 rounded-2xl rounded-br-sm text-sm max-w-[75%]">
                      We had pizza yesterday
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="bg-[#2d2e40] text-white px-3 py-2 rounded-2xl rounded-bl-sm text-sm max-w-[75%]">
                      Thai food?
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <div className="bg-gray-200 text-gray-800 px-3 py-2 rounded-2xl rounded-br-sm text-sm max-w-[75%]">
                      Too spicy for me
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="bg-[#c83e22] text-white px-3 py-2 rounded-2xl rounded-bl-sm text-sm max-w-[75%]">
                      Sushi?
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <div className="bg-gray-200 text-gray-800 px-3 py-2 rounded-2xl rounded-br-sm text-sm max-w-[75%]">
                      I&apos;m broke
                    </div>
                  </div>
                  <div className="text-center text-xs text-gray-400 py-2">
                    <FaClock className="inline mr-1" />
                    45 minutes later...
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-bold text-[#ef4e2d]">
                      Still hungry, still arguing
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: The Review Rabbit Hole */}
              <div className="bg-white/30 backdrop-blur-sm rounded-2xl shadow-lg border-l-4 border-[#2d2e40] p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-[#2d2e40]/10 rounded-full">
                    <MdStars className="text-3xl text-[#2d2e40]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#2d2e40] font-league-spartan uppercase tracking-wide">
                      Review Paralysis
                    </h3>
                    <p className="text-sm text-gray-500">
                      The infinite scroll trap
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="border-l-4 border-green-400 bg-green-50 p-3 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-yellow-400 text-sm">★★★★★</div>
                      <span className="text-xs text-gray-500">2 days ago</span>
                    </div>
                    <p className="text-sm">
                      &ldquo;Amazing food! Best in town!&rdquo;
                    </p>
                  </div>

                  <div className="border-l-4 border-[#ef4e2d] bg-red-50 p-3 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-yellow-400 text-sm">★</div>
                      <span className="text-xs text-gray-500">1 week ago</span>
                    </div>
                    <p className="text-sm">
                      &ldquo;Worst service ever, food was cold&rdquo;
                    </p>
                  </div>

                  <div className="border-l-4 border-[#c83e22] bg-orange-50 p-3 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-yellow-400 text-sm">★★★★</div>
                      <span className="text-xs text-gray-500">3 days ago</span>
                    </div>
                    <p className="text-sm">
                      &ldquo;Pretty good, but overpriced...&rdquo;
                    </p>
                  </div>

                  <div className="text-center text-xs text-gray-400 py-2">
                    <BsArrowsMove className="inline mr-1" />
                    Scrolling for 30 minutes...
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-bold text-[#2d2e40]">
                      More confused than before
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: The Decision Standoff */}
              <div className="bg-white/30 backdrop-blur-sm rounded-2xl shadow-lg border-l-4 border-[#c83e22] p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-[#c83e22]/10 rounded-full">
                    <GiSpiderMask className="text-3xl text-[#c83e22]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#2d2e40] font-league-spartan uppercase tracking-wide">
                      Decision Standoff
                    </h3>
                    <p className="text-sm text-gray-500">
                      The classic &ldquo;you choose&rdquo; loop
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src="/spiderman.jpg"
                      alt="Spider-Man pointing meme representing food decision standoff"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="text-center">
                    <span className="text-md font-bold text-[#ef4e2d]">
                      &quot;I literally don&apos;t care&quot;
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-16">
              <div className="bg-gradient-to-r from-[#ef4e2d]/15 to-[#ef4e2d]/25 backdrop-blur-sm rounded-3xl p-8 border-2 border-dashed border-[#ef4e2d]/40 shadow-lg">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-[#ef4e2d] rounded-full">
                    <LuFerrisWheel className="text-4xl text-white" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-[#ef4e2d] font-lilita mb-4 uppercase">
                  Break The Cycle
                </h3>
                <p className="text-xl text-gray-700 font-nunito mb-6 max-w-2xl mx-auto">
                  One spin ends the madness. No more debates, no more analysis
                  paralysis. Just good food, chosen by fate.
                </p>
                <Link href="/spin">
                  <Button
                    size="lg"
                    className="text-xl font-bold px-8 py-4 bg-[#ef4e2d] border-b-4 border-[#c83e22] font-league-spartan transition-all duration-300 uppercase rounded-2xl hover:bg-[#e03c24] hover:border-[#b32f1a] hover:scale-105 hover:cursor-pointer transform shadow-lg"
                  >
                    Just Spin Already
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-20 space-y-6">
              <h2 className="text-4xl md:text-6xl text-[#ef4e2d] font-lilita uppercase tracking-wide">
                How It Works
              </h2>
              {/* API Access Info */}
              <div className="mt-0">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">
                    <span className="font-semibold text-[#ef4e2d]">
                      Free APIs:
                    </span>{" "}
                    OpenStreetMap for everyone, Google Maps for premium accounts
                  </span>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center -mt-4">
              {/* Steps */}
              <div className="space-y-12">
                {/* Step 1 */}
                <div className="group">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-[#ef4e2d] rounded-2xl flex items-center justify-center text-white text-2xl font-bold font-league-spartan group-hover:scale-110 transition-transform duration-300">
                      1
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-800 font-league-spartan uppercase tracking-wide group-hover:text-[#ef4e2d] transition-colors duration-300">
                        Tell Us Where You Are
                      </h3>
                      <p className="text-lg text-gray-600 font-nunito leading-relaxed">
                        Enter your location so we can find nearby restaurants.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="group">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-[#ef4e2d] rounded-2xl flex items-center justify-center text-white text-2xl font-bold font-league-spartan group-hover:scale-110 transition-transform duration-300">
                      2
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-800 font-league-spartan uppercase tracking-wide group-hover:text-[#ef4e2d] transition-colors duration-300">
                        Spin The Wheel!
                      </h3>
                      <p className="text-lg text-gray-600 font-nunito leading-relaxed">
                        Let fate decide where you eat.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="group">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-[#ef4e2d] rounded-2xl flex items-center justify-center text-white text-2xl font-bold font-league-spartan group-hover:scale-110 transition-transform duration-300">
                      3
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-800 font-league-spartan uppercase tracking-wide group-hover:text-[#ef4e2d] transition-colors duration-300">
                        Go Eat!
                      </h3>
                      <p className="text-lg text-gray-600 font-nunito leading-relaxed">
                        We&apos;ll show you a spot. If you&apos;re
                        reallyyyyyyyyyyyy not feeling it, spin again!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Demo Section */}
              <div className="bg-white/80 rounded-3xl px-8 pt-4 pb-12 border-r-4 border-b-4 border-[#3d3d3d] overflow-hidden shadow-xl">
                <div className="aspect-video rounded-2xl flex items-center justify-center">
                  <div className="relative text-center text-white space-y-4 w-full">
                    <h3 className="tracking-widest flex justify-center gap-2 text-2xl font-bold font-league-spartan text-[#3d3d3d] uppercase z-20">
                      Demo <FaVideo className="mt-[0.1rem]"/>
                    </h3>
                    <div className="w-full max-w-sm md:max-w-md lg:max-w-lg mx-auto overflow-hidden rounded-2xl mt-0">
                      <img
                        src="/demo.gif"
                        alt="Demo Video"
                        className="w-full h-auto object-contain rounded-2xl"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center mt-20">
              <Link href="/spin">
                <Button
                  size="lg"
                  className="text-2xl md:text-3xl font-bold px-12 py-6 bg-[#ef4e2d] border-b-8 border-[#c83e22] font-league-spartan transition-all duration-300 uppercase rounded-3xl hover:bg-[#e03c24] hover:border-[#b32f1a] hover:scale-105 hover:cursor-pointer transform"
                >
                  Try It Now!
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
