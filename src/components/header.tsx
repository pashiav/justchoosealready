"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession, signIn, signOut } from "next-auth/react";
import { FaUser, FaSignOutAlt } from "react-icons/fa";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="font-lilita uppercase bg-transparent relative z-20 w-full">
      <div className="container mx-auto px-4 pt-6">
        <nav className="flex items-center gap-8 tracking-wider justify-end w-full text-sm">
          <Link
            href="/spin"
            className="text-[#2d2e40] hover:text-[#ef4e2d] transition-colors font-bold"
          >
            Spin The Wheel
          </Link>

          {session ? (
            <div className="flex items-center -gap-12">
              <Link href="/account">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent border-none p-0 hover:bg-transparent hover:cursor-grab"
                  title="My Account"
                >
                  <FaUser className="inline text-[#2d2e40] hover:text-gray-400 transition-colors" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="bg-transparent p-0 hover:bg-transparent hover:cursor-grab"
                title="Sign Out"
              >
                <FaSignOutAlt className="inline text-[#2d2e40] hover:text-gray-400 transition-colors" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => signIn()}
              size="sm"
              className="bg-transparent p-0 hover:bg-transparent hover:cursor-grab"
              title="Sign In"
            >
              <FaUser className="inline mr-2 text-[#2d2e40] hover:text-gray-400 transition-colors" />
            </Button>
          )}
        </nav>
        <div className="flex items-center w-full -mt-7">
          <Link href="/">
            <img
              src="/logo.png"
              alt="Just Choose Already Logo"
              className="h-12 w-auto"
            />
          </Link>
          <hr className="flex-1 border-[#2d2e40] border-[0.08rem] ml-[1rem] mt-4" />
        </div>
      </div>
    </header>
  );
}
