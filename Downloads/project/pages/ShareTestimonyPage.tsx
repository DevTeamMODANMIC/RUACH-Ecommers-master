import { useState } from 'react';
import { User, Mail, Star, Heart, BookOpen, Send, Check, Sparkles, Quote, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ShareTestimonyPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    testimony: '',
    role: '',
    location: ''
  });
  const [rating, setRating] = useState(5);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [charCount, setCharCount] = useState(0);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (field === 'testimony') {
      setCharCount(value.length);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';

    if (!formData.testimony.trim()) newErrors.testimony = 'Please share your testimony';
    else if (formData.testimony.length < 50) newErrors.testimony = 'Please write at least 50 characters';

    if (!formData.role.trim()) newErrors.role = 'Please tell us your role';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log({ ...formData, rating });
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-8 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white rounded-3xl p-12 shadow-2xl relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-60"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-orange-200 to-pink-200 rounded-full opacity-40"></div>

            <div className="relative z-10">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg animate-pulse">
                <Check className="w-12 h-12 text-white" />
              </div>

              <div className="mb-6">
                <h1 className="text-5xl font-serif text-gray-900 mb-4 drop-shadow-sm">
                  Thank You!
                </h1>
                <div className="flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-yellow-600 mr-2" />
                  <span className="text-lg text-gray-800 font-medium">Your testimony has been shared successfully!</span>
                </div>
              </div>

              <p className="text-xl text-gray-800 mb-4 leading-relaxed font-medium">
                🌟 Your story of practical love will inspire countless hearts and transform lives across Nigeria and beyond.
              </p>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Thank you for being a beacon of hope and demonstrating the beautiful power of biblical love in action.
              </p>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-8 border border-purple-100">
                <div className="flex items-center justify-center mb-3">
                  <Quote className="w-6 h-6 text-purple-600 mr-2" />
                  <span className="font-medium text-purple-800">What happens next?</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Your testimony will be reviewed by our love ministry team and featured on our testimonies page to inspire others on their journey.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/testimonies"
                  className="group bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center"
                >
                  <Users className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  View Other Testimonies
                </Link>
                <Link
                  to="/"
                  className="group border-2 border-purple-500 text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center"
                >
                  <Heart className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          <div className="relative mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full mb-6 shadow-2xl animate-pulse">
              <Heart className="w-12 h-12 text-white fill-current" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-bounce"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-pink-400 rounded-full animate-bounce delay-100"></div>
          </div>

          <h1 className="text-5xl md:text-6xl font-serif text-gray-900 mb-6 leading-tight drop-shadow-sm">
            Share Your Love Story
          </h1>
          <p className="text-2xl text-gray-800 max-w-3xl mx-auto leading-relaxed mb-4 font-medium">
            💝 Your journey of practical love can inspire and transform lives
          </p>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto font-medium">
            Every testimony shared becomes a beacon of hope for families across Nigeria
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Enhanced Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-purple-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"></div>

              <div className="mb-8">
                <h2 className="text-2xl font-serif text-gray-900 mb-2 font-bold">Tell Your Story</h2>
                <p className="text-gray-700 font-medium">Help others discover the transforming power of biblical love</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label htmlFor="name" className="block text-gray-700 font-semibold mb-3 flex items-center">
                      <User className="w-5 h-5 mr-2 text-purple-600" />
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-4 border-2 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-purple-300'}`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-2 flex items-center"><span className="mr-1">⚠️</span>{errors.name}</p>}
                  </div>

                  <div className="group">
                    <label htmlFor="email" className="block text-gray-700 font-semibold mb-3 flex items-center">
                      <Mail className="w-5 h-5 mr-2 text-purple-600" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-4 py-4 border-2 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-purple-300'}`}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-2 flex items-center"><span className="mr-1">⚠️</span>{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="role" className="block text-gray-700 font-semibold mb-3">
                      Your Role/Position *
                    </label>
                    <input
                      type="text"
                      id="role"
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className={`w-full px-4 py-4 border-2 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.role ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-purple-300'}`}
                      placeholder="e.g., Mother, Pastor, Teacher, Business Owner"
                    />
                    {errors.role && <p className="text-red-500 text-sm mt-2 flex items-center"><span className="mr-1">⚠️</span>{errors.role}</p>}
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-gray-700 font-semibold mb-3">
                      Your Location (Optional)
                    </label>
                    <input
                      type="text"
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                      placeholder="e.g., Lagos, Nigeria"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-3 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-purple-600" />
                    How has practical love impacted you? *
                  </label>
                  <div className="flex space-x-3 justify-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-3xl focus:outline-none transform hover:scale-125 transition-all duration-200"
                      >
                        {star <= rating ? (
                          <Star className="w-10 h-10 text-yellow-400 fill-current drop-shadow-sm" />
                        ) : (
                          <Star className="w-10 h-10 text-gray-300 hover:text-yellow-300" />
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-gray-800 mt-2 text-sm font-semibold bg-gray-50 py-2 px-4 rounded-lg">
                    {rating === 1 && "⭐ Beginning the journey"}
                    {rating === 2 && "⭐⭐ Growing in love"}
                    {rating === 3 && "⭐⭐⭐ Love is making a difference"}
                    {rating === 4 && "⭐⭐⭐⭐ Deeply transformed"}
                    {rating === 5 && "⭐⭐⭐⭐⭐ Completely life-changing"}
                  </p>
                </div>

                <div>
                  <label htmlFor="testimony" className="block text-gray-700 font-semibold mb-3 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                    Your Love Story *
                  </label>
                  <textarea
                    id="testimony"
                    value={formData.testimony}
                    onChange={(e) => handleInputChange('testimony', e.target.value)}
                    rows={8}
                    className={`w-full px-4 py-4 border-2 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none ${errors.testimony ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-purple-300'}`}
                    placeholder="Share your journey... How did you discover practical love? What challenges did you face? How has it transformed your relationships, family, or community? Be specific about the biblical love characteristics that made the difference..."
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-gray-500 text-sm">
                      Share specific examples of how love changed your situation
                    </p>
                    <div className={`text-sm font-bold bg-gray-50 py-1 px-3 rounded-lg ${charCount < 50 ? 'text-red-600 bg-red-50' : charCount < 100 ? 'text-yellow-700 bg-yellow-50' : 'text-green-600 bg-green-50'}`}>
                      {charCount}/500 {charCount >= 500 && '✨'}
                    </div>
                  </div>
                  {errors.testimony && <p className="text-red-500 text-sm mt-2 flex items-center"><span className="mr-1">⚠️</span>{errors.testimony}</p>}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-5 px-8 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        Sharing Your Story...
                      </>
                    ) : (
                      <>
                        <Send className="w-6 h-6 mr-3" />
                        Share Your Testimony
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tips Card */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-purple-100">
              <h3 className="text-xl font-serif text-gray-900 mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-yellow-600" />
                Writing Tips
              </h3>
              <ul className="space-y-3 text-gray-800 text-sm font-medium">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 font-bold">✓</span>
                  Share specific examples from your life
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 font-bold">✓</span>
                  Mention which love characteristics helped most
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 font-bold">✓</span>
                  Describe the transformation in your relationships
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 font-bold">✓</span>
                  Keep it authentic and encouraging
                </li>
              </ul>
            </div>

            {/* Impact Card */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
              <h3 className="text-xl font-serif mb-4 text-white drop-shadow-sm">Your Impact</h3>
              <p className="text-white mb-4 leading-relaxed font-medium drop-shadow-sm">
                Your story could be the encouragement someone needs to start their own journey of practical love.
              </p>
              <div className="flex items-center">
                <Users className="w-6 h-6 mr-2 drop-shadow-sm" />
                <span className="text-lg font-bold drop-shadow-sm">Inspiring Others</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Testimonials Preview */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif text-gray-900 mb-4 drop-shadow-sm">
              Stories That Inspire
            </h2>
            <p className="text-xl text-gray-800 max-w-3xl mx-auto leading-relaxed font-medium">
              Real people, real transformations, real hope for Nigerian families
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-purple-100 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-100 to-pink-100 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 fill-current drop-shadow-sm" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-purple-300" />
                </div>

                <p className="text-gray-800 text-lg leading-relaxed mb-6 italic">
                  "After 15 years of marriage, I discovered practical love through this ministry. The patience and kindness I learned transformed not just my relationship with my husband, but how I parent our children. Now I'm sharing these principles with other couples in my community."
                </p>

                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">AO</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-lg">Adunni Okonkwo</p>
                    <p className="text-purple-600 font-medium">Marriage Counselor • Lagos</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl border border-purple-100 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-orange-100 to-pink-100 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 fill-current drop-shadow-sm" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-orange-300" />
                </div>

                <p className="text-gray-800 text-lg leading-relaxed mb-6 italic">
                  "As a pastor, I thought I knew about love. But practical love taught me how to genuinely care for my congregation beyond sermons. My community ministry has grown tremendously because people see authentic love in action, not just words."
                </p>

                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">JA</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-lg">James Adeleke</p>
                    <p className="text-orange-600 font-medium">Pastor & Community Leader • Abuja</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="bg-white rounded-2xl p-8 border border-purple-200 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-purple-700 mb-2">500+</div>
                <div className="text-gray-800 font-semibold text-lg">Testimonies Shared</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-pink-700 mb-2">50+</div>
                <div className="text-gray-800 font-semibold text-lg">Nigerian Communities</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-700 mb-2">∞</div>
                <div className="text-gray-800 font-semibold text-lg">Lives Transformed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Call to Action */}
        <div className="text-center bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white bg-opacity-10 rounded-full"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white bg-opacity-10 rounded-full"></div>

          <div className="relative z-10">
            <div className="mb-6">
              <Heart className="w-16 h-16 mx-auto mb-4 text-white fill-current animate-pulse drop-shadow-lg" />
              <h2 className="text-4xl md:text-5xl font-serif mb-6 text-white drop-shadow-md">Your Story Can Change Lives</h2>
              <p className="text-2xl text-white mb-4 max-w-4xl mx-auto leading-relaxed drop-shadow-sm font-medium">
                Every testimony of practical love plants seeds of hope in Nigerian families
              </p>
              <p className="text-lg text-purple-100 max-w-3xl mx-auto drop-shadow-sm">
                Join hundreds of Nigerians who are courageously sharing their journey and inspiring transformation across our nation
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                to="/testimonies"
                className="group bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center"
              >
                <Users className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
                Read Inspiring Stories
              </Link>
              <Link
                to="/love-challenge"
                className="group border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-purple-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center"
              >
                <Sparkles className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
                Take the Love Challenge
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}