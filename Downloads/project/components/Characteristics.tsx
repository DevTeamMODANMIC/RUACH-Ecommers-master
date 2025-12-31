import { Sprout, Bird, Scale, Handshake, Crown, Zap } from 'lucide-react';

interface CharacteristicProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function CharacteristicCard({ icon, title, description }: CharacteristicProps) {
  return (
    <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center">
          {icon}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

export default function Characteristics() {
  const characteristics = [
    {
      icon: <Sprout className="w-8 h-8" />,
      title: "Endures long and",
      description: "is patient and kind"
    },
    {
      icon: <Bird className="w-8 h-8" />,
      title: "Is never envious or",
      description: "boils over with jealousy"
    },
    {
      icon: <Scale className="w-8 h-8" />,
      title: "Is not boastful",
      description: "or vainglorious"
    },
    {
      icon: <Handshake className="w-8 h-8" />,
      title: "Does not display",
      description: "itself haughtily"
    },
    {
      icon: <Crown className="w-8 h-8" />,
      title: "Is not conceited",
      description: "(arrogant and inflated with pride)"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Is not rude",
      description: "or unmannerly"
    }
  ];

  return (
    <section id="characteristics" className="py-20 px-6 bg-gradient-to-b from-orange-50 to-yellow-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-red-800 mb-6">
            Characteristics of Love
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {characteristics.map((characteristic, index) => (
            <CharacteristicCard
              key={index}
              icon={characteristic.icon}
              title={characteristic.title}
              description={characteristic.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}