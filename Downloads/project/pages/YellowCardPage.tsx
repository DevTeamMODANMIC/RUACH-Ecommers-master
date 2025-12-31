import { Heart, Award, Download, Printer, CheckCircle, Calendar, Target, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function YellowCardPage() {
  const characteristics = [
    "Love is patient, love is kind.",
    "It does not envy, it does not boast, it is not proud.",
    "It does not dishonor others, it is not self-seeking, it is not easily angered, it keeps no record of wrongs.",
    "Love does not delight in evil but rejoices with the truth.",
    "It always protects, always trusts, always hopes, always perseveres.",
    "Love never fails."
  ];

  const dailyPractices = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Morning Reflection",
      description: "Start your day by reading one characteristic and setting an intention to practice it."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Daily Goal",
      description: "Choose one characteristic to focus on throughout the day in your interactions."
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Evening Review",
      description: "Reflect on how you demonstrated love and where you can improve tomorrow."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Mother of Two",
      content: "The Yellow Card transformed how I communicate with my children. Patient love has brought us closer than ever before.",
      rating: 5
    },
    {
      name: "Michael Okafor",
      role: "Community Leader",
      content: "Implementing these principles in our community projects has led to remarkable collaboration and success.",
      rating: 5
    }
  ];

  const benefits = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Transform Your Relationships",
      description: "Apply these principles to strengthen your family, friendships, and professional relationships."
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Build Stronger Communities",
      description: "Create positive change in your neighborhood and workplace through practical love."
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Experience Personal Growth",
      description: "Develop character and emotional maturity by practicing these timeless principles."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-100 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-6 shadow-lg">
            <Heart className="w-8 h-8 text-red-700 fill-current" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-red-800 mb-4">
            The Yellow Card of Love
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Your personal guide to practicing practical love in everyday life
          </p>
        </div>

        {/* Yellow Card Preview */}
        <div className="bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-2xl shadow-2xl p-1 mb-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="bg-white rounded-xl shadow-lg m-1">
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-red-600 to-orange-600 rounded-full mb-4">
                  <Heart className="w-7 h-7 text-white fill-current" />
                </div>
                <h2 className="text-2xl font-serif text-red-800 mb-2">1 Corinthians 13:4-8</h2>
                <p className="text-red-700 font-medium">The Love Chapter</p>
              </div>

              <div className="space-y-5">
                {characteristics.map((characteristic, index) => (
                  <div key={index} className="flex items-start group">
                    <div className="w-7 h-7 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-gray-800 text-lg leading-relaxed group-hover:text-red-700 transition-colors">
                      {characteristic}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-6 border-t border-gray-200 text-center">
                <p className="text-red-800 font-semibold italic text-lg">
                  "Let all that you do be done in love." - 1 Corinthians 16:14
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Practice Guide */}
        <div className="bg-white rounded-2xl p-8 shadow-xl mb-12">
          <h2 className="text-3xl font-serif text-center text-red-800 mb-2">Your Daily Practice Guide</h2>
          <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            Simple steps to integrate the characteristics of love into your everyday life
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {dailyPractices.map((practice, index) => (
              <div key={index} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg flex items-center justify-center mb-4">
                  {practice.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{practice.title}</h3>
                <p className="text-gray-600">{practice.description}</p>
              </div>
            ))}
          </div>

          {/* Progress Tracker */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-100">
            <h3 className="text-xl font-semibold text-red-800 mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500 fill-current" />
              30-Day Love Challenge
            </h3>
            <p className="text-gray-700 mb-4">
              Track your progress as you practice each characteristic daily. Mark each day you successfully demonstrate practical love.
            </p>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {Array.from({ length: 30 }).map((_, index) => (
                <div key={index} className="h-10 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                  {index + 1}
                </div>
              ))}
            </div>
            <Link to="/love-challenge" className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:from-red-600 hover:to-orange-600 transition-all inline-block">
              Start Challenge
            </Link>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-12">
          <h2 className="text-3xl font-serif text-center text-red-800 mb-2">Success Stories</h2>
          <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            Hear from people who have transformed their lives through the Yellow Card
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 italic mb-4">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-800">{testimonial.name}</p>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-serif text-center text-red-800 mb-2">Benefits of Practicing Love</h2>
          <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            Discover the transformative power of incorporating these principles into your daily life
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-100 to-orange-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Download Section */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-8 text-white text-center mb-12 shadow-xl">
          <h2 className="text-3xl font-serif mb-2">Get Your Personal Yellow Card</h2>
          <p className="text-orange-100 mb-8 max-w-2xl mx-auto text-lg">
            Download your printable version or save it to your phone for daily inspiration
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button className="bg-white text-red-600 px-8 py-4 rounded-lg font-medium hover:bg-orange-50 transition-colors flex items-center justify-center shadow-lg">
              <Download className="w-5 h-5 mr-2" />
              Download PDF
            </button>
            <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-medium hover:bg-white hover:text-red-600 transition-colors flex items-center justify-center shadow-lg">
              <Printer className="w-5 h-5 mr-2" />
              Print Version
            </button>
          </div>
          
          <div className="text-orange-200 text-sm">
            <p>Also available as a mobile app - coming soon!</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-serif text-red-800 mb-4">Ready to Begin Your Journey?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
            Start practicing practical love today and experience the transformation in your relationships and community.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/testimonies" 
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-4 rounded-lg font-medium hover:from-red-600 hover:to-orange-600 transition-all shadow-lg"
            >
              Read More Success Stories
            </Link>
            <Link 
              to="/bible-passages" 
              className="border-2 border-red-500 text-red-500 px-8 py-4 rounded-lg font-medium hover:bg-red-50 transition-colors shadow-lg"
            >
              Explore More Scriptures
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}