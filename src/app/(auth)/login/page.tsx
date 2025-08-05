import LoginForm from '@/components/forms/login-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Logo - Fixed at top left */}
      <div className="absolute top-6 left-6 z-20">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-gray-900 rounded flex items-center justify-center">
            <span className="text-white text-sm font-bold">⚡</span>
          </div>
          <span className="text-lg font-semibold text-gray-900 tracking-tight">ModuleX</span>
        </div>
      </div>

      <div className="min-h-screen flex">
        {/* Left side - Form */}
        <div className="flex-1 flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <LoginForm />
          </div>
        </div>

        {/* Right side - Image Illustration */}
        <div className="hidden lg:flex flex-1 relative overflow-hidden p-10">
          <div className="w-full h-full rounded-2xl relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Background Image */}
            <img 
              src="/login_page_illus.png" 
              alt="ModuleX AI Illustration" 
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 