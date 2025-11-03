// src/components/HomePage.tsx
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  FileText, 
  Briefcase, 
  Users, 
  CheckCircle,
  ArrowRight,
  Star,
  Download,
  Shield
} from 'lucide-react';

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>CareerCraft.in - Free ATS Resume Builder & Job Portal | India's Career Platform</title>
        <meta 
          name="description" 
          content="Create professional ATS-optimized resumes for Indian job market. Find latest job openings in IT, engineering, marketing sectors across India. Free resume templates for freshers and experienced professionals." 
        />
        <meta 
          name="keywords" 
          content="resume builder India, ATS resume maker, job portal India, Indian job search, engineering jobs India, IT jobs India, fresher jobs India, free resume maker, CV builder India, career platform India"
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Your Career Journey Starts at CareerCraft.in
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                Create ATS-Friendly Resumes & Find Your Dream Job in India
              </p>
              <p className="text-lg mb-12 text-blue-200 max-w-3xl mx-auto leading-relaxed">
                India's premier career platform helping job seekers create professional resumes that pass through 
                Applicant Tracking Systems and connect with top employers across India. Built for the Indian job market.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/builder" 
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <FileText size={24} />
                  Build Your Resume - Free
                </Link>
                <Link 
                  to="/job-applications" 
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-1"
                >
                  <Briefcase size={24} />
                  Find Jobs in India
                </Link>
              </div>
              
              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-6 mt-12 pt-8 border-t border-blue-500">
                <div className="flex items-center text-blue-200 text-sm">
                  <CheckCircle size={16} className="mr-2" />
                  No Sign Up Required
                </div>
                <div className="flex items-center text-blue-200 text-sm">
                  <Download size={16} className="mr-2" />
                  Instant PDF Download
                </div>
                <div className="flex items-center text-blue-200 text-sm">
                  <Shield size={16} className="mr-2" />
                  100% Privacy Protected
                </div>
                <div className="flex items-center text-blue-200 text-sm">
                  <Star size={16} className="mr-2" />
                  ATS Optimized Templates
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose CareerCraft.in?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Built specifically for the Indian job market with features that matter
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 hover:transform hover:-translate-y-2 transition-all duration-300">
                <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="text-blue-600" size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3">ATS-Optimized Resumes</h3>
                <p className="text-gray-600">
                  Templates designed to pass through Applicant Tracking Systems used by Indian companies like TCS, Infosys, Wipro
                </p>
              </div>

              <div className="text-center p-6 hover:transform hover:-translate-y-2 transition-all duration-300">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="text-green-600" size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3">India-Focused Job Listings</h3>
                <p className="text-gray-600">
                  Curated job opportunities from top Indian companies, startups, and MNCs across all major cities
                </p>
              </div>

              <div className="text-center p-6 hover:transform hover:-translate-y-2 transition-all duration-300">
                <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-purple-600" size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3">Career Guidance for India</h3>
                <p className="text-gray-600">
                  Expert advice tailored for Indian job market, industry trends, and regional opportunities
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="transform hover:scale-105 transition-transform duration-300">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">50,000+</div>
                <div className="text-gray-600">Resumes Created</div>
              </div>
              <div className="transform hover:scale-105 transition-transform duration-300">
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">10,000+</div>
                <div className="text-gray-600">Jobs Listed</div>
              </div>
              <div className="transform hover:scale-105 transition-transform duration-300">
                <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">25+</div>
                <div className="text-gray-600">Indian Cities</div>
              </div>
              <div className="transform hover:scale-105 transition-transform duration-300">
                <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">15+</div>
                <div className="text-gray-600">Job Industries</div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How CareerCraft.in Works</h2>
            <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <div className="text-center transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold text-xl">1</div>
                <h3 className="font-semibold mb-2 text-lg">Select Indian Template</h3>
                <p className="text-gray-600 text-sm">Choose from templates optimized for Indian companies and ATS systems</p>
              </div>
              
              <div className="text-center transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold text-xl">2</div>
                <h3 className="font-semibold mb-2 text-lg">Add Your Information</h3>
                <p className="text-gray-600 text-sm">Fill in your details with Indian education and work experience formats</p>
              </div>
              
              <div className="text-center transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold text-xl">3</div>
                <h3 className="font-semibold mb-2 text-lg">Customize for India</h3>
                <p className="text-gray-600 text-sm">Tailor your resume for specific Indian industries and job roles</p>
              </div>
              
              <div className="text-center transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold text-xl">4</div>
                <h3 className="font-semibold mb-2 text-lg">Apply in India</h3>
                <p className="text-gray-600 text-sm">Download and apply to Indian companies with your perfect resume</p>
              </div>
            </div>
          </div>
        </section>

        {/* Industry Focus */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">We Serve All Major Indian Industries</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { name: 'IT & Software', color: 'bg-blue-500' },
                { name: 'Engineering', color: 'bg-green-500' },
                { name: 'Business & MBA', color: 'bg-purple-500' },
                { name: 'Healthcare', color: 'bg-red-500' },
                { name: 'Finance & Banking', color: 'bg-yellow-500' },
                { name: 'Marketing & Sales', color: 'bg-pink-500' },
                { name: 'Design & Creative', color: 'bg-indigo-500' },
                { name: 'Education & Research', color: 'bg-teal-500' }
              ].map((industry, index) => (
                <div key={index} className="bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className={`w-12 h-12 ${industry.color} rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold`}>
                    {industry.name.charAt(0)}
                  </div>
                  <h3 className="font-semibold text-gray-800">{industry.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="container mx-auto px-4 py-16 bg-white">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Success Stories from India</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-xl shadow-md border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full mr-4 flex items-center justify-center text-blue-600 font-bold">RK</div>
                <div>
                  <h4 className="font-semibold">Rajesh Kumar</h4>
                  <p className="text-sm text-gray-500">Software Engineer, Bangalore</p>
                </div>
              </div>
              <p className="text-gray-600">"CareerCraft.in helped me create a resume that got me interviews at 3 top Indian IT companies. The ATS optimization really works!"</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl shadow-md border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full mr-4 flex items-center justify-center text-green-600 font-bold">PM</div>
                <div>
                  <h4 className="font-semibold">Priya Mehta</h4>
                  <p className="text-sm text-gray-500">Mechanical Engineer, Pune</p>
                </div>
              </div>
              <p className="text-gray-600">"As a fresher from Mumbai University, I was struggling. CareerCraft.in's templates made my academic projects look professional."</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl shadow-md border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full mr-4 flex items-center justify-center text-purple-600 font-bold">AS</div>
                <div>
                  <h4 className="font-semibold">Anjali Singh</h4>
                  <p className="text-sm text-gray-500">MBA Graduate, Delhi</p>
                </div>
              </div>
              <p className="text-gray-600">"The Indian job market templates helped me highlight the right skills. Landed a role at a top Indian startup in Gurgaon!"</p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-blue-600 py-16 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Advance Your Career in India?
            </h2>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Join thousands of Indian professionals who found their dream jobs through CareerCraft.in
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/builder" 
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Create Your Resume
                <ArrowRight size={20} />
              </Link>
              <Link 
                to="/job-applications" 
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:-translate-y-1"
              >
                Browse Indian Jobs
              </Link>
            </div>
            <p className="text-blue-200 mt-6 text-sm">
              🚀 Free • No Sign Up • Instant Download • Made for India
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;