import { useState } from 'react';
import { ChevronDown, ChevronUp, Heart, BookOpen } from 'lucide-react';

interface BiblePassage {
  reference: string;
  text: string;
  explanation: string;
  application: string;
  category: 'command' | 'example' | 'promise' | 'warning';
}

export default function BiblePassagesPage() {
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set([0, 1, 2])); // First 3 expanded by default

  const toggleCard = (index: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCards(newExpanded);
  };

  const passages: BiblePassage[] = [
    {
      reference: "John 3:16",
      text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
      explanation: "This is the foundation of God's love - He demonstrated the greatest love by sacrificing His Son for humanity.",
      application: "When we struggle to love others, remember God's ultimate sacrifice. This motivates us to love even difficult family members.",
      category: "example"
    },
    {
      reference: "1 John 4:19",
      text: "We love because he first loved us.",
      explanation: "Our ability to love comes from experiencing God's love first. We can't give what we haven't received.",
      application: "Before demanding love from your spouse or children, ensure you are showing them God's love through your actions and words.",
      category: "promise"
    },
    {
      reference: "1 Corinthians 13:4-7",
      text: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It does not dishonor others, it is not self-seeking, it is not easily angered, it keeps no record of wrongs. Love does not delight in evil but rejoices with the truth. It always protects, always trusts, always hopes, always perseveres.",
      explanation: "This is the definitive description of love in action. These are the characteristics we should memorize and practice daily.",
      application: "Use this as your 'Yellow Card' - review these traits daily and ask: 'Did I show patience to my family today? Was I kind to my spouse?'",
      category: "command"
    },
    {
      reference: "Matthew 22:37-39",
      text: "Jesus replied: 'Love the Lord your God with all your heart and with all your soul and with all your mind.' This is the first and greatest commandment. And the second is like it: 'Love your neighbor as yourself.'",
      explanation: "Jesus summarizes all commandments into two: love God completely and love others as we love ourselves.",
      application: "In Nigerian families, this means loving your spouse and children as much as you love and care for yourself. No favoritism, no neglect.",
      category: "command"
    },
    {
      reference: "Ephesians 5:25",
      text: "Husbands, love your wives, just as Christ loved the church and gave himself up for her.",
      explanation: "Husbands are called to love their wives with the same sacrificial love Christ showed the church.",
      application: "Nigerian husbands: your love should be demonstrated through daily sacrifice, protection, and service to your wife and family.",
      category: "command"
    },
    {
      reference: "1 John 4:20",
      text: "Whoever claims to love God yet hates a brother or sister is a liar. For whoever does not love their brother and sister, whom they have seen, cannot love God, whom they have not seen.",
      explanation: "You cannot claim to love God while hating or mistreating the people around you, especially family.",
      application: "Family conflicts in Nigeria often stem from unforgiveness. Practice forgiveness as the foundation of love.",
      category: "warning"
    },
    {
      reference: "Romans 12:9-10",
      text: "Love must be sincere. Hate what is evil; cling to what is good. Be devoted to one another in love. Honor one another above yourselves.",
      explanation: "Love should be genuine, not fake or hypocritical. Show preference and honor to family members.",
      application: "In Nigerian culture where respect is important, this means treating your spouse and children with the honor they deserve as God's creation.",
      category: "command"
    },
    {
      reference: "1 Peter 4:8",
      text: "Above all, love each other deeply, because love covers over a multitude of sins.",
      explanation: "Deep love has the power to forgive and overlook many offenses and mistakes.",
      application: "When family members make mistakes (as they will), let love cover it rather than keeping record of wrongs.",
      category: "promise"
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'command': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'example': return 'bg-green-100 border-green-300 text-green-800';
      case 'promise': return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'warning': return 'bg-red-100 border-red-300 text-red-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'command': return '📝';
      case 'example': return '💡';
      case 'promise': return '✨';
      case 'warning': return '⚠️';
      default: return '📖';
    }
  };

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-orange-100 to-red-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-12 h-12 text-red-600 mr-4" />
            <BookOpen className="w-12 h-12 text-orange-600" />
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-red-800 mb-6">
            LOVE PASSAGES IN <span className="text-orange-600">NEW TESTAMENT</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the biblical foundation of love and learn how to apply these timeless truths in your family and relationships.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {passages.map((passage, index) => {
            const isExpanded = expandedCards.has(index);
            return (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => toggleCard(index)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">{getCategoryIcon(passage.category)}</span>
                        <h3 className="text-xl font-semibold text-gray-800">{passage.reference}</h3>
                      </div>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(passage.category)}`}>
                        {passage.category.charAt(0).toUpperCase() + passage.category.slice(1)}
                      </span>
                    </div>
                    <div className="ml-4">
                      {isExpanded ? (
                        <ChevronUp className="w-6 h-6 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                  </div>

                  <p className="text-gray-700 mt-3 leading-relaxed">{passage.text}</p>
                </div>

                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="pt-4">
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                          <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
                          Understanding
                        </h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{passage.explanation}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                          <Heart className="w-4 h-4 mr-2 text-red-600" />
                          Application for Nigerian Families
                        </h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{passage.application}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-xl p-8 shadow-lg max-w-4xl mx-auto">
            <h3 className="text-2xl font-serif text-red-800 mb-4">Daily Love Challenge</h3>
            <p className="text-gray-600 mb-6">
              Choose one verse each day this week. Read it in the morning, meditate on it throughout the day,
              and ask yourself before bed: "How did I live out this truth in my family today?"
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-50 p-4 rounded-lg">
                <strong>Monday:</strong> 1 Corinthians 13:4-7
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <strong>Wednesday:</strong> Ephesians 5:25
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <strong>Friday:</strong> 1 John 4:19
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}