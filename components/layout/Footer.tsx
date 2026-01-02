export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About Imerse</h3>
            <p className="text-gray-400">
              An ultimate RPG campaign management and worldbuilding tool.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-gray-400 hover:text-white transition">
                  About
                </a>
              </li>
              <li>
                <a href="/features" className="text-gray-400 hover:text-white transition">
                  Features
                </a>
              </li>
              <li>
                <a href="/pricing" className="text-gray-400 hover:text-white transition">
                  Pricing
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="/docs" className="text-gray-400 hover:text-white transition">
                  Documentation
                </a>
              </li>
              <li>
                <a href="/help" className="text-gray-400 hover:text-white transition">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-400 hover:text-white transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Imerse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
