import { useState } from 'react';
import { Heart, Target, Award, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LoveChallengePage() {
  const [currentDay] = useState(1);
  const [completedDays, setCompletedDays] = useState<number[]>([]);

  const toggleDay = (day: number) => {
    if (completedDays.includes(day)) {
      setCompletedDays(completedDays.filter(d => d !== day));
    } else {
      setCompletedDays([...completedDays, day]);
    }
  };

  const characteristics = [
    "Love is patient, love is kind.",
    "It does not envy, it does not boast, it is not proud.",
    "It does not dishonor others, it is not self-seeking, it is not easily angered, it keeps no record of wrongs.",
    "Love does not delight in evil but rejoices with the truth.",
    "It always protects, always trusts, always hopes, always perseveres.",
    "Love never fails."
  ];

  const dailyFocus = [
    "Patience in difficult situations",
    "Kindness to strangers and family",
    "Avoiding jealousy and comparison",
    "Humble service to others",
    "Forgiving those who wrong you",
    "Truthful communication",
    "Protecting and supporting loved ones",
    "Trusting others even when uncertain",
    "Maintaining hope during challenges",
    "Persevering through difficulties",
    "Unfailing commitment to relationships",
    "Selfless acts of service",
    "Active listening in conversations",
    "Generosity with time and resources",
    "Encouraging others' success",
    "Managing anger constructively",
    "Letting go of grudges",
    "Celebrating truth and goodness",
    "Standing up for others",
    "Building others up instead of tearing them down",
    "Showing respect to everyone",
    "Being content with what you have",
    "Demonstrating loyalty",
    "Offering comfort to those in pain",
    "Maintaining integrity under pressure",
    "Choosing peace over conflict",
    "Extending grace to others",
    "Sacrificing personal desires for others' good",
    "Remaining faithful in relationships",
    "Being slow to judge",
    "Quick to forgive"
  ];

  const getDailyFocus = (day: number) => {
    return dailyFocus[(day - 1) % dailyFocus.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-100 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mb-6 shadow-lg">
            <Heart className="w-8 h-8 text-white fill-current" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-red-800 mb-4">
            30-Day Love Challenge
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Transform your relationships and character through daily practice of practical love
          </p>
        </div>

        {/* Challenge Progress */}
        <div className="bg-white rounded-2xl p-8 shadow-xl mb-12">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <h2 className="text-2xl font-serif text-red-800 mb-4">Your Progress</h2>
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 font-medium">Days Completed</span>
                  <span className="text-red-600 font-bold">{completedDays.length}/30</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-orange-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${(completedDays.length / 30) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-6">
                {Array.from({ length: 30 }).map((_, index) => {
                  const day = index + 1;
                  const isCompleted = completedDays.includes(day);
                  return (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`h-10 rounded-lg flex items-center justify-center font-medium transition-all ${
                        isCompleted 
                          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md' 
                          : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-red-400'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-red-100">
                <h3 className="font-semibold text-red-800 mb-2">Today's Focus</h3>
                <p className="text-gray-700">
                  Day {currentDay}: <span className="font-medium text-red-600">{getDailyFocus(currentDay)}</span>
                </p>
              </div>
            </div>

            <div className="md:w-1/2">
              <h2 className="text-2xl font-serif text-red-800 mb-4">Today's Love Practice</h2>
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Characteristic of Love</h3>
                <p className="text-gray-700 mb-4">
                  "{characteristics[(currentDay - 1) % characteristics.length]}"
                </p>
                <div className="flex items-center text-red-600">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span>1 Corinthians 13:{((currentDay - 1) % 8) + 4}</span>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Reflection Questions</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      1
                    </div>
                    <span className="text-gray-700">How did I demonstrate this characteristic today?</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      2
                    </div>
                    <span className="text-gray-700">Where could I have shown more love?</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      3
                    </div>
                    <span className="text-gray-700">How will I practice this tomorrow?</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Challenge Benefits */}
        <div className="mb-12">
          <h2 className="text-3xl font-serif text-center text-red-800 mb-4">Benefits of the Challenge</h2>
          <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            Discover the transformative power of practicing love consistently
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Stronger Relationships</h3>
              <p className="text-gray-600">Build deeper connections with family, friends, and colleagues</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Personal Growth</h3>
              <p className="text-gray-600">Develop emotional maturity and character strength</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Community Impact</h3>
              <p className="text-gray-600">Create positive change in your neighborhood and workplace</p>
            </div>
          </div>
        </div>

        {/* Completion Certificate */}
        {completedDays.length === 30 && (
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-8 text-white text-center mb-12 shadow-xl">
            <Award className="w-16 h-16 mx-auto mb-4 fill-current" />
            <h2 className="text-3xl font-serif mb-2">Congratulations!</h2>
            <p className="text-orange-100 mb-6 max-w-2xl mx-auto text-lg">
              You've completed the 30-Day Love Challenge! You've taken a significant step toward becoming a more loving person.
            </p>
            <button className="bg-white text-red-600 px-8 py-3 rounded-lg font-medium hover:bg-orange-50 transition-colors shadow-lg">
              Download Certificate
            </button>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-serif text-red-800 mb-4">Continue Your Journey</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
            Share your experience or explore more ways to practice practical love
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/share-testimony" 
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-4 rounded-lg font-medium hover:from-red-600 hover:to-orange-600 transition-all shadow-lg"
            >
              Share Your Testimony
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