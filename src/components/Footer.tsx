import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-[#2d2e40] text-gray-300 py-8 mt-10 font-league-spartan">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Image src="/logo-colored.png" alt="Just Choose Already Logo" width={80} height={80} className="rounded-full" />
        </div>
        <div className="flex gap-6 text-sm uppercase tracking-wide">
          <Link href="/spin" className="hover:text-[#ef4e2d] transition-colors">Spin</Link>
          <a href="https://github.com/pashiav/justchoosealready" target="_blank" rel="noopener noreferrer" className="hover:text-[#ef4e2d] transition-colors">GitHub</a>
        </div>
        <div className="text-xs text-gray-500 text-center md:text-right">
          &copy; {new Date().getFullYear()} Just Choose Already <br />
          Powered by Google Maps API and OpenStreetMap
        </div>
      </div>
    </footer>
  );
}
