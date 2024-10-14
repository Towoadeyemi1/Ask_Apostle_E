import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-100 to-white">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          <Image
            src="/apostle_emmanuel_adewusi.jpg"
            alt="Apostle Emmanuel Adewusi"
            width={128}
            height={128}
            className="mb-4 rounded-full"
            priority
          />
          <h1 className="text-4xl font-bold text-blue-800 mb-2 text-center">Ask Apostle E</h1>
          <p className="text-xl text-gray-600 text-center">AI Spiritual Guidance</p>
        </div>
        <div className="flex flex-col space-y-4 mt-8">
          <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/register">Register</Link>
          </Button>
          <Button asChild variant="secondary" className="w-full bg-green-500 hover:bg-green-600 text-white">
            <Link href="/chat">Start Chat</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}