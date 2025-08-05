export default function Page() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Hello World - JobsyAI Test</h1>
        <p className="text-xl text-gray-600 mb-8">🎉 Your app is successfully deployed!</p>
        
        <div className="max-w-md mx-auto bg-gray-50 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Deployment Status</h2>
          <div className="space-y-3 text-left">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Middleware resolved</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Deployment working</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Next.js 13+ App Router</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">TypeScript compilation</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Vercel deployment</span>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <p className="text-sm text-gray-500">JobsyAI - AI-Powered Job Application Assistant</p>
        </div>
      </div>
    </div>
  );
}
