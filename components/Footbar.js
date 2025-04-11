export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-teal-600 to-emerald-700 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-coral-400">
              Bijayakumartamang
            </h3>
            <p className="text-teal-100 mt-2">Creating digital experiences that matter</p>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-white hover:text-amber-300 transition duration-300">
              <span className="sr-only">Facebook</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            {/* Add other social icons similarly */}
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-teal-500/30 flex flex-col md:flex-row justify-between items-center">
          <p className="text-teal-100">&copy; 2024 Bijayakumartamang. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="#" className="text-teal-100 hover:text-white">Privacy Policy</a>
            <a href="#" className="text-teal-100 hover:text-white">Terms of Service</a>
            <a href="#" className="text-teal-100 hover:text-white">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}