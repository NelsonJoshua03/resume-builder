// src/components/HomePage.tsx
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <i className="fas fa-file-alt text-2xl text-blue-600 mr-2"></i>
            <span className="text-xl font-bold text-gray-800">ResumeCVForge</span>
          </div>
          <div className="flex space-x-4">
            <Link 
              to="/builder" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Resume
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          Create Professional Resumes in Minutes
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Build eye-catching resumes that stand out to employers. Choose from professional templates, customize with your details, and download instantly.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            to="/builder" 
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
          >
            Start Building Now
          </Link>
          <a 
            href="#features" 
            className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Why Choose ResumeCVForge?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-paint-brush text-2xl text-blue-600"></i>
            </div>
            <h3 className="text-xl font-semibold mb-3">Professional Templates</h3>
            <p className="text-gray-600">Choose from multiple professionally designed templates tailored for different industries and job roles.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-edit text-2xl text-blue-600"></i>
            </div>
            <h3 className="text-xl font-semibold mb-3">Easy Customization</h3>
            <p className="text-gray-600">Easily customize every aspect of your resume with our intuitive editor. No design skills needed.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-download text-2xl text-blue-600"></i>
            </div>
            <h3 className="text-xl font-semibold mb-3">Instant Download</h3>
            <p className="text-gray-600">Download your resume as a PDF ready to send to employers. No watermarks, no sign-up required.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">1</div>
              <h3 className="font-semibold mb-2">Select Template</h3>
              <p className="text-gray-600 text-sm">Choose from professional, modern, creative, or minimalist designs.</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">2</div>
              <h3 className="font-semibold mb-2">Add Your Information</h3>
              <p className="text-gray-600 text-sm">Fill in your details, work experience, education, and skills.</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">3</div>
              <h3 className="font-semibold mb-2">Customize Design</h3>
              <p className="text-gray-600 text-sm">Adjust colors and layout to match your personal style.</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">4</div>
              <h3 className="font-semibold mb-2">Download & Apply</h3>
              <p className="text-gray-600 text-sm">Download your resume and start applying for jobs immediately.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">What Users Say</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
              <div>
                <h4 className="font-semibold">Sarah Johnson</h4>
                <p className="text-sm text-gray-500">Marketing Professional</p>
              </div>
            </div>
            <p className="text-gray-600">"The modern template helped me stand out in a competitive job market. I landed three interviews in the first week!"</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
              <div>
                <h4 className="font-semibold">Michael Chen</h4>
                <p className="text-sm text-gray-500">Software Developer</p>
              </div>
            </div>
            <p className="text-gray-600">"As a developer, I appreciate the clean code and easy customization. The PDF export is perfect for applications."</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
              <div>
                <h4 className="font-semibold">Jessica Williams</h4>
                <p className="text-sm text-gray-500">Recent Graduate</p>
              </div>
            </div>
            <p className="text-gray-600">"The step-by-step process made it so easy to create a professional resume even without any work experience."</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-blue-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Create Your Perfect Resume?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Join thousands of job seekers who have landed their dream jobs with resumes created on ResumeCVForge.</p>
          <Link 
            to="/builder" 
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors shadow-md inline-block"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">ResumeCVForge</h3>
              <p className="text-gray-400">Creating professional resumes made simple and efficient.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/builder" className="text-gray-400 hover:text-white">Create Resume</Link></li>
                <li><a href="#features" className="text-gray-400 hover:text-white">Features</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Resume Tips</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Cover Letter Examples</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Interview Preparation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect With Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} ResumeCVForge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;